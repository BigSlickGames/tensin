(function() {
  let state = {
    allApps: [],
    selectedCategory: 'all',
    searchQuery: ''
  };

  let elements = {};

  function start(container) {
    initializeState();
    render(container);
    attachEventListeners();
    loadData();
  }

  function initializeState() {
    state = {
      allApps: [],
      selectedCategory: 'all',
      searchQuery: ''
    };
    elements = {};
  }

  function render(container) {
    container.innerHTML = `
      <style>
        .app-store-root {
          min-height: 100vh;
          background: #f5f5f7;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        .hero-banner {
          margin: 0 0 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 48px 20px 40px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
          position: relative;
          overflow: hidden;
        }

        .hero-banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .hero-logo {
          font-size: 40px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
          text-shadow: 0 2px 12px rgba(0,0,0,0.15);
        }

        .hero-subtitle {
          font-size: 16px;
          color: rgba(255,255,255,0.9);
          font-weight: 400;
          text-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        .apps-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px 40px;
        }

        .section-title {
          color: #1d1d1f;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .apps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 40px;
        }

        .app-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .app-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          transform: translateY(-2px);
        }

        .app-card:active {
          transform: scale(0.98);
        }

        .app-thumbnail {
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(135deg, #0071e3 0%, #00a4e3 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 60px;
        }

        .app-info {
          padding: 12px;
        }

        .app-name {
          color: #1d1d1f;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
          line-height: 1.3;
        }

        .app-description {
          color: #6e6e73;
          font-size: 12px;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .open-btn {
          width: 100%;
          background: #0071e3;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .open-btn:hover {
          background: #0077ed;
        }

        .open-btn:active {
          transform: scale(0.95);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6e6e73;
        }
      </style>

      <div class="app-store-root" data-element="root">
        <div class="hero-banner">
          <div class="hero-content">
            <div class="hero-logo">TENSINS WORLD OF APPS</div>
            <div class="hero-subtitle">Discover Amazing Apps</div>
          </div>
        </div>

        <div class="apps-section">
          <div class="section-title">Featured Apps</div>
          <div class="apps-grid" data-element="featured-apps">
            <div class="empty-state">Loading apps...</div>
          </div>

          <div class="section-title">All Apps</div>
          <div class="apps-grid" data-element="all-apps">
            <div class="empty-state">Loading apps...</div>
          </div>
        </div>
      </div>
    `;

    cacheElements(container);
  }

  function cacheElements(container) {
    elements.root = container.querySelector('[data-element="root"]');
    elements.featuredApps = container.querySelector('[data-element="featured-apps"]');
    elements.allApps = container.querySelector('[data-element="all-apps"]');
  }

  function attachEventListeners() {
    if (elements.featuredApps) {
      elements.featuredApps.addEventListener('click', handleAppClick);
    }
    if (elements.allApps) {
      elements.allApps.addEventListener('click', handleAppClick);
    }
  }

  function handleAppClick(e) {
    const card = e.target.closest('.app-card');
    if (!card) return;

    const appId = card.dataset.appId;
    launchApp(appId);
  }

  async function loadData() {
    if (!window.AppStoreManager) {
      console.warn('AppStoreManager not available');
      return;
    }

    await window.AppStoreManager.loadMetadata();

    const allEnriched = window.AppStoreManager.getAllEnriched();

    state.allApps = allEnriched.filter(module => {
      return module.metadata?.is_public !== false;
    });

    renderApps();
  }

  function renderApps() {
    const featuredApps = state.allApps.filter(app => app.metadata?.is_featured);
    const allApps = state.allApps;

    if (elements.featuredApps) {
      elements.featuredApps.innerHTML = featuredApps.length > 0
        ? featuredApps.map(app => createAppCard(app)).join('')
        : '<div class="empty-state">No featured apps</div>';
    }

    if (elements.allApps) {
      elements.allApps.innerHTML = allApps.length > 0
        ? allApps.map(app => createAppCard(app)).join('')
        : '<div class="empty-state">No apps available</div>';
    }
  }

  function createAppCard(app) {
    const gradients = [
      'linear-gradient(135deg, #0071e3 0%, #00a4e3 100%)',
      'linear-gradient(135deg, #34c759 0%, #30d158 100%)',
      'linear-gradient(135deg, #ff9500 0%, #ffb340 100%)',
      'linear-gradient(135deg, #ff3b30 0%, #ff6961 100%)',
      'linear-gradient(135deg, #5856d6 0%, #7d7aff 100%)',
      'linear-gradient(135deg, #00c7be 0%, #32d4ce 100%)'
    ];

    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

    return `
      <div class="app-card" data-app-id="${app.id}">
        <div class="app-thumbnail" style="background: ${randomGradient};">
          ${app.icon}
        </div>
        <div class="app-info">
          <div class="app-name">${app.name}</div>
          <div class="app-description">${app.description || ''}</div>
          <button class="open-btn" onclick="event.stopPropagation()">Open</button>
        </div>
      </div>
    `;
  }

  function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  async function launchApp(appId) {
    if (window.AppStoreManager) {
      await window.AppStoreManager.incrementLaunchCount(appId);
    }

    if (window.TelegramAdapter) {
      window.TelegramAdapter.haptic('impact', 'medium');
    }

    const app = state.allApps.find(a => a.id === appId);
    if (app && app.url) {
      window.open(app.url, '_blank');
    } else {
      console.warn(`No URL found for app: ${appId}`);
    }
  }

  function cleanup() {
    state = {
      allApps: [],
      selectedCategory: 'all',
      searchQuery: ''
    };
    elements = {};
  }

  window.ModuleRegistry.register({
    id: 'app-store',
    name: 'App Store',
    icon: '🏪',
    type: 'utility',
    description: 'Browse and discover apps',
    start: start,
    stop: cleanup
  });
})();
