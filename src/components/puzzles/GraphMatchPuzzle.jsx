import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
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

// Generate graph matching problems
const generateProblem = (difficulty) => {
  const problems = {
    Easy: [
      { 
        equation: 'y = x', 
        description: 'Linear function through origin',
        options: ['linear-up', 'linear-down', 'parabola-up', 'parabola-down'],
        correct: 'linear-up'
      },
      { 
        equation: 'y = -x', 
        description: 'Linear function with negative slope',
        options: ['linear-up', 'linear-down', 'parabola-up', 'parabola-down'],
        correct: 'linear-down'
      },
      { 
        equation: 'y = x²', 
        description: 'Parabola opening upward',
        options: ['linear-up', 'linear-down', 'parabola-up', 'parabola-down'],
        correct: 'parabola-up'
      },
      { 
        equation: 'y = -x²', 
        description: 'Parabola opening downward',
        options: ['linear-up', 'linear-down', 'parabola-up', 'parabola-down'],
        correct: 'parabola-down'
      },
      {
        equation: 'y = 2',
        description: 'Horizontal line',
        options: ['linear-up', 'linear-down', 'horizontal', 'vertical'],
        correct: 'horizontal'
      }
    ],
    Medium: [
      { 
        equation: 'y = x² + 1', 
        description: 'Parabola shifted up',
        options: ['parabola-up-1', 'parabola-up-2', 'parabola-down-1', 'parabola-up-3'],
        correct: 'parabola-up-1'
      },
      { 
        equation: 'y = x² - 1', 
        description: 'Parabola shifted down',
        options: ['parabola-up-1', 'parabola-down-1', 'parabola-up-2', 'horizontal'],
        correct: 'parabola-down-1'
      },
      { 
        equation: 'y = (x-1)²', 
        description: 'Parabola shifted right',
        options: ['parabola-right', 'parabola-left', 'parabola-up-1', 'parabola-down-1'],
        correct: 'parabola-right'
      },
      { 
        equation: 'y = |x|', 
        description: 'V-shaped absolute value',
        options: ['v-shape', 'parabola-up', 'linear-up', 'step'],
        correct: 'v-shape'
      },
      {
        equation: 'y = 1/x',
        description: 'Hyperbola',
        options: ['hyperbola', 'parabola-up', 'linear-up', 'step'],
        correct: 'hyperbola'
      }
    ],
    Hard: [
      { 
        equation: 'y = x³', 
        description: 'Cubic function',
        options: ['cubic-up', 'cubic-down', 'parabola-up', 's-curve'],
        correct: 'cubic-up'
      },
      { 
        equation: 'y = √x', 
        description: 'Square root function',
        options: ['sqrt-curve', 'parabola-up', 'linear-up', 'v-shape'],
        correct: 'sqrt-curve'
      },
      { 
        equation: 'y = 2x + 1', 
        description: 'Linear with y-intercept',
        options: ['linear-intercept-1', 'linear-intercept-2', 'linear-up', 'parabola-up'],
        correct: 'linear-intercept-1'
      },
      { 
        equation: 'y = -x² + 4', 
        description: 'Inverted parabola with intercept',
        options: ['inverted-4', 'parabola-down', 'parabola-up', 'v-shape'],
        correct: 'inverted-4'
      },
      {
        equation: 'y = e^x',
        description: 'Exponential growth',
        options: ['exponential', 'linear-up', 'parabola-up', 'logarithmic'],
        correct: 'exponential'
      }
    ]
  };
  
  const levelProblems = problems[difficulty];
  return levelProblems[Math.floor(Math.random() * levelProblems.length)];
};

// Simple SVG graph renderer
const GraphPreview = ({ type, className = "" }) => {
  const size = 100;
  const center = size / 2;
  
  const graphs = {
    'linear-up': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <line x1="0" y1={size} x2={size} y2="0" stroke="currentColor" strokeWidth="2" />
        <text x="70" y="25" fontSize="8" fill="currentColor">↑</text>
      </svg>
    ),
    'linear-down': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <line x1="0" y1="0" x2={size} y2={size} stroke="currentColor" strokeWidth="2" />
        <text x="70" y="85" fontSize="8" fill="currentColor">↓</text>
      </svg>
    ),
    'parabola-up': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <path d="M 0 80 Q 50 0 100 80" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    'parabola-down': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <path d="M 0 20 Q 50 100 100 20" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    'horizontal': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <line x1="0" y1={center} x2={size} y2={center} stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    'vertical': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <line x1={center} y1="0" x2={center} y2={size} stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    'parabola-up-1': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <path d="M 0 90 Q 50 10 100 90" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="40" y="15" fontSize="8" fill="currentColor">+1</text>
      </svg>
    ),
    'parabola-up-2': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <path d="M 0 95 Q 50 40 100 95" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    'parabola-up-3': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <path d="M 0 70 Q 50 -10 100 70" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    'parabola-down-1': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <path d="M 0 10 Q 50 90 100 10" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="40" y="95" fontSize="8" fill="currentColor">-1</text>
      </svg>
    ),
    'parabola-right': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <path d="M 20 0 Q 20 50 90 100" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    'parabola-left': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <path d="M 80 0 Q 80 50 10 100" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    'v-shape': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <polyline points="0,0 50,50 100,0" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    'step': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <polyline points="0,80 30,80 30,40 60,40 60,0" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    'hyperbola': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <path d="M 20 0 Q 30 30 50 50 Q 70 70 100 100" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M 0 100 Q 30 70 50 50 Q 70 30 80 0" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    'cubic-up': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <path d="M 0 100 C 30 100 70 0 100 0" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    'cubic-down': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <path d="M 0 0 C 30 0 70 100 100 100" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    'sqrt-curve': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <path d="M 0 100 Q 30 70 50 50 T 100 0" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    'linear-intercept-1': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <line x1="0" y1={size-15} x2={size} y2="0" stroke="currentColor" strokeWidth="2" />
        <circle cx={center} cy={center} r="3" fill="currentColor" />
      </svg>
    ),
    'linear-intercept-2': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <line x1="0" y1={size-30} x2={size} y2="0" stroke="currentColor" strokeWidth="2" />
        <circle cx={center - 10} cy={center + 10} r="3" fill="currentColor" />
      </svg>
    ),
    'inverted-4': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <path d="M 0 30 Q 50 100 100 30" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="0" y1="30" x2={size} y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="4" />
      </svg>
    ),
    'exponential': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <path d="M 0 100 Q 30 80 50 50 T 100 0" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    'logarithmic': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <path d="M 0 0 Q 30 50 100 80" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    's-curve': (
      <svg viewBox={`0 0 ${size} ${size}`} className={className}>
        <path d="M 0 80 C 30 80 30 20 50 20 C 70 20 70 80 100 80" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  };
  
  return graphs[type] || graphs['linear-up'];
};

export default function GraphMatchPuzzle({ onComplete, onBack, progress, updateProgress, xpReward }) {
  const [gameState, setGameState] = useState('menu');
  const [difficulty, setDifficulty] = useState('Easy');
  const [currentProblem, setCurrentProblem] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions] = useState(5);
  const [showFeedback, setShowFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [usedHint, setUsedHint] = useState(false);

  // Generate new problem
  const newProblem = useCallback(() => {
    const problem = generateProblem(difficulty);
    setCurrentProblem(problem);
    setSelectedAnswer(null);
    setShowHint(false);
    setUsedHint(false);
  }, [difficulty]);

  // Start game
  const startGame = () => {
    setScore(0);
    setQuestionNumber(0);
    setGameState('playing');
    newProblem();
  };

  // Handle answer selection
  const handleSelect = (answer) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    
    const isCorrect = answer === currentProblem.correct;
    
    if (isCorrect) {
      const points = usedHint ? 20 : 30;
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
    const xpEarned = xpReward[difficulty.toLowerCase()] || 20;
    const finalXP = score > 0 ? xpEarned : Math.floor(xpEarned / 2);
    
    updateProgress?.('graphmatch', score, difficulty);
    onComplete?.(finalXP);
  };

  // Get hint
  const getHint = () => {
    setShowHint(true);
    setUsedHint(true);
    alert(`Hint: ${currentProblem.description}. Look at the shape and key features of each graph.`);
  };

  // Get shuffled options
  const getShuffledOptions = () => {
    if (!currentProblem) return [];
    const options = [...currentProblem.options];
    // Shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  };

  // Menu Screen
  if (gameState === 'menu') {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <Home className="w-4 h-4 mr-2" />
          Back to Arcade
        </Button>

        <Card className="border-2 border-pink-200 dark:border-pink-800">
          <div className="h-2 bg-gradient-to-r from-pink-400 to-red-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <TrendingUp className="w-6 h-6 text-pink-500" />
              Graph Sniper
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              Match equations to their graphs! Test your ability to visualize 
              mathematical functions and understand their properties.
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
              className="w-full bg-gradient-to-r from-pink-400 to-red-500 hover:from-pink-500 hover:to-red-600 text-lg py-6"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Start Matching
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Playing Screen
  if (gameState === 'playing') {
    const options = getShuffledOptions();
    
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
              className="bg-gradient-to-r from-pink-400 to-red-500 h-2 rounded-full transition-all"
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
            <Card className="border-2 border-pink-200 dark:border-pink-800">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-mono text-pink-600 dark:text-pink-400">
                  {currentProblem?.equation}
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentProblem?.description}
                </p>
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
                      <><CheckCircle className="w-5 h-5" /> Correct!</>
                    ) : (
                      <><XCircle className="w-5 h-5" /> Not quite!</>
                    )}
                  </motion.div>
                )}

                {/* Graph Options */}
                <div className="grid grid-cols-2 gap-4">
                  {options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleSelect(option)}
                      disabled={!!showFeedback}
                      className={`
                        p-4 rounded-xl border-2 transition-all hover:scale-105
                        ${selectedAnswer === option 
                          ? (option === currentProblem.correct 
                              ? 'border-green-500 bg-green-50 dark:bg-green-900' 
                              : 'border-red-500 bg-red-50 dark:bg-red-900')
                          : 'border-gray-200 dark:border-gray-600 hover:border-pink-300 dark:hover:border-pink-500 bg-white dark:bg-gray-800'
                        }
                        ${showFeedback && option === currentProblem.correct ? 'border-green-500 bg-green-50 dark:bg-green-900' : ''}
                      `}
                    >
                      <GraphPreview 
                        type={option} 
                        className="w-full h-24 text-gray-600 dark:text-gray-300" 
                      />
                    </button>
                  ))}
                </div>

                {/* Hint Button */}
                {!showFeedback && (
                  <div className="flex justify-center">
                    <Button 
                      variant="outline"
                      onClick={getHint}
                      disabled={showHint}
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-900"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      {showHint ? 'Hint Shown' : 'Need a Hint?'}
                    </Button>
                  </div>
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
      <Card className="border-2 border-pink-200 dark:border-pink-800">
        <div className="h-2 bg-gradient-to-r from-pink-400 to-red-500" />
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block mx-auto"
          >
            <Trophy className="w-16 h-16 text-pink-500 mx-auto mb-2" />
          </motion.div>
          <CardTitle className="text-2xl">Matching Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{score}</div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-pink-600">{xpReward[difficulty.toLowerCase()]}</div>
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
              className="flex-1 bg-gradient-to-r from-pink-400 to-red-500 hover:from-pink-500 hover:to-red-600"
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

