window.ModuleRegistry.register({
  id: 'dino-runner',
  name: 'Silent Run',
  icon: '🥷',
  description: 'Ninja parkour - jump and duck to survive!',

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

    this.groundHeight = 100;
    this.player = {
      x: 100,
      y: 0,
      width: 35,
      height: 60,
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
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%); position: relative; overflow: hidden;">

        <!-- Score Display -->
        <div style="position: absolute; top: 20px; left: 20px; z-index: 10;">
          <div style="font-size: 32px; font-weight: 900; color: #f59e0b; text-shadow: 2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(245,158,11,0.5);">
            <span id="dino-score">0</span>
          </div>
          <div style="font-size: 12px; font-weight: 700; color: #94a3b8; margin-top: 4px;">
            SCORE
          </div>
        </div>

        <!-- High Score -->
        <div style="position: absolute; top: 20px; right: 20px; z-index: 10; text-align: right;">
          <div style="font-size: 20px; font-weight: 800; color: #94a3b8; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
            HI: <span id="dino-highscore">0</span>
          </div>
        </div>

        <!-- Game Canvas Container -->
        <div style="flex: 1; display: flex; align-items: center; justify-content: center; position: relative;">
          <canvas id="dino-canvas" width="800" height="400" style="max-width: 100%; border: 4px solid #0f172a; border-radius: 12px; background: linear-gradient(180deg, #0f172a 0%, #1e293b 70%, #334155 100%); box-shadow: 0 8px 32px rgba(0,0,0,0.6);"></canvas>
        </div>

        <!-- Start Screen -->
        <div id="dino-start-screen" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(15,23,42,0.98); z-index: 20;">
          <div style="text-align: center; padding: 40px;">
            <div style="font-size: 72px; margin-bottom: 16px;">🥷</div>
            <div style="font-size: 48px; font-weight: 900; color: #f59e0b; margin-bottom: 8px; text-shadow: 0 0 30px rgba(245,158,11,0.6);">SILENT RUN</div>
            <div style="font-size: 14px; color: #94a3b8; margin-bottom: 32px; font-style: italic;">Master the art of ninja parkour</div>
            <div style="font-size: 16px; color: #cbd5e1; margin-bottom: 32px; max-width: 400px; line-height: 1.8;">
              Press <strong style="color: #f59e0b;">SPACE</strong> or <strong style="color: #f59e0b;">TAP</strong> to jump over crates<br>
              Hold <strong style="color: #f59e0b;">DOWN ARROW</strong> to duck under lights<br>
              The faster you go, the greater the challenge!
            </div>
            <button id="dino-start-btn" class="launch-button" style="padding: 16px 48px; font-size: 20px; font-weight: 800; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
              BEGIN MISSION
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
        <div style="padding: 20px; text-align: center; background: rgba(15,23,42,0.95); border-top: 2px solid #f59e0b;">
          <div style="display: flex; justify-content: center; gap: 32px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="padding: 8px 12px; background: #f59e0b; color: #0f172a; border-radius: 6px; font-weight: 700; font-size: 12px; box-shadow: 0 0 10px rgba(245,158,11,0.4);">SPACE</div>
              <span style="color: #cbd5e1; font-size: 14px; font-weight: 600;">Jump</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="padding: 8px 12px; background: #f59e0b; color: #0f172a; border-radius: 6px; font-weight: 700; font-size: 12px; box-shadow: 0 0 10px rgba(245,158,11,0.4);">↓</div>
              <span style="color: #cbd5e1; font-size: 14px; font-weight: 600;">Duck</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="padding: 8px 12px; background: #f59e0b; color: #0f172a; border-radius: 6px; font-weight: 700; font-size: 12px; box-shadow: 0 0 10px rgba(245,158,11,0.4);">TAP</div>
              <span style="color: #cbd5e1; font-size: 14px; font-weight: 600;">Jump</span>
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
    this.player.groundY = this.canvas.height - this.groundHeight - this.player.height;

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
    const types = ['crate', 'light'];
    const type = types[Math.floor(Math.random() * types.length)];

    let obstacle;
    if (type === 'crate') {
      const height = 45 + Math.random() * 25;
      const width = 40 + Math.random() * 20;
      obstacle = {
        type: 'crate',
        x: this.canvas.width,
        y: this.canvas.height - this.groundHeight - height,
        width: width,
        height: height,
        color: '#8b4513'
      };
    } else {
      const heights = [
        this.canvas.height - this.groundHeight - 140,
        this.canvas.height - this.groundHeight - 110
      ];
      obstacle = {
        type: 'light',
        x: this.canvas.width,
        y: heights[Math.floor(Math.random() * heights.length)],
        width: 50,
        height: 35,
        color: '#fbbf24',
        ropeLength: Math.abs(heights[Math.floor(Math.random() * heights.length)])
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
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.7, '#1e293b');
    gradient.addColorStop(1, '#334155');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBuildings();

    const groundY = this.canvas.height - this.groundHeight;
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(0, groundY, this.canvas.width, this.groundHeight);

    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(0, groundY, this.canvas.width, 3);

    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 2;
    const groundOffset = (this.score * this.speed / 2) % 40;
    for (let i = -40; i < this.canvas.width; i += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(i + groundOffset, groundY + 20);
      this.ctx.lineTo(i + groundOffset + 20, groundY + 20);
      this.ctx.stroke();
    }

    const playerHeight = this.player.isDucking ? this.player.height / 2 : this.player.height;
    const playerY = this.player.isDucking
      ? this.canvas.height - this.groundHeight - playerHeight
      : this.canvas.height - this.groundHeight - this.player.height - this.player.y;

    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(this.player.x, playerY, this.player.width, playerHeight);

    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(this.player.x + 2, playerY + 2, this.player.width - 4, playerHeight - 4);

    if (!this.player.isDucking) {
      this.ctx.fillStyle = '#dc2626';
      this.ctx.fillRect(this.player.x + 22, playerY + 8, 8, 3);
    }

    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(this.player.x + 24, playerY + 12, 6, 6);

    this.obstacles.forEach(obstacle => {
      if (obstacle.type === 'crate') {
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        this.ctx.fillStyle = '#8b5a3c';
        this.ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, obstacle.height - 10);

        this.ctx.strokeStyle = '#4a3520';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        this.ctx.strokeStyle = '#4a3520';
        this.ctx.lineWidth = 2;
        const diagOffset = 8;
        this.ctx.beginPath();
        this.ctx.moveTo(obstacle.x + diagOffset, obstacle.y + diagOffset);
        this.ctx.lineTo(obstacle.x + obstacle.width - diagOffset, obstacle.y + obstacle.height - diagOffset);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(obstacle.x + obstacle.width - diagOffset, obstacle.y + diagOffset);
        this.ctx.lineTo(obstacle.x + diagOffset, obstacle.y + obstacle.height - diagOffset);
        this.ctx.stroke();
      } else {
        this.ctx.strokeStyle = '#475569';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(obstacle.x + obstacle.width / 2, 0);
        this.ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
        this.ctx.stroke();

        const glowSize = 3 + Math.sin(this.score / 10) * 2;
        this.ctx.shadowColor = obstacle.color;
        this.ctx.shadowBlur = 20;
        this.ctx.fillStyle = obstacle.color;
        this.ctx.fillRect(
          obstacle.x + glowSize,
          obstacle.y + glowSize,
          obstacle.width - glowSize * 2,
          obstacle.height - glowSize * 2
        );
        this.ctx.shadowBlur = 0;

        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, 3);
        this.ctx.fillRect(obstacle.x, obstacle.y + obstacle.height - 3, obstacle.width, 3);
      }
    });
  },

  drawBuildings() {
    const buildingOffset = (this.score * this.speed / 8) % 200;

    for (let i = -200; i < this.canvas.width + 200; i += 200) {
      const x = i + buildingOffset;
      const heights = [80, 120, 100, 140];
      const height = heights[Math.floor(Math.abs(x) / 200) % heights.length];

      this.ctx.fillStyle = '#0a0f1f';
      this.ctx.fillRect(x, this.canvas.height - this.groundHeight - height, 80, height);

      for (let wx = 0; wx < 4; wx++) {
        for (let wy = 0; wy < Math.floor(height / 20); wy++) {
          const windowX = x + 10 + wx * 18;
          const windowY = this.canvas.height - this.groundHeight - height + 10 + wy * 20;
          this.ctx.fillStyle = Math.random() > 0.3 ? '#fbbf24' : '#1e293b';
          this.ctx.fillRect(windowX, windowY, 12, 12);
        }
      }
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
