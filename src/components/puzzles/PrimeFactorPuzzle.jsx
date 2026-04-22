import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Trophy, 
  ChevronRight, 
  RotateCcw,
  Home,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Bomb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Generate prime factorization problems
const generateProblem = (difficulty) => {
  let number, answer, hint;
  
  switch (difficulty) {
    case 'Easy':
      // Small numbers (product of 2 primes)
      const primes1 = [2, 3, 5, 7, 11, 13];
      const p1 = primes1[Math.floor(Math.random() * 4)]; // 2, 3, 5, 7
      const p2 = primes1[Math.floor(Math.random() * 4)];
      number = p1 * p2;
      answer = [Math.min(p1, p2), Math.max(p1, p2)].sort((a, b) => a - b);
      hint = `Find two prime numbers that multiply to ${number}. Try small primes like 2, 3, 5, 7.`;
      break;
      
    case 'Medium':
      // Medium numbers (product of 2-3 primes)
      const primes2 = [2, 3, 5, 7, 11, 13, 17];
      const isThree = Math.random() > 0.5;
      if (isThree) {
        const p3 = primes2[Math.floor(Math.random() * 5)];
        const p4 = primes2[Math.floor(Math.random() * 5)];
        const p5 = primes2[Math.floor(Math.random() * 4)];
        number = p3 * p4 * p5;
        answer = [p3, p4, p5].sort((a, b) => a - b);
        hint = `This number is the product of three prime numbers. Try breaking it down step by step.`;
      } else {
        const p3 = primes2[Math.floor(Math.random() * 6)];
        const p4 = primes2[Math.floor(Math.random() * 6)];
        number = p3 * p4;
        answer = [Math.min(p3, p4), Math.max(p3, p4)].sort((a, b) => a - b);
        hint = `Find two prime numbers that multiply to ${number}.`;
      }
      break;
      
    case 'Hard':
      // Larger numbers (product of 3-4 primes or larger)
      const primes3 = [2, 3, 5, 7, 11, 13, 17, 19, 23];
      const isFour = Math.random() > 0.6;
      if (isFour) {
        const nums = Array.from({ length: 4 }, () => primes3[Math.floor(Math.random() * 7)]);
        number = nums.reduce((a, b) => a * b, 1);
        answer = nums.sort((a, b) => a - b);
        hint = `This is a challenging number! Try dividing by small primes first (2, 3, 5, 7).`;
      } else {
        const nums2 = Array.from({ length: 3 }, () => primes3[Math.floor(Math.random() * 8)]);
        number = nums2.reduce((a, b) => a * b, 1);
        answer = nums2.sort((a, b) => a - b);
        hint = `Break this down into prime factors. Start with the smallest primes.`;
      }
      break;
      
    default:
      number = 12;
      answer = [2, 2, 3];
      hint = '2 × 2 × 3 = 12';
  }
  
  return { 
    number, 
    answer, 
    answerString: answer.join(' × '),
    hint 
  };
};

// Check if answer is correct (order doesn't matter for primes)
const checkAnswer = (userAnswer, correctAnswer) => {
  const userPrimes = userAnswer.split('×').map(n => parseInt(n.trim())).sort((a, b) => a - b);
  if (userPrimes.length !== correctAnswer.length) return false;
  return userPrimes.every((val, idx) => val === correctAnswer[idx]);
};

export default function PrimeFactorPuzzle({ onComplete, onBack, progress, updateProgress, xpReward }) {
  const [gameState, setGameState] = useState('menu');
  const [difficulty, setDifficulty] = useState('Easy');
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions] = useState(5);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showFeedback, setShowFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [usedHint, setUsedHint] = useState(false);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Generate new problem
  const newProblem = useCallback(() => {
    const problem = generateProblem(difficulty);
    setCurrentProblem(problem);
    setUserAnswer('');
    setShowHint(false);
    setUsedHint(false);
  }, [difficulty]);

  // Start game
  const startGame = () => {
    setScore(0);
    setQuestionNumber(0);
    setTimeLeft(60);
    setGameState('playing');
    newProblem();
  };

  // Handle answer submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const isCorrect = checkAnswer(userAnswer, currentProblem.answer);
    
    if (isCorrect) {
      const points = usedHint ? 12 : 20;
      setScore((prev) => prev + points);
      setShowFeedback('correct');
    } else {
      setShowFeedback('wrong');
    }

    setTimeout(() => {
      setShowFeedback(null);
      if (questionNumber >= totalQuestions - 1) {
        endGame();
      } else {
        setQuestionNumber((prev) => prev + 1);
        newProblem();
      }
    }, 1500);
  };

  // End game
  const endGame = () => {
    setGameState('results');
    const xpEarned = xpReward[difficulty.toLowerCase()] || 15;
    const finalXP = score > 0 ? xpEarned : Math.floor(xpEarned / 2);
    
    updateProgress?.('primefactor', score, difficulty);
    onComplete?.(finalXP);
  };

  // Quick answer buttons for easy mode
  const quickAnswers = difficulty === 'Easy' ? [
    [2, 2], [2, 3], [2, 5], [2, 7], [3, 3], [3, 5], [3, 7], [5, 5]
  ] : [];

  // Menu Screen
  if (gameState === 'menu') {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <Home className="w-4 h-4 mr-2" />
          Back to Arcade
        </Button>

        <Card className="border-2 border-green-200 dark:border-green-800">
          <div className="h-2 bg-gradient-to-r from-green-400 to-teal-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="w-6 h-6 text-green-500" />
              Prime Hacker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              Break down numbers into their prime factors! Master number theory 
              by finding the building blocks of mathematics.
            </p>

            {/* Difficulty Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Difficulty</label>
              <div className="grid grid-cols-3 gap-3">
                {['Easy', 'Medium', 'Hard'].map((diff) => (
                  <Button
                    key={diff}
                    variant={difficulty === diff ? 'default' : 'outline'}
                    onClick={() => setDifficulty(diff)}
                    className={`
                      ${diff === 'Easy' ? 'bg-green-500 hover:bg-green-600' : ''}
                      ${diff === 'Medium' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                      ${diff === 'Hard' ? 'bg-red-500 hover:bg-red-600' : ''}
                    `}
                  >
                    {diff}
                    <span className="ml-2 text-xs opacity-75">
                      {xpReward[diff.toLowerCase()]} XP
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Best Score */}
            {progress?.[difficulty]?.bestScore > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Best Score ({difficulty}): {progress[difficulty].bestScore}
              </div>
            )}

            <Button 
              onClick={startGame}
              className="w-full bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-lg py-6"
            >
              <Bomb className="w-5 h-5 mr-2" />
              Start Hacking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Playing Screen
  if (gameState === 'playing') {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <Button onClick={onBack} variant="ghost" size="sm">
            <Home className="w-4 h-4 mr-2" />
            Quit
          </Button>
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              timeLeft <= 15 ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' :
              'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-bold">{timeLeft}s</span>
            </div>
            <div className="text-sm text-gray-500">
              Score: <span className="font-bold text-purple-600">{score}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Question {questionNumber + 1} of {totalQuestions}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-teal-500 h-2 rounded-full transition-all"
              style={{ width: `${((questionNumber + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentProblem?.number}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <Card className={`border-2 ${showFeedback === 'correct' ? 'border-green-500 bg-green-50 dark:bg-green-900' : showFeedback === 'wrong' ? 'border-red-500 bg-red-50 dark:bg-red-900' : 'border-green-200 dark:border-green-800'}`}>
              <CardHeader className="text-center">
                <CardTitle className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Factorize this number into primes:
                </CardTitle>
                <div className="text-5xl font-mono font-bold text-green-600 dark:text-green-400">
                  {currentProblem?.number}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Feedback */}
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                      showFeedback === 'correct' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {showFeedback === 'correct' ? (
                      <><CheckCircle className="w-5 h-5" /> Correct! {currentProblem.answerString}</>
                    ) : (
                      <><XCircle className="w-5 h-5" /> Not quite. The answer is {currentProblem.answerString}</>
                    )}
                  </motion.div>
                )}

                {/* Hint */}
                {showHint && !showFeedback && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 mb-1">
                      <Lightbulb className="w-4 h-4" />
                      <span className="font-medium">Hint</span>
                    </div>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      {currentProblem?.hint}
                    </p>
                  </motion.div>
                )}

                {/* Quick Answers for Easy Mode */}
                {!showFeedback && difficulty === 'Easy' && (
                  <div className="grid grid-cols-4 gap-2">
                    {quickAnswers.map((ans, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => setUserAnswer(ans.join(' × '))}
                        className="font-mono text-xs"
                      >
                        {ans.join('×')}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Answer Input */}
                {!showFeedback && (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="e.g., 2 × 3 × 5"
                        className="flex-1 text-center text-lg py-3 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-green-500 focus:outline-none bg-white dark:bg-gray-800 font-mono"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowHint(true);
                          setUsedHint(true);
                        }}
                        disabled={showHint}
                        className="flex-1"
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Hint
                      </Button>
                      <Button 
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Check
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Results Screen
  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="border-2 border-green-200 dark:border-green-800">
        <div className="h-2 bg-gradient-to-r from-green-400 to-teal-500" />
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block mx-auto"
          >
            <Trophy className="w-16 h-16 text-green-500 mx-auto mb-2" />
          </motion.div>
          <CardTitle className="text-2xl">Hacking Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{score}</div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{xpReward[difficulty.toLowerCase()]}</div>
              <div className="text-sm text-gray-500">XP Earned</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={startGame}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            <Button 
              onClick={onBack}
              className="flex-1 bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Arcade
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

