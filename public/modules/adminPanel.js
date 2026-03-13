(function() {
  let state = {
    allApps: [],
    filter: 'all'
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
      filter: 'all'
    };
    elements = {};
  }

  function render(container) {
    container.innerHTML = `
      <style>
        .admin-panel-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          padding: 24px;
        }

        .admin-header {
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          padding: 32px;
          border-radius: 20px;
          margin-bottom: 32px;
          box-shadow: 0 10px 40px rgba(220, 38, 38, 0.3);
        }

        .admin-title {
          color: white;
          font-size: 36px;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .admin-subtitle {
          color: rgba(255,255,255,0.9);
          font-size: 16px;
        }

        .filter-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .filter-tab {
          padding: 12px 24px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 2px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-tab.active {
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: white;
          border-color: transparent;
        }

        .apps-list {
          display: grid;
          gap: 16px;
        }

        .app-item {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s;
        }

        .app-item:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
        }

        .app-icon-display {
          font-size: 48px;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2));
          border-radius: 16px;
          flex-shrink: 0;
        }

        .app-details {
          flex: 1;
          min-width: 0;
        }

        .app-name-display {
          color: white;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .app-meta {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .meta-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.9);
        }

        .meta-badge.public {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
        }

        .meta-badge.hidden {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }

        .app-url {
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          font-family: monospace;
          word-break: break-all;
        }

        .app-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .action-btn {
          padding: 10px 20px;
          border-radius: 10px;
          border: none;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: white;
        }

        .toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .delete-btn {
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          color: white;
        }

        .delete-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        }

        .empty-state {
          text-align: center;
          padding: 60px 24px;
          color: rgba(255,255,255,0.5);
        }

        @media (max-width: 768px) {
          .app-item {
            flex-direction: column;
            align-items: stretch;
          }

          .app-actions {
            width: 100%;
          }

          .action-btn {
            flex: 1;
          }
        }
      </style>

      <div class="admin-panel-root">
        <div class="admin-header">
          <div class="admin-title">Admin Panel</div>
          <div class="admin-subtitle">Manage app visibility and settings</div>
        </div>

        <div class="filter-tabs">
          <div class="filter-tab active" data-filter="all">All Apps</div>
          <div class="filter-tab" data-filter="public">Public</div>
          <div class="filter-tab" data-filter="hidden">Hidden</div>
        </div>

        <div class="apps-list" data-element="apps-list">
          <div class="empty-state">Loading apps...</div>
        </div>
      </div>
    `;

    cacheElements(container);
  }

  function cacheElements(container) {
    elements.appsList = container.querySelector('[data-element="apps-list"]');
    elements.filterTabs = container.querySelectorAll('.filter-tab');
  }

  function attachEventListeners() {
    elements.filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.filter = tab.dataset.filter;
        renderApps();
      });
    });

    elements.appsList.addEventListener('click', async (e) => {
      if (e.target.classList.contains('toggle-btn')) {
        const appId = e.target.dataset.appId;
        const isPublic = e.target.dataset.isPublic === 'true';
        await toggleVisibility(appId, !isPublic);
      }

      if (e.target.classList.contains('delete-btn')) {
        const appId = e.target.dataset.appId;
        if (confirm('Are you sure you want to delete this app?')) {
          await deleteApp(appId);
        }
      }
    });
  }

  async function loadData() {
    if (!window.AppStoreManager) {
      console.warn('AppStoreManager not available');
      return;
    }

    await window.AppStoreManager.loadMetadata();

    const allEnriched = window.AppStoreManager.getAllEnriched();

    state.allApps = allEnriched.filter(module => {
      return module.id !== 'app-store' && module.id !== 'admin-panel';
    });

    renderApps();
  }

  function renderApps() {
    let filteredApps = state.allApps;

    if (state.filter === 'public') {
      filteredApps = state.allApps.filter(app => app.metadata?.is_public !== false);
    } else if (state.filter === 'hidden') {
      filteredApps = state.allApps.filter(app => app.metadata?.is_public === false);
    }

    if (filteredApps.length === 0) {
      elements.appsList.innerHTML = '<div class="empty-state">No apps found</div>';
      return;
    }

    elements.appsList.innerHTML = filteredApps
      .map(app => createAppItem(app))
      .join('');
  }

  function createAppItem(app) {
    const isPublic = app.metadata?.is_public !== false;
    const launchCount = app.metadata?.launch_count || 0;
    const url = app.url || app.metadata?.url || 'Not set';

    return `
      <div class="app-item">
        <div class="app-icon-display">${app.icon}</div>
        <div class="app-details">
          <div class="app-name-display">${app.name}</div>
          <div class="app-meta">
            <span class="meta-badge ${isPublic ? 'public' : 'hidden'}">
              ${isPublic ? '✓ Public' : '✕ Hidden'}
            </span>
            <span class="meta-badge">${app.type || 'App'}</span>
            <span class="meta-badge">🚀 ${launchCount} launches</span>
          </div>
          <div class="app-url">${url}</div>
        </div>
        <div class="app-actions">
          <button class="action-btn toggle-btn" data-app-id="${app.id}" data-is-public="${isPublic}">
            ${isPublic ? 'Hide' : 'Show'}
          </button>
          <button class="action-btn delete-btn" data-app-id="${app.id}">
            Delete
          </button>
        </div>
      </div>
    `;
  }

  async function toggleVisibility(appId, isPublic) {
    if (!window.SupabaseClient?.client) return;

    try {
      const { error } = await window.SupabaseClient.client
        .from('module_metadata')
        .update({
          is_public: isPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', appId);

      if (error) {
        console.error('Failed to update visibility:', error);
        alert('Failed to update visibility');
      } else {
        await loadData();
      }
    } catch (error) {
      console.error('Error updating visibility:', error);
      alert('Error updating visibility');
    }
  }

  async function deleteApp(appId) {
    if (!window.SupabaseClient?.client) return;

    try {
      const { error } = await window.SupabaseClient.client
        .from('module_metadata')
        .delete()
        .eq('id', appId);

      if (error) {
        console.error('Failed to delete app:', error);
        alert('Failed to delete app');
      } else {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting app:', error);
      alert('Error deleting app');
    }
  }

  function cleanup() {
    state = {
      allApps: [],
      filter: 'all'
    };
    elements = {};
  }

  window.ModuleRegistry.register({
    id: 'admin-panel',
    name: 'Admin Panel',
    icon: '⚙️',
    type: 'utility',
    description: 'Manage apps and settings',
    start: start,
    stop: cleanup
  });
})();
