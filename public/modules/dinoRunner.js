window.ModuleRegistry.register({
  id: 'dino-runner',
  name: 'Dino Runner',
  icon: '🦖',
  description: 'Jump and duck to avoid obstacles!',

  start(container) {
    this.container = container;
    this.isRunning = false;
    this.score = 0;
    this.speed = 6;
    this.gravity = 0.6;
    this.jumpStrength = -12;
    this.obstacles = [];
    this.obstacleTimer = 0;
    this.obstacleInterval = 100;
    this.gameStarted = false;

    this.player = {
      x: 100,
      y: 0,
      width: 40,
      height: 50,
      velocityY: 0,
      isJumping: false,
      isDucking: false,
      groundY: 0
    };

    this.render();
    this.setupControls();
  },

  render() {
    this.container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: linear-gradient(180deg, #87ceeb 0%, #e0f6ff 100%); position: relative; overflow: hidden;">

        <!-- Score Display -->
        <div style="position: absolute; top: 20px; left: 20px; z-index: 10;">
          <div style="font-size: 32px; font-weight: 900; color: #333; text-shadow: 2px 2px 4px rgba(255,255,255,0.8);">
            <span id="dino-score">0</span>
          </div>
          <div style="font-size: 12px; font-weight: 700; color: #666; margin-top: 4px;">
            SCORE
          </div>
        </div>

        <!-- High Score -->
        <div style="position: absolute; top: 20px; right: 20px; z-index: 10; text-align: right;">
          <div style="font-size: 20px; font-weight: 800; color: #666; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">
            HI: <span id="dino-highscore">0</span>
          </div>
        </div>

        <!-- Game Canvas Container -->
        <div style="flex: 1; display: flex; align-items: center; justify-content: center; position: relative;">
          <canvas id="dino-canvas" width="800" height="400" style="max-width: 100%; border: 4px solid #333; border-radius: 12px; background: #fff; box-shadow: 0 8px 32px rgba(0,0,0,0.2);"></canvas>
        </div>

        <!-- Start Screen -->
        <div id="dino-start-screen" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.95); z-index: 20;">
          <div style="text-align: center; padding: 40px;">
            <div style="font-size: 72px; margin-bottom: 16px;">🦖</div>
            <div style="font-size: 36px; font-weight: 900; color: #333; margin-bottom: 16px;">DINO RUNNER</div>
            <div style="font-size: 16px; color: #666; margin-bottom: 32px; max-width: 400px; line-height: 1.6;">
              Press <strong>SPACE</strong> or <strong>TAP</strong> to jump<br>
              Hold <strong>DOWN ARROW</strong> or <strong>SWIPE DOWN</strong> to duck<br>
              Avoid the obstacles and survive as long as you can!
            </div>
            <button id="dino-start-btn" class="launch-button" style="padding: 16px 48px; font-size: 20px; font-weight: 800;">
              START GAME
            </button>
          </div>
        </div>

        <!-- Game Over Screen -->
        <div id="dino-gameover-screen" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.9); z-index: 20;">
          <div style="text-align: center; padding: 40px;">
            <div style="font-size: 64px; margin-bottom: 16px;">💀</div>
            <div style="font-size: 48px; font-weight: 900; color: #ef4444; margin-bottom: 16px;">GAME OVER</div>
            <div style="font-size: 24px; color: #fff; margin-bottom: 8px;">
              Score: <span id="dino-final-score" style="font-weight: 900; color: #fbbf24;">0</span>
            </div>
            <div style="font-size: 16px; color: #9ca3af; margin-bottom: 32px;">
              High Score: <span id="dino-final-highscore">0</span>
            </div>
            <button id="dino-restart-btn" class="launch-button success" style="padding: 16px 48px; font-size: 20px; font-weight: 800;">
              PLAY AGAIN
            </button>
          </div>
        </div>

        <!-- Controls Info -->
        <div style="padding: 20px; text-align: center; background: rgba(255,255,255,0.9); border-top: 2px solid #ddd;">
          <div style="display: flex; justify-content: center; gap: 32px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="padding: 8px 12px; background: #333; color: white; border-radius: 6px; font-weight: 700; font-size: 12px;">SPACE</div>
              <span style="color: #666; font-size: 14px; font-weight: 600;">Jump</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="padding: 8px 12px; background: #333; color: white; border-radius: 6px; font-weight: 700; font-size: 12px;">↓</div>
              <span style="color: #666; font-size: 14px; font-weight: 600;">Duck</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="padding: 8px 12px; background: #333; color: white; border-radius: 6px; font-weight: 700; font-size: 12px;">TAP</div>
              <span style="color: #666; font-size: 14px; font-weight: 600;">Jump</span>
            </div>
          </div>
        </div>

      </div>
    `;

    this.canvas = document.getElementById('dino-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.scoreDisplay = document.getElementById('dino-score');
    this.highScoreDisplay = document.getElementById('dino-highscore');
    this.startScreen = document.getElementById('dino-start-screen');
    this.gameOverScreen = document.getElementById('dino-gameover-screen');

    this.loadHighScore();
  },

  setupControls() {
    const startBtn = document.getElementById('dino-start-btn');
    const restartBtn = document.getElementById('dino-restart-btn');

    startBtn.onclick = () => this.startGame();
    restartBtn.onclick = () => this.restartGame();

    // Keyboard controls
    this.keydownHandler = (e) => {
      if (e.code === 'Space' && !this.player.isJumping && this.isRunning) {
        e.preventDefault();
        this.jump();
      }
      if (e.code === 'ArrowDown' && this.isRunning) {
        e.preventDefault();
        this.duck();
      }
    };

    this.keyupHandler = (e) => {
      if (e.code === 'ArrowDown' && this.isRunning) {
        this.stopDuck();
      }
    };

    // Touch controls
    let touchStartY = 0;
    this.touchStartHandler = (e) => {
      if (!this.isRunning) return;
      touchStartY = e.touches[0].clientY;
    };

    this.touchMoveHandler = (e) => {
      if (!this.isRunning) return;
      const touchY = e.touches[0].clientY;
      const diff = touchY - touchStartY;

      if (diff > 30) {
        this.duck();
      }
    };

    this.touchEndHandler = (e) => {
      if (!this.isRunning) return;
      this.stopDuck();

      // If it was a tap (not a swipe), jump
      if (!this.player.isDucking && !this.player.isJumping) {
        this.jump();
      }
    };

    document.addEventListener('keydown', this.keydownHandler);
    document.addEventListener('keyup', this.keyupHandler);
    this.canvas.addEventListener('touchstart', this.touchStartHandler);
    this.canvas.addEventListener('touchmove', this.touchMoveHandler);
    this.canvas.addEventListener('touchend', this.touchEndHandler);
  },

  async loadHighScore() {
    try {
      const user = window.AuthManager.getCurrentUser();
      if (!user) return;

      const { data } = await window.SupabaseClient.client
        .from('leaderboard_scores')
        .select('score')
        .eq('user_id', user.id)
        .eq('game_type', 'dino-runner')
        .order('score', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        this.highScore = data.score;
        this.highScoreDisplay.textContent = data.score;
      }
    } catch (error) {
      console.error('Error loading high score:', error);
    }
  },

  startGame() {
    this.startScreen.style.display = 'none';
    this.gameOverScreen.style.display = 'none';
    this.isRunning = true;
    this.gameStarted = true;
    this.score = 0;
    this.speed = 6;
    this.obstacles = [];
    this.obstacleTimer = 0;
    this.player.y = 0;
    this.player.velocityY = 0;
    this.player.isJumping = false;
    this.player.isDucking = false;
    this.player.groundY = this.canvas.height - 80 - this.player.height;

    this.gameLoop();
  },

  restartGame() {
    this.startGame();
  },

  jump() {
    if (!this.player.isJumping && !this.player.isDucking) {
      this.player.velocityY = this.jumpStrength;
      this.player.isJumping = true;
    }
  },

  duck() {
    if (!this.player.isJumping) {
      this.player.isDucking = true;
    }
  },

  stopDuck() {
    this.player.isDucking = false;
  },

  gameLoop() {
    if (!this.isRunning) return;

    this.update();
    this.draw();

    requestAnimationFrame(() => this.gameLoop());
  },

  update() {
    // Update score and speed
    this.score++;
    this.scoreDisplay.textContent = Math.floor(this.score / 10);

    // Increase speed gradually
    if (this.score % 500 === 0) {
      this.speed += 0.5;
    }

    // Update player physics
    if (this.player.isJumping || this.player.y > 0) {
      this.player.velocityY += this.gravity;
      this.player.y += this.player.velocityY;

      if (this.player.y >= this.player.groundY) {
        this.player.y = this.player.groundY;
        this.player.velocityY = 0;
        this.player.isJumping = false;
      }
    } else {
      this.player.y = this.player.groundY;
    }

    // Spawn obstacles
    this.obstacleTimer++;
    if (this.obstacleTimer > this.obstacleInterval) {
      this.spawnObstacle();
      this.obstacleTimer = 0;
      // Gradually decrease interval (increase spawn rate)
      this.obstacleInterval = Math.max(50, 100 - Math.floor(this.score / 1000));
    }

    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.x -= this.speed;

      // Remove off-screen obstacles
      if (obstacle.x + obstacle.width < 0) {
        this.obstacles.splice(i, 1);
        continue;
      }

      // Check collision
      if (this.checkCollision(obstacle)) {
        this.gameOver();
        return;
      }
    }
  },

  spawnObstacle() {
    const types = ['cactus', 'bird'];
    const type = types[Math.floor(Math.random() * types.length)];

    let obstacle;
    if (type === 'cactus') {
      const height = 40 + Math.random() * 30;
      obstacle = {
        type: 'cactus',
        x: this.canvas.width,
        y: this.canvas.height - 80 - height,
        width: 20 + Math.random() * 20,
        height: height,
        color: '#10b981'
      };
    } else {
      const heights = [
        this.canvas.height - 80 - 150, // High
        this.canvas.height - 80 - 100  // Medium
      ];
      obstacle = {
        type: 'bird',
        x: this.canvas.width,
        y: heights[Math.floor(Math.random() * heights.length)],
        width: 40,
        height: 30,
        color: '#ef4444'
      };
    }

    this.obstacles.push(obstacle);
  },

  checkCollision(obstacle) {
    const playerHeight = this.player.isDucking ? this.player.height / 2 : this.player.height;
    const playerY = this.player.isDucking ? this.player.groundY + this.player.height / 2 : this.player.groundY - this.player.y;

    return (
      this.player.x < obstacle.x + obstacle.width &&
      this.player.x + this.player.width > obstacle.x &&
      playerY < obstacle.y + obstacle.height &&
      playerY + playerHeight > obstacle.y
    );
  },

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ground
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, this.canvas.height - 80, this.canvas.width, 4);

    // Draw decorative ground lines
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 2;
    const groundOffset = (this.score * this.speed / 2) % 40;
    for (let i = -40; i < this.canvas.width; i += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(i + groundOffset, this.canvas.height - 76);
      this.ctx.lineTo(i + groundOffset + 20, this.canvas.height - 76);
      this.ctx.stroke();
    }

    // Draw player (dino)
    const playerHeight = this.player.isDucking ? this.player.height / 2 : this.player.height;
    const playerY = this.player.isDucking
      ? this.canvas.height - 80 - playerHeight
      : this.canvas.height - 80 - this.player.height - this.player.y;

    this.ctx.fillStyle = '#14b8a6';
    this.ctx.fillRect(this.player.x, playerY, this.player.width, playerHeight);

    // Draw dino eye
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(this.player.x + 25, playerY + 10, 6, 6);
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(this.player.x + 27, playerY + 12, 3, 3);

    // Draw obstacles
    this.obstacles.forEach(obstacle => {
      if (obstacle.type === 'cactus') {
        // Draw cactus
        this.ctx.fillStyle = obstacle.color;
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Cactus arms
        this.ctx.fillRect(obstacle.x - 8, obstacle.y + obstacle.height * 0.3, 8, 15);
        this.ctx.fillRect(obstacle.x + obstacle.width, obstacle.y + obstacle.height * 0.4, 8, 12);
      } else {
        // Draw bird
        this.ctx.fillStyle = obstacle.color;
        this.ctx.beginPath();
        this.ctx.ellipse(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2,
                        obstacle.width/2, obstacle.height/2, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Bird wings
        const wingFlap = Math.sin(this.score / 5) * 5;
        this.ctx.beginPath();
        this.ctx.moveTo(obstacle.x, obstacle.y + obstacle.height/2);
        this.ctx.lineTo(obstacle.x - 10, obstacle.y + wingFlap);
        this.ctx.lineTo(obstacle.x + 10, obstacle.y + obstacle.height/2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height/2);
        this.ctx.lineTo(obstacle.x + obstacle.width + 10, obstacle.y + wingFlap);
        this.ctx.lineTo(obstacle.x + obstacle.width - 10, obstacle.y + obstacle.height/2);
        this.ctx.fill();
      }
    });

    // Draw clouds
    this.drawClouds();
  },

  drawClouds() {
    const cloudOffset = (this.score * this.speed / 4) % 300;
    this.ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';

    for (let i = -100; i < this.canvas.width + 100; i += 300) {
      const x = i + cloudOffset;
      this.ctx.beginPath();
      this.ctx.arc(x, 60, 20, 0, Math.PI * 2);
      this.ctx.arc(x + 25, 60, 25, 0, Math.PI * 2);
      this.ctx.arc(x + 50, 60, 20, 0, Math.PI * 2);
      this.ctx.fill();
    }
  },

  async gameOver() {
    this.isRunning = false;

    const finalScore = Math.floor(this.score / 10);
    document.getElementById('dino-final-score').textContent = finalScore;
    document.getElementById('dino-final-highscore').textContent = this.highScoreDisplay.textContent;

    // Save score
    try {
      const user = window.AuthManager.getCurrentUser();
      if (user) {
        await window.SupabaseClient.client
          .from('leaderboard_scores')
          .insert({
            user_id: user.id,
            game_type: 'dino-runner',
            score: finalScore,
            metadata: { speed: this.speed.toFixed(2) }
          });

        // Update high score if needed
        if (finalScore > (this.highScore || 0)) {
          this.highScore = finalScore;
          this.highScoreDisplay.textContent = finalScore;

          // Award XP and bankroll
          const xpReward = Math.floor(finalScore / 10);
          const bankrollReward = Math.floor(finalScore / 5);

          await window.ProgressionManager.addExperience(xpReward);
          await window.ProgressionManager.addBankroll(bankrollReward);
        }
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }

    this.gameOverScreen.style.display = 'flex';
  },

  stop() {
    this.isRunning = false;
    document.removeEventListener('keydown', this.keydownHandler);
    document.removeEventListener('keyup', this.keyupHandler);
    if (this.canvas) {
      this.canvas.removeEventListener('touchstart', this.touchStartHandler);
      this.canvas.removeEventListener('touchmove', this.touchMoveHandler);
      this.canvas.removeEventListener('touchend', this.touchEndHandler);
    }
  }
});
