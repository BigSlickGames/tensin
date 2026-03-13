class App {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) {
      console.warn('App already initialized');
      return;
    }

    console.log('Initializing Mini App Hub...');

    await this.loadModules();

    if (window.AppStoreManager) {
      await window.AppStoreManager.initialize();
    }

    if (window.DailyChallengeManager) {
      await window.DailyChallengeManager.initialize();
    }

    window.UIManager.init();

    this.initialized = true;

    console.log('App initialized successfully');

    const user = window.TelegramAdapter.getUser();
    console.log(`Welcome, ${user.first_name}!`);

    if (window.TelegramAdapter.isReady()) {
      window.TelegramAdapter.setBackgroundColor('#1a1a1a');
    }
  }

  async loadModules() {
    const moduleScripts = [
      '/modules/appStore.js',
      '/modules/reactionGame.js',
      '/modules/memoryGame.js',
      '/modules/supabaseExample.js',
      '/modules/shareTest.js',
      '/modules/analyticsViewer.js',
      '/modules/adminDashboard.js',
      '/modules/moduleGeneratorUI.js'
    ];

    const loadPromises = moduleScripts.map(src => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => {
          console.error(`Failed to load module: ${src}`);
          resolve();
        };
        document.head.appendChild(script);
      });
    });

    await Promise.all(loadPromises);

    console.log(`${window.ModuleRegistry.getAll().length} modules loaded`);
  }

  loadModule(id) {
    if (!this.initialized) {
      console.error('App not initialized');
      return;
    }

    window.UIManager.launchModule(id);
  }

  getUser() {
    return window.TelegramAdapter.getUser();
  }

  showMenu() {
    window.UIManager.showMenu();
  }

  refresh() {
    window.UIManager.refresh();
  }
}

window.App = new App();

document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
