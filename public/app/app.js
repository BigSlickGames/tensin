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

    if (window.SupabaseClient) {
      await window.SupabaseClient.initialize();
    }

    if (window.AuthManager) {
      await window.AuthManager.initialize();
    }

    await this.loadModules();

    if (window.AppStoreManager) {
      await window.AppStoreManager.initialize();
    }

    if (window.DailyChallengeManager) {
      await window.DailyChallengeManager.initialize();
    }

    await window.UIManager.init();

    this.initialized = true;

    console.log('App initialized successfully');

    if (window.AuthManager.isAuthenticated()) {
      const user = window.AuthManager.getCurrentUser();
      console.log(`Welcome back, ${user.username || user.first_name}!`);
    } else {
      console.log('Welcome! Please sign in to continue.');
      window.UIManager.launchModule('auth');
    }
  }

  async loadModules() {
    const moduleScripts = [
      '/modules/auth.js',
      '/modules/reactionGame.js',
      '/modules/memoryGame.js',
      '/modules/leaderboard.js',
      '/modules/supabaseExample.js',
      '/modules/shareTest.js',
      '/modules/analyticsViewer.js',
      '/modules/adminDashboard.js',
      '/modules/moduleGeneratorUI.js',
      '/modules/dailyChallenges.js'
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
    return window.AuthManager.getCurrentUser() || { first_name: 'Guest' };
  }

  showMenu() {
    window.UIManager.showMenu();
  }

  refresh() {
    window.UIManager.refresh();
  }
}

window.App = new App();

document.addEventListener('DOMContentLoaded', async () => {
  await window.App.init();
});
