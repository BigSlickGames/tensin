class UIManager {
  constructor() {
    this.currentModule = null;
    this.isMenuVisible = true;
  }

  init() {
    this.createUserCenteredView();
  }

  createUserCenteredView() {
    const root = document.getElementById('root');
    root.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'app-container';

    // Header
    const header = this.createHeader();
    container.appendChild(header);

    // Menu Container
    const menuContainer = document.createElement('div');
    menuContainer.className = 'menu-container';
    menuContainer.id = 'menu-container';

    // Hero Banner
    const heroBanner = this.createHeroBanner();
    menuContainer.appendChild(heroBanner);

    // User Sections
    this.createExpandableSection(menuContainer, 'Player Profile', 'blue', '👤', this.createPlayerProfileContent());
    this.createExpandableSection(menuContainer, 'Daily Bonuses', 'orange', '🎁', this.createDailyBonusesContent());
    this.createExpandableSection(menuContainer, 'Games', 'green', '🎮', this.createGamesContent());
    this.createExpandableSection(menuContainer, 'Forum', 'purple', '💬', this.createForumContent());
    this.createExpandableSection(menuContainer, 'Socials', 'pink', '✨', this.createSocialsContent());

    // Admin link at bottom
    const adminLink = document.createElement('div');
    adminLink.style.cssText = 'margin-top: 32px; padding: 24px; text-align: center; border-top: 2px solid var(--border-subtle);';
    adminLink.innerHTML = `
      <button class="launch-button" onclick="window.UIManager.showAdminPanel()" style="opacity: 0.7;">
        ⚙️ Admin Panel
      </button>
    `;
    menuContainer.appendChild(adminLink);

    container.appendChild(menuContainer);

    // Module Container (hidden by default)
    const moduleContainer = document.createElement('div');
    moduleContainer.className = 'module-container';
    moduleContainer.id = 'module-container';
    moduleContainer.style.display = 'none';
    container.appendChild(moduleContainer);

    root.appendChild(container);
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
    title.textContent = 'Mini App Hub';
    header.appendChild(title);

    return header;
  }

  createHeroBanner() {
    const banner = document.createElement('div');
    banner.className = 'hero-banner';
    banner.innerHTML = `
      <div class="hero-content">
        <div class="hero-title">BIG SLICK GAMES</div>
        <div class="hero-subtitle">Your Gaming Universe</div>
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
      <div class="expandable-title">${icon} ${title}</div>
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

  createPlayerProfileContent() {
    const user = window.TelegramAdapter.getUser();
    return `
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
        <div style="width: 80px; height: 80px; background: var(--gradient-teal); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; box-shadow: var(--shadow-lg);">
          ${user.first_name.charAt(0).toUpperCase()}
        </div>
        <div style="flex: 1;">
          <div style="font-size: 24px; font-weight: 800; margin-bottom: 4px;">${user.first_name} ${user.last_name || ''}</div>
          <div style="color: var(--text-secondary); font-size: 14px;">Level 5 Player</div>
        </div>
      </div>
      <div class="game-stats" style="justify-content: flex-start;">
        <div class="stat-item">
          <div class="stat-label">Score</div>
          <div class="stat-value">1,234</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Wins</div>
          <div class="stat-value">42</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Rank</div>
          <div class="stat-value">#15</div>
        </div>
      </div>
      <div style="margin-top: 24px;">
        <h4 style="font-size: 14px; color: var(--text-tertiary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Achievements</h4>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <div style="background: var(--bg-tertiary); padding: 12px 16px; border-radius: var(--radius-md); border: 2px solid var(--border-glow); font-size: 20px;">🏆</div>
          <div style="background: var(--bg-tertiary); padding: 12px 16px; border-radius: var(--radius-md); border: 2px solid var(--border-glow); font-size: 20px;">⚡</div>
          <div style="background: var(--bg-tertiary); padding: 12px 16px; border-radius: var(--radius-md); border: 2px solid var(--border-glow); font-size: 20px;">🎯</div>
          <div style="background: var(--bg-tertiary); padding: 12px 16px; border-radius: var(--radius-md); border: 2px solid var(--border-glow); font-size: 20px;">💎</div>
          <div style="background: var(--bg-tertiary); padding: 12px 16px; border-radius: var(--radius-md); border: 2px solid var(--border-glow); font-size: 20px;">🔥</div>
        </div>
      </div>
    `;
  }

  createDailyBonusesContent() {
    return `
      <div style="display: grid; gap: 16px;">
        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: var(--radius-lg); border: 2px solid var(--border-glow);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 18px; font-weight: 800; margin-bottom: 4px;">Daily Login Bonus</div>
              <div style="color: var(--text-secondary); font-size: 14px;">Come back tomorrow for more rewards!</div>
            </div>
            <div style="font-size: 36px;">🎁</div>
          </div>
          <button class="game-button" style="width: 100%; margin-top: 16px;">Claim 100 Coins</button>
        </div>
        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: var(--radius-lg); border: 2px solid var(--border-glow);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 18px; font-weight: 800; margin-bottom: 4px;">Daily Challenge</div>
              <div style="color: var(--text-secondary); font-size: 14px;">Complete 3 games today</div>
            </div>
            <div style="font-size: 36px;">🎯</div>
          </div>
          <div style="margin-top: 16px; background: var(--bg-primary); padding: 12px; border-radius: var(--radius-md);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 14px;">Progress</span>
              <span style="font-weight: 800;">1/3</span>
            </div>
            <div style="height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;">
              <div style="width: 33%; height: 100%; background: var(--gradient-green); transition: width 0.3s;"></div>
            </div>
          </div>
        </div>
        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: var(--radius-lg); border: 2px solid var(--border-glow);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 18px; font-weight: 800; margin-bottom: 4px;">Streak Reward</div>
              <div style="color: var(--text-secondary); font-size: 14px;">7 days in a row! 🔥</div>
            </div>
            <div style="font-size: 36px;">⚡</div>
          </div>
          <button class="game-button success" style="width: 100%; margin-top: 16px;">Claim 500 Coins</button>
        </div>
      </div>
    `;
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
          <button class="launch-button" style="width: 100%; margin-top: 16px;">View Full Leaderboard</button>
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
    appTitle.textContent = 'Mini App Hub';
  }

  refresh() {
    this.createUserCenteredView();
  }
}

window.UIManager = new UIManager();
