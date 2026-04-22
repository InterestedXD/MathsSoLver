// Pipes module for Flappy Bird

export class Pipes {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.pipes = [];
    this.pipeWidth = 60;
    this.pipeGap = 140;
    this.pipeSpeed = 3;
    this.spawnTimer = 0;
    this.spawnInterval = 180; // frames between pipes
    this.lastPipeX = canvasWidth;
  }

  // Spawn a new pipe
  spawn() {
    const minTopHeight = 50;
    const maxTopHeight = this.canvasHeight - this.pipeGap - 50;
    const topHeight = Math.floor(Math.random() * (maxTopHeight - minTopHeight) + minTopHeight);

    this.pipes.push({
      x: this.canvasWidth,
      topHeight: topHeight,
      gap: this.pipeGap,
      passed: false,
      triggered: false
    });
  }

  // Update pipe positions
  update() {
    // Spawn new pipes
    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawn();
      this.spawnTimer = 0;
    }

    // Move pipes
    this.pipes = this.pipes.map(pipe => ({
      ...pipe,
      x: pipe.x - this.pipeSpeed
    }));

    // Remove off-screen pipes
    this.pipes = this.pipes.filter(pipe => pipe.x > -this.pipeWidth);
  }

  // Get the current pipe that needs a question (first untriggered pipe in range)
  getNextPipeInRange(birdX, triggerDistance = 120) {
    return this.pipes.find(pipe => 
      !pipe.triggered && 
      pipe.x > birdX && 
      pipe.x < birdX + triggerDistance
    );
  }

  // Mark pipe as triggered
  triggerPipe(pipeIndex) {
    if (this.pipes[pipeIndex]) {
      this.pipes[pipeIndex].triggered = true;
    }
  }

  // Remove a pipe (when answered correctly)
  removePipe(pipeIndex) {
    this.pipes.splice(pipeIndex, 1);
  }

  // Check if pipe was passed
  markPipePassed(pipeIndex) {
    if (this.pipes[pipeIndex]) {
      this.pipes[pipeIndex].passed = true;
    }
  }

  // Check if bird passed a pipe (for scoring)
  checkPipePassed(birdX, birdRadius = 15) {
    for (let i = 0; i < this.pipes.length; i++) {
      const pipe = this.pipes[i];
      if (!pipe.passed && birdX - birdRadius > pipe.x + this.pipeWidth) {
        pipe.passed = true;
        return { passed: true, index: i };
      }
    }
    return { passed: false, index: -1 };
  }

  // Get pipe at index
  getPipe(index) {
    return this.pipes[index];
  }

  // Reset pipes
  reset() {
    this.pipes = [];
    this.spawnTimer = 0;
  }

  // Draw pipes on canvas
  draw(ctx) {
    this.pipes.forEach(pipe => {
      // Create gradient for pipes
      const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + this.pipeWidth, 0);
      gradient.addColorStop(0, '#4F46E5');
      gradient.addColorStop(0.5, '#6366F1');
      gradient.addColorStop(1, '#818CF8');

      // Top pipe
      ctx.fillStyle = gradient;
      ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);

      // Top pipe cap
      ctx.fillStyle = '#4338CA';
      ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, this.pipeWidth + 10, 20);

      // Bottom pipe
      const bottomY = pipe.topHeight + pipe.gap;
      ctx.fillStyle = gradient;
      ctx.fillRect(pipe.x, bottomY, this.pipeWidth, this.canvasHeight - bottomY);

      // Bottom pipe cap
      ctx.fillStyle = '#4338CA';
      ctx.fillRect(pipe.x - 5, bottomY, this.pipeWidth + 10, 20);
    });
  }
}

