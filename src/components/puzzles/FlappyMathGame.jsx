import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Math question generators for different difficulties
const generateQuestion = (difficulty) => {
  const operations = difficulty === 'Easy' 
    ? ['+', '-'] 
    : difficulty === 'Medium' 
      ? ['+', '-', '×'] 
      : ['+', '-', '×', '÷'];
  
  const op = operations[Math.floor(Math.random() * operations.length)];
  let a, b, question, answer, options;

  switch (op) {
    case '+':
      a = Math.floor(Math.random() * (difficulty === 'Easy' ? 20 : difficulty === 'Medium' ? 50 : 100)) + 1;
      b = Math.floor(Math.random() * (difficulty === 'Easy' ? 20 : difficulty === 'Medium' ? 50 : 100)) + 1;
      answer = a + b;
      question = `${a} + ${b}`;
      break;
    case '-':
      a = Math.floor(Math.random() * (difficulty === 'Easy' ? 20 : difficulty === 'Medium' ? 50 : 100)) + 10;
      b = Math.floor(Math.random() * a);
      answer = a - b;
      question = `${a} - ${b}`;
      break;
    case '×':
      a = Math.floor(Math.random() * (difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 12 : 15)) + 2;
      b = Math.floor(Math.random() * (difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 12 : 15)) + 2;
      answer = a * b;
      question = `${a} × ${b}`;
      break;
    case '÷':
      b = Math.floor(Math.random() * (difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 12 : 15)) + 2;
      answer = Math.floor(Math.random() * (difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 12 : 15)) + 2;
      a = b * answer;
      question = `${a} ÷ ${b}`;
      break;
    default:
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      answer = a + b;
      question = `${a} + ${b}`;
  }

  // Generate wrong options
  const optionsSet = new Set([answer]);
  while (optionsSet.size < 3) {
    const wrong = answer + Math.floor(Math.random() * 10) - 5;
    if (wrong > 0 && wrong !== answer) {
      optionsSet.add(wrong);
    }
  }
  options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return { question, options, correct: answer };
};

export default function FlappyMathGame({ onComplete, onBack, progress, updateProgress, xpReward }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start'); // start, playing, paused, gameOver
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState('Medium');
  const [showMathQuestion, setShowMathQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentPipeIndex, setCurrentPipeIndex] = useState(-1);
  const [earnedXP, setEarnedXP] = useState(0);

  // Game state refs (for animation loop)
  const gameRef = useRef({
    birdY: 200,
    velocity: 0,
    gravity: 0.25,
    jump: -5,
    pipes: [],
    score: 0,
    frameCount: 0,
    isPaused: false,
    currentQuestionPipe: null,
    birdX: 80,
    pipeGap: 130,
    pipeSpeed: 2,
  });

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('flappyMathHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Load images
  const [images, setImages] = useState({
    bg: null,
    bird: [],
    pipe: { top: null, bottom: null },
    ground: null,
  });

  useEffect(() => {
    // Load all game assets
    const loadImages = () => {
      const bg = new Image();
      bg.src = '/flappy/img/BG.png';
      
      const birdFrames = [0, 1, 2].map(i => {
        const img = new Image();
        img.src = `/flappy/img/bird/b${i}.png`;
        return img;
      });
      
      const topPipe = new Image();
      topPipe.src = '/flappy/img/toppipe.png';
      
      const bottomPipe = new Image();
      bottomPipe.src = '/flappy/img/botpipe.png';
      
      const ground = new Image();
      ground.src = '/flappy/img/ground.png';

      Promise.all([
        new Promise(r => bg.onload = r),
        ...birdFrames.map(r => new Promise(res => r.onload = res)),
        new Promise(r => topPipe.onload = r),
        new Promise(r => bottomPipe.onload = r),
        new Promise(r => ground.onload = r),
      ]).then(() => {
        setImages({
          bg,
          bird: birdFrames,
          pipe: { top: topPipe, bottom: bottomPipe },
          ground,
        });
      });
    };

    loadImages();
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing' || showMathQuestion) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const game = gameRef.current;

    const update = () => {
      if (game.isPaused || gameState !== 'playing') return;

      game.frameCount++;

      // Update bird
      game.velocity += game.gravity;
      game.birdY += game.velocity;

      // Generate pipes
      if (game.frameCount % 140 === 0) {
        const minHeight = 50;
        const maxHeight = canvas.height - 150 - game.pipeGap;
        const pipeHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
        
        game.pipes.push({
          x: canvas.width,
          y: pipeHeight - 320, // top pipe position
          passed: false,
        });
      }

      // Update pipes
      game.pipes.forEach((pipe, index) => {
        pipe.x -= game.pipeSpeed;

        // Check if bird should answer math question
        if (!game.currentQuestionPipe && pipe.x - game.birdX < 150 && pipe.x - game.birdX > 0) {
          game.isPaused = true;
          game.currentQuestionPipe = index;
          const question = generateQuestion(difficulty);
          setCurrentQuestion(question);
          setCurrentPipeIndex(index);
          setShowMathQuestion(true);
        }

        // Check if bird passed pipe successfully
        if (!pipe.passed && pipe.x + 50 < game.birdX) {
          pipe.passed = true;
          game.score += 1;
          setScore(game.score);
        }
      });

      // Remove off-screen pipes
      game.pipes = game.pipes.filter(pipe => pipe.x > -100);

      // Check collision with ground or ceiling
      if (game.birdY >= canvas.height - 60 || game.birdY <= 0) {
        gameOver();
        return;
      }

      // Check pipe collision
      game.pipes.forEach(pipe => {
        const birdRadius = 15;
        const pipeWidth = 50;
        
        // Horizontal collision
        if (game.birdX + birdRadius > pipe.x && game.birdX - birdRadius < pipe.x + pipeWidth) {
          // Vertical collision (top or bottom pipe)
          if (game.birdY - birdRadius < pipe.y + 320 || game.birdY + birdRadius > pipe.y + 320 + game.pipeGap) {
            gameOver();
          }
        }
      });
    };

    const draw = () => {
      const game = gameRef.current;

      // Draw background
      if (images.bg) {
        ctx.drawImage(images.bg, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#30c0df';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw pipes
      game.pipes.forEach(pipe => {
        if (images.pipe.top && images.pipe.bottom) {
          // Top pipe
          ctx.drawImage(images.pipe.top, pipe.x, pipe.y, 50, 320);
          // Bottom pipe
          ctx.drawImage(images.pipe.bottom, pipe.x, pipe.y + 320 + game.pipeGap, 50, 320);
        } else {
          // Fallback if images not loaded
          ctx.fillStyle = '#2ecc71';
          ctx.fillRect(pipe.x, pipe.y, 50, 320);
          ctx.fillRect(pipe.x, pipe.y + 320 + game.pipeGap, 50, 320);
        }
      });

      // Draw ground
      if (images.ground) {
        ctx.drawImage(images.ground, 0, canvas.height - 60, canvas.width, 60);
      }

      // Draw bird
      const birdFrame = Math.floor(game.frameCount / 8) % 3;
      if (images.bird[birdFrame]) {
        ctx.drawImage(images.bird[birdFrame], game.birdX - 15, game.birdY - 15, 30, 30);
      } else {
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(game.birdX, game.birdY, 15, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw score
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.font = 'bold 32px Arial';
      ctx.fillText(game.score, canvas.width / 2 - 10, 50);
      ctx.strokeText(game.score, canvas.width / 2 - 10, 50);
    };

    const gameLoop = () => {
      update();
      draw();
      if (gameState === 'playing' && !showMathQuestion) {
        animationId = requestAnimationFrame(gameLoop);
      }
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [gameState, showMathQuestion, difficulty, images]);

  // Handle jump
  const handleJump = useCallback(() => {
    if (gameState === 'playing' && !showMathQuestion) {
      gameRef.current.velocity = gameRef.current.jump;
    }
  }, [gameState, showMathQuestion]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === 'start') {
          startGame();
        } else if (gameState === 'playing') {
          handleJump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleJump]);

  const startGame = () => {
    gameRef.current = {
      birdY: 200,
      velocity: 0,
      gravity: difficulty === 'Easy' ? 0.2 : difficulty === 'Medium' ? 0.25 : 0.3,
      jump: -5,
      pipes: [],
      score: 0,
      frameCount: 0,
      isPaused: false,
      currentQuestionPipe: null,
      birdX: 80,
      pipeGap: difficulty === 'Easy' ? 150 : difficulty === 'Medium' ? 130 : 110,
      pipeSpeed: difficulty === 'Easy' ? 1.5 : difficulty === 'Medium' ? 2 : 2.5,
    };
    setScore(0);
    setGameState('playing');
    setShowMathQuestion(false);
    setCurrentQuestion(null);
  };

  const gameOver = () => {
    setGameState('gameOver');
    
    // Calculate XP
    const baseXP = xpReward?.[difficulty.toLowerCase()] || 10;
    const scoreBonus = Math.floor(score / 5) * 2;
    const totalXP = baseXP + scoreBonus;
    setEarnedXP(totalXP);

    // Save high score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('flappyMathHighScore', score.toString());
    }

    // Update progress
    if (onComplete) {
      onComplete(totalXP);
    }
    if (updateProgress) {
      updateProgress('flappymath', score, difficulty);
    }
  };

  // Handle math question answer
  const handleAnswer = (answer) => {
    if (answer === currentQuestion.correct) {
      // Correct answer - remove the pipe and continue
      const game = gameRef.current;
      if (game.currentQuestionPipe !== null && game.pipes[game.currentQuestionPipe]) {
        game.pipes.splice(game.currentQuestionPipe, 1);
        game.score += 10;
        setScore(game.score);
      }
      game.isPaused = false;
      game.currentQuestionPipe = null;
      setShowMathQuestion(false);
      setCurrentQuestion(null);
      setCurrentPipeIndex(-1);
    } else {
      // Wrong answer - game over
      gameOver();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="bg-gray-800 border-gray-700 max-w-lg w-full">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" onClick={onBack} className="text-gray-300">
              ← Back
            </Button>
            <div className="flex gap-2">
              {['Easy', 'Medium', 'Hard'].map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1 rounded text-sm ${
                    difficulty === d 
                      ? d === 'Easy' ? 'bg-green-500' : d === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Game Canvas */}
          <div className="relative mx-auto" style={{ width: '320px', height: '480px' }}>
            <canvas
              ref={canvasRef}
              width={320}
              height={480}
              className="rounded-xl border border-gray-600 bg-sky-300 w-full"
              onClick={handleJump}
            />

            {/* Start Screen */}
            {gameState === 'start' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-xl">
                <h2 className="text-2xl font-bold text-white mb-2">Flappy Math</h2>
                <p className="text-gray-200 text-center mb-4 px-4">
                  Solve math questions to break through pipes!
                </p>
                <Button 
                  onClick={startGame}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  Start Game
                </Button>
              </div>
            )}

            {/* Math Question Overlay */}
            {showMathQuestion && currentQuestion && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl">
                <div className="bg-gray-800 p-6 rounded-xl text-center border border-gray-600">
                  <h3 className="text-white font-bold mb-2">Solve to break the pipe!</h3>
                  <p className="text-2xl font-bold text-yellow-400 mb-4">
                    {currentQuestion.question} = ?
                  </p>
                  <div className="flex gap-2 justify-center">
                    {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(option)}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Game Over Screen */}
            {gameState === 'gameOver' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-xl">
                <h2 className="text-2xl font-bold text-red-500 mb-2">Game Over!</h2>
                <div className="text-white mb-4 text-center">
                  <p className="text-xl">Score: {score}</p>
                  <p className="text-gray-300">Best: {highScore}</p>
                  <p className="text-green-400 font-bold mt-2">+{earnedXP} XP</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={startGame}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white"
                  >
                    Play Again
                  </Button>
                  <Button 
                    onClick={onBack}
                    variant="outline"
                    className="text-white border-gray-500"
                  >
                    Back to Arcade
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 text-center text-gray-400 text-sm">
            <p>Press SPACE or click to jump</p>
            <p>Answer math questions to break through pipes!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

