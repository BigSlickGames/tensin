class UIManager {
  constructor() {
    this.currentModule = null;
    this.isMenuVisible = true;
  }

  async init() {
    await window.AuthManager.initialize();
    this.createUserCenteredView();
  }

  createUserCenteredView() {
    const root = document.getElementById('root');
    root.innerHTML = '';

    const effectsLayer = this.createEffectsLayer();
    root.appendChild(effectsLayer);

    const container = document.createElement('div');
    container.className = 'app-container';

    if (!window.AuthManager.isAuthenticated()) {
      container.appendChild(this.createLoginView());
      root.appendChild(container);
      return;
    }

    // Header
    const header = this.createHeader();
    container.appendChild(header);

    // Menu Container
    const menuContainer = document.createElement('div');
    menuContainer.className = 'menu-container';
    menuContainer.id = 'menu-container';

    // Hero Banner with Profile
    const heroBanner = this.createHeroBanner();
    menuContainer.appendChild(heroBanner);

    // Games Carousel
    const gamesCarousel = this.createGamesCarousel();
    menuContainer.appendChild(gamesCarousel);

    container.appendChild(menuContainer);

    // Module Container (hidden by default)
    const moduleContainer = document.createElement('div');
    moduleContainer.className = 'module-container';
    moduleContainer.id = 'module-container';
    moduleContainer.style.display = 'none';
    container.appendChild(moduleContainer);

    // Bottom Navigation
    const bottomNav = this.createBottomNav();
    container.appendChild(bottomNav);

    root.appendChild(container);
  }

  createEffectsLayer() {
    const layer = document.createElement('div');
    layer.className = 'effects-layer';

    const shimmer = document.createElement('div');
    shimmer.className = 'shimmer';
    layer.appendChild(shimmer);

    const depthGradient = document.createElement('div');
    depthGradient.className = 'depth-gradient';
    layer.appendChild(depthGradient);

    for (let i = 0; i < 10; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      layer.appendChild(particle);
    }

    return layer;
  }

  createHeader() {
    const header = document.createElement('div');
    header.className = 'app-header';
    header.id = 'app-header';

    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.innerHTML = '←';
    backButton.style.display = 'none';
    backButton.onclick = () => this.showMenu();
    header.appendChild(backButton);

    const title = document.createElement('div');
    title.className = 'app-title';
    title.textContent = '';
    header.appendChild(title);

    return header;
  }

  createLoginView() {
    const loginContainer = document.createElement('div');
    loginContainer.style.cssText = 'min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px;';

    loginContainer.innerHTML = `
      <div style="width: 100%; max-width: 400px; background: var(--bg-secondary); padding: 40px; border-radius: var(--radius-xl); border: 2px solid var(--border-glow); box-shadow: var(--shadow-lg);">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 32px; font-weight: 900; background: var(--gradient-teal); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px;">
            TENSINS WORLD
          </div>
          <div style="color: var(--text-secondary);">Sign in to continue</div>
        </div>

        <div style="display: grid; gap: 16px;">
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">Username</label>
            <input
              type="text"
              id="login-username"
              placeholder="Enter username"
              style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: 2px solid var(--border-glow); border-radius: var(--radius-md); color: var(--text-primary); font-size: 16px;"
            />
          </div>

          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">Password</label>
            <input
              type="password"
              id="login-password"
              placeholder="Enter password"
              style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: 2px solid var(--border-glow); border-radius: var(--radius-md); color: var(--text-primary); font-size: 16px;"
            />
          </div>

          <div id="login-error" style="display: none; padding: 12px; background: rgba(239, 68, 68, 0.1); border: 2px solid rgba(239, 68, 68, 0.5); border-radius: var(--radius-md); color: #ef4444; font-size: 14px;"></div>

          <button
            id="login-button"
            class="launch-button"
            style="width: 100%; padding: 14px; font-size: 16px; font-weight: 800;"
          >
            Sign In
          </button>

          <div style="text-align: center; color: var(--text-tertiary); font-size: 14px; margin-top: 8px;">
            Test accounts: john, jenny, jack<br>Password: tensin26
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      const loginButton = document.getElementById('login-button');
      const usernameInput = document.getElementById('login-username');
      const passwordInput = document.getElementById('login-password');
      const errorDiv = document.getElementById('login-error');

      const handleLogin = async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
          errorDiv.textContent = 'Please enter username and password';
          errorDiv.style.display = 'block';
          return;
        }

        loginButton.textContent = 'Signing in...';
        loginButton.disabled = true;
        errorDiv.style.display = 'none';

        const result = await window.AuthManager.signIn(username, password);

        if (result.success) {
          this.refresh();
        } else {
          errorDiv.textContent = result.error || 'Invalid credentials';
          errorDiv.style.display = 'block';
          loginButton.textContent = 'Sign In';
          loginButton.disabled = false;
        }
      };

      loginButton.onclick = handleLogin;

      usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
      });

      passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
      });
    }, 0);

    return loginContainer;
  }

  createHeroBanner() {
    const user = window.AuthManager.getCurrentUser();
    if (!user) return document.createElement('div');

    const experience = user.experience || 0;
    const level = window.ProgressionManager.calculateLevel(experience);
    const bankroll = user.bankroll || 0;

    const currentLevelXP = window.ProgressionManager.getXPForCurrentLevel(experience);
    const xpNeeded = window.ProgressionManager.getXPNeededForNextLevel(experience);
    const progressPercent = Math.min((currentLevelXP / xpNeeded) * 100, 100);

    const banner = document.createElement('div');
    banner.className = 'hero-banner';
    banner.innerHTML = `
      <button
        onclick="window.UIManager.launchModule('auth')"
        style="position: absolute; top: 16px; right: 16px; padding: 8px 16px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: white; font-size: 12px; cursor: pointer; z-index: 10;"
      >
        Account
      </button>

      <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 20px;">
        <div style="width: 70px; height: 70px; background: var(--gradient-teal); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 900; box-shadow: 0 8px 24px rgba(20, 184, 166, 0.4); border: 3px solid rgba(255, 255, 255, 0.2);">
          ${user.first_name.charAt(0).toUpperCase()}
        </div>
        <div style="flex: 1;">
          <div style="font-size: 24px; font-weight: 900; margin-bottom: 4px; color: white;">
            ${user.first_name} ${user.last_name || ''}
          </div>
          <div style="font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7);">Level ${level}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Bankroll</div>
          <div style="font-size: 24px; font-weight: 900; color: white; text-shadow: 0 2px 8px rgba(0,0,0,0.4);">${bankroll.toLocaleString()}</div>
        </div>
      </div>

      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.5px;">XP Progress</span>
          <span style="font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.9);">${currentLevelXP} / ${xpNeeded}</span>
        </div>
        <div style="position: relative; height: 10px; background: rgba(0,0,0,0.3); border-radius: 999px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
          <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${progressPercent}%; background: linear-gradient(90deg, #14b8a6 0%, #3b82f6 100%); transition: width 0.5s ease; box-shadow: 0 0 12px rgba(20, 184, 166, 0.6);"></div>
        </div>
      </div>
    `;
    return banner;
  }

  createExpandableSection(parent, title, colorClass, icon, contentHTML) {
    const section = document.createElement('div');
    section.className = 'expandable-section';

    const header = document.createElement('div');
    header.className = `expandable-header ${colorClass}`;
    header.innerHTML = `
      <div class="expandable-title">${title}</div>
      <div class="expandable-icon">▼</div>
    `;

    const content = document.createElement('div');
    content.className = 'expandable-content';
    const inner = document.createElement('div');
    inner.className = 'expandable-inner';
    inner.innerHTML = contentHTML;
    content.appendChild(inner);

    header.onclick = () => {
      section.classList.toggle('expanded');
    };

    section.appendChild(header);
    section.appendChild(content);
    parent.appendChild(section);
  }

  createGamesCarousel() {
    const carousel = document.createElement('div');
    carousel.style.cssText = 'margin: 0 0 20px 0; padding: 0 20px;';

    carousel.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0;">Games & Apps</h3>
      </div>
      <div id="games-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        ${this.createGameCards()}
      </div>
    `;

    return carousel;
  }

  createGameCards() {
    const games = [
      { id: 'memory-game', name: 'Memory Game', emoji: '🧠', color: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' },
      { id: 'reaction-game', name: 'Reaction Game', emoji: '⚡', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    ];

    return games.map(game => `
      <div
        onclick="window.UIManager.launchModule('${game.id}')"
        style="
          height: 160px;
          background: ${game.color};
          border-radius: var(--radius-lg);
          padding: 20px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          border: 2px solid rgba(255,255,255,0.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        "
        onmouseover="this.style.transform='translateY(-4px) scale(1.02)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.3)';"
        onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)';"
      >
        <div style="font-size: 48px; margin-bottom: 12px;">${game.emoji}</div>
        <div style="font-size: 14px; font-weight: 800; color: white; line-height: 1.3;">${game.name}</div>
      </div>
    `).join('');
  }

  createDailyChallengesSection() {
    const section = document.createElement('div');
    section.style.cssText = 'margin: 0 0 24px 0;';
    section.id = 'daily-challenges-section';

    section.innerHTML = `
      <div style="padding: 0 20px;">
        <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">Daily Challenges</h3>
        <div id="challenges-list" style="display: grid; gap: 12px;">
          <div style="text-align: center; padding: 32px; color: var(--text-secondary);">
            Loading challenges...
          </div>
        </div>
      </div>
    `;

    setTimeout(() => this.loadDailyChallenges(), 100);
    return section;
  }

  async loadDailyChallenges() {
    const listContainer = document.getElementById('challenges-list');
    if (!listContainer) return;

    try {
      const user = window.AuthManager.getCurrentUser();
      if (!user) {
        listContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">Sign in to view challenges</div>';
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      const { data: progressData } = await window.SupabaseClient.client
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_date', today);

      const progressMap = new Map();
      if (progressData) {
        progressData.forEach(p => progressMap.set(p.challenge_id, p));
      }

      const challenges = [
        { id: 'login', title: 'Daily Login', icon: '🎁', reward: '50 XP + 100', target: 1, progress: 1, completed: true },
        { id: 'play-3', title: 'Play 3 Games', icon: '🎮', reward: '100 XP + 200', target: 3, progress: 0, completed: false },
        { id: 'win-5', title: 'Win 5 Games', icon: '🏆', reward: '200 XP + 400', target: 5, progress: 0, completed: false }
      ];

      challenges.forEach(c => {
        const userProgress = progressMap.get(c.id);
        if (userProgress) {
          c.progress = userProgress.progress;
          c.completed = userProgress.completed;
        }
      });

      listContainer.innerHTML = challenges.map(c => {
        const progressPercent = Math.min((c.progress / c.target) * 100, 100);
        return `
          <div style="
            background: var(--bg-card);
            backdrop-filter: blur(10px);
            border: 2px solid ${c.completed ? '#10b981' : 'var(--border-glow)'};
            border-radius: 12px;
            padding: 16px;
            position: relative;
            overflow: hidden;
            ${c.completed ? 'opacity: 0.7;' : ''}
          ">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <div style="font-size: 32px;">${c.icon}</div>
              <div style="flex: 1;">
                <div style="font-size: 16px; font-weight: 800; margin-bottom: 2px;">${c.title}</div>
                <div style="font-size: 12px; color: #fbbf24; font-weight: 700;">${c.reward}</div>
              </div>
              ${c.completed ? '<div style="font-size: 32px;">✅</div>' : ''}
            </div>
            <div style="margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 11px; color: var(--text-tertiary); font-weight: 700;">Progress</span>
                <span style="font-size: 11px; font-weight: 800;">${c.progress} / ${c.target}</span>
              </div>
              <div style="position: relative; height: 8px; background: rgba(0,0,0,0.3); border-radius: 999px; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${progressPercent}%; background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%); transition: width 0.5s ease;"></div>
              </div>
            </div>
          </div>
        `;
      }).join('');

    } catch (error) {
      console.error('Error loading challenges:', error);
      listContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--danger);">Failed to load challenges</div>';
    }
  }

  createChallengesButton() {
    const button = document.createElement('div');
    button.style.cssText = 'margin: 20px; padding: 0;';
    button.innerHTML = `
      <button
        onclick="window.UIManager.launchModule('daily-challenge')"
        style="
          width: 100%;
          padding: 20px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: var(--radius-lg);
          color: white;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        "
        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(245, 158, 11, 0.5)';"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(245, 158, 11, 0.3)';"
      >
        <span style="font-size: 24px;">🎯</span>
        <span>Daily Challenges</span>
      </button>
    `;
    return button;
  }

  createGamesContent() {
    const games = [
      { id: 'memory-game', name: 'Memory Match', icon: '🧠', description: 'Test your memory' },
      { id: 'reaction-game', name: 'Reaction Test', icon: '⚡', description: 'How fast are you?' }
    ];

    let html = '<div class="module-grid">';
    games.forEach(game => {
      html += `
        <div class="module-card" onclick="window.UIManager.launchModule('${game.id}')">
          <div class="module-icon">${game.icon}</div>
          <div class="module-info">
            <div class="module-name">${game.name}</div>
            <div class="module-description">${game.description}</div>
          </div>
          <button class="launch-button" onclick="event.stopPropagation(); window.UIManager.launchModule('${game.id}')">
            Play Now
          </button>
        </div>
      `;
    });
    html += '</div>';
    return html;
  }

  createForumContent() {
    return `
      <div style="display: grid; gap: 12px;">
        <div style="background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-lg); border: 2px solid var(--border-glow); cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#22d3ee'" onmouseout="this.style.borderColor='var(--border-glow)'">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div style="font-weight: 800; font-size: 16px;">Welcome to the community! 👋</div>
            <div style="font-size: 12px; color: var(--text-tertiary);">2h ago</div>
          </div>
          <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">Introduce yourself and meet other players...</div>
          <div style="display: flex; gap: 16px; font-size: 12px; color: var(--text-tertiary);">
            <span>💬 42 replies</span>
            <span>👁️ 234 views</span>
          </div>
        </div>
        <div style="background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-lg); border: 2px solid var(--border-glow); cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#22d3ee'" onmouseout="this.style.borderColor='var(--border-glow)'">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div style="font-weight: 800; font-size: 16px;">Tips & Tricks for Memory Game 🧠</div>
            <div style="font-size: 12px; color: var(--text-tertiary);">5h ago</div>
          </div>
          <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">Share your best strategies here...</div>
          <div style="display: flex; gap: 16px; font-size: 12px; color: var(--text-tertiary);">
            <span>💬 18 replies</span>
            <span>👁️ 156 views</span>
          </div>
        </div>
        <div style="background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-lg); border: 2px solid var(--border-glow); cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#22d3ee'" onmouseout="this.style.borderColor='var(--border-glow)'">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div style="font-weight: 800; font-size: 16px;">🔥 Weekly Challenge Discussion</div>
            <div style="font-size: 12px; color: var(--text-tertiary);">1d ago</div>
          </div>
          <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">Let's discuss the current challenge...</div>
          <div style="display: flex; gap: 16px; font-size: 12px; color: var(--text-tertiary);">
            <span>💬 67 replies</span>
            <span>👁️ 423 views</span>
          </div>
        </div>
        <button class="launch-button" style="width: 100%; margin-top: 8px;">View All Topics</button>
      </div>
    `;
  }

  createSocialsContent() {
    return `
      <div style="display: grid; gap: 12px;">
        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: var(--radius-lg); border: 2px solid var(--border-glow); text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">🎮</div>
          <div style="font-size: 18px; font-weight: 800; margin-bottom: 8px;">Share Your Score</div>
          <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 16px;">Show off your achievements with friends!</div>
          <button class="launch-button" style="width: 100%;" onclick="window.ShareManager && window.ShareManager.shareScore('Memory Game', 1234)">Share Now</button>
        </div>
        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: var(--radius-lg); border: 2px solid var(--border-glow);">
          <div style="font-size: 18px; font-weight: 800; margin-bottom: 16px;">🏆 Leaderboard</div>
          <div style="display: grid; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-primary); border-radius: var(--radius-md);">
              <div style="font-size: 24px; font-weight: 900; color: #fbbf24; width: 32px;">1</div>
              <div style="flex: 1;">
                <div style="font-weight: 700;">SuperGamer123</div>
                <div style="font-size: 12px; color: var(--text-tertiary);">5,678 points</div>
              </div>
              <div style="font-size: 20px;">🥇</div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-primary); border-radius: var(--radius-md);">
              <div style="font-size: 24px; font-weight: 900; color: #9ca3af; width: 32px;">2</div>
              <div style="flex: 1;">
                <div style="font-weight: 700;">ProPlayer456</div>
                <div style="font-size: 12px; color: var(--text-tertiary);">4,321 points</div>
              </div>
              <div style="font-size: 20px;">🥈</div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-primary); border-radius: var(--radius-md);">
              <div style="font-size: 24px; font-weight: 900; color: #cd7f32; width: 32px;">3</div>
              <div style="flex: 1;">
                <div style="font-weight: 700;">GameMaster789</div>
                <div style="font-size: 12px; color: var(--text-tertiary);">3,987 points</div>
              </div>
              <div style="font-size: 20px;">🥉</div>
            </div>
          </div>
          <button class="launch-button" style="width: 100%; margin-top: 16px;" onclick="window.UIManager.launchModule('leaderboard')">View Full Leaderboard</button>
        </div>
        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: var(--radius-lg); border: 2px solid var(--border-glow); text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">👥</div>
          <div style="font-size: 18px; font-weight: 800; margin-bottom: 8px;">Invite Friends</div>
          <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 16px;">Get bonus coins for each friend!</div>
          <button class="launch-button success" style="width: 100%;" onclick="window.ShareManager && window.ShareManager.shareApp()">Send Invite</button>
        </div>
      </div>
    `;
  }

  createBottomNav() {
    const nav = document.createElement('div');
    nav.className = 'bottom-nav';
    nav.id = 'bottom-nav';

    nav.innerHTML = `
      <button class="nav-button" onclick="window.UIManager.launchModule('daily-challenge')">
        <img src="/icons/challenges.svg" alt="Challenges" class="nav-icon">
        <span class="nav-label">Challenges</span>
      </button>
      <button class="nav-button" onclick="window.UIManager.launchModule('leaderboard')">
        <img src="/icons/leaderboard.svg" alt="Leaderboard" class="nav-icon">
        <span class="nav-label">Leaderboard</span>
      </button>
      <button class="nav-button" onclick="window.UIManager.launchModule('socials')">
        <img src="/icons/socials.svg" alt="Social" class="nav-icon">
        <span class="nav-label">Social</span>
      </button>
    `;

    return nav;
  }

  showAdminPanel() {
    const menuContainer = document.getElementById('menu-container');
    const moduleContainer = document.getElementById('module-container');
    const backButton = document.querySelector('.back-button');
    const appTitle = document.querySelector('.app-title');

    menuContainer.style.display = 'none';
    moduleContainer.style.display = 'block';
    backButton.style.display = 'flex';
    appTitle.textContent = 'Admin Panel';

    if (window.ModuleRegistry && window.ModuleRegistry.get('admin-panel')) {
      const adminModule = window.ModuleRegistry.get('admin-panel');
      moduleContainer.innerHTML = '';
      adminModule.start(moduleContainer);
    }
  }

  launchModule(id) {
    const module = window.ModuleRegistry.get(id);
    if (!module) {
      console.error(`Module not found: ${id}`);
      return;
    }

    this.currentModule = module;

    const menuContainer = document.getElementById('menu-container');
    const moduleContainer = document.getElementById('module-container');
    const backButton = document.querySelector('.back-button');
    const appTitle = document.querySelector('.app-title');

    menuContainer.style.display = 'none';
    moduleContainer.style.display = 'block';
    backButton.style.display = 'flex';
    appTitle.textContent = module.name;

    moduleContainer.innerHTML = '';
    module.start(moduleContainer);

    window.Analytics.trackModuleLaunch(id);
  }

  showMenu() {
    const menuContainer = document.getElementById('menu-container');
    const moduleContainer = document.getElementById('module-container');
    const backButton = document.querySelector('.back-button');
    const appTitle = document.querySelector('.app-title');

    if (this.currentModule && this.currentModule.stop) {
      this.currentModule.stop();
    }
    this.currentModule = null;

    menuContainer.style.display = 'block';
    moduleContainer.style.display = 'none';
    backButton.style.display = 'none';
    appTitle.textContent = '';
  }

  refresh() {
    this.createUserCenteredView();
  }
}

window.UIManager = new UIManager();
