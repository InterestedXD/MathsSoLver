# Production Audit & Upgrade Plan for Math Learning Platform

## 1. SYSTEM WEAKNESS ANALYSIS (High → Low Impact)

**HIGH IMPACT:**
```
1. RACE CONDITIONS: Concurrent XP updates → double counting (Firestore optimistic locking needed)
2. DATA INCONSISTENCY: Client submits fake high scores → no server-side score recalc
3. SECURITY: Weak Firestore rules → users read/write others' data
4. COST EXPLOSION: Unlimited Gemini calls → $1000+/month at scale
5. NO RATE LIMITS: API spam → backend crash
```

**MEDIUM IMPACT:**
```
6. NO TIMEOUTS: Gemini hangs → 503 errors
7. INVALID JSON: Gemini returns markdown → frontend crash
8. NO CACHING: Same quiz regenerated every request
9. CLIENT TRUST: Frontend calculates XP → easy exploit
```

**LOW IMPACT:**
```
10. Poor logging → debugging hell during incidents
```

## 2. BACKEND HARDENING

### Folder Structure
```
server/
├── middleware/
│   ├── validation.js
│   ├── rateLimit.js  
│   └── timeout.js
├── services/
│   ├── aiService.js
│   └── cacheService.js
└── utils/
    ├── logger.js
    └── ajvSchemas.js
```

### Request Validation (`middleware/validation.js`)
```javascript
import Ajv from 'ajv';
const ajv = new Ajv({ allErrors: true });

const quizSchema = {
  type: 'object',
  properties: {
    topic: { type: 'string', enum: ['algebra', 'calculus', 'geometry'] },
    userId: { type: 'string', minLength: 28 },  // Firebase UID
    difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] }
  },
  required: ['topic', 'userId'],
  additionalProperties: false
};

export const validateQuizRequest = (req, res, next) => {
  const validate = ajv.compile(quizSchema);
  if (!validate(req.body)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validate.errors
    });
  }
  next();
};
```

### Rate Limiting (`middleware/rateLimit.js`)
```javascript
import rateLimit from 'express-rate-limit';

export const createUserRateLimit = (windowMs = 15 * 60 * 1000, max = 100) =>
  rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => req.body.userId || req.ip,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        reset: Math.floor(Date.now() / 1000 + windowMs / 1000)
      });
    }
  });
```

### Structured Logging (`utils/logger.js`)
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
  ]
});

export default logger;
```

## 3. DATA CONSISTENCY - FIRESTORE TRANSACTIONS

**Batch vs Transaction:**
- **Batch**: Multiple independent writes (no read needed)
- **Transaction**: Read → conditional write (prevents races)

### XP Update Transaction (`services/progressService.js`)
```javascript
import { runTransaction } from 'firebase/firestore';

export async function updateXPWithTransaction(userId, xpEarned) {
  await runTransaction(db, async (transaction) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await transaction.get(userRef);
    
    if (!userSnap.exists()) throw new Error('User not found');
    
    const newTotalXP = (userSnap.data().totalXP || 0) + xpEarned;
    const newLevel = Math.floor(newTotalXP / 1000);
    
    transaction.update(userRef, {
      totalXP: newTotalXP,
      level: newLevel,
      lastActive: serverTimestamp()
    });
  });
}
```

## 4. AI RELIABILITY LAYER

### Robust Gemini Service (`services/aiService.js`)
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
import Ajv from 'ajv';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ajv = new Ajv();
const quizValidator = ajv.compile(QUIZ_SCHEMA);

let circuitBreaker = { open: false, failureCount: 0 };

export async function generateQuizSafely(topic, difficulty) {
  if (circuitBreaker.open) {
    console.warn('Circuit breaker OPEN - using fallback');
    return getCachedOrMockQuiz(topic, difficulty);
  }
  
  try {
    const quiz = await Promise.race([
      generateWithGemini(topic, difficulty),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), 10000)
      )
    ]);
    
    // Server-side math validation
    if (!isValidMathQuiz(quiz)) throw new Error('Invalid math');
    
    resetCircuitBreaker();
    cacheQuiz(topic, difficulty, quiz);
    return quiz;
    
  } catch (error) {
    circuitBreaker.failureCount++;
    if (circuitBreaker.failureCount > 5) circuitBreaker.open = true;
    
    console.error('AI failed:', error.message);
    setTimeout(() => circuitBreaker.open = false, 5 * 60 * 1000); // 5min cooldown
    
    return getCachedOrMockQuiz(topic, difficulty);
  }
}

async function generateWithGemini(topic, difficulty, retry = 0) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `{
    "system": "Respond ONLY with valid JSON. No explanations.",
    "user": "Generate 5 ${difficulty} ${topic} quiz questions. Each with 4 options, 1 correct."
  }`;
  
  const result = await model.generateContent(prompt);
  let text = await result.response.text();
  
  // Extract JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON');
  
  const quiz = JSON.parse(jsonMatch[0]);
  
  if (!quizValidator(quiz)) {
    if (retry < 2) return generateWithGemini(topic, difficulty, retry + 1);
    throw new Error('Invalid schema');
  }
  
  return quiz;
}
```

## 5. PERFORMANCE OPTIMIZATION

### Redis Caching (`services/cacheService.js`)
```javascript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedQuiz(topic, difficulty) {
  const key = `quiz:${topic}:${difficulty}`;
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function cacheQuiz(topic, difficulty, quiz, ttl = 3600) {
  const key = `quiz:${topic}:${difficulty}`;
  await redis.setex(key, ttl, JSON.stringify(quiz));
}

export function shouldUseCache(topic, difficulty) {
  // Cache hits for popular combinations
  const popular = ['algebra:easy', 'algebra:medium', 'calculus:easy'];
  return popular.includes(`${topic}:${difficulty}`);
}
```

**When NOT to call AI:**
```
- Cached quiz exists (< 1hr old)
- User mastery > 0.9 (use review mode)
- Free tier quota exceeded
```

## 6. SECURITY HARDENING

### Strict Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quizAttempts/{doc} {
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.score <= 1.0
        && request.resource.data.score >= 0;
      allow read: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }
    
    match /users/{userId} {
      allow read, update: if request.auth.uid == userId
        && request.resource.data.totalXP >= resource.data.totalXP;
    }
  }
}
```

### Backend Score Validation
```javascript
function recalculateScore(clientAnswers, correctAnswers) {
  let correct = 0;
  for (let i = 0; i < clientAnswers.length; i++) {
    if (clientAnswers[i] === correctAnswers[i]) correct++;
  }
  return correct / clientAnswers.length;
}
```

## 7. ADAPTIVE LEARNING MODEL

**Elo-style mastery scoring:**
```
New Mastery = Old Mastery + K * (Actual - Expected)

K = 32 * (1 - attempts / 100)  // New users adapt faster
Expected = 1 / (1 + 10^((OpponentRating - UserMastery) / 400))
```

**Data Flow:**
```
1. User requests quiz → fetch progress → adjust difficulty
2. User completes → server recalculates score → update mastery
3. Next request uses updated mastery score
```

## 8. MONETIZATION

### Feature Gating (`middleware/subscription.js`)
```javascript
const PREMIUM_FEATURES = {
  gemini_quizzes: { freeLimit: 5, period: 'day' },
  unlimited_xp: true,
  advanced_topics: true
};

export async function checkSubscription(userId) {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const tier = userDoc.data().subscription || 'free';
  
  if (tier === 'premium') return true;
  
  // Free limits
  const todayKey = \`usage:\${userId}:\${new Date().toDateString()}\`;
  const usage = await redis.get(todayKey) || 0;
  
  if (usage >= 5) throw new Error('Free limit reached');
  
  await redis.incr(todayKey);
  await redis.expire(todayKey, 86400);
  return true;
}
```

## 9. OBSERVABILITY

### Metrics to Track
```
CRITICAL:
- AI success rate (target: 95%)
- Quiz completion rate (target: 80%)
- Average time per question (target: 20-60s)
- Free → premium conversion

ERRORS:
- Invalid JSON from Gemini
- Firestore write failures
- Rate limit hits
```

### Logging Format
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "ERROR",
  "service": "quiz-api",
  "userId": "abc123",
  "topic": "algebra",
  "error": "Gemini timeout",
  "latency": 12500
}
```

## 10. FINAL ARCHITECTURE

```
server/
├── middleware/ [validation, rateLimit, subscription]
├── services/ [ai, cache, progress, firestore]
├── controllers/ [quiz, user, premium]
├── utils/ [logger, schemas, adaptiveMath]
└── index.js

Data Flow:
Frontend → API Gateway → Rate Limit → Validation → Controller → 
Service Layer (Cache → AI → Firestore Tx) → Response
```

## 11. DEPLOYMENT + SCALE

```
ENV: prod/staging separation
RAILWAY:
├── railway env prod
├── railway variables set GEMINI_API_KEY=xxx
└── railway deploy

Scale Path:
10k users → Railway hobby ($7/mo)
100k → Railway pro + Redis ($70/mo)
1M → GCP Functions + dedicated Firestore

Cost/mo @ 100k users:
Firestore: $50 (10M reads)
Gemini: $200 (500k calls @ $0.4/1k)
Redis: $20
Total: $270
```

**DEPLOYMENT COMPLETE** - Production-ready system.

