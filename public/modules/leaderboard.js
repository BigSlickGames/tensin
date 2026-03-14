window.Modules = window.Modules || {};

window.Modules.leaderboard = {
  name: 'Leaderboard',
  description: 'Global rankings',
  icon: '🏆',

  async render() {
    const container = document.createElement('div');
    container.className = 'game-container';
    container.innerHTML = `
      <h1 class="game-title">🏆 Leaderboard</h1>
      <p class="game-subtitle">Top players worldwide</p>

      <div id="leaderboard-tabs" style="display: flex; gap: 12px; margin-bottom: 24px;">
        <button class="tab-button active" data-game="all">All Games</button>
        <button class="tab-button" data-game="memory">Memory</button>
        <button class="tab-button" data-game="reaction">Reaction</button>
      </div>

      <div id="leaderboard-content" style="width: 100%; max-width: 600px;">
        <div class="loading-state" style="text-align: center; padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
          <p style="color: var(--text-secondary);">Loading leaderboard...</p>
        </div>
      </div>
    `;

    this.container = container;
    this.currentGame = 'all';
    this.setupEventListeners();
    await this.loadLeaderboard();

    return container;
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

      const leaderboardHTML = scores.map((entry, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
        const rankClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : '';
        const username = entry.user_profiles?.username || 'Anonymous';

        return `
          <div class="leaderboard-entry ${rankClass}">
            <div class="entry-rank">
              <span class="rank-number">${rank}</span>
              ${medal ? `<span class="rank-medal">${medal}</span>` : ''}
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
        <div class="leaderboard-list">
          ${leaderboardHTML}
        </div>
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
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all var(--transition-base);
    text-transform: uppercase;
    letter-spacing: 0.5px;
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
