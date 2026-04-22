import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Zap, 
  Timer, 
  Trophy, 
  Flame, 
  ChevronRight, 
  RotateCcw,
  Home,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Generate random math problems based on difficulty
const generateProblem = (difficulty) => {
  let a, b, operator, answer, display;
  
  switch (difficulty) {
    case 'Easy':
      // Addition and subtraction
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      if (Math.random() > 0.5) {
        operator = '+';
        answer = a + b;
        display = `${a} + ${b}`;
      } else {
        operator = '-';
        // Ensure positive result
        if (a < b) [a, b] = [b, a];
        answer = a - b;
        display = `${a} - ${b}`;
      }
      break;
    case 'Medium':
      // Multiplication and simple division
      if (Math.random() > 0.5) {
        a = Math.floor(Math.random() * 12) + 2;
        b = Math.floor(Math.random() * 12) + 2;
        operator = '×';
        answer = a * b;
        display = `${a} × ${b}`;
      } else {
        b = Math.floor(Math.random() * 10) + 2;
        answer = Math.floor(Math.random() * 10) + 2;
        a = b * answer;
        operator = '÷';
        display = `${a} ÷ ${b}`;
      }
      break;
    case 'Hard':
      // Mixed expressions
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * 20) + 5;
        operator = '+';
        answer = a + b;
        display = `${a} + ${b}`;
      } else if (type === 1) {
        a = Math.floor(Math.random() * 50) + 20;
        b = Math.floor(Math.random() * 30) + 5;
        if (a < b) [a, b] = [b, a];
        operator = '-';
        answer = a - b;
        display = `${a} - ${b}`;
      } else {
        a = Math.floor(Math.random() * 15) + 3;
        b = Math.floor(Math.random() * 15) + 3;
        operator = '×';
        answer = a * b;
        display = `${a} × ${b}`;
      }
      break;
    default:
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      operator = '+';
      answer = a + b;
      display = `${a} + ${b}`;
  }
  
  return { display, answer };
};

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  Easy: { time: 30, questions: 10 },
  Medium: { time: 45, questions: 10 },
  Hard: { time: 60, questions: 10 }
};

export default function SpeedMathGame({ onComplete, onBack, progress, updateProgress, xpReward }) {
  const [gameState, setGameState] = useState('menu'); // menu, playing, results
  const [difficulty, setDifficulty] = useState('Easy');
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_SETTINGS.Easy.time);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [showFeedback, setShowFeedback] = useState(null); // 'correct' or 'wrong'
  const [totalProblems, setTotalProblems] = useState(DIFFICULTY_SETTINGS.Easy.questions);

  // Timer effect
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
  }, [difficulty]);

  // Start game
  const startGame = () => {
    setScore(0);
    setStreak(0);
    setQuestionNumber(0);
    setTimeLeft(DIFFICULTY_SETTINGS[difficulty].time);
    setTotalProblems(DIFFICULTY_SETTINGS[difficulty].questions);
    setGameState('playing');
    newProblem();
  };

  // Handle answer submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const isCorrect = parseInt(userAnswer) === currentProblem.answer;
    
    if (isCorrect) {
      setScore((prev) => prev + 10 + (streak * 2)); // Bonus for streak
      setStreak((prev) => prev + 1);
      setShowFeedback('correct');
    } else {
      setStreak(0);
      setShowFeedback('wrong');
    }

    setQuestionNumber((prev) => prev + 1);

    // Show feedback briefly then move to next
    setTimeout(() => {
      setShowFeedback(null);
      if (questionNumber >= totalProblems - 1) {
        endGame();
      } else {
        newProblem();
      }
    }, 500);
  };

  // End game
  const endGame = () => {
    setGameState('results');
    const xpEarned = xpReward[difficulty.toLowerCase()] || 10;
    const finalXP = score > 0 ? xpEarned : Math.floor(xpEarned / 2);
    
    updateProgress?.('speedmath', score, difficulty);
    onComplete?.(finalXP);
  };

  // Get hint (mock AI hint)
  const getHint = () => {
    alert(`Hint: For ${currentProblem.display}, try breaking it down into smaller steps. ${difficulty === 'Easy' ? 'Use mental math tricks like rounding.' : 'Look for patterns in the numbers.'}`);
  };

  // Menu Screen
  if (gameState === 'menu') {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <Home className="w-4 h-4 mr-2" />
          Back to Arcade
        </Button>

        <Card className="border-2 border-yellow-200 dark:border-yellow-800">
          <div className="h-2 bg-gradient-to-r from-yellow-400 to-orange-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Zap className="w-6 h-6 text-yellow-500" />
              Speed Math Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              Solve as many math problems as you can before time runs out! 
              Build streaks for bonus points.
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
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-lg py-6"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Challenge
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
              timeLeft <= 10 ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' :
              'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
            }`}>
              <Timer className="w-4 h-4" />
              <span className="font-bold">{timeLeft}s</span>
            </div>
            {/* Streak */}
            {streak > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400">
                <Flame className="w-4 h-4" />
                <span className="font-bold">{streak}x</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Question {questionNumber + 1} of {totalProblems}</span>
            <span>Score: {score}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${((questionNumber + 1) / totalProblems) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentProblem?.display}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className={`border-2 ${showFeedback === 'correct' ? 'border-green-500 bg-green-50 dark:bg-green-900' : showFeedback === 'wrong' ? 'border-red-500 bg-red-50 dark:bg-red-900' : 'border-yellow-200 dark:border-yellow-800'}`}>
              <CardHeader className="text-center">
                <CardTitle className="text-4xl font-mono">
                  {currentProblem?.display} = ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter your answer..."
                    className="text-center text-2xl py-6"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={getHint}
                      className="flex-1"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Hint
                    </Button>
                    <Button 
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                    >
                      <ChevronRight className="w-4 h-4 mr-2" />
                      Submit
                    </Button>
                  </div>
                </form>
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
      <Card className="border-2 border-yellow-200 dark:border-yellow-800">
        <div className="h-2 bg-gradient-to-r from-yellow-400 to-orange-500" />
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block mx-auto"
          >
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-2" />
          </motion.div>
          <CardTitle className="text-2xl">Challenge Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{score}</div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{questionNumber}</div>
              <div className="text-sm text-gray-500">Solved</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{xpReward[difficulty.toLowerCase()]}</div>
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
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
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

