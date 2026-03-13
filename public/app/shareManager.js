class ShareManager {
  constructor() {
    this.botUsername = 'YourBotUsername';
    this.defaultMessages = {
      general: "Check out this awesome Mini App Hub! Play games and compete with friends!",
      tapGame: "I'm crushing it in Tap Master! Can you beat my score?",
      reactionGame: "I scored {score} in Reaction Test! Think you're faster? Prove it!",
      memoryGame: "My memory is on fire! I scored {score} in Memory Match. Can you beat it?",
      bubblePop: "Just popped my way to {score} points in Bubble Pop! Your turn!"
    };
  }

  setBotUsername(username) {
    this.botUsername = username;
  }

  getBotUsername() {
    const stored = localStorage.getItem('bot_username');
    return stored || this.botUsername;
  }

  generateShareUrl(message = null, startParam = null) {
    const botUsername = this.getBotUsername();
    let url = `https://t.me/share/url?url=https://t.me/${botUsername}`;

    if (startParam) {
      url += `?start=${startParam}`;
    }

    if (message) {
      url += `&text=${encodeURIComponent(message)}`;
    }

    return url;
  }

  generateChallengeMessage(gameName, score) {
    const gameKey = this.getGameKey(gameName);
    const template = this.defaultMessages[gameKey] || this.defaultMessages.general;
    return template.replace('{score}', score);
  }

  getGameKey(gameName) {
    const nameMap = {
      'Tap Master': 'tapGame',
      'Reaction Test': 'reactionGame',
      'Memory Match': 'memoryGame',
      'Bubble Pop': 'bubblePop'
    };
    return nameMap[gameName] || 'general';
  }

  shareToTelegram(message, startParam = null) {
    if (window.TelegramAdapter.isReady()) {
      const url = this.generateShareUrl(message, startParam);
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      console.warn('Telegram WebApp not available');
      this.fallbackShare(message);
    }
  }

  shareGameScore(gameName, score) {
    const message = this.generateChallengeMessage(gameName, score);
    const startParam = `challenge_${this.getGameKey(gameName)}_${score}`;
    this.shareToTelegram(message, startParam);
  }

  shareGeneral() {
    const message = this.defaultMessages.general;
    this.shareToTelegram(message, 'invite');
  }

  fallbackShare(message) {
    const botUsername = this.getBotUsername();
    const url = `https://t.me/${botUsername}`;

    if (navigator.share) {
      navigator.share({
        title: 'Mini App Hub',
        text: message,
        url: url
      }).catch(err => console.log('Share cancelled', err));
    } else {
      const shareUrl = this.generateShareUrl(message);
      window.open(shareUrl, '_blank');
    }
  }

  createShareButton(options = {}) {
    const {
      text = 'Share',
      icon = '📤',
      style = 'primary',
      gameName = null,
      score = null,
      onClick = null
    } = options;

    const button = document.createElement('button');
    button.className = `share-button share-button-${style}`;
    button.innerHTML = `${icon} ${text}`;

    button.style.cssText = `
      padding: 12px 24px;
      background: ${style === 'primary' ? '#3b82f6' : '#10b981'};
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    button.addEventListener('mousedown', () => {
      button.style.transform = 'scale(0.95)';
    });

    button.addEventListener('mouseup', () => {
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('click', () => {
      if (window.Analytics) {
        window.Analytics.trackButtonClick('share', {
          gameName: gameName || 'general',
          score: score
        });
      }

      if (onClick) {
        onClick();
      } else if (gameName && score !== null) {
        this.shareGameScore(gameName, score);
      } else {
        this.shareGeneral();
      }
    });

    return button;
  }

  parseStartParam() {
    if (!window.TelegramAdapter.isReady()) {
      return null;
    }

    const startParam = window.Telegram.WebApp.initDataUnsafe.start_param;
    if (!startParam) {
      return null;
    }

    if (startParam === 'invite') {
      return { type: 'invite' };
    }

    if (startParam.startsWith('challenge_')) {
      const parts = startParam.split('_');
      if (parts.length === 3) {
        return {
          type: 'challenge',
          game: parts[1],
          score: parseInt(parts[2], 10)
        };
      }
    }

    return null;
  }

  handleStartParam() {
    const param = this.parseStartParam();

    if (param) {
      console.log('Start param detected:', param);

      if (param.type === 'challenge') {
        setTimeout(() => {
          this.showChallengeNotification(param);
        }, 1000);
      }
    }
  }

  showChallengeNotification(challenge) {
    const gameNames = {
      tapGame: 'Tap Master',
      reactionGame: 'Reaction Test',
      memoryGame: 'Memory Match',
      bubblePop: 'Bubble Pop'
    };

    const gameName = gameNames[challenge.game] || 'a game';
    const message = `Challenge accepted! Beat a score of ${challenge.score} in ${gameName}!`;

    if (window.TelegramAdapter.isReady()) {
      window.Telegram.WebApp.showAlert(message);
    } else {
      alert(message);
    }
  }
}

window.ShareManager = new ShareManager();

window.addEventListener('DOMContentLoaded', () => {
  window.ShareManager.handleStartParam();
});
