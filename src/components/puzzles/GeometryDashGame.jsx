import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  RotateCcw, 
  Home,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Shuffle
} from 'lucide-react';

// Math question generator
const generateMathQuestion = (difficulty) => {
  const operations = ['+', '-', '*', '/'];
  let num1, num2, operation, question, answer, options;
  
  switch(difficulty) {
    case 'Easy':
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      operation = operations[Math.floor(Math.random() * 2)]; // + or -
      break;
    case 'Medium':
      num1 = Math.floor(Math.random() * 20) + 5;
      num2 = Math.floor(Math.random() * 20) + 5;
      operation = operations[Math.floor(Math.random() * 3)]; // +, -, *
      break;
    case 'Hard':
      num1 = Math.floor(Math.random() * 50) + 10;
      num2 = Math.floor(Math.random() * 50) + 10;
      operation = operations[Math.floor(Math.random() * 4)];
      break;
    default:
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      operation = '+';
  }

  // Generate question and answer
  switch(operation) {
    case '+':
      question = `${num1} + ${num2} = ?`;
      answer = num1 + num2;
      break;
    case '-':
      // Ensure positive result
      if (num1 < num2) [num1, num2] = [num2, num1];
      question = `${num1} - ${num2} = ?`;
      answer = num1 - num2;
      break;
    case '*':
      // Use smaller numbers for multiplication
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      question = `${num1} × ${num2} = ?`;
      answer = num1 * num2;
      break;
    case '/':
      // Ensure clean division
      num2 = Math.floor(Math.random() * 9) + 2;
      answer = Math.floor(Math.random() * 10) + 1;
      num1 = num2 * answer;
      question = `${num1} ÷ ${num2} = ?`;
      break;
    default:
      question = `${num1} + ${num2} = ?`;
      answer = num1 + num2;
  }

  // Generate wrong options
  const wrongOptions = new Set();
  while (wrongOptions.size < 2) {
    const wrong = answer + Math.floor(Math.random() * 10) - 5;
    if (wrong !== answer && wrong > 0) {
      wrongOptions.add(wrong);
    }
  }

  // Shuffle options
  const allOptions = [answer, ...Array.from(wrongOptions)];
  for (let i = allOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
  }

  return {
    question,
    correctAnswer: answer,
    options: allOptions
  };
};

export default function GeometryDashGame({ onComplete, onBack, progress, updateProgress, xpReward }) {
  usePageTitle('Geometry Dash Math - Maths Solver');

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const gameLoopRef = useRef(null);
  const gameStateRef = useRef({
    isRunning: false,
    isPaused: false,
    score: 0,
    playerY: 300,
    playerVelocity: 0,
    obstacles: [],
    decorations: [],
    gameOver: false,
    currentObstacleIndex: 0,
    isWaitingForAnswer: false,
    currentQuestion: null,
    currentObstacle: null
  });

  const [gameState, setGameState] = useState({
    isRunning: false,
    isPaused: false,
    score: 0,
    gameOver: false,
    isWaitingForAnswer: false,
    currentQuestion: null,
    currentObstacle: null
  });
  const [difficulty, setDifficulty] = useState('Medium');
  const [showStartScreen, setShowStartScreen] = useState(true);

  // Initialize game
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 400;
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  const startGame = useCallback(() => {
    const state = gameStateRef.current;
    state.isRunning = true;
    state.isPaused = false;
    state.score = 0;
    state.playerY = 300;
    state.playerVelocity = 0;
    state.gameOver = false;
    state.currentObstacleIndex = 0;
    state.isWaitingForAnswer = false;
    state.currentQuestion = null;
    state.currentObstacle = null;

    // Initialize obstacles
    state.obstacles = [
      { x: 800, y: 350, width: 25, height: 30, passed: false },
      { x: 1100, y: 350, width: 25, height: 30, passed: false },
      { x: 1400, y: 320, width: 25, height: 60, passed: false },
      { x: 1700, y: 320, width: 25, height: 60, passed: false },
      { x: 2000, y: 350, width: 50, height: 30, passed: false },
      { x: 2300, y: 280, width: 25, height: 100, passed: false },
      { x: 2600, y: 350, width: 25, height: 30, passed: false },
      { x: 2900, y: 320, width: 25, height: 60, passed: false },
    ];

    // Initialize decorations (platforms to jump on)
    state.decorations = [
      { x: 900, y: 300, width: 60, height: 20 },
      { x: 1500, y: 280, width: 60, height: 20 },
      { x: 2400, y: 250, width: 60, height: 20 },
    ];

    setShowStartScreen(false);
    setGameState({
      isRunning: true,
      isPaused: false,
      score: 0,
      gameOver: false,
      isWaitingForAnswer: false,
      currentQuestion: null,
      currentObstacle: null
    });

    gameLoop();
  }, []);

  const gameLoop = useCallback(() => {
    const state = gameStateRef.current;
    if (!state.isRunning || state.isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 370, canvas.width, 30);
    ctx.fillStyle = '#e94560';
    ctx.fillRect(0, 370, canvas.width, 3);

    // Draw decorations (stars in background)
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 20; i++) {
      const x = (i * 50 + state.score * 0.5) % canvas.width;
      const y = (i * 30) % 200 + 20;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Update and draw obstacles
    const speed = difficulty === 'Easy' ? 3 : difficulty === 'Medium' ? 5 : 7;
    state.obstacles.forEach((obstacle, index) => {
      obstacle.x -= speed;

      // Draw obstacle
      ctx.fillStyle = '#e94560';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // Draw spike details
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.moveTo(obstacle.x, obstacle.y);
      ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y - 10);
      ctx.lineTo(obstacle.x + obstacle.width, obstacle.y);
      ctx.fill();

      // Check if player passed obstacle
      if (!obstacle.passed && obstacle.x + obstacle.width < 100) {
        obstacle.passed = true;
        state.score += 10;
      }

      // Check for math question trigger
      if (!state.isWaitingForAnswer && obstacle.x < 300 && obstacle.x > 250) {
        // Pause game and show math question
        state.isWaitingForAnswer = true;
        state.currentObstacle = obstacle;
        const mathQuestion = generateMathQuestion(difficulty);
        state.currentQuestion = mathQuestion;
        
        setGameState(prev => ({
          ...prev,
          isPaused: true,
          isWaitingForAnswer: true,
          currentQuestion: mathQuestion,
          currentObstacle: obstacle
        }));
      }

      // Check collision
      if (
        100 + 40 > obstacle.x &&
        100 < obstacle.x + obstacle.width &&
        state.playerY + 40 > obstacle.y
      ) {
        // Game over
        state.gameOver = true;
        state.isRunning = false;
        setGameState(prev => ({
          ...prev,
          gameOver: true,
          isRunning: false
        }));
        
        // Calculate XP
        const earnedXP = xpReward?.[difficulty.toLowerCase()] || 10;
        if (onComplete) {
          onComplete(earnedXP);
        }
        if (updateProgress) {
          updateProgress('geometrydash', state.score, difficulty);
        }
      }
    });

    // Remove off-screen obstacles and add new ones
    state.obstacles = state.obstacles.filter(o => o.x > -100);
    if (state.obstacles.length < 5) {
      const lastX = Math.max(...state.obstacles.map(o => o.x));
      state.obstacles.push({
        x: lastX + 300 + Math.random() * 200,
        y: 320 + Math.random() * 30,
        width: 25,
        height: 30 + Math.random() * 30,
        passed: false
      });
    }

    // Draw decorations (platforms)
    state.decorations.forEach(dec => {
      dec.x -= speed;
      if (dec.x + dec.width > 0 && dec.x < canvas.width) {
        ctx.fillStyle = '#533483';
        ctx.fillRect(dec.x, dec.y, dec.width, dec.height);
        ctx.fillStyle = '#7952a3';
        ctx.fillRect(dec.x + 3, dec.y + 3, dec.width - 6, dec.height - 6);
      }
    });
    state.decorations = state.decorations.filter(d => d.x > -100);

    // Player physics
    const gravity = 0.8;
    const jumpForce = -15;
    const groundY = 330;

    state.playerVelocity += gravity;
    state.playerY += state.playerVelocity;

    // Check platform collision
    state.decorations.forEach(dec => {
      if (
        100 + 40 > dec.x &&
        100 < dec.x + dec.width &&
        state.playerY + 40 > dec.y &&
        state.playerY + 40 < dec.y + dec.height + 10 &&
        state.playerVelocity > 0
      ) {
        state.playerY = dec.y - 40;
        state.playerVelocity = 0;
      }
    });

    // Ground collision
    if (state.playerY > groundY) {
      state.playerY = groundY;
      state.playerVelocity = 0;
    }

    // Draw player (cube with face)
    const playerX = 100;
    const playerY = state.playerY;
    
    // Main body
    ctx.fillStyle = '#ffd93d';
    ctx.fillRect(playerX, playerY, 40, 40);
    
    // Face
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(playerX + 8, playerY + 8, 10, 10);
    ctx.fillRect(playerX + 22, playerY + 8, 10, 10);
    
    // Pupils
    ctx.fillStyle = '#000000';
    ctx.fillRect(playerX + 10, playerY + 10, 4, 4);
    ctx.fillRect(playerX + 24, playerY + 10, 4, 4);
    
    // Mouth
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(playerX + 12, playerY + 25, 16, 6);

    // Draw score
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Score: ${state.score}`, 20, 40);

    // Draw difficulty
    ctx.font = '16px Arial';
    ctx.fillText(`Difficulty: ${difficulty}`, 20, 65);

    if (!state.gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [difficulty, xpReward, onComplete, updateProgress]);

  // Handle answer selection
  const handleAnswer = (answer) => {
    const state = gameStateRef.current;
    
    if (state.currentQuestion && answer === state.currentQuestion.correctAnswer) {
      // Correct answer - remove obstacle and continue
      if (state.currentObstacle) {
        state.obstacles = state.obstacles.filter(o => o !== state.currentObstacle);
        state.score += 20; // Bonus for correct answer
      }
      state.isWaitingForAnswer = false;
      state.currentQuestion = null;
      state.currentObstacle = null;
      
      setGameState(prev => ({
        ...prev,
        isPaused: false,
        isWaitingForAnswer: false,
        currentQuestion: null,
        currentObstacle: null,
        score: state.score
      }));
    } else {
      // Wrong answer - game over
      state.gameOver = true;
      state.isRunning = false;
      state.isWaitingForAnswer = false;
      
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        isRunning: false,
        isWaitingForAnswer: false
      }));
      
      const earnedXP = xpReward?.[difficulty.toLowerCase()] || 10;
      if (onComplete) {
        onComplete(earnedXP / 2); // Half XP for losing
      }
    }
  };

  // Handle jump
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        const state = gameStateRef.current;
        if (state.isRunning && !state.isPaused && state.playerY >= 330) {
          state.playerVelocity = -15;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleJump = () => {
    const state = gameStateRef.current;
    if (state.isRunning && !state.isPaused && state.playerY >= 330) {
      state.playerVelocity = -15;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={onBack} 
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Arcade
          </Button>
          
          <h1 className="text-2xl font-bold text-white">Geometry Dash Math</h1>
          
          <div className="flex gap-2">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Game Canvas */}
        <div 
          ref={containerRef}
          className="relative rounded-xl overflow-hidden border-2 border-gray-700"
          style={{ cursor: 'pointer' }}
          onClick={handleJump}
        >
          <canvas 
            ref={canvasRef}
            className="w-full"
            style={{ maxHeight: '400px' }}
          />

          {/* Start Screen Overlay */}
          {showStartScreen && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
              <h2 className="text-4xl font-bold text-white mb-4">Geometry Dash Math</h2>
              <p className="text-gray-300 mb-2">Solve math problems to pass obstacles!</p>
              <p className="text-gray-400 mb-6 text-sm">Press SPACE or click to jump</p>
              <Button 
                onClick={startGame}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>
            </div>
          )}

          {/* Math Question Overlay */}
          {gameState.isWaitingForAnswer && gameState.currentQuestion && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
              <Card className="bg-gray-800 border-gray-700 max-w-md w-full mx-4">
                <CardHeader>
                  <CardTitle className="text-white text-center flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Solve to Pass!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white mb-6">
                      {gameState.currentQuestion.question}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {gameState.currentQuestion.options.map((option, index) => (
                        <Button
                          key={index}
                          onClick={() => handleAnswer(option)}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white text-lg py-6"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Game Over Overlay */}
          {gameState.gameOver && !showStartScreen && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center">
              <h2 className="text-4xl font-bold text-red-500 mb-4">Game Over!</h2>
              <p className="text-xl text-white mb-2">Final Score: {gameState.score}</p>
              <p className="text-gray-400 mb-6">
                XP Earned: {Math.floor((xpReward?.[difficulty.toLowerCase()] || 10) / (gameState.score > 0 ? 1 : 2))}
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={startGame}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
                <Button 
                  onClick={onBack}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Arcade
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Click on the game or press <span className="text-white font-bold">SPACE</span> to jump. 
            Solve math problems to pass obstacles!
          </p>
        </div>
      </div>
    </div>
  );
}

