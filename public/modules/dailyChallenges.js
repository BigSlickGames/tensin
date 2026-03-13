const dailyChallengesModule = {
  name: 'Daily Challenges',
  version: '1.0.0',
  description: 'Complete daily challenges to earn rewards',

  async render(container) {
    const user = window.AuthManager.getCurrentUser();
    if (!user) {
      container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">Please sign in to view challenges</div>';
      return;
    }

    const challenges = await this.getChallenges();

    container.innerHTML = `
      <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 32px; font-weight: 900; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px;">
            Daily Challenges
          </h1>
          <p style="color: var(--text-secondary); font-size: 16px;">Complete challenges to earn XP and bankroll bonuses!</p>
        </div>

        <div style="display: grid; gap: 20px;">
          ${challenges.map(challenge => this.renderChallengeCard(challenge, user)).join('')}
        </div>
      </div>
    `;

    this.attachEventListeners();
  },

  async getChallenges() {
    const today = new Date().toISOString().split('T')[0];

    return [
      {
        id: 'login',
        type: 'login',
        title: 'Daily Login',
        description: 'Log in to the app',
        icon: '🎁',
        reward: { xp: 50, bankroll: 100 },
        color: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
        progress: 1,
        target: 1,
        completed: true
      },
      {
        id: 'play-3-games',
        type: 'play',
        title: 'Play 3 Games',
        description: 'Complete 3 games today',
        icon: '🎮',
        reward: { xp: 100, bankroll: 200 },
        color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        progress: 1,
        target: 3,
        completed: false
      },
      {
        id: 'win-5-games',
        type: 'beat',
        title: 'Win 5 Games',
        description: 'Win 5 games in any mode',
        icon: '🏆',
        reward: { xp: 200, bankroll: 400 },
        color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        progress: 0,
        target: 5,
        completed: false
      },
      {
        id: 'memory-master',
        type: 'beat',
        title: 'Memory Master',
        description: 'Complete Memory Game in under 20 moves',
        icon: '🧠',
        reward: { xp: 150, bankroll: 300 },
        color: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'reaction-pro',
        type: 'beat',
        title: 'Reaction Pro',
        description: 'Complete Reaction Game in under 500ms',
        icon: '⚡',
        reward: { xp: 150, bankroll: 300 },
        color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'share-score',
        type: 'share',
        title: 'Share Your Score',
        description: 'Share your game result with friends',
        icon: '📤',
        reward: { xp: 75, bankroll: 150 },
        color: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'invite-friend',
        type: 'invite',
        title: 'Invite a Friend',
        description: 'Invite 1 friend to join the app',
        icon: '👥',
        reward: { xp: 250, bankroll: 500 },
        color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'post-forum',
        type: 'post',
        title: 'Forum Post',
        description: 'Create a post in the forum',
        icon: '💬',
        reward: { xp: 100, bankroll: 200 },
        color: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'daily-streak-3',
        type: 'beat',
        title: '3-Day Streak',
        description: 'Log in 3 days in a row',
        icon: '🔥',
        reward: { xp: 300, bankroll: 600 },
        color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        progress: 2,
        target: 3,
        completed: false
      },
      {
        id: 'daily-streak-7',
        type: 'beat',
        title: '7-Day Streak',
        description: 'Log in 7 days in a row',
        icon: '🔥',
        reward: { xp: 500, bankroll: 1000 },
        color: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        progress: 2,
        target: 7,
        completed: false
      },
      {
        id: 'leaderboard-top-10',
        type: 'beat',
        title: 'Top 10 Player',
        description: 'Reach top 10 on any leaderboard',
        icon: '📊',
        reward: { xp: 400, bankroll: 800 },
        color: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'explore-apps',
        type: 'play',
        title: 'App Explorer',
        description: 'Visit the App Store and try a new app',
        icon: '🏪',
        reward: { xp: 125, bankroll: 250 },
        color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        progress: 0,
        target: 1,
        completed: false
      }
    ];
  },

  renderChallengeCard(challenge, user) {
    const progressPercent = Math.min((challenge.progress / challenge.target) * 100, 100);
    const isCompleted = challenge.completed;

    return `
      <div style="
        background: var(--bg-secondary);
        border: 2px solid ${isCompleted ? 'rgba(16, 185, 129, 0.5)' : 'var(--border-glow)'};
        border-radius: var(--radius-lg);
        padding: 20px;
        position: relative;
        overflow: hidden;
        transition: all 0.2s;
        ${isCompleted ? 'opacity: 0.7;' : ''}
      "
      onmouseover="if (!${isCompleted}) this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.4)';"
      onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';"
      >
        ${isCompleted ? `
          <div style="position: absolute; top: 16px; right: 16px; width: 40px; height: 40px; background: rgba(16, 185, 129, 0.2); border: 2px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">
            ✓
          </div>
        ` : ''}

        <div style="display: flex; align-items: start; gap: 20px; margin-bottom: 16px;">
          <div style="
            width: 70px;
            height: 70px;
            background: ${challenge.color};
            border-radius: var(--radius-lg);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          ">
            ${challenge.icon}
          </div>

          <div style="flex: 1;">
            <div style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
              ${challenge.title}
            </div>
            <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 12px;">
              ${challenge.description}
            </div>

            <div style="display: flex; gap: 16px; align-items: center;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 14px; font-weight: 700; color: #22d3ee;">+${challenge.reward.xp} XP</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 14px; font-weight: 700; color: #fbbf24;">+${challenge.reward.bankroll}</span>
              </div>
            </div>
          </div>
        </div>

        ${!isCompleted ? `
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">Progress</span>
              <span style="font-size: 13px; font-weight: 800; color: var(--text-primary);">${challenge.progress} / ${challenge.target}</span>
            </div>
            <div style="height: 8px; background: var(--bg-tertiary); border-radius: 999px; overflow: hidden; border: 1px solid var(--border-subtle);">
              <div style="height: 100%; width: ${progressPercent}%; background: ${challenge.color}; transition: width 0.5s ease;"></div>
            </div>
          </div>

          <button
            class="challenge-action-btn"
            data-challenge-id="${challenge.id}"
            data-challenge-type="${challenge.type}"
            style="
              width: 100%;
              padding: 12px;
              background: ${challenge.color};
              border: none;
              border-radius: var(--radius-md);
              color: white;
              font-size: 14px;
              font-weight: 800;
              cursor: pointer;
              transition: all 0.2s;
            "
            onmouseover="this.style.opacity='0.9'; this.style.transform='scale(0.98)';"
            onmouseout="this.style.opacity='1'; this.style.transform='scale(1)';"
          >
            ${this.getActionButtonText(challenge.type)}
          </button>
        ` : `
          <div style="
            padding: 12px;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: var(--radius-md);
            text-align: center;
            color: #10b981;
            font-weight: 700;
          ">
            Completed! Rewards Claimed
          </div>
        `}
      </div>
    `;
  },

  getActionButtonText(type) {
    const buttonTexts = {
      'login': 'Claim Reward',
      'play': 'Play Games',
      'beat': 'Start Challenge',
      'share': 'Share Now',
      'invite': 'Invite Friends',
      'post': 'Go to Forum'
    };
    return buttonTexts[type] || 'Start';
  },

  attachEventListeners() {
    const buttons = document.querySelectorAll('.challenge-action-btn');
    buttons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const challengeId = e.target.dataset.challengeId;
        const challengeType = e.target.dataset.challengeType;
        await this.handleChallengeAction(challengeType, challengeId);
      });
    });
  },

  async handleChallengeAction(type, challengeId) {
    switch (type) {
      case 'login':
        await this.claimReward(challengeId);
        break;
      case 'play':
        window.UIManager.showMenu();
        break;
      case 'beat':
        if (challengeId === 'memory-master') {
          window.ModuleLoader.loadModule('memory-game');
        } else if (challengeId === 'reaction-pro') {
          window.ModuleLoader.loadModule('reaction-game');
        } else {
          window.UIManager.showMenu();
        }
        break;
      case 'share':
        if (window.ShareManager) {
          await window.ShareManager.shareScore('Check out my progress!', 1000);
        }
        break;
      case 'invite':
        if (window.Telegram?.WebApp) {
          const inviteUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Join me in Tensins World!')}`;
          window.Telegram.WebApp.openTelegramLink(inviteUrl);
        } else {
          alert('Invite feature coming soon!');
        }
        break;
      case 'post':
        window.UIManager.showMenu();
        break;
    }
  },

  async claimReward(challengeId) {
    const user = window.AuthManager.getCurrentUser();
    if (!user) return;

    const challenges = await this.getChallenges();
    const challenge = challenges.find(c => c.id === challengeId);

    if (!challenge) return;

    const newXP = (user.experience || 0) + challenge.reward.xp;
    const newBankroll = (user.bankroll || 0) + challenge.reward.bankroll;

    const { error } = await window.supabase
      .from('user_profiles')
      .update({
        experience: newXP,
        bankroll: newBankroll
      })
      .eq('id', user.id);

    if (!error) {
      user.experience = newXP;
      user.bankroll = newBankroll;

      const container = document.getElementById('module-container');
      if (container) {
        await this.render(container);
      }
    }
  },

  cleanup() {
    // Cleanup if needed
  }
};

window.ModuleRegistry.register('daily-challenge', dailyChallengesModule);
