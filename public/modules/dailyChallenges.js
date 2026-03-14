const dailyChallengesModule = {
  id: 'daily-challenge',
  name: 'Daily Challenges',
  icon: '🎯',
  type: 'tool',
  version: '1.0.0',
  description: 'Complete daily challenges to earn rewards',

  async start(container) {
    const user = window.AuthManager.getCurrentUser();
    if (!user) {
      container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">Please sign in to view challenges</div>';
      return;
    }

    const challenges = await this.getChallenges();
    this.currentFilter = this.currentFilter || 'all';

    const experience = user.experience || 0;
    const level = user.level || 1;
    const bankroll = user.bankroll || 0;
    const xpForCurrentLevel = (level - 1) * 100;
    const currentLevelXP = experience - xpForCurrentLevel;
    const xpNeeded = 100;
    const progressPercent = Math.min((currentLevelXP / xpNeeded) * 100, 100);

    const categories = [
      { id: 'all', name: 'All', icon: '🎯' },
      { id: 'daily', name: 'Daily', icon: '☀️' },
      { id: 'weekly', name: 'Weekly', icon: '📅' },
      { id: 'skill', name: 'Skill', icon: '🎮' },
      { id: 'social', name: 'Social', icon: '👥' },
      { id: 'competitive', name: 'Competitive', icon: '🏆' },
      { id: 'progression', name: 'Progress', icon: '📈' }
    ];

    const filteredChallenges = this.currentFilter === 'all'
      ? challenges
      : challenges.filter(c => c.category === this.currentFilter);

    const completedCount = challenges.filter(c => c.completed).length;
    const totalChallenges = challenges.length;

    container.innerHTML = `
      <div style="min-height: 100vh; background: var(--bg-primary);">
        <div style="
          position: relative;
          background: url('/bd784273-048d-46b7-9ce9-6a2ee14880bf_(1).jpg') center/cover;
          padding: 40px 20px;
          border-bottom: 3px solid var(--border-glow);
        ">
          <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(217, 119, 6, 0.8));"></div>

          <div style="position: relative; max-width: 1000px; margin: 0 auto;">
            <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 24px; flex-wrap: wrap;">
              <div style="width: 80px; height: 80px; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 900; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3); border: 3px solid rgba(255, 255, 255, 0.4); color: white;">
                ${user.first_name.charAt(0).toUpperCase()}
              </div>
              <div style="flex: 1; min-width: 200px;">
                <div style="font-size: 28px; font-weight: 900; margin-bottom: 4px; color: white; text-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                  ${user.first_name} ${user.last_name || ''}
                </div>
                <div style="font-size: 16px; font-weight: 700; color: rgba(255,255,255,0.9);">Level ${level} • ${bankroll.toLocaleString()} Bankroll</div>
              </div>
              <div style="background: rgba(0, 0, 0, 0.2); backdrop-filter: blur(10px); border-radius: 12px; padding: 16px; border: 2px solid rgba(255, 255, 255, 0.2);">
                <div style="font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.8); text-align: center; margin-bottom: 4px;">Challenges</div>
                <div style="font-size: 24px; font-weight: 900; color: white; text-align: center;">${completedCount}/${totalChallenges}</div>
              </div>
            </div>

            <div style="background: rgba(0, 0, 0, 0.2); backdrop-filter: blur(10px); border-radius: 12px; padding: 16px; border: 2px solid rgba(255, 255, 255, 0.2); margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.5px;">XP Progress</span>
                <span style="font-size: 13px; font-weight: 800; color: white;">${currentLevelXP} / ${xpNeeded}</span>
              </div>
              <div style="position: relative; height: 12px; background: rgba(0,0,0,0.4); border-radius: 999px; overflow: hidden; border: 1px solid rgba(255,255,255,0.2);">
                <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${progressPercent}%; background: linear-gradient(90deg, #fbbf24 0%, #fef3c7 50%, #fbbf24 100%); transition: width 0.5s ease; box-shadow: 0 0 16px rgba(251, 191, 36, 0.8);"></div>
              </div>
            </div>

            <div style="text-align: center;">
              <h1 style="font-size: 36px; font-weight: 900; color: white; margin-bottom: 8px; text-shadow: 0 4px 12px rgba(0,0,0,0.4);">
                🎯 Daily Challenges
              </h1>
              <p style="color: rgba(255,255,255,0.95); font-size: 16px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Complete challenges to earn XP and bankroll bonuses!</p>
            </div>
          </div>
        </div>

        <div style="padding: 24px 20px; max-width: 1000px; margin: 0 auto;">
          <div style="display: flex; gap: 8px; overflow-x: auto; padding: 8px 0; margin-bottom: 24px; -webkit-overflow-scrolling: touch;">
            ${categories.map(cat => `
              <button
                class="category-filter-btn"
                data-category="${cat.id}"
                style="
                  padding: 10px 20px;
                  background: ${this.currentFilter === cat.id ? 'var(--border-glow)' : 'var(--bg-secondary)'};
                  border: 2px solid ${this.currentFilter === cat.id ? 'var(--border-glow)' : 'var(--border-subtle)'};
                  border-radius: var(--radius-md);
                  color: var(--text-primary);
                  font-size: 14px;
                  font-weight: 700;
                  cursor: pointer;
                  white-space: nowrap;
                  transition: all 0.2s;
                  flex-shrink: 0;
                "
                onmouseover="if(this.dataset.category !== '${this.currentFilter}') { this.style.background='var(--bg-tertiary)'; this.style.borderColor='var(--border-glow)'; }"
                onmouseout="if(this.dataset.category !== '${this.currentFilter}') { this.style.background='var(--bg-secondary)'; this.style.borderColor='var(--border-subtle)'; }"
              >
                ${cat.icon} ${cat.name}
              </button>
            `).join('')}
          </div>

          <div style="display: grid; gap: 20px;">
            ${filteredChallenges.length > 0
              ? filteredChallenges.map(challenge => this.renderChallengeCard(challenge, user)).join('')
              : '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No challenges in this category yet.</div>'
            }
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  },

  async getChallenges() {
    const user = window.AuthManager.getCurrentUser();
    const today = new Date().toISOString().split('T')[0];

    // Define all available challenges
    const challengeTemplates = [
      {
        id: 'login',
        type: 'login',
        category: 'daily',
        title: 'Daily Login',
        description: 'Log in to the app today',
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
        category: 'daily',
        title: 'Play 3 Games',
        description: 'Complete 3 games today',
        icon: '🎮',
        reward: { xp: 100, bankroll: 200 },
        color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        progress: 0,
        target: 3,
        completed: false
      },
      {
        id: 'play-5-games',
        type: 'play',
        category: 'daily',
        title: 'Gaming Marathon',
        description: 'Play 5 different games today',
        icon: '🎯',
        reward: { xp: 200, bankroll: 400 },
        color: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        progress: 0,
        target: 5,
        completed: false
      },
      {
        id: 'win-game',
        type: 'beat',
        category: 'daily',
        title: 'First Victory',
        description: 'Win your first game today',
        icon: '🏅',
        reward: { xp: 75, bankroll: 150 },
        color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'win-3-games',
        type: 'beat',
        category: 'daily',
        title: 'Hat Trick',
        description: 'Win 3 games today',
        icon: '🎩',
        reward: { xp: 150, bankroll: 300 },
        color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        progress: 0,
        target: 3,
        completed: false
      },
      {
        id: 'win-5-games',
        type: 'beat',
        category: 'weekly',
        title: 'Champion',
        description: 'Win 5 games in any mode',
        icon: '🏆',
        reward: { xp: 300, bankroll: 600 },
        color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        progress: 0,
        target: 5,
        completed: false
      },
      {
        id: 'perfect-score',
        type: 'beat',
        category: 'skill',
        title: 'Perfectionist',
        description: 'Get a perfect score in any game',
        icon: '💯',
        reward: { xp: 250, bankroll: 500 },
        color: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'memory-master',
        type: 'beat',
        category: 'skill',
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
        id: 'memory-genius',
        type: 'beat',
        category: 'skill',
        title: 'Memory Genius',
        description: 'Complete Memory Game in under 15 moves',
        icon: '🎓',
        reward: { xp: 300, bankroll: 600 },
        color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'reaction-fast',
        type: 'beat',
        category: 'skill',
        title: 'Quick Reflexes',
        description: 'Complete Reaction Game in under 500ms',
        icon: '⚡',
        reward: { xp: 150, bankroll: 300 },
        color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'reaction-pro',
        type: 'beat',
        category: 'skill',
        title: 'Lightning Speed',
        description: 'Complete Reaction Game in under 300ms',
        icon: '⚡',
        reward: { xp: 300, bankroll: 600 },
        color: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'high-score-1000',
        type: 'beat',
        category: 'skill',
        title: 'Score Hunter',
        description: 'Score 1000+ points in any game',
        icon: '🎯',
        reward: { xp: 100, bankroll: 200 },
        color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'high-score-5000',
        type: 'beat',
        category: 'skill',
        title: 'Score Legend',
        description: 'Score 5000+ points in any game',
        icon: '🌟',
        reward: { xp: 250, bankroll: 500 },
        color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'share-score',
        type: 'share',
        category: 'social',
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
        id: 'share-3-times',
        type: 'share',
        category: 'social',
        title: 'Social Butterfly',
        description: 'Share 3 game results today',
        icon: '🦋',
        reward: { xp: 150, bankroll: 300 },
        color: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
        progress: 0,
        target: 3,
        completed: false
      },
      {
        id: 'invite-friend',
        type: 'invite',
        category: 'social',
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
        id: 'invite-3-friends',
        type: 'invite',
        category: 'social',
        title: 'Friend Magnet',
        description: 'Invite 3 friends to join',
        icon: '🎪',
        reward: { xp: 500, bankroll: 1000 },
        color: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
        progress: 0,
        target: 3,
        completed: false
      },
      {
        id: 'daily-streak-3',
        type: 'streak',
        category: 'weekly',
        title: '3-Day Streak',
        description: 'Log in 3 days in a row',
        icon: '🔥',
        reward: { xp: 300, bankroll: 600 },
        color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        progress: 0,
        target: 3,
        completed: false
      },
      {
        id: 'daily-streak-7',
        type: 'streak',
        category: 'weekly',
        title: '7-Day Streak',
        description: 'Log in 7 days in a row',
        icon: '🔥',
        reward: { xp: 500, bankroll: 1000 },
        color: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        progress: 0,
        target: 7,
        completed: false
      },
      {
        id: 'daily-streak-30',
        type: 'streak',
        category: 'monthly',
        title: '30-Day Streak',
        description: 'Log in 30 days in a row',
        icon: '🔥',
        reward: { xp: 1000, bankroll: 2000 },
        color: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        progress: 0,
        target: 30,
        completed: false
      },
      {
        id: 'leaderboard-top-50',
        type: 'beat',
        category: 'competitive',
        title: 'Rising Star',
        description: 'Reach top 50 on any leaderboard',
        icon: '⭐',
        reward: { xp: 200, bankroll: 400 },
        color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'leaderboard-top-10',
        type: 'beat',
        category: 'competitive',
        title: 'Top Contender',
        description: 'Reach top 10 on any leaderboard',
        icon: '📊',
        reward: { xp: 400, bankroll: 800 },
        color: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'leaderboard-top-3',
        type: 'beat',
        category: 'competitive',
        title: 'Elite Player',
        description: 'Reach top 3 on any leaderboard',
        icon: '🥉',
        reward: { xp: 600, bankroll: 1200 },
        color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'leaderboard-first',
        type: 'beat',
        category: 'competitive',
        title: 'Champion',
        description: 'Reach #1 on any leaderboard',
        icon: '🥇',
        reward: { xp: 1000, bankroll: 2000 },
        color: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'explore-apps',
        type: 'play',
        category: 'exploration',
        title: 'App Explorer',
        description: 'Visit the App Store and try a new app',
        icon: '🏪',
        reward: { xp: 125, bankroll: 250 },
        color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'try-5-apps',
        type: 'play',
        category: 'exploration',
        title: 'App Enthusiast',
        description: 'Try 5 different apps from the store',
        icon: '🎨',
        reward: { xp: 300, bankroll: 600 },
        color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        progress: 0,
        target: 5,
        completed: false
      },
      {
        id: 'earn-1000-bankroll',
        type: 'beat',
        category: 'progression',
        title: 'First Thousand',
        description: 'Earn 1000 total bankroll',
        icon: '💰',
        reward: { xp: 200, bankroll: 400 },
        color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'earn-5000-bankroll',
        type: 'beat',
        category: 'progression',
        title: 'Wealth Builder',
        description: 'Earn 5000 total bankroll',
        icon: '💎',
        reward: { xp: 500, bankroll: 1000 },
        color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'reach-level-5',
        type: 'beat',
        category: 'progression',
        title: 'Level Up',
        description: 'Reach level 5',
        icon: '📈',
        reward: { xp: 250, bankroll: 500 },
        color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'reach-level-10',
        type: 'beat',
        category: 'progression',
        title: 'Experienced',
        description: 'Reach level 10',
        icon: '🎖️',
        reward: { xp: 500, bankroll: 1000 },
        color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        progress: 0,
        target: 1,
        completed: false
      },
      {
        id: 'complete-10-challenges',
        type: 'beat',
        category: 'achievement',
        title: 'Challenge Seeker',
        description: 'Complete 10 total challenges',
        icon: '🎯',
        reward: { xp: 300, bankroll: 600 },
        color: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
        progress: 0,
        target: 10,
        completed: false
      },
      {
        id: 'complete-50-challenges',
        type: 'beat',
        category: 'achievement',
        title: 'Challenge Master',
        description: 'Complete 50 total challenges',
        icon: '🏅',
        reward: { xp: 750, bankroll: 1500 },
        color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        progress: 0,
        target: 50,
        completed: false
      }
    ];

    try {
      const { data: progressData } = await window.supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('reset_at', today);

      if (progressData) {
        progressData.forEach(progress => {
          const challenge = challengeTemplates.find(c => c.id === progress.challenge_id);
          if (challenge) {
            challenge.progress = progress.progress;
            challenge.completed = progress.completed;
          }
        });
      }
    } catch (error) {
      console.error('Error loading challenge progress:', error);
    }

    return challengeTemplates;
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
    const actionButtons = document.querySelectorAll('.challenge-action-btn');
    actionButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const challengeId = e.target.dataset.challengeId;
        const challengeType = e.target.dataset.challengeType;
        await this.handleChallengeAction(challengeType, challengeId);
      });
    });

    const filterButtons = document.querySelectorAll('.category-filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        this.currentFilter = e.target.dataset.category;
        const container = document.getElementById('module-container');
        if (container) {
          await this.start(container);
        }
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
          window.UIManager.launchModule('memory-game');
        } else if (challengeId === 'reaction-pro') {
          window.UIManager.launchModule('reaction-game');
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
    if (!user || !window.supabase) return;

    const challenges = await this.getChallenges();
    const challenge = challenges.find(c => c.id === challengeId);

    if (!challenge || challenge.completed) return;

    const today = new Date().toISOString().split('T')[0];

    // Mark challenge as completed in database
    const { error: progressError } = await window.supabase
      .from('user_challenge_progress')
      .upsert({
        user_id: user.id,
        challenge_id: challengeId,
        progress: challenge.target,
        target: challenge.target,
        completed: true,
        completed_at: new Date().toISOString(),
        reset_at: today,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,challenge_id,reset_at'
      });

    if (progressError) {
      console.error('Error updating challenge progress:', progressError);
      return;
    }

    // Award XP and bankroll
    const newXP = (user.experience || 0) + challenge.reward.xp;
    const newBankroll = (user.bankroll || 0) + challenge.reward.bankroll;

    const { error } = await window.supabase
      .from('user_profiles')
      .update({
        experience: newXP,
        bankroll: newBankroll,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (!error) {
      user.experience = newXP;
      user.bankroll = newBankroll;

      const container = document.getElementById('module-container');
      if (container) {
        await this.start(container);
      }
    }
  },

  stop() {
    // Cleanup if needed
  }
};

window.ModuleRegistry.register(dailyChallengesModule);
