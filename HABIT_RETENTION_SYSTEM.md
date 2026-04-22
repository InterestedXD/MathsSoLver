# Habit-Forming Retention System

## 1. HABIT LOOP (Trigger → Action → Reward → Investment)

**Daily Loop**:
```
Trigger: Push notification "Your 🔥5 streak ends in 2h"
↓
Action: 1-click "Quick Algebra Review" (preloads weak topic)
↓
Reward: Instant XP burst + "Streak saved! +50 bonus"
↓
Investment: "Choose tomorrow's goal" (3/5/10 questions)
```

**Stored**: `users/{userId}.dailyGoal`, `streakEndTime`

## 2. DAILY ENGAGEMENT SYSTEM

**Firestore Fields**:
```javascript
users/{userId}:
{
  dailyGoal: 5,  // Questions target
  dailyProgress: 2,  // Current count
  streak: 5,
  streakFreezeUsed: 1,  // Max 3 lifetime
  lastSessionEnd: timestamp
}
```

**UI** (`Dashboard.jsx`):
```
🔥 Streak 5 | 2/5 daily goal ✓

[Continue Streak → Quick Quiz]
```

**Comeback Trigger** (`cron job/cloud function`):
```javascript
if (daysSinceLast > 1 && streak > 0) {
  sendPush(`Save your 🔥${streak} streak!`);
}
```

## 3. PROGRESSION SYSTEM

**Level Unlocks** (psychology: anticipation + exclusivity):
```
Level 1 (0 XP): Basic algebra/quiz
Level 5 (5k XP): Unlock calculus + themes
Level 10 (20k): Advanced games + streak freeze (1x)
Level 25 (75k): Premium topics + unlimited freeze
```

**Variable Rewards**: Random badge/theme per level
```javascript
const unlocks = {
  5: ['calculus', 'dark-theme', 'confetti'],
  10: ['streakFreeze:1', 'hardMode']
};
```

## 4. REWARD DESIGN

**Trigger Rules**:
```
- Daily goal hit: Level-up animation (3s celebration)
- Streak 7: Rare badge + 2x XP day
- Near-miss (4/5 goal): "Almost! 1 more → bonus"
- Milestone (Level 10): Full screen ceremony + share button
```

**Avoid Overuse**:
```javascript
const rewardCooldowns = {
  confetti: 300000,  // 5min
  bonusXP: 86400000  // 24h
};
```

## 5. RE-ENGAGEMENT STRATEGY

**Inactivity Detection** (`onSnapshot listener`):
```
daysIdle = (now - lastSessionEnd) / day_ms

if (daysIdle == 1 && streak > 0):
  message = "Don't break your 🔥${streak} streak!"

if (daysIdle > 3):
  message = "Missed ${improvedTopic}. Continue?"
  
Push if permission + opens to exact continuation point
```

## 6. SESSION DESIGN

**Ideal**: 8-12 minutes (3-4 quick actions)
```
Max 5 quizzes/session
After 3 quizzes → suggest game/flashcards
Session > 15min → "Great work! Continue tomorrow?"
XP bonus for stopping at goal completion
```

**Burnout Detection**:
```javascript
if (quizCount > 5 || sessionDuration > 15*60*1000) {
  topAction = 'tomorrowGoalSetup';
  message = "Amazing session! Set tomorrow's goal?";
}
```

## 7. BEHAVIORAL INSIGHTS

**Why Users Return**:
1. **Variable streaks**: Dopamine from "almost lose → save"
2. **Near-miss goals**: "4/5 → just one more"
3. **Social proof**: "Friends at level 15" (future)
4. **Loss aversion**: "Don't lose streak XP bonus"

**Balance**: 70% learning + 30% game/reward → sustainable addiction

## 8. IMPLEMENTATION HOOKS

**Firestore Updates**:
```javascript
// In useLearningFlow updateAfterAction
await updateDoc(userRef, {
  dailyProgress: increment(1),
  streakEndTime: ifDailyComplete() ? tomorrow() : streakEndTime,
  lastSessionEnd: sessionDuration > 5*60 ? serverTimestamp() : lastSessionEnd
});
```

**Hook Enhancement**:
```javascript
const retentionState = {
  dailyProgress: state.dailyProgress,
  goalComplete: state.dailyProgress >= state.dailyGoal,
  streakRisk: hoursUntilMidnight(streakEndTime) < 2,
  nearMiss: state.dailyProgress === state.dailyGoal - 1
};
```

**Frontend Reaction**:
```javascript
if (retentionState.goalComplete) {
  showCelebration("Daily goal! 🔥 Streak safe!");
  topAction = 'setTomorrowGoal';
}

if (retentionState.streakRisk) {
  PrimaryCTA = "Save Streak → Quick Quiz";
}
```

**RETENTION COMPLETE** - Daily habit machine built.

