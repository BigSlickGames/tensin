class TelegramAdapter {
  constructor() {
    this.isAvailable = false;
    this.webApp = null;
    this.init();
  }

  init() {
    if (window.Telegram && window.Telegram.WebApp) {
      this.isAvailable = true;
      this.webApp = window.Telegram.WebApp;
      this.webApp.ready();
      this.webApp.expand();

      console.log('Telegram WebApp initialized');
      console.log('User:', this.getUser());
    } else {
      console.log('Running in standard browser mode');
    }
  }

  getUser() {
    if (!this.isAvailable) {
      return {
        id: 0,
        first_name: 'Guest',
        last_name: 'User',
        username: 'guest',
        language_code: 'en',
        is_premium: false
      };
    }

    const user = this.webApp.initDataUnsafe?.user;

    return {
      id: user?.id || 0,
      first_name: user?.first_name || 'User',
      last_name: user?.last_name || '',
      username: user?.username || '',
      language_code: user?.language_code || 'en',
      is_premium: user?.is_premium || false
    };
  }

  expand() {
    if (this.isAvailable) {
      this.webApp.expand();
    }
  }

  haptic(type = 'impact', style = 'medium') {
    if (!this.isAvailable) {
      return;
    }

    try {
      if (type === 'impact') {
        this.webApp.HapticFeedback.impactOccurred(style);
      } else if (type === 'notification') {
        this.webApp.HapticFeedback.notificationOccurred(style);
      } else if (type === 'selection') {
        this.webApp.HapticFeedback.selectionChanged();
      }
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  close() {
    if (this.isAvailable) {
      this.webApp.close();
    }
  }

  showAlert(message) {
    if (this.isAvailable) {
      this.webApp.showAlert(message);
    } else {
      alert(message);
    }
  }

  showConfirm(message, callback) {
    if (this.isAvailable) {
      this.webApp.showConfirm(message, callback);
    } else {
      const result = confirm(message);
      if (callback) callback(result);
    }
  }

  setBackgroundColor(color) {
    if (this.isAvailable) {
      this.webApp.setBackgroundColor(color);
    }
  }

  setHeaderColor(color) {
    if (this.isAvailable) {
      this.webApp.setHeaderColor(color);
    }
  }

  openLink(url, options = {}) {
    if (this.isAvailable) {
      this.webApp.openLink(url, options);
    } else {
      window.open(url, options.try_instant_view ? '_self' : '_blank');
    }
  }

  sendData(data) {
    if (this.isAvailable) {
      this.webApp.sendData(JSON.stringify(data));
    } else {
      console.log('Send data:', data);
    }
  }

  getThemeParams() {
    if (this.isAvailable) {
      return this.webApp.themeParams;
    }

    return {
      bg_color: '#1a1a1a',
      text_color: '#ffffff',
      hint_color: '#aaaaaa',
      link_color: '#3b82f6',
      button_color: '#3b82f6',
      button_text_color: '#ffffff'
    };
  }

  getPlatform() {
    if (this.isAvailable) {
      return this.webApp.platform;
    }
    return 'web';
  }

  getVersion() {
    if (this.isAvailable) {
      return this.webApp.version;
    }
    return '0.0.0';
  }

  isReady() {
    return this.isAvailable;
  }
}

window.TelegramAdapter = new TelegramAdapter();
