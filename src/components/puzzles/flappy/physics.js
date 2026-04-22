// Physics module for Flappy Bird

export class Physics {
  constructor() {
    this.gravity = 0.25;
    this.jumpStrength = -4.5;
    this.maxVelocity = 10;
  }

  // Apply gravity to bird
  applyGravity(velocity) {
    let newVelocity = velocity + this.gravity;
    if (newVelocity > this.maxVelocity) {
      newVelocity = this.maxVelocity;
    }
    return newVelocity;
  }

  // Bird jumps
  jump(velocity) {
    return this.jumpStrength;
  }

  // Check if bird is within pipe trigger zone
  isInTriggerZone(birdX, pipeX, triggerDistance = 120) {
    // Trigger when pipe is 120px away from bird
    return pipeX > birdX && pipeX < birdX + triggerDistance;
  }

  // Check collision between bird and pipe
  checkCollision(bird, pipe, canvasHeight) {
    const birdRadius = 15;
    const pipeWidth = 60;
    const pipeGap = 140;

    // Bird X position is fixed at 80
    const birdX = 80;
    const birdY = bird.y;

    // Check if bird is within pipe's X range
    if (birdX + birdRadius > pipe.x && birdX - birdRadius < pipe.x + pipeWidth) {
      // Check top pipe collision
      if (birdY - birdRadius < pipe.topHeight) {
        return true;
      }
      // Check bottom pipe collision
      if (birdY + birdRadius > pipe.topHeight + pipeGap) {
        return true;
      }
    }

    // Check ground/ceiling collision
    if (birdY + birdRadius > canvasHeight || birdY - birdRadius < 0) {
      return true;
    }

    return false;
  }

  // Calculate bird position update
  updatePosition(y, velocity) {
    return {
      y: y + velocity,
      velocity: this.applyGravity(velocity)
    };
  }
}

