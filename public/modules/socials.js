window.Modules = window.Modules || {};

window.Modules.socials = {
  name: 'Social',
  description: 'Connect with friends',
  icon: '👥',

  async render() {
    const container = document.createElement('div');
    container.className = 'game-container';
    container.innerHTML = `
      <h1 class="game-title">👥 Social</h1>
      <p class="game-subtitle">Connect and compete with friends</p>

      <div id="socials-content" style="width: 100%; max-width: 600px; display: grid; gap: 20px;">
        ${this.createShareSection()}
        ${this.createLeaderboardPreview()}
        ${this.createInviteSection()}
      </div>
    `;

    this.container = container;
    await this.loadLeaderboardPreview();

    return container;
  },

  createShareSection() {
    return `
      <div style="background: var(--bg-card); backdrop-filter: blur(10px); padding: 28px; border-radius: var(--radius-xl); border: 2px solid var(--border-glow); text-align: center; box-shadow: var(--shadow-lg);">
        <div style="font-size: 56px; margin-bottom: 16px;">🎮</div>
        <div style="font-size: 22px; font-weight: 800; margin-bottom: 12px; color: var(--text-primary);">Share Your Score</div>
        <div style="color: var(--text-secondary); font-size: 15px; margin-bottom: 20px; line-height: 1.5;">Show off your achievements with friends and climb the ranks!</div>
        <button class="game-button" style="width: 100%;" onclick="window.ShareManager && window.ShareManager.shareScore('Best Score', 9999)">Share Now</button>
      </div>
    `;
  },

  createLeaderboardPreview() {
    return `
      <div style="background: var(--bg-card); backdrop-filter: blur(10px); padding: 28px; border-radius: var(--radius-xl); border: 2px solid var(--border-glow); box-shadow: var(--shadow-lg);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <div style="font-size: 22px; font-weight: 800; color: var(--text-primary);">🏆 Top Players</div>
          <button
            onclick="window.UIManager.launchModule('leaderboard')"
            style="padding: 8px 16px; background: var(--gradient-teal); border: none; border-radius: var(--radius-md); color: white; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s;"
            onmouseover="this.style.transform='scale(1.05)'"
            onmouseout="this.style.transform='scale(1)'"
          >View All</button>
        </div>
        <div id="leaderboard-preview" style="display: grid; gap: 12px;">
          <div style="text-align: center; padding: 32px; color: var(--text-secondary);">
            Loading top players...
          </div>
        </div>
      </div>
    `;
  },

  createInviteSection() {
    return `
      <div style="background: var(--bg-card); backdrop-filter: blur(10px); padding: 28px; border-radius: var(--radius-xl); border: 2px solid var(--border-glow); text-align: center; box-shadow: var(--shadow-lg);">
        <div style="font-size: 56px; margin-bottom: 16px;">🎁</div>
        <div style="font-size: 22px; font-weight: 800; margin-bottom: 12px; color: var(--text-primary);">Invite Friends</div>
        <div style="color: var(--text-secondary); font-size: 15px; margin-bottom: 20px; line-height: 1.5;">Get bonus coins for each friend who joins!</div>
        <button class="game-button success" style="width: 100%;" onclick="window.ShareManager && window.ShareManager.shareApp()">Send Invite</button>
      </div>
    `;
  },

  async loadLeaderboardPreview() {
    const previewContainer = this.container.querySelector('#leaderboard-preview');
    if (!previewContainer) return;

    try {
      const { data: scores, error } = await window.supabaseClient
        .from('leaderboard_scores')
        .select(`
          *,
          user_profiles (username)
        `)
        .order('score', { ascending: false })
        .limit(3);

      if (error) throw error;

      if (!scores || scores.length === 0) {
        previewContainer.innerHTML = `
          <div style="text-align: center; padding: 24px; color: var(--text-secondary);">
            <div style="font-size: 48px; margin-bottom: 12px; opacity: 0.4;">🏆</div>
            <p>No scores yet. Be the first!</p>
          </div>
        `;
        return;
      }

      const medals = ['🥇', '🥈', '🥉'];
      const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];

      previewContainer.innerHTML = scores.map((entry, index) => {
        const username = entry.user_profiles?.username || 'Anonymous';
        return `
          <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--bg-tertiary); border-radius: var(--radius-lg); border: 2px solid ${colors[index]}33; transition: all 0.2s;" onmouseover="this.style.transform='translateX(4px)'; this.style.borderColor='${colors[index]}'" onmouseout="this.style.transform='translateX(0)'; this.style.borderColor='${colors[index]}33'">
            <div style="font-size: 32px; font-weight: 900; color: ${colors[index]}; min-width: 40px; text-align: center;">${index + 1}</div>
            <div style="flex: 1;">
              <div style="font-weight: 800; font-size: 17px; margin-bottom: 2px;">${username}</div>
              <div style="font-size: 13px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px;">${entry.game_type}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="font-size: 22px; font-weight: 900; background: var(--gradient-teal); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${entry.score.toLocaleString()}</div>
              <div style="font-size: 28px;">${medals[index]}</div>
            </div>
          </div>
        `;
      }).join('');

    } catch (error) {
      console.error('Error loading leaderboard preview:', error);
      previewContainer.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--danger);">
          Failed to load top players
        </div>
      `;
    }
  }
};
