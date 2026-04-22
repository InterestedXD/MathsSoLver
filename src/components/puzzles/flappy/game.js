// Main game module for Flappy Math
import { Physics } from './physics.js';
import { Pipes } from './pipes.js';
import { generateQuestion } from './mathEngine.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    // Game state
    this.isRunning = false;
    this.isPaused = false;
    this.isGameOver = false;
    this.score = 0;
    this.difficulty = 'Easy';
    
    // Physics and game objects
    this.physics = new Physics();
    this.pipes = new Pipes(this.width, this.height);
    
    // Bird
    this.bird = {
      x: 80,
      y: this.height / 2,
      velocity: 0,
      radius: 15
    };
    
    // Current question
    this.currentQuestion = null;
    this.currentPipeIndex = -1;
    
    // Animation
    this.animationId = null;
    
    // Callbacks
    this.onScoreChange = null;
    this.onGameOver = null;
    this.onQuestionRequired = null;
  }

  // Set difficulty
  setDifficulty(difficulty) {
    this.difficulty = difficulty;
  }

  // Start the game
  start() {
    this.reset();
    this.isRunning = true;
    this.isPaused = false;
    this.isGameOver = false;
    this.gameLoop();
  }

  // Reset game state
  reset() {
    this.score = 0;
    this.bird = {
      x: 80,
      y: this.height / 2,
      velocity: 0,
      radius: 15
    };
    this.pipes.reset();
    this.currentQuestion = null;
    this.currentPipeIndex = -1;
    if (this.onScoreChange) {
      this.onScoreChange(this.score);
    }
  }

  // Bird jumps
  jump() {
    if (this.isRunning && !this.isPaused) {
      this.bird.velocity = this.physics.jump(this.bird.velocity);
    }
  }

  // Main game loop
  gameLoop() {
    if (!this.isRunning || this.isGameOver) return;

    // Clear canvas
    this.ctx.fillStyle = '#0B0F19';
    this.ctx.fillRect(0, 0, this.width, this.height);

    if (!this.isPaused) {
      // Update physics
      const newState = this.physics.updatePosition(this.bird.y, this.bird.velocity);
      this.bird.y = newState.y;
      this.bird.velocity = newState.velocity;

      // Update pipes
      this.pipes.update();

      // Check for question trigger
      if (!this.currentQuestion) {
        const nextPipe = this.pipes.getNextPipeInRange(this.bird.x, 120);
        if (nextPipe) {
          // Pause game and show question
          this.isPaused = true;
          this.currentQuestion = generateQuestion(this.difficulty);
          this.currentPipeIndex = this.pipes.pipes.indexOf(nextPipe);
          nextPipe.triggered = true;
          
          if (this.onQuestionRequired) {
            this.onQuestionRequired(this.currentQuestion);
          }
        }
      }

      // Check for pipe pass (score)
      const passResult = this.pipes.checkPipePassed(this.bird.x, this.bird.radius);
      if (passResult.passed) {
        this.score += 10;
        if (this.onScoreChange) {
          this.onScoreChange(this.score);
        }
      }

      // Check collision
      for (let i = 0; i < this.pipes.pipes.length; i++) {
        if (this.physics.checkCollision(this.bird, this.pipes.pipes[i], this.height)) {
          this.gameOver();
          return;
        }
      }
    }

    // Draw everything
    this.draw();

    // Continue loop
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  // Draw game elements
  draw() {
    // Draw pipes
    this.pipes.draw(this.ctx);

    // Draw bird
    this.drawBird();
  }

  // Draw the bird
  drawBird() {
    const { x, y, radius } = this.bird;

    // Bird body gradient
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, '#FBBF24');
    gradient.addColorStop(1, '#F59E0B');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Bird eye
    this.ctx.fillStyle = '#0B0F19';
    this.ctx.beginPath();
    this.ctx.arc(x + 6, y - 4, 5, 0, Math.PI * 2);
    this.ctx.fill();

    // Bird pupil
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(x + 7, y - 5, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Bird wing
    this.ctx.fillStyle = '#D97706';
    this.ctx.beginPath();
    this.ctx.ellipse(x - 4, y + 4, 8, 5, Math.PI / 4, 0, Math.PI * 2);
    this.ctx.fill();
  }

  // Handle answer
  handleAnswer(selectedIndex) {
    if (!this.currentQuestion) return false;

    const isCorrect = selectedIndex === this.currentQuestion.correctIndex;

    if (isCorrect) {
      // Remove the triggered pipe
      if (this.currentPipeIndex >= 0) {
        this.pipes.removePipe(this.currentPipeIndex);
      }
      
      // Add score
      this.score += 10;
      if (this.onScoreChange) {
        this.onScoreChange(this.score);
      }
      
      // Resume game
      this.currentQuestion = null;
      this.currentPipeIndex = -1;
      this.isPaused = false;
      
      return true;
    } else {
      // Wrong answer - game over
      this.gameOver();
      return false;
    }
  }

  // Game over
  gameOver() {
    this.isRunning = false;
    this.isGameOver = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.onGameOver) {
      this.onGameOver(this.score);
    }
  }

  // Stop game
  stop() {
    this.isRunning = false;
    this.isGameOver = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  // Get game state for rendering when paused
  drawPausedState() {
    this.ctx.fillStyle = '#0B0F19';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.pipes.draw(this.ctx);
    this.drawBird();
  }
}

