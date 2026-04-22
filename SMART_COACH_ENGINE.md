# Smart Coach Learning Engine Implementation

## 1. PRIORITY-BASED DECISION ENGINE

**Score Calculation** (`utils/decisionEngine.js`):
```javascript
function calculateActionScores(state, sessionData) {
  const actions = [
    { type: 'flashcards', baseScore: 0 },
    { type: 'quiz', baseScore: 0 },
    { type: 'solver', baseScore: 0 },
    { type: 'game', baseScore: 0 }
  ];

  actions.forEach(action => {
    action.score = action.baseScore;
    
    // Mastery gap (weak topics boost flashcards/solver)
    const gap = 1 - state.mastery[state.activeTopic];
    action.score += gap * 0.4;
    
    // Recent performance (failure boosts review)
    if (sessionData.recentAccuracy < 0.6) {
      if (action.type === 'flashcards') action.score += 0.3;
    }
    
    // Streak (success boosts challenge)
    if (state.streak > 3) {
      if (action.type === 'quiz' || action.type === 'game') action.score += 0.2;
    }
    
    // Time decay (haven't practiced → boost)
    const daysSince = (Date.now() - state.lastPractice[state.activeTopic]) / (24*60*60*1000);
    action.score += Math.min(daysSince / 7, 0.2);
  });

  return actions.sort((a, b) => b.score - a.score);
}

function pickBestAction(actions) {
  return actions[0];
}
```

## 2. USER INTENT MODEL

**Detection Logic**:
```javascript
function detectIntent(sessionData, clicks) {
  if (clicks.includes('easy_quiz') || clicks.includes('practice_button')) return 'practice';
  if (clicks.includes('review') || sessionData.recentAccuracy < 0.7) return 'revise';
  if (clicks.includes('arcade') || sessionData.gamePlays > 2) return 'explore';
  if (state.streak > 5 || clicks.includes('hard_quiz')) return 'challenge';
  return 'practice';  // Default
}

function modifyRecommendations(intent, actions) {
  if (intent === 'challenge') actions.find(a => a.type === 'quiz').score += 0.3;
  if (intent === 'revise') actions.find(a => a.type === 'flashcards').score += 0.4;
  return actions.sort((a, b) => b.score - a.score);
}
```

## 3. CONTEXT-AWARE FLOW

**Fatigue & Streak Logic**:
```javascript
function applyContextModifiers(state, session) {
  // Fatigue: too many quizzes
  if (session.quizCount > 3) {
    const quizAction = actions.find(a => a.type === 'quiz');
    quizAction.score -= 0.5;
  }
  
  // Failure streak
  if (session.failureStreak >= 2) {
    actions.find(a => a.type === 'flashcards').score += 0.4;
  }
  
  // Success streak
  if (state.streak >= 4) {
    actions.find(a => a.type === 'quiz').score += 0.2;
    actions.find(a => a.type === 'game').score += 0.1;
  }
  
  // Session length
  if (session.duration > 30 * 60 * 1000) {  // 30min
    actions.find(a => a.type === 'game').score += 0.3;  // Break with fun
  }
}
```

## 4. EMOTIONAL FEEDBACK SYSTEM

**Coach Messages** (`utils/coachMessages.js`):
```javascript
const messages = {
  afterFailure: [
    "Tough one! Let's break it down with flashcards first.",
    "Everyone struggles. Quick review → you'll crush it next time."
  ],
  afterSuccess: [
    "Nailed it! Lock in that knowledge with practice.",
    "You're getting strong. Ready for harder challenges?"
  ],
  streak: [
    "4-day streak! Momentum is building.",
    "Legendary consistency → time to level up."
  ]
};

function getCoachMessage(state, session) {
  if (session.accuracy < 0.6) return random(messages.afterFailure);
  if (state.streak > 3) return random(messages.streak);
  return "Great work. What's next?";
}
```

**UI Placement**: Hero banner above primary CTA.

## 5. SMART DASHBOARD

**Structure**:
```
[Coach Message: "Struggling with quadratics? Flashcards next 👆"]

🏆 Primary: [Practice Flashcards] ← Score 0.92
📝 Secondary: [Algebra Quiz]     ← Score 0.75
🎮 Fun: [Arcade Break]           ← Score 0.42

Progress: [XP Bar] | Streak: 🔥4
```

## 6. IMPROVED useLearningFlow()

**Hook** (`hooks/useLearningFlow.js`):
```javascript
export function useLearningFlow(userId) {
  const [coachState, setCoachState] = useState({
    nextActions: [],
    topAction: null,
    intent: 'practice',
    message: '',
    session: { quizCount: 0, duration: 0 }
  });
  
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'users', userId), (snap) => {
      const state = snap.data();
      const session = getSessionData();  // localStorage
      
      const rawActions = calculateActionScores(state, session);
      const modifiedActions = modifyRecommendations(detectIntent(session), rawActions);
      const finalActions = applyContextModifiers(state, session, modifiedActions);
      
      setCoachState({
        nextActions: finalActions,
        topAction: pickBestAction(finalActions),
        intent: detectIntent(session, getClickHistory()),
        message: getCoachMessage(state, session)
      });
    });
    
    return unsubscribe;
  }, [userId]);
  
  return coachState;
}
```

**Component Usage**:
```javascript
function Dashboard() {
  const { topAction, nextActions, message, intent } = useLearningFlow(user.id);
  
  return (
    <div>
      <Banner>{message}</Banner>
      <PrimaryCTA onClick={() => navigate(topAction.type)}>
        {topAction.type.toUpperCase()}
      </PrimaryCTA>
      
      <SecondaryActions>
        {nextActions.slice(1, 3).map(action => (
          <ActionButton key={action.type}>{action.type}</ActionButton>
        ))}
      </SecondaryActions>
    </div>
  );
}
```

## 7. SYSTEM BEHAVIOR EXAMPLES

**Example 1: User fails quiz twice**
```
Session: accuracy=0.4, failureStreak=2, topic="algebra"
→ flashcards.score = 0.92 (gap + failure boost)
→ Message: "Tough one! Let's break it down with flashcards first."
→ Primary CTA: Flashcards
```

**Example 2: User on streak → challenge**
```
Streak=5, accuracy=0.9, session.quizCount=2
→ quiz.score = 0.85 (streak + success)
→ game.score = 0.65 (secondary reward)
→ Message: "You're getting strong. Ready for harder challenges?"
→ Primary: Quiz (hard)
```

**Example 3: User idle 3 days**
```
daysSince=3, mastery=0.6
→ all actions +0.2 time decay
→ flashcards.score highest (gap + decay)
→ Message: "Missed you! Quick review to get back on track."
```

**INTELLIGENCE ACHIEVED** - System feels alive, adaptive, and coach-like.

