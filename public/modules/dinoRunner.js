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
    this.particles = [];
    this.animationFrame = 0;
    this.backgroundOffset = 0;

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
    this.initializeResponsiveCanvas();
  },

  initializeResponsiveCanvas() {
    this.updateCanvasSize();
    window.addEventListener('resize', () => this.updateCanvasSize());
  },

  updateCanvasSize() {
    if (!this.canvas) return;

    const container = this.canvas.parentElement;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    const aspectRatio = 2;
    let canvasWidth = Math.min(containerWidth - 40, 800);
    let canvasHeight = canvasWidth / aspectRatio;

    if (canvasHeight > containerHeight - 40) {
      canvasHeight = containerHeight - 40;
      canvasWidth = canvasHeight * aspectRatio;
    }

    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      canvasWidth = containerWidth - 20;
      canvasHeight = Math.min(canvasWidth / aspectRatio, 300);
    }

    const oldWidth = this.canvas.width;
    const oldHeight = this.canvas.height;

    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    if (this.gameStarted && oldWidth !== canvasWidth) {
      const scale = canvasWidth / oldWidth;
      this.obstacles.forEach(obstacle => {
        obstacle.x *= scale;
        obstacle.width *= scale;
        if (obstacle.height) obstacle.height *= scale;
      });
    }

    this.groundHeight = canvasHeight * 0.25;
    this.player.groundY = this.canvas.height - this.groundHeight - this.player.height;

    this.scaleFactor = canvasWidth / 800;
    this.player.width = 35 * this.scaleFactor;
    this.player.height = 60 * this.scaleFactor;
  },

  render() {
    const isMobile = window.innerWidth < 768;

    this.container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: linear-gradient(180deg, #0a0a1a 0%, #16213e 100%); position: relative; overflow: hidden;">

        <div style="position: absolute; top: ${isMobile ? '10px' : '20px'}; left: ${isMobile ? '10px' : '20px'}; z-index: 10;">
          <div style="font-size: ${isMobile ? '24px' : '32px'}; font-weight: 900; color: #f59e0b; text-shadow: 2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(245,158,11,0.5);">
            <span id="dino-score">0</span>
          </div>
          <div style="font-size: ${isMobile ? '10px' : '12px'}; font-weight: 700; color: #94a3b8; margin-top: 4px;">
            SCORE
          </div>
        </div>

        <div style="position: absolute; top: ${isMobile ? '10px' : '20px'}; right: ${isMobile ? '10px' : '20px'}; z-index: 10; text-align: right;">
          <div style="font-size: ${isMobile ? '16px' : '20px'}; font-weight: 800; color: #94a3b8; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
            HI: <span id="dino-highscore">0</span>
          </div>
        </div>

        <div style="flex: 1; display: flex; align-items: center; justify-content: center; position: relative; padding: ${isMobile ? '10px' : '20px'};">
          <canvas id="dino-canvas" width="800" height="400" style="max-width: 100%; border: 4px solid #0f172a; border-radius: ${isMobile ? '8px' : '12px'}; background: linear-gradient(180deg, #0f172a 0%, #1e293b 70%, #334155 100%); box-shadow: 0 8px 32px rgba(0,0,0,0.6);"></canvas>
        </div>

        <div id="dino-start-screen" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(15,23,42,0.98); z-index: 20;">
          <div style="text-align: center; padding: ${isMobile ? '20px' : '40px'}; max-width: ${isMobile ? '90%' : '500px'};">
            <div style="font-size: ${isMobile ? '48px' : '72px'}; margin-bottom: ${isMobile ? '8px' : '16px'};">🥷</div>
            <div style="font-size: ${isMobile ? '32px' : '48px'}; font-weight: 900; color: #f59e0b; margin-bottom: 8px; text-shadow: 0 0 30px rgba(245,158,11,0.6);">SILENT RUN</div>
            <div style="font-size: ${isMobile ? '12px' : '14px'}; color: #94a3b8; margin-bottom: ${isMobile ? '16px' : '32px'}; font-style: italic;">Master the art of ninja parkour</div>
            <div style="font-size: ${isMobile ? '14px' : '16px'}; color: #cbd5e1; margin-bottom: ${isMobile ? '20px' : '32px'}; max-width: 400px; line-height: 1.8;">
              Press <strong style="color: #f59e0b;">SPACE</strong> or <strong style="color: #f59e0b;">TAP</strong> to jump over crates<br>
              Hold <strong style="color: #f59e0b;">DOWN ARROW</strong> to duck under lights<br>
              The faster you go, the greater the challenge!
            </div>
            <button id="dino-start-btn" class="launch-button" style="padding: ${isMobile ? '12px 32px' : '16px 48px'}; font-size: ${isMobile ? '16px' : '20px'}; font-weight: 800; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
              BEGIN MISSION
            </button>
          </div>
        </div>

        <div id="dino-gameover-screen" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.9); z-index: 20;">
          <div style="text-align: center; padding: ${isMobile ? '20px' : '40px'};">
            <div style="font-size: ${isMobile ? '48px' : '64px'}; margin-bottom: ${isMobile ? '8px' : '16px'};">💀</div>
            <div style="font-size: ${isMobile ? '32px' : '48px'}; font-weight: 900; color: #ef4444; margin-bottom: ${isMobile ? '12px' : '16px'};">GAME OVER</div>
            <div style="font-size: ${isMobile ? '20px' : '24px'}; color: #fff; margin-bottom: 8px;">
              Score: <span id="dino-final-score" style="font-weight: 900; color: #fbbf24;">0</span>
            </div>
            <div style="font-size: ${isMobile ? '14px' : '16px'}; color: #9ca3af; margin-bottom: ${isMobile ? '20px' : '32px'};">
              High Score: <span id="dino-final-highscore">0</span>
            </div>
            <button id="dino-restart-btn" class="launch-button success" style="padding: ${isMobile ? '12px 32px' : '16px 48px'}; font-size: ${isMobile ? '16px' : '20px'}; font-weight: 800;">
              PLAY AGAIN
            </button>
          </div>
        </div>

        <div style="padding: ${isMobile ? '12px' : '20px'}; text-align: center; background: rgba(15,23,42,0.95); border-top: 2px solid #f59e0b;">
          <div style="display: flex; justify-content: center; gap: ${isMobile ? '16px' : '32px'}; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="padding: ${isMobile ? '6px 10px' : '8px 12px'}; background: #f59e0b; color: #0f172a; border-radius: 6px; font-weight: 700; font-size: ${isMobile ? '10px' : '12px'}; box-shadow: 0 0 10px rgba(245,158,11,0.4);">SPACE</div>
              <span style="color: #cbd5e1; font-size: ${isMobile ? '12px' : '14px'}; font-weight: 600;">Jump</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="padding: ${isMobile ? '6px 10px' : '8px 12px'}; background: #f59e0b; color: #0f172a; border-radius: 6px; font-weight: 700; font-size: ${isMobile ? '10px' : '12px'}; box-shadow: 0 0 10px rgba(245,158,11,0.4);">↓</div>
              <span style="color: #cbd5e1; font-size: ${isMobile ? '12px' : '14px'}; font-weight: 600;">Duck</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="padding: ${isMobile ? '6px 10px' : '8px 12px'}; background: #f59e0b; color: #0f172a; border-radius: 6px; font-weight: 700; font-size: ${isMobile ? '10px' : '12px'}; box-shadow: 0 0 10px rgba(245,158,11,0.4);">TAP</div>
              <span style="color: #cbd5e1; font-size: ${isMobile ? '12px' : '14px'}; font-weight: 600;">Jump</span>
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
    this.particles = [];
    this.animationFrame = 0;
    this.backgroundOffset = 0;
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
    this.score++;
    this.scoreDisplay.textContent = Math.floor(this.score / 10);
    this.animationFrame++;
    this.backgroundOffset += this.speed * 0.3;

    if (this.score % 300 === 0) {
      this.speed += 0.5;
    }

    if (this.player.isJumping || this.player.y < 0) {
      this.player.velocityY += this.gravity;
      this.player.y += this.player.velocityY;

      if (this.player.y >= 0) {
        this.player.y = 0;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        this.createLandingParticles();
      }
    } else {
      this.player.y = 0;
    }

    this.obstacleTimer++;
    if (this.obstacleTimer > this.obstacleInterval) {
      this.spawnObstacle();
      this.obstacleTimer = 0;
      this.obstacleInterval = Math.max(50, 100 - Math.floor(this.score / 1000));
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.x -= this.speed;

      if (obstacle.x + obstacle.width < 0) {
        this.obstacles.splice(i, 1);
        continue;
      }

      if (this.checkCollision(obstacle)) {
        this.gameOver();
        return;
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.life--;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  },

  createLandingParticles() {
    const playerX = this.player.x;
    const playerY = this.canvas.height - this.groundHeight;

    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: playerX + this.player.width / 2,
        y: playerY,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * -3 - 1,
        size: Math.random() * 3 + 2,
        life: 20,
        color: '#475569'
      });
    }
  },

  spawnObstacle() {
    const types = ['crate', 'crate2', 'crate3', 'light'];
    const type = types[Math.floor(Math.random() * types.length)];

    let obstacle;
    if (type.startsWith('crate')) {
      const height = (45 + Math.random() * 25) * this.scaleFactor;
      const width = (40 + Math.random() * 20) * this.scaleFactor;
      obstacle = {
        type: type,
        x: this.canvas.width,
        y: this.canvas.height - this.groundHeight - height,
        width: width,
        height: height,
        variant: Math.floor(Math.random() * 3)
      };
    } else {
      const baseHeight = this.canvas.height - this.groundHeight;
      const heights = [baseHeight - 100 * this.scaleFactor, baseHeight - 80 * this.scaleFactor];
      const chosenHeight = heights[Math.floor(Math.random() * heights.length)];
      obstacle = {
        type: 'light',
        x: this.canvas.width,
        y: chosenHeight,
        width: 50 * this.scaleFactor,
        height: 35 * this.scaleFactor,
        ropeLength: chosenHeight
      };
    }

    this.obstacles.push(obstacle);
  },

  checkCollision(obstacle) {
    const playerHeight = this.player.isDucking ? this.player.height / 2 : this.player.height;
    const playerY = this.player.isDucking
      ? this.canvas.height - this.groundHeight - playerHeight
      : this.canvas.height - this.groundHeight - this.player.height + this.player.y;

    const padding = 3 * this.scaleFactor;

    return (
      this.player.x + padding < obstacle.x + obstacle.width - padding &&
      this.player.x + this.player.width - padding > obstacle.x + padding &&
      playerY + padding < obstacle.y + obstacle.height - padding &&
      playerY + playerHeight - padding > obstacle.y + padding
    );
  },

  draw() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.4, '#1a1a3e');
    gradient.addColorStop(0.7, '#16213e');
    gradient.addColorStop(1, '#1e293b');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawParallaxBackground();
    this.drawBuildings();

    const groundY = this.canvas.height - this.groundHeight;

    const groundGradient = this.ctx.createLinearGradient(0, groundY, 0, this.canvas.height);
    groundGradient.addColorStop(0, '#1e293b');
    groundGradient.addColorStop(1, '#0f172a');
    this.ctx.fillStyle = groundGradient;
    this.ctx.fillRect(0, groundY, this.canvas.width, this.groundHeight);

    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(0, groundY, this.canvas.width, 3);

    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 2;
    const groundOffset = (this.score * this.speed / 2) % (40 * this.scaleFactor);
    for (let i = -40 * this.scaleFactor; i < this.canvas.width; i += 40 * this.scaleFactor) {
      this.ctx.beginPath();
      this.ctx.moveTo(i + groundOffset, groundY + 20 * this.scaleFactor);
      this.ctx.lineTo(i + groundOffset + 20 * this.scaleFactor, groundY + 20 * this.scaleFactor);
      this.ctx.stroke();
    }

    this.drawNinja();

    this.obstacles.forEach(obstacle => {
      if (obstacle.type.startsWith('crate')) {
        this.drawCrate(obstacle);
      } else {
        this.drawLight(obstacle);
      }
    });

    this.particles.forEach(p => {
      this.ctx.globalAlpha = p.life / 20;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
      this.ctx.globalAlpha = 1;
    });
  },

  drawParallaxBackground() {
    const groundY = this.canvas.height - this.groundHeight;

    const layer1Offset = this.backgroundOffset * 0.1;
    const layer2Offset = this.backgroundOffset * 0.3;

    this.ctx.globalAlpha = 0.3;
    const stars = 50;
    for (let i = 0; i < stars; i++) {
      const x = ((i * 137) % this.canvas.width + layer1Offset * 0.5) % this.canvas.width;
      const y = (i * 73) % (groundY * 0.5);
      const size = (i % 3) + 1;
      this.ctx.fillStyle = i % 4 === 0 ? '#06b6d4' : '#fbbf24';
      this.ctx.fillRect(x, y, size, size);
    }
    this.ctx.globalAlpha = 1;

    this.ctx.globalAlpha = 0.6;
    for (let i = 0; i < 5; i++) {
      const x = ((i * 200 - layer2Offset) % (this.canvas.width + 200)) - 100;
      const width = 80 + i * 20;
      const height = 150 + i * 30;
      const y = groundY - height;

      this.ctx.fillStyle = '#0a0f1f';
      this.ctx.fillRect(x, y, width, height);

      for (let w = 0; w < 3; w++) {
        const wx = x + 15 + w * 25;
        const wy = y + 20;
        this.ctx.fillStyle = (i + w) % 3 === 0 ? '#06b6d4' : '#0a0f1f';
        this.ctx.fillRect(wx, wy, 8, 12);
      }
    }
    this.ctx.globalAlpha = 1;
  },

  drawBuildings() {
    const groundY = this.canvas.height - this.groundHeight;

    const buildings = [
      { x: 0.06, width: 0.075, height: 0.4, windows: 6, color: '#0d1b2a' },
      { x: 0.15, width: 0.1, height: 0.55, windows: 8, color: '#0a1628' },
      { x: 0.26, width: 0.062, height: 0.35, windows: 5, color: '#1b263b' },
      { x: 0.34, width: 0.087, height: 0.65, windows: 9, color: '#0f1c2e' },
      { x: 0.44, width: 0.069, height: 0.3, windows: 4, color: '#162338' },
      { x: 0.52, width: 0.112, height: 0.7, windows: 10, color: '#0a1420' },
      { x: 0.64, width: 0.081, height: 0.45, windows: 7, color: '#13202f' },
      { x: 0.74, width: 0.094, height: 0.5, windows: 8, color: '#0e1a29' },
      { x: 0.84, width: 0.075, height: 0.38, windows: 6, color: '#1a2639' },
      { x: 0.93, width: 0.106, height: 0.6, windows: 9, color: '#0c1825' },
    ];

    buildings.forEach((building, idx) => {
      const x = building.x * this.canvas.width;
      const width = building.width * this.canvas.width;
      const height = building.height * (groundY - 50);

      this.ctx.fillStyle = building.color;
      this.ctx.fillRect(x, groundY - height, width, height);

      this.ctx.strokeStyle = '#0a0f1f';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, groundY - height, width, height);

      if (Math.random() > 0.7) {
        this.ctx.fillStyle = '#dc2626';
        this.ctx.fillRect(x + width / 2 - 3, groundY - height, 6, 4);
      }

      const windowWidth = 8 * this.scaleFactor;
      const windowHeight = 10 * this.scaleFactor;
      const windowPadding = 6 * this.scaleFactor;
      const cols = Math.floor((width - windowPadding) / (windowWidth + windowPadding));

      for (let row = 0; row < building.windows; row++) {
        for (let col = 0; col < cols; col++) {
          const wx = x + windowPadding + col * (windowWidth + windowPadding);
          const wy = groundY - height + 15 + row * (windowHeight + windowPadding);
          const seed = idx * 100 + row * 10 + col;

          let windowColor;
          const rand = seed % 12;
          if (rand < 6) {
            windowColor = '#fbbf24';
          } else if (rand < 8) {
            windowColor = '#06b6d4';
          } else if (rand < 9) {
            windowColor = '#ec4899';
          } else {
            windowColor = '#0f172a';
          }

          if (windowColor !== '#0f172a') {
            this.ctx.shadowColor = windowColor;
            this.ctx.shadowBlur = 8;
          }

          this.ctx.fillStyle = windowColor;
          this.ctx.fillRect(wx, wy, windowWidth, windowHeight);
          this.ctx.shadowBlur = 0;

          if (windowColor !== '#0f172a') {
            this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(wx, wy, windowWidth, windowHeight);
          }
        }
      }
    });
  },

  drawNinja() {
    const playerHeight = this.player.isDucking ? this.player.height / 2 : this.player.height;
    const playerY = this.player.isDucking
      ? this.canvas.height - this.groundHeight - playerHeight
      : this.canvas.height - this.groundHeight - this.player.height + this.player.y;

    const runCycle = Math.floor(this.animationFrame / 8) % 4;

    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(this.player.x, playerY, this.player.width, playerHeight);

    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(this.player.x + 2, playerY + 2, this.player.width - 4, playerHeight - 4);

    if (!this.player.isDucking) {
      const headSize = 15 * this.scaleFactor;
      const headY = playerY + 5 * this.scaleFactor;
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(
        this.player.x + this.player.width / 2 - headSize / 2,
        headY,
        headSize,
        headSize
      );

      this.ctx.fillStyle = '#dc2626';
      const scarfWidth = 18 * this.scaleFactor;
      const scarfY = headY + 8 * this.scaleFactor;
      this.ctx.fillRect(
        this.player.x + this.player.width / 2 - scarfWidth / 2,
        scarfY,
        scarfWidth,
        4 * this.scaleFactor
      );

      const scarfTailOffset = (runCycle % 2) * 2;
      this.ctx.fillRect(
        this.player.x + this.player.width - 2,
        scarfY + scarfTailOffset,
        8 * this.scaleFactor,
        3 * this.scaleFactor
      );

      const eyeY = headY + 6 * this.scaleFactor;
      const eyeX = this.player.x + this.player.width / 2 + 3 * this.scaleFactor;
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.fillRect(eyeX, eyeY, 6 * this.scaleFactor, 2 * this.scaleFactor);
    } else {
      this.ctx.fillStyle = '#dc2626';
      this.ctx.fillRect(
        this.player.x + 5 * this.scaleFactor,
        playerY + 2 * this.scaleFactor,
        this.player.width - 10 * this.scaleFactor,
        3 * this.scaleFactor
      );
    }

    if (!this.player.isJumping && !this.player.isDucking) {
      const legWidth = 4 * this.scaleFactor;
      const legHeight = 8 * this.scaleFactor;
      const legY = playerY + playerHeight - legHeight - 2;

      const leg1Offset = runCycle < 2 ? 2 : -2;
      const leg2Offset = runCycle < 2 ? -2 : 2;

      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(
        this.player.x + 8 * this.scaleFactor,
        legY + leg1Offset,
        legWidth,
        legHeight
      );
      this.ctx.fillRect(
        this.player.x + this.player.width - 12 * this.scaleFactor,
        legY + leg2Offset,
        legWidth,
        legHeight
      );
    }

    if (this.player.isJumping) {
      this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
      this.ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        this.ctx.strokeRect(
          this.player.x - i * 8,
          playerY + i * 4,
          this.player.width,
          playerHeight
        );
      }
    }
  },

  drawCrate(obstacle) {
    const colors = [
      { dark: '#654321', mid: '#8b5a3c', light: '#a0764a' },
      { dark: '#4a3520', mid: '#6b4e2f', light: '#8b6841' },
      { dark: '#5c4033', mid: '#8b6347', light: '#a67c52' }
    ];

    const colorSet = colors[obstacle.variant];

    this.ctx.fillStyle = colorSet.dark;
    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    this.ctx.fillStyle = colorSet.mid;
    this.ctx.fillRect(
      obstacle.x + 5 * this.scaleFactor,
      obstacle.y + 5 * this.scaleFactor,
      obstacle.width - 10 * this.scaleFactor,
      obstacle.height - 10 * this.scaleFactor
    );

    this.ctx.fillStyle = colorSet.light;
    const plankWidth = 3 * this.scaleFactor;
    for (let i = 0; i < obstacle.height; i += 8 * this.scaleFactor) {
      this.ctx.fillRect(obstacle.x, obstacle.y + i, obstacle.width, plankWidth);
    }

    this.ctx.strokeStyle = '#2d1f15';
    this.ctx.lineWidth = 3 * this.scaleFactor;
    this.ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    const metalSize = 6 * this.scaleFactor;
    this.ctx.fillStyle = '#64748b';

    this.ctx.fillRect(obstacle.x + 3, obstacle.y + 3, metalSize, metalSize);
    this.ctx.fillRect(obstacle.x + obstacle.width - metalSize - 3, obstacle.y + 3, metalSize, metalSize);
    this.ctx.fillRect(obstacle.x + 3, obstacle.y + obstacle.height - metalSize - 3, metalSize, metalSize);
    this.ctx.fillRect(obstacle.x + obstacle.width - metalSize - 3, obstacle.y + obstacle.height - metalSize - 3, metalSize, metalSize);

    const diagOffset = 10 * this.scaleFactor;
    this.ctx.strokeStyle = '#4a3520';
    this.ctx.lineWidth = 2 * this.scaleFactor;
    this.ctx.beginPath();
    this.ctx.moveTo(obstacle.x + diagOffset, obstacle.y + diagOffset);
    this.ctx.lineTo(obstacle.x + obstacle.width - diagOffset, obstacle.y + obstacle.height - diagOffset);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(obstacle.x + obstacle.width - diagOffset, obstacle.y + diagOffset);
    this.ctx.lineTo(obstacle.x + diagOffset, obstacle.y + obstacle.height - diagOffset);
    this.ctx.stroke();

    if (obstacle.variant === 0) {
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.font = `${10 * this.scaleFactor}px Arial`;
      this.ctx.fillText('!', obstacle.x + obstacle.width / 2 - 3, obstacle.y + obstacle.height / 2 + 3);
    }

    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetY = 5;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(
      obstacle.x + 5,
      this.canvas.height - this.groundHeight + 2,
      obstacle.width - 10,
      6
    );
    this.ctx.shadowBlur = 0;
  },

  drawLight(obstacle) {
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 2 * this.scaleFactor;
    this.ctx.beginPath();
    this.ctx.moveTo(obstacle.x + obstacle.width / 2, 0);
    this.ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
    this.ctx.stroke();

    const chainLinks = Math.floor(obstacle.y / (8 * this.scaleFactor));
    for (let i = 0; i < chainLinks; i++) {
      const linkY = i * 8 * this.scaleFactor;
      this.ctx.strokeStyle = i % 2 === 0 ? '#475569' : '#334155';
      this.ctx.lineWidth = 3 * this.scaleFactor;
      this.ctx.strokeRect(
        obstacle.x + obstacle.width / 2 - 2 * this.scaleFactor,
        linkY,
        4 * this.scaleFactor,
        6 * this.scaleFactor
      );
    }

    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, 4 * this.scaleFactor);

    const glowSize = 3 + Math.sin(this.animationFrame / 10) * 2;
    const glowIntensity = 15 + Math.sin(this.animationFrame / 10) * 5;

    this.ctx.shadowColor = '#fbbf24';
    this.ctx.shadowBlur = glowIntensity;
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fillRect(
      obstacle.x + glowSize,
      obstacle.y + glowSize,
      obstacle.width - glowSize * 2,
      obstacle.height - glowSize * 2
    );
    this.ctx.shadowBlur = 0;

    this.ctx.fillStyle = 'rgba(255, 230, 100, 0.4)';
    this.ctx.fillRect(
      obstacle.x + glowSize + 3,
      obstacle.y + glowSize + 3,
      (obstacle.width - glowSize * 2) / 2,
      (obstacle.height - glowSize * 2) / 2
    );

    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, 3 * this.scaleFactor);
    this.ctx.fillRect(obstacle.x, obstacle.y + obstacle.height - 3 * this.scaleFactor, obstacle.width, 3 * this.scaleFactor);
    this.ctx.fillRect(obstacle.x, obstacle.y, 3 * this.scaleFactor, obstacle.height);
    this.ctx.fillRect(obstacle.x + obstacle.width - 3 * this.scaleFactor, obstacle.y, 3 * this.scaleFactor, obstacle.height);

    const groundY = this.canvas.height - this.groundHeight;
    const lightGradient = this.ctx.createRadialGradient(
      obstacle.x + obstacle.width / 2,
      obstacle.y + obstacle.height / 2,
      0,
      obstacle.x + obstacle.width / 2,
      groundY,
      100 * this.scaleFactor
    );
    lightGradient.addColorStop(0, 'rgba(251, 191, 36, 0.3)');
    lightGradient.addColorStop(1, 'rgba(251, 191, 36, 0)');

    this.ctx.fillStyle = lightGradient;
    this.ctx.fillRect(
      obstacle.x - 50 * this.scaleFactor,
      obstacle.y,
      100 * this.scaleFactor,
      groundY - obstacle.y
    );
  },

  async gameOver() {
    this.isRunning = false;

    const finalScore = Math.floor(this.score / 10);
    document.getElementById('dino-final-score').textContent = finalScore;
    document.getElementById('dino-final-highscore').textContent = this.highScoreDisplay.textContent;

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

        if (finalScore > (this.highScore || 0)) {
          this.highScore = finalScore;
          this.highScoreDisplay.textContent = finalScore;

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
    window.removeEventListener('resize', this.updateCanvasSize);
  }
});
