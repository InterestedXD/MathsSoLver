import React, { useState, useEffect } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import XPBar from '@/components/gamification/XPBar';
import { 
  Zap, 
  Calculator, 
  Target, 
  TrendingUp, 
  Trophy, 
  Play,
  Grid3X3,
  Rocket
} from 'lucide-react';
import { calculateLevel, loadUserProgress, GAMIFICATION_CONFIG } from '@/lib/gamification';

// Import puzzle components
import SpeedMathGame from '@/components/puzzles/SpeedMathGame';
import AlgebraBalancePuzzle from '@/components/puzzles/AlgebraBalancePuzzle';
import PrimeFactorPuzzle from '@/components/puzzles/PrimeFactorPuzzle';
import GraphMatchPuzzle from '@/components/puzzles/GraphMatchPuzzle';
import FlappyMathGame from '@/components/puzzles/FlappyMathGame';
import SudokuGame from '@/components/puzzles/SudokuGame';
import GeometryDashGame from '@/components/puzzles/GeometryDashGame';

// Puzzle definitions
const PUZZLES = [
  {
    id: 'speedmath',
    title: 'Speed Math',
    description: 'Solve math problems quickly under time pressure. Boost your mental arithmetic skills!',
    icon: Zap,
    gradient: 'from-yellow-400 via-orange-500 to-amber-500',
    component: SpeedMathGame,
    xpReward: { easy: 10, medium: 20, hard: 30 },
    difficulty: ['Easy', 'Medium', 'Hard']
  },
  {
    id: 'flappymath',
    title: 'Flappy Math',
    description: 'Answer math questions to break obstacles and keep flying.',
    icon: Rocket,
    gradient: 'from-indigo-400 via-purple-500 to-violet-500',
    component: FlappyMathGame,
    xpReward: { easy: 10, medium: 20, hard: 30 },
    difficulty: ['Easy', 'Medium', 'Hard']
  },
  {
    id: 'algebrabalance',
    title: 'Algebra Balance',
    description: 'Learn algebraic equations through visual balance puzzles. Isolate variables like a pro!',
    icon: Calculator,
    gradient: 'from-blue-400 via-indigo-500 to-purple-500',
    component: AlgebraBalancePuzzle,
    xpReward: { base: 20 },
    difficulty: ['Easy', 'Medium', 'Hard']
  },
  {
    id: 'primefactor',
    title: 'Prime Hacker',
    description: 'Break down numbers into their prime factors. Master number theory through gameplay!',
    icon: Target,
    gradient: 'from-green-400 via-teal-500 to-emerald-500',
    component: PrimeFactorPuzzle,
    xpReward: { easy: 15, medium: 25, hard: 35 },
    difficulty: ['Easy', 'Medium', 'Hard']
  },
  {
    id: 'graphmatch',
    title: 'Graph Sniper',
    description: 'Match equations to their graphs. Visualize mathematical functions!',
    icon: TrendingUp,
    gradient: 'from-pink-400 via-rose-500 to-red-500',
    component: GraphMatchPuzzle,
    xpReward: { easy: 20, medium: 30, hard: 40 },
    difficulty: ['Easy', 'Medium', 'Hard']
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    description: 'Classic number puzzle to train logical thinking. Fill the 9x9 grid!',
    icon: Grid3X3,
    gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
    component: SudokuGame,
    xpReward: { easy: 15, medium: 25, hard: 35 },
    difficulty: ['Easy', 'Medium', 'Hard']
  },
  {
    id: 'geometrydash',
    title: 'Geometry Dash Math',
    description: 'Jump over obstacles by solving math problems.',
    icon: Play,
    gradient: 'from-red-400 via-orange-500 to-amber-500',
    component: GeometryDashGame,
    xpReward: { easy: 15, medium: 25, hard: 35 },
    difficulty: ['Easy', 'Medium', 'Hard']
  }
];

// Badge styles
const getDifficultyStyle = (diff) => {
  if (diff === 'Easy') {
    return { backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.3)' };
  } else if (diff === 'Medium') {
    return { backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)' };
  } else {
    return { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)' };
  }
};

export default function Arcade() {
  usePageTitle('Math Arcade - Maths Solver');

  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [puzzleProgress, setPuzzleProgress] = useState({});
  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [xpToNextLevel, setXpToNextLevel] = useState(GAMIFICATION_CONFIG.BASE_XP_FOR_LEVEL);
  const [dailyStreak, setDailyStreak] = useState(0);

  // Load user progress on mount
  useEffect(() => {
    const { xp, level } = loadUserProgress();
    setUserXP(xp);
    setUserLevel(level);
    const { xpToNextLevel: nextLevelXP } = calculateLevel(xp);
    setXpToNextLevel(nextLevelXP);

    // Load puzzle progress
    const stored = localStorage.getItem('puzzleProgress');
    if (stored) {
      setPuzzleProgress(JSON.parse(stored));
    }

    // Load daily streak
    const streak = parseInt(localStorage.getItem('puzzleDailyStreak') || '0');
    setDailyStreak(streak);
  }, []);

  // Save XP earned from puzzles
  const handlePuzzleComplete = (xpEarned) => {
    const newXP = userXP + xpEarned;
    const { level: newLevel, xpToNextLevel: nextLevelXP } = calculateLevel(newXP);
    
    setUserXP(newXP);
    setXpToNextLevel(nextLevelXP);
    setUserLevel(newLevel);

    // Update streak
    const today = new Date().toDateString();
    const lastPlayed = localStorage.getItem('puzzleLastPlayed');
    
    if (lastPlayed !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastPlayed === yesterday.toDateString()) {
        const newStreak = dailyStreak + 1;
        setDailyStreak(newStreak);
        localStorage.setItem('puzzleDailyStreak', newStreak.toString());
      } else {
        setDailyStreak(1);
        localStorage.setItem('puzzleDailyStreak', '1');
      }
      localStorage.setItem('puzzleLastPlayed', today);
    }

    // Save progress
    localStorage.setItem('userXP', newXP.toString());
    localStorage.setItem('userLevel', newLevel.toString());
  };

  // Update puzzle progress
  const updatePuzzleProgress = (puzzleId, score, difficulty) => {
    const newProgress = {
      ...puzzleProgress,
      [puzzleId]: {
        ...puzzleProgress[puzzleId],
        [difficulty]: {
          bestScore: Math.max(score, puzzleProgress[puzzleId]?.[difficulty]?.bestScore || 0),
          timesPlayed: (puzzleProgress[puzzleId]?.[difficulty]?.timesPlayed || 0) + 1
        }
      }
    };
    setPuzzleProgress(newProgress);
    localStorage.setItem('puzzleProgress', JSON.stringify(newProgress));
  };

  const handleBackToArcade = () => {
    setSelectedPuzzle(null);
  };

  // If a puzzle is selected, render it
  if (selectedPuzzle) {
    const PuzzleComponent = selectedPuzzle.component;
    return (
      <PuzzleComponent 
        onComplete={handlePuzzleComplete}
        onBack={handleBackToArcade}
        progress={puzzleProgress[selectedPuzzle.id]}
        updateProgress={updatePuzzleProgress}
        xpReward={selectedPuzzle.xpReward}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#020617] p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 pt-6">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ 
              fontFamily: "'Space Grotesk', sans-serif",
              background: 'linear-gradient(135deg, #FFFFFF 0%, #A5B4FC 50%, #818CF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Math Arcade
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Practice math concepts through interactive games. Earn XP, build streaks, and master mathematics!
          </p>
        </div>

        {/* XP Bar and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2">
            <XPBar 
              xp={userXP} 
              level={userLevel} 
              xpToNextLevel={xpToNextLevel}
            />
          </div>
          <Card className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-gray-700/50">
            <CardContent className="p-5 flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl shadow-lg">
                🔥
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {dailyStreak}
                </div>
                <div className="text-sm text-gray-400 font-medium">
                  Day Streak
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Puzzle Grid - Modern Game Cards */}
        <div className="grid-games mb-12">
          {PUZZLES.map((puzzle, index) => (
            <div
              key={puzzle.id}
              className="game-card animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setSelectedPuzzle(puzzle)}
            >
              {/* Icon */}
              <div 
                className="game-card-icon"
                style={{ 
                  background: `linear-gradient(135deg, ${puzzle.gradient.replace('from-', '').replace('via-', ', ').replace(' to-', ', ')})`
                }}
              >
                <puzzle.icon className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h3 className="game-card-title">
                {puzzle.title}
              </h3>

              {/* Description */}
              <p className="game-card-description">
                {puzzle.description}
              </p>

              {/* Difficulty Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {puzzle.difficulty.map((diff) => (
                  <span 
                    key={diff}
                    style={getDifficultyStyle(diff)}
                    className="badge"
                  >
                    {diff}
                  </span>
                ))}
              </div>

              {/* Best Score Display */}
              {puzzleProgress[puzzle.id] && (
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span>Best: {Math.max(
                    puzzleProgress[puzzle.id].Easy?.bestScore || 0,
                    puzzleProgress[puzzle.id].Medium?.bestScore || 0,
                    puzzleProgress[puzzle.id].Hard?.bestScore || 0,
                    puzzleProgress[puzzle.id]?.bestScore || 0
                  )} pts</span>
                </div>
              )}

              {/* Play Button */}
              <div className="game-card-play">
                <Play className="w-5 h-5" />
                Start Challenge
              </div>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <Card className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white text-xl">
              <Trophy className="w-6 h-6 text-purple-400" />
              Arcade Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-gray-400 space-y-2 text-base" style={{ lineHeight: '1.8', paddingLeft: '24px' }}>
              <li className="list-disc">Complete puzzles daily to build your streak and earn bonus XP!</li>
              <li className="list-disc">Higher difficulty levels reward more XP but require more skill.</li>
              <li className="list-disc">Use hints when stuck - they provide educational guidance without giving away the answer.</li>
              <li className="list-disc">Your best scores are saved - try to beat your personal records!</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

