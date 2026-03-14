window.ProgressionManager = {
  calculateLevel(experience) {
    if (experience === 0) return 1;

    // Each level requires progressively more XP from 0
    // Level 1: 100 XP, Level 2: 200 XP, Level 3: 300 XP, etc.
    let totalXPNeeded = 0;
    let level = 1;

    while (true) {
      totalXPNeeded += level * 100;
      if (experience < totalXPNeeded) {
        return level;
      }
      level++;
    }
  },

  getXPRequiredForLevel(level) {
    // Total XP needed to reach this level from level 1
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += i * 100;
    }
    return total;
  },

  getXPForCurrentLevel(experience) {
    // XP progress within current level (starts from 0 each level)
    const level = this.calculateLevel(experience);
    const xpForPreviousLevel = this.getXPRequiredForLevel(level);
    return experience - xpForPreviousLevel;
  },

  getXPNeededForNextLevel(experience) {
    // XP needed to complete current level (increases per level)
    const level = this.calculateLevel(experience);
    return level * 100;
  },

  async awardChips(chips, reason = 'game') {
    const user = window.AuthManager?.getCurrentUser();
    if (!user || !window.supabase || chips <= 0) return null;

    try {
      const newExperience = (user.experience || 0) + chips;
      const newBankroll = (user.bankroll || 0) + chips;
      const oldLevel = this.calculateLevel(user.experience || 0);
      const newLevel = this.calculateLevel(newExperience);

      const { data, error } = await window.supabase
        .from('user_profiles')
        .update({
          experience: newExperience,
          bankroll: newBankroll,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error awarding chips:', error);
        return null;
      }

      user.experience = newExperience;
      user.bankroll = newBankroll;

      const leveledUp = newLevel > oldLevel;

      if (leveledUp && window.TelegramAdapter) {
        window.TelegramAdapter.haptic('notification', 'success');
      }

      return {
        chips,
        newExperience,
        newBankroll,
        oldLevel,
        newLevel,
        leveledUp,
        reason
      };
    } catch (error) {
      console.error('Error in awardChips:', error);
      return null;
    }
  },

  calculateChipsForGame(gameId, score, scoreType) {
    switch (gameId) {
      case 'memory-game':
        const maxMoves = 30;
        const minChips = 10;
        const maxChips = 100;
        const efficiency = Math.max(0, (maxMoves - score) / maxMoves);
        return Math.floor(minChips + (efficiency * (maxChips - minChips)));

      case 'reaction-game':
        if (score < 200) return 100;
        if (score < 300) return 75;
        if (score < 400) return 50;
        if (score < 500) return 30;
        return 20;

      default:
        return 25;
    }
  },

  showProgressNotification(result) {
    if (!result) return;

    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      z-index: 10000;
      min-width: 200px;
      animation: slideIn 0.3s ease-out;
    `;

    const levelUpText = result.leveledUp
      ? `<div style="font-size: 18px; font-weight: 900; margin-bottom: 8px;">🎉 Level Up! Level ${result.newLevel}</div>`
      : '';

    container.innerHTML = `
      ${levelUpText}
      <div style="font-size: 14px; font-weight: 700; margin-bottom: 4px;">
        +${result.chips} Chips Won!
      </div>
      <div style="font-size: 12px; opacity: 0.9;">
        XP: ${this.getXPForCurrentLevel(result.newExperience)} / ${this.getXPNeededForNextLevel(result.newExperience)}
      </div>
      <div style="font-size: 12px; opacity: 0.9;">
        Bankroll: ${result.newBankroll.toLocaleString()}
      </div>
    `;

    document.body.appendChild(container);

    setTimeout(() => {
      container.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => container.remove(), 300);
    }, 3000);
  }
};

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
