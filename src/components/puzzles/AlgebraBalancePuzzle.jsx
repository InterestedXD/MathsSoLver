import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  Trophy, 
  ChevronRight, 
  RotateCcw,
  Home,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Generate random equation problems
const generateEquation = (difficulty) => {
  let equation, solution, steps, hint;
  
  switch (difficulty) {
    case 'Easy':
      // Simple: x + a = b
      const a1 = Math.floor(Math.random() * 10) + 1;
      const b1 = a1 + Math.floor(Math.random() * 10) + 1;
      equation = `x + ${a1} = ${b1}`;
      solution = b1 - a1;
      steps = [
        `Start with: x + ${a1} = ${b1}`,
        `Subtract ${a1} from both sides`,
        `x = ${b1} - ${a1}`,
        `x = ${solution}`
      ];
      hint = `To isolate x, you need to get x alone on one side. What operation undoes adding ${a1}?`;
      break;
      
    case 'Medium':
      // Medium: ax + b = c
      const a2 = Math.floor(Math.random() * 5) + 2;
      const x2 = Math.floor(Math.random() * 10) + 1;
      const b2 = Math.floor(Math.random() * 10) + 1;
      const c2 = a2 * x2 + b2;
      equation = `${a2}x + ${b2} = ${c2}`;
      solution = x2;
      steps = [
        `Start with: ${a2}x + ${b2} = ${c2}`,
        `Subtract ${b2} from both sides: ${a2}x = ${c2} - ${b2}`,
        `${a2}x = ${c2 - b2}`,
        `Divide both sides by ${a2}: x = ${c2 - b2} / ${a2}`,
        `x = ${solution}`
      ];
      hint = `First, get the term with x by itself. Then divide by ${a2} to solve for x.`;
      break;
      
    case 'Hard':
      // Hard: ax + b = cx + d
      const a3 = Math.floor(Math.random() * 4) + 2;
      const c3 = a3 + Math.floor(Math.random() * 3) + 1;
      const x3 = Math.floor(Math.random() * 8) + 2;
      const b3 = Math.floor(Math.random() * 10) + 1;
      const d3 = (c3 - a3) * x3 + b3;
      equation = `${a3}x + ${b3} = ${c3}x + ${d3}`;
      solution = x3;
      steps = [
        `Start with: ${a3}x + ${b3} = ${c3}x + ${d3}`,
        `Subtract ${a3}x from both sides: ${b3} = ${c3 - a3}x + ${d3}`,
        `Subtract ${d3} from both sides: ${b3 - d3} = ${c3 - a3}x`,
        `Divide by ${c3 - a3}: x = ${b3 - d3} / ${c3 - a3}`,
        `x = ${solution}`
      ];
      hint = `Get all x terms on one side first. Move the smaller x coefficient to the other side.`;
      break;
      
    default:
      equation = 'x + 5 = 10';
      solution = 5;
      steps = ['x = 10 - 5', 'x = 5'];
      hint = 'Subtract 5 from both sides.';
  }
  
  return { equation, solution, steps, hint };
};

export default function AlgebraBalancePuzzle({ onComplete, onBack, progress, updateProgress, xpReward }) {
  const [gameState, setGameState] = useState('menu');
  const [difficulty, setDifficulty] = useState('Easy');
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions] = useState(5);
  const [showFeedback, setShowFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [usedHint, setUsedHint] = useState(false);

  // Generate new problem
  const newProblem = useCallback(() => {
    const problem = generateEquation(difficulty);
    setCurrentProblem(problem);
    setUserAnswer('');
    setShowHint(false);
    setShowSteps(false);
    setUsedHint(false);
  }, [difficulty]);

  // Start game
  const startGame = () => {
    setScore(0);
    setQuestionNumber(0);
    setGameState('playing');
    newProblem();
  };

  // Handle answer submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const isCorrect = parseInt(userAnswer) === currentProblem.solution;
    
    if (isCorrect) {
      const points = usedHint ? 15 : 20;
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
    const xpEarned = xpReward.base || 20;
    const finalXP = score > 0 ? xpEarned : Math.floor(xpEarned / 2);
    
    updateProgress?.('algebrabalance', score, difficulty);
    onComplete?.(finalXP);
  };

  // Menu Screen
  if (gameState === 'menu') {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <Home className="w-4 h-4 mr-2" />
          Back to Arcade
        </Button>

        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <div className="h-2 bg-gradient-to-r from-blue-400 to-purple-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calculator className="w-6 h-6 text-blue-500" />
              Algebra Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              Learn to solve algebraic equations by isolating the variable. 
              Use balance puzzles to understand how to manipulate equations!
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
              className="w-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-lg py-6"
            >
              <Calculator className="w-5 h-5 mr-2" />
              Start Solving
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
          <div className="text-sm text-gray-500">
            Score: <span className="font-bold text-purple-600">{score}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Question {questionNumber + 1} of {totalQuestions}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${((questionNumber + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentProblem?.equation}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`border-2 ${showFeedback === 'correct' ? 'border-green-500 bg-green-50 dark:bg-green-900' : showFeedback === 'wrong' ? 'border-red-500 bg-red-50 dark:bg-red-900' : 'border-blue-200 dark:border-blue-800'}`}>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-mono bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {currentProblem?.equation}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Visual Balance Scale */}
                <div className="flex items-center justify-center gap-8 py-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">x</span>
                    </div>
                    <div className="text-sm text-gray-500">Left Side</div>
                  </div>
                  <div className="text-2xl text-gray-400">=</div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-purple-600">
                        {currentProblem?.equation.split('=')[1]}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">Right Side</div>
                  </div>
                </div>

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
                      <><CheckCircle className="w-5 h-5" /> Correct! Well done!</>
                    ) : (
                      <><XCircle className="w-5 h-5" /> Not quite. The answer is {currentProblem.solution}</>
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

                {/* Steps */}
                {showSteps && !showFeedback && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1"
                  >
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Solution Steps:</div>
                    {currentProblem?.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 flex items-center justify-center text-xs">
                          {i + 1}
                        </span>
                        {step}
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Answer Input */}
                {!showFeedback && (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-mono">x = </span>
                      <input
                        type="number"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="?"
                        className="flex-1 text-center text-xl py-3 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800"
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
                        type="button"
                        variant="outline"
                        onClick={() => setShowSteps(true)}
                        className="flex-1"
                      >
                        Show Steps
                      </Button>
                      <Button 
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600"
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
      <Card className="border-2 border-blue-200 dark:border-blue-800">
        <div className="h-2 bg-gradient-to-r from-blue-400 to-purple-500" />
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block mx-auto"
          >
            <Trophy className="w-16 h-16 text-blue-500 mx-auto mb-2" />
          </motion.div>
          <CardTitle className="text-2xl">Puzzle Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{score}</div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{xpReward.base}</div>
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
              className="flex-1 bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600"
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

