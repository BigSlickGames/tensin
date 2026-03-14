const leaderboardModule = {
  id: 'leaderboard',
  name: 'Leaderboard',
  description: 'Global rankings',
  icon: '🏆',
  type: 'game',
  container: null,
  currentGame: 'all',

  async start(container) {
    this.container = container;
    this.currentGame = 'all';

    const wrapper = document.createElement('div');
    wrapper.className = 'game-container';
    wrapper.innerHTML = `
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 class="game-title" style="margin-bottom: 8px;">🏆 Global Leaderboard</h1>
        <p class="game-subtitle">Compete with the best players worldwide</p>
      </div>

      <div id="leaderboard-tabs" style="display: flex; gap: 8px; margin-bottom: 28px; justify-content: center; flex-wrap: wrap;">
        <button class="tab-button active" data-game="all">
          <span style="font-size: 16px; margin-bottom: 2px;">🌟</span>
          <span>All Games</span>
        </button>
        <button class="tab-button" data-game="memory">
          <span style="font-size: 16px; margin-bottom: 2px;">🧠</span>
          <span>Memory</span>
        </button>
        <button class="tab-button" data-game="reaction">
          <span style="font-size: 16px; margin-bottom: 2px;">⚡</span>
          <span>Reaction</span>
        </button>
      </div>

      <div id="leaderboard-content" style="width: 100%; max-width: 640px;">
        <div class="loading-state" style="text-align: center; padding: 48px;">
          <div style="font-size: 56px; margin-bottom: 16px; animation: pulse 1.5s ease-in-out infinite;">⏳</div>
          <p style="color: var(--text-secondary); font-size: 16px;">Loading rankings...</p>
        </div>
      </div>
    `;

    container.appendChild(wrapper);
    this.setupEventListeners();
    await this.loadLeaderboard();
  },

  stop() {
    this.container = null;
    this.currentGame = 'all';
  },

  setupEventListeners() {
    const tabs = this.container.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
      tab.addEventListener('click', async (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.currentGame = e.target.dataset.game;
        await this.loadLeaderboard();
      });
    });
  },

  async loadLeaderboard() {
    const content = this.container.querySelector('#leaderboard-content');

    try {
      let scores;

      if (this.currentGame === 'all') {
        const { data, error } = await window.supabaseClient
          .from('leaderboard_scores')
          .select(`
            *,
            user_profiles (username)
          `)
          .order('score', { ascending: false })
          .limit(100);

        if (error) throw error;
        scores = data;
      } else {
        const { data, error } = await window.supabaseClient
          .from('leaderboard_scores')
          .select(`
            *,
            user_profiles (username)
          `)
          .eq('game_type', this.currentGame)
          .order('score', { ascending: false })
          .limit(100);

        if (error) throw error;
        scores = data;
      }

      if (!scores || scores.length === 0) {
        content.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🏆</div>
            <p>No scores yet. Be the first to play!</p>
          </div>
        `;
        return;
      }

      const topThree = scores.slice(0, 3);
      const rest = scores.slice(3);

      const podiumHTML = topThree.length >= 3 ? `
        <div style="display: flex; align-items: flex-end; justify-content: center; gap: 12px; margin-bottom: 32px; padding: 0 20px;">
          <div style="flex: 1; max-width: 120px; text-align: center;">
            <div style="width: 60px; height: 60px; margin: 0 auto 12px; background: linear-gradient(135deg, #C0C0C0, #E8E8E8); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; border: 3px solid rgba(255,255,255,0.3); box-shadow: 0 8px 24px rgba(192,192,192,0.4);">🥈</div>
            <div style="background: linear-gradient(135deg, rgba(192,192,192,0.2), transparent); border: 2px solid rgba(192,192,192,0.5); border-radius: var(--radius-lg); padding: 16px 8px; min-height: 120px; display: flex; flex-direction: column; justify-content: center;">
              <div style="font-size: 32px; font-weight: 900; color: #C0C0C0; margin-bottom: 4px;">2</div>
              <div style="font-size: 13px; font-weight: 800; margin-bottom: 4px; color: var(--text-primary);">${topThree[1]?.user_profiles?.username || 'Anonymous'}</div>
              <div style="font-size: 18px; font-weight: 900; background: var(--gradient-teal); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${topThree[1]?.score.toLocaleString()}</div>
            </div>
          </div>

          <div style="flex: 1; max-width: 120px; text-align: center;">
            <div style="width: 80px; height: 80px; margin: 0 auto 12px; background: linear-gradient(135deg, #FFD700, #FFA500); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; border: 3px solid rgba(255,255,255,0.4); box-shadow: 0 12px 32px rgba(255,215,0,0.5); animation: pulse 2s ease-in-out infinite;">👑</div>
            <div style="background: linear-gradient(135deg, rgba(255,215,0,0.3), transparent); border: 2px solid rgba(255,215,0,0.6); border-radius: var(--radius-lg); padding: 20px 8px; min-height: 140px; display: flex; flex-direction: column; justify-content: center;">
              <div style="font-size: 40px; font-weight: 900; color: #FFD700; margin-bottom: 4px;">1</div>
              <div style="font-size: 14px; font-weight: 800; margin-bottom: 4px; color: var(--text-primary);">${topThree[0]?.user_profiles?.username || 'Anonymous'}</div>
              <div style="font-size: 20px; font-weight: 900; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${topThree[0]?.score.toLocaleString()}</div>
            </div>
          </div>

          <div style="flex: 1; max-width: 120px; text-align: center;">
            <div style="width: 60px; height: 60px; margin: 0 auto 12px; background: linear-gradient(135deg, #CD7F32, #8B4513); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; border: 3px solid rgba(255,255,255,0.3); box-shadow: 0 8px 24px rgba(205,127,50,0.4);">🥉</div>
            <div style="background: linear-gradient(135deg, rgba(205,127,50,0.2), transparent); border: 2px solid rgba(205,127,50,0.5); border-radius: var(--radius-lg); padding: 16px 8px; min-height: 110px; display: flex; flex-direction: column; justify-content: center;">
              <div style="font-size: 32px; font-weight: 900; color: #CD7F32; margin-bottom: 4px;">3</div>
              <div style="font-size: 13px; font-weight: 800; margin-bottom: 4px; color: var(--text-primary);">${topThree[2]?.user_profiles?.username || 'Anonymous'}</div>
              <div style="font-size: 18px; font-weight: 900; background: var(--gradient-teal); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${topThree[2]?.score.toLocaleString()}</div>
            </div>
          </div>
        </div>
      ` : '';

      const restHTML = rest.map((entry, index) => {
        const rank = index + 4;
        const username = entry.user_profiles?.username || 'Anonymous';

        return `
          <div class="leaderboard-entry">
            <div class="entry-rank">
              <span class="rank-number" style="font-size: 20px;">${rank}</span>
            </div>
            <div class="entry-info">
              <div class="entry-username">${username}</div>
              <div class="entry-game">${entry.game_type}</div>
            </div>
            <div class="entry-score">${entry.score.toLocaleString()}</div>
          </div>
        `;
      }).join('');

      content.innerHTML = `
        ${podiumHTML}
        ${rest.length > 0 ? `<div class="leaderboard-list">${restHTML}</div>` : ''}
      `;

    } catch (error) {
      console.error('Error loading leaderboard:', error);
      content.innerHTML = `
        <div class="error-message">
          <strong>Failed to load leaderboard</strong>
          <div class="error-details">${error.message}</div>
        </div>
      `;
    }
  }
};

const style = document.createElement('style');
style.textContent = `
  .tab-button {
    background: var(--bg-card);
    backdrop-filter: blur(10px);
    border: 2px solid var(--border-glow);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all var(--transition-base);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .tab-button:hover {
    background: var(--bg-tertiary);
    border-color: #22d3ee;
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
  }

  .tab-button.active {
    background: var(--gradient-teal);
    border-color: #22d3ee;
    box-shadow: var(--shadow-md), var(--shadow-glow);
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
  }

  .leaderboard-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .leaderboard-entry {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: var(--bg-card);
    backdrop-filter: blur(10px);
    border: 2px solid var(--border-glow);
    border-radius: var(--radius-lg);
    transition: all var(--transition-base);
    box-shadow: var(--shadow-md);
  }

  .leaderboard-entry:hover {
    border-color: #22d3ee;
    transform: translateX(4px);
    box-shadow: var(--shadow-lg), var(--shadow-glow);
  }

  .leaderboard-entry.rank-gold {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, var(--bg-card) 100%);
    border-color: #FFD700;
  }

  .leaderboard-entry.rank-silver {
    background: linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, var(--bg-card) 100%);
    border-color: #C0C0C0;
  }

  .leaderboard-entry.rank-bronze {
    background: linear-gradient(135deg, rgba(205, 127, 50, 0.15) 0%, var(--bg-card) 100%);
    border-color: #CD7F32;
  }

  .entry-rank {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 60px;
  }

  .rank-number {
    font-size: 24px;
    font-weight: 900;
    color: var(--text-primary);
  }

  .rank-medal {
    font-size: 28px;
  }

  .entry-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .entry-username {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .entry-game {
    font-size: 12px;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .entry-score {
    font-size: 28px;
    font-weight: 900;
    background: var(--gradient-teal);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 480px) {
    .leaderboard-entry {
      padding: 12px 16px;
      gap: 12px;
    }

    .rank-number {
      font-size: 20px;
    }

    .rank-medal {
      font-size: 24px;
    }

    .entry-username {
      font-size: 16px;
    }

    .entry-score {
      font-size: 24px;
    }

    .tab-button {
      padding: 10px 16px;
      font-size: 12px;
    }
  }
`;
document.head.appendChild(style);

if (window.ModuleRegistry) {
  window.ModuleRegistry.register(leaderboardModule);
}
