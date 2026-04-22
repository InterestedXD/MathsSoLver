# Real-Time Coach UX Flows & Behavior

## 1. NON-FORCEFUL GUIDANCE

**Rules**:
```
Idle > 30s → show subtle suggestion (tooltip/pill)
Idle > 2min → animate suggestion (pulse glow)
Never auto-redirect
User click away → hide suggestion for 30s
```

**Timing**:
```javascript
useEffect(() => {
  const timeout = setTimeout(() => setShowSuggestion(true), 30000);
  const hideTimeout = setTimeout(() => setShowSuggestion(false), 120000);
  return () => {
    clearTimeout(timeout);
    clearTimeout(hideTimeout);
  };
}, [idleStart]);
```

## 2. VISIBLE REASONING

**Generator** (`utils/reasonGenerator.js`):
```javascript
function generateReason(state, topAction) {
  const gap = 1 - state.mastery[state.activeTopic];
  
  if (gap > 0.3 && topAction.type === 'flashcards') {
    return `Your ${state.activeTopic} mastery is ${Math.round(state.mastery[state.activeTopic]*100)}%. Flashcards will strengthen it.`;
  }
  
  if (state.streak > 3 && topAction.type === 'quiz') {
    return `Streak 🔥${state.streak}! Time to test yourself with a quiz.`;
  }
  
  if (daysSinceLast > 2) {
    return `Haven't practiced ${state.activeTopic} in ${daysSinceLast} days. Quick review?`;
  }
  
  return `${topAction.type} is your best next step right now.`;
}
```

**UI Attachment**:
```
[Practice Flashcards ↑]
Your algebra mastery is 62%. Flashcards will strengthen it.
```

## 3. SMOOTH TRANSITIONS

**Quiz Completion Flow** (1500ms total):
```
t=0ms:   Show results + confetti (if success) [fade in 300ms]
t=500ms: Animate XP gain [XP counter 400ms]
t=1000ms: Slide in coach message + reason [slide up 300ms]
t=1400ms: Primary CTA glows + subtle pulse [infinite until click]
```

**Framer Motion**:
```javascript
<AnimatePresence>
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.0, duration: 0.3 }}
  >
    {coachMessage}
  </motion.div>
</AnimatePresence>
```

## 4. MICRO-FEEDBACK SYSTEM

**Placement**: Inline toast (top-right, auto-dismiss)

**Timings & Triggers**:
```
Correct answer: "✅ Perfect!" [1200ms green toast]
Wrong answer: "Try reviewing that concept" [2000ms yellow toast]
3 correct streak: "You're on fire! 🔥" [800ms]
Failure streak: "Let's slow down" [2500ms]
```

**Implementation**:
```javascript
// In Quiz component
useEffect(() => {
  if (isCorrect) {
    toast.success('✅ Perfect!', { duration: 1200 });
    updateStreak(1);
  } else {
    toast.warning("Let's review", { duration: 2000 });
    updateStreak(-1);
  }
}, [answer]);
```

## 5. DASHBOARD BEHAVIOR

**Dynamic Layout**:
```
Always visible (60% height):
[XP Bar + Level] [Streak 🔥4]

Conditional (top 40%):
showSuggestion ? 
  [Primary CTA + Reason] 
  [2 Secondary small buttons]
: 
  [Static welcome + manual nav]
```

**Priority**:
1. Primary CTA (full width, pulsing glow)
2. Reason text (below CTA)
3. Secondary (row of 3 small chips)

## 6. HOOK UPGRADE

**`useLearningFlow.js`**:
```javascript
export function useLearningFlow(userId, sessionIdle) {
  // ... existing logic ...
  
  const [showSuggestion, setShowSuggestion] = useState(false);
  
  useEffect(() => {
    if (sessionIdle > 30) setShowSuggestion(true);
    else if (sessionIdle < 5) setShowSuggestion(false);
  }, [sessionIdle]);
  
  return {
    topAction,
    nextActions,
    message,
    reason: generateReason(state, topAction),
    showSuggestion
  };
}
```

**Component Reaction**:
```javascript
function Dashboard() {
  const { showSuggestion, topAction, reason } = useLearningFlow();
  
  return (
    <>
      {!showSuggestion && <WelcomeScreen />}
      {showSuggestion && (
        <div className="animate-fadeIn">
          <h2>{topAction.label}</h2>
          <p className="text-muted">{reason}</p>
          <PrimaryButton>{topAction.type}</PrimaryButton>
        </div>
      )}
    </>
  );
}
```

## 7. REAL USER SCENARIOS

**Scenario 1: Fails quiz twice (algebra)**
```
t=0s: Quiz results: 40% [red toast "Let's slow down" 2.5s]
t=2s: XP +20 [counter anim]
t=5s: Coach: "Struggling with algebra? Flashcards will help." 
t=5.5s: Primary CTA glows
t=35s: If idle → suggestion tooltip appears
→ User clicks Flashcards
```

**Scenario 2: On streak (4 wins)**
```
t=0s: Quiz results: 100% [green confetti + "Perfect! 🔥" 1.2s]
t=1s: XP +80 [counter]
t=2s: "Streak 🔥4! Test yourself with harder quiz."
t=2.5s: Quiz CTA (hard mode) primary
→ Suggests challenge
```

**Scenario 3: Idle 45s on dashboard**
```
t=0s: Dashboard static
t=30s: Primary CTA starts subtle pulse
t=35s: "Best next step" tooltip appears
t=120s: Secondary suggestions fade in
→ Non-intrusive re-engagement
```

**LIVING SYSTEM ACHIEVED** - Smooth, human-like coach behavior.

