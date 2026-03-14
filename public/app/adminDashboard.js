const adminDashboard = {
  currentSection: 'overview',
  currentUser: null,
  stats: {},

  async start(container) {
    const { data: { user } } = await window.supabaseClientClient.auth.getUser();
    this.currentUser = user;

    await this.loadStats();
    this.render(container);
    this.attachEventListeners();
  },

  async loadStats() {
    const { count: totalUsers } = await window.supabaseClientClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    const { count: activeToday } = await window.supabaseClientClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const { data: revenueData } = await window.supabaseClientClient
      .from('revenue_tracking')
      .select('amount');

    const totalRevenue = revenueData?.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0) || 0;

    const { data: challengeData } = await window.supabaseClientClient
      .from('user_challenge_progress')
      .select('completed')
      .eq('completed', true);

    this.stats = {
      totalUsers: totalUsers || 0,
      activeToday: activeToday || 0,
      totalRevenue: totalRevenue.toFixed(2),
      challengesCompleted: challengeData?.length || 0,
    };
  },

  render(container) {
    container.innerHTML = `
      <div style="min-height: 100vh; background: var(--bg-primary);">
        ${this.renderHeader()}
        <div style="display: flex; max-width: 1400px; margin: 0 auto;">
          ${this.renderSidebar()}
          ${this.renderMainContent()}
        </div>
      </div>
    `;
  },

  renderHeader() {
    return `
      <div style="
        background: var(--bg-secondary);
        border-bottom: 2px solid var(--border-glow);
        padding: 20px 24px;
      ">
        <div style="max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 24px; font-weight: 900; color: var(--text-primary); margin-bottom: 4px;">
              Admin Dashboard
            </h1>
            <p style="color: var(--text-secondary); font-size: 14px;">
              Tensins World Management Portal
            </p>
          </div>
          <button
            id="admin-logout-btn"
            style="
              padding: 10px 20px;
              background: var(--bg-tertiary);
              border: 2px solid var(--border-subtle);
              border-radius: var(--radius-md);
              color: var(--text-primary);
              font-size: 14px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.2s;
            "
            onmouseover="this.style.borderColor='var(--border-glow)'"
            onmouseout="this.style.borderColor='var(--border-subtle)'"
          >
            Sign Out
          </button>
        </div>
      </div>
    `;
  },

  renderSidebar() {
    const sections = [
      { id: 'overview', name: 'Overview', icon: '📊' },
      { id: 'users', name: 'User Management', icon: '👥' },
      { id: 'analytics', name: 'Analytics', icon: '📈' },
      { id: 'revenue', name: 'Revenue', icon: '💰' },
      { id: 'marketing', name: 'Marketing', icon: '📢' },
      { id: 'challenges', name: 'Challenges', icon: '🎯' },
      { id: 'apps', name: 'App Store', icon: '🏪' },
      { id: 'logs', name: 'Activity Logs', icon: '📝' },
    ];

    return `
      <div style="
        width: 250px;
        background: var(--bg-secondary);
        border-right: 2px solid var(--border-subtle);
        min-height: calc(100vh - 88px);
        padding: 24px 0;
      ">
        ${sections.map(section => `
          <button
            class="admin-nav-btn"
            data-section="${section.id}"
            style="
              width: 100%;
              padding: 14px 24px;
              background: ${this.currentSection === section.id ? 'var(--bg-tertiary)' : 'transparent'};
              border: none;
              border-left: 3px solid ${this.currentSection === section.id ? 'var(--border-glow)' : 'transparent'};
              color: var(--text-primary);
              font-size: 15px;
              font-weight: ${this.currentSection === section.id ? '800' : '600'};
              cursor: pointer;
              text-align: left;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              gap: 12px;
            "
            onmouseover="if('${section.id}' !== '${this.currentSection}') { this.style.background='var(--bg-tertiary)'; }"
            onmouseout="if('${section.id}' !== '${this.currentSection}') { this.style.background='transparent'; }"
          >
            <span style="font-size: 20px;">${section.icon}</span>
            ${section.name}
          </button>
        `).join('')}
      </div>
    `;
  },

  renderMainContent() {
    const sections = {
      overview: this.renderOverview(),
      users: this.renderUserManagement(),
      analytics: this.renderAnalytics(),
      revenue: this.renderRevenue(),
      marketing: this.renderMarketing(),
      challenges: this.renderChallenges(),
      apps: this.renderAppStore(),
      logs: this.renderActivityLogs(),
    };

    return `
      <div style="flex: 1; padding: 32px; overflow-y: auto; max-height: calc(100vh - 88px);">
        ${sections[this.currentSection] || sections.overview}
      </div>
    `;
  },

  renderOverview() {
    return `
      <div>
        <h2 style="font-size: 28px; font-weight: 900; color: var(--text-primary); margin-bottom: 24px;">
          Overview
        </h2>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px;">
          ${this.renderStatCard('Total Users', this.stats.totalUsers, '👥', '#3b82f6')}
          ${this.renderStatCard('Active Today', this.stats.activeToday, '🔥', '#10b981')}
          ${this.renderStatCard('Total Revenue', '$' + this.stats.totalRevenue, '💰', '#f59e0b')}
          ${this.renderStatCard('Challenges Done', this.stats.challengesCompleted, '🎯', '#8b5cf6')}
        </div>

        <div style="background: var(--bg-secondary); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
            Quick Actions
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
            ${this.renderQuickAction('View All Users', 'users', '#3b82f6')}
            ${this.renderQuickAction('Analytics Report', 'analytics', '#10b981')}
            ${this.renderQuickAction('Revenue Tracking', 'revenue', '#f59e0b')}
            ${this.renderQuickAction('Marketing Tools', 'marketing', '#ec4899')}
          </div>
        </div>

        <div style="background: var(--bg-secondary); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px;">
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
            Recent Activity
          </h3>
          <div id="recent-activity-container" style="color: var(--text-secondary);">
            Loading recent activity...
          </div>
        </div>
      </div>
    `;
  },

  renderStatCard(label, value, icon, color) {
    return `
      <div style="
        background: var(--bg-secondary);
        border: 2px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: 24px;
        transition: all 0.2s;
      "
      onmouseover="this.style.borderColor='var(--border-glow)'; this.style.transform='translateY(-2px)'"
      onmouseout="this.style.borderColor='var(--border-subtle)'; this.style.transform='translateY(0)'"
      >
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
          <div style="
            width: 48px;
            height: 48px;
            background: ${color}22;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
          ">
            ${icon}
          </div>
          <div>
            <div style="color: var(--text-secondary); font-size: 13px; font-weight: 600; margin-bottom: 4px;">
              ${label}
            </div>
            <div style="color: var(--text-primary); font-size: 28px; font-weight: 900;">
              ${value}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderQuickAction(label, section, color) {
    return `
      <button
        class="admin-nav-btn"
        data-section="${section}"
        style="
          padding: 14px 18px;
          background: ${color}22;
          border: 2px solid ${color}44;
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        "
        onmouseover="this.style.borderColor='${color}'; this.style.transform='scale(1.02)'"
        onmouseout="this.style.borderColor='${color}44'; this.style.transform='scale(1)'"
      >
        ${label}
      </button>
    `;
  },

  renderUserManagement() {
    return `
      <div>
        <h2 style="font-size: 28px; font-weight: 900; color: var(--text-primary); margin-bottom: 24px;">
          User Management
        </h2>

        <div style="background: var(--bg-secondary); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
          <div style="display: flex; gap: 12px; margin-bottom: 20px;">
            <input
              type="text"
              id="user-search"
              placeholder="Search users by email or username..."
              style="
                flex: 1;
                padding: 12px;
                background: var(--bg-tertiary);
                border: 2px solid var(--border-subtle);
                border-radius: var(--radius-md);
                color: var(--text-primary);
                font-size: 14px;
              "
            />
            <button
              id="search-users-btn"
              style="
                padding: 12px 24px;
                background: var(--border-glow);
                border: none;
                border-radius: var(--radius-md);
                color: var(--text-primary);
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
              "
            >
              Search
            </button>
          </div>

          <div id="users-list-container" style="min-height: 400px;">
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
              Loading users...
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderAnalytics() {
    return `
      <div>
        <h2 style="font-size: 28px; font-weight: 900; color: var(--text-primary); margin-bottom: 24px;">
          Analytics & Reporting
        </h2>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 24px;">
          <div style="background: var(--bg-secondary); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px;">
            <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
              User Growth
            </h3>
            <div id="user-growth-chart" style="color: var(--text-secondary);">
              Chart data loading...
            </div>
          </div>

          <div style="background: var(--bg-secondary); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px;">
            <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
              Engagement Metrics
            </h3>
            <div id="engagement-metrics" style="color: var(--text-secondary);">
              Loading metrics...
            </div>
          </div>

          <div style="background: var(--bg-secondary); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px;">
            <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
              Popular Games
            </h3>
            <div id="popular-games" style="color: var(--text-secondary);">
              Loading game data...
            </div>
          </div>
        </div>

        <div style="background: var(--bg-secondary); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px;">
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
            Export Reports
          </h3>
          <div style="display: flex; gap: 12px;">
            <button style="
              padding: 12px 24px;
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              border: none;
              border-radius: var(--radius-md);
              color: white;
              font-weight: 700;
              cursor: pointer;
            ">
              Export User Report
            </button>
            <button style="
              padding: 12px 24px;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              border: none;
              border-radius: var(--radius-md);
              color: white;
              font-weight: 700;
              cursor: pointer;
            ">
              Export Revenue Report
            </button>
            <button style="
              padding: 12px 24px;
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              border: none;
              border-radius: var(--radius-md);
              color: white;
              font-weight: 700;
              cursor: pointer;
            ">
              Export Analytics Report
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderRevenue() {
    return `
      <div>
        <h2 style="font-size: 28px; font-weight: 900; color: var(--text-primary); margin-bottom: 24px;">
          Revenue Tracking
        </h2>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
          ${this.renderStatCard('Total Revenue', '$' + this.stats.totalRevenue, '💰', '#10b981')}
          ${this.renderStatCard('This Month', '$0.00', '📅', '#3b82f6')}
          ${this.renderStatCard('This Week', '$0.00', '📊', '#8b5cf6')}
          ${this.renderStatCard('Today', '$0.00', '🔥', '#f59e0b')}
        </div>

        <div style="background: var(--bg-secondary); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
            Add Transaction
          </h3>
          <div style="display: grid; gap: 16px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <input
                type="text"
                id="transaction-type"
                placeholder="Transaction Type"
                style="
                  padding: 12px;
                  background: var(--bg-tertiary);
                  border: 2px solid var(--border-subtle);
                  border-radius: var(--radius-md);
                  color: var(--text-primary);
                  font-size: 14px;
                "
              />
              <input
                type="number"
                id="transaction-amount"
                placeholder="Amount"
                step="0.01"
                style="
                  padding: 12px;
                  background: var(--bg-tertiary);
                  border: 2px solid var(--border-subtle);
                  border-radius: var(--radius-md);
                  color: var(--text-primary);
                  font-size: 14px;
                "
              />
            </div>
            <textarea
              id="transaction-description"
              placeholder="Description"
              rows="3"
              style="
                padding: 12px;
                background: var(--bg-tertiary);
                border: 2px solid var(--border-subtle);
                border-radius: var(--radius-md);
                color: var(--text-primary);
                font-size: 14px;
                resize: vertical;
              "
            ></textarea>
            <button
              id="add-transaction-btn"
              style="
                padding: 12px 24px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border: none;
                border-radius: var(--radius-md);
                color: white;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
              "
            >
              Add Transaction
            </button>
          </div>
        </div>

        <div style="background: var(--bg-secondary); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px;">
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
            Recent Transactions
          </h3>
          <div id="transactions-list" style="color: var(--text-secondary);">
            Loading transactions...
          </div>
        </div>
      </div>
    `;
  },

  renderMarketing() {
    return `
      <div>
        <h2 style="font-size: 28px; font-weight: 900; color: var(--text-primary); margin-bottom: 24px;">
          Marketing Campaigns
        </h2>

        <div style="margin-bottom: 24px;">
          <button
            id="create-campaign-btn"
            style="
              padding: 12px 24px;
              background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
              border: none;
              border-radius: var(--radius-md);
              color: white;
              font-size: 14px;
              font-weight: 700;
              cursor: pointer;
            "
          >
            Create New Campaign
          </button>
        </div>

        <div style="display: grid; gap: 20px;">
          <div style="background: var(--bg-secondary); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px;">
            <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
              Active Campaigns
            </h3>
            <div id="active-campaigns" style="color: var(--text-secondary);">
              No active campaigns
            </div>
          </div>

          <div style="background: var(--bg-secondary); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px;">
            <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
              Campaign Performance
            </h3>
            <div id="campaign-performance" style="color: var(--text-secondary);">
              Loading performance data...
            </div>
          </div>

          <div style="background: var(--bg-secondary); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px;">
            <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
              Marketing Tools
            </h3>
            <div style="display: grid; gap: 12px;">
              <button style="
                padding: 12px 18px;
                background: var(--bg-tertiary);
                border: 2px solid var(--border-subtle);
                border-radius: var(--radius-md);
                color: var(--text-primary);
                font-weight: 700;
                text-align: left;
                cursor: pointer;
              ">
                Email Blast
              </button>
              <button style="
                padding: 12px 18px;
                background: var(--bg-tertiary);
                border: 2px solid var(--border-subtle);
                border-radius: var(--radius-md);
                color: var(--text-primary);
                font-weight: 700;
                text-align: left;
                cursor: pointer;
              ">
                Push Notifications
              </button>
              <button style="
                padding: 12px 18px;
                background: var(--bg-tertiary);
                border: 2px solid var(--border-subtle);
                border-radius: var(--radius-md);
                color: var(--text-primary);
                font-weight: 700;
                text-align: left;
                cursor: pointer;
              ">
                Social Media Posts
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderChallenges() {
    return `
      <div>
        <h2 style="font-size: 28px; font-weight: 900; color: var(--text-primary); margin-bottom: 24px;">
          Challenge Management
        </h2>

        <div style="background: var(--bg-secondary); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
            Challenge Statistics
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
            ${this.renderStatCard('Completed', this.stats.challengesCompleted, '✅', '#10b981')}
            ${this.renderStatCard('Active Users', this.stats.activeToday, '🔥', '#f59e0b')}
          </div>
        </div>

        <div style="background: var(--bg-secondary); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px;">
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
            Challenge Settings
          </h3>
          <div style="color: var(--text-secondary);">
            Challenge management tools coming soon...
          </div>
        </div>
      </div>
    `;
  },

  renderAppStore() {
    return `
      <div>
        <h2 style="font-size: 28px; font-weight: 900; color: var(--text-primary); margin-bottom: 24px;">
          App Store Management
        </h2>

        <div style="background: var(--bg-secondary); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
            Manage Apps
          </h3>
          <div id="apps-list" style="color: var(--text-secondary);">
            Loading apps...
          </div>
        </div>

        <div style="background: var(--bg-secondary); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px;">
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
            App Visibility Controls
          </h3>
          <div style="color: var(--text-secondary);">
            Toggle app visibility and featured status...
          </div>
        </div>
      </div>
    `;
  },

  renderActivityLogs() {
    return `
      <div>
        <h2 style="font-size: 28px; font-weight: 900; color: var(--text-primary); margin-bottom: 24px;">
          Activity Logs
        </h2>

        <div style="background: var(--bg-secondary); border: 2px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px;">
          <div style="display: flex; gap: 12px; margin-bottom: 20px;">
            <select
              id="log-filter"
              style="
                padding: 12px;
                background: var(--bg-tertiary);
                border: 2px solid var(--border-subtle);
                border-radius: var(--radius-md);
                color: var(--text-primary);
                font-size: 14px;
              "
            >
              <option value="all">All Actions</option>
              <option value="user_update">User Updates</option>
              <option value="user_ban">User Bans</option>
              <option value="revenue">Revenue Changes</option>
              <option value="campaign">Campaign Actions</option>
            </select>
            <button
              id="refresh-logs-btn"
              style="
                padding: 12px 24px;
                background: var(--border-glow);
                border: none;
                border-radius: var(--radius-md);
                color: var(--text-primary);
                font-weight: 700;
                cursor: pointer;
              "
            >
              Refresh
            </button>
          </div>

          <div id="activity-logs-list" style="min-height: 400px; color: var(--text-secondary);">
            Loading activity logs...
          </div>
        </div>
      </div>
    `;
  },

  attachEventListeners() {
    const navButtons = document.querySelectorAll('.admin-nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const section = e.currentTarget.dataset.section;
        this.currentSection = section;
        const container = document.getElementById('admin-container');
        this.render(container);
        this.attachEventListeners();
        this.loadSectionData();
      });
    });

    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await window.supabaseClient.auth.signOut();
        window.location.reload();
      });
    }

    this.loadSectionData();
  },

  async loadSectionData() {
    switch (this.currentSection) {
      case 'users':
        await this.loadUsers();
        break;
      case 'revenue':
        await this.loadTransactions();
        break;
      case 'logs':
        await this.loadActivityLogs();
        break;
      case 'overview':
        await this.loadRecentActivity();
        break;
    }
  },

  async loadUsers() {
    const container = document.getElementById('users-list-container');
    if (!container) return;

    const { data: users, error } = await window.supabaseClient
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !users) {
      container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Error loading users</div>';
      return;
    }

    if (users.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No users found</div>';
      return;
    }

    container.innerHTML = `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-subtle);">
              <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-size: 12px; font-weight: 700; text-transform: uppercase;">User</th>
              <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-size: 12px; font-weight: 700; text-transform: uppercase;">XP</th>
              <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-size: 12px; font-weight: 700; text-transform: uppercase;">Bankroll</th>
              <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-size: 12px; font-weight: 700; text-transform: uppercase;">Admin</th>
              <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-size: 12px; font-weight: 700; text-transform: uppercase;">Joined</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(user => `
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 12px; color: var(--text-primary); font-weight: 600;">${user.username || user.email || 'Anonymous'}</td>
                <td style="padding: 12px; color: var(--text-primary);">${user.experience || 0}</td>
                <td style="padding: 12px; color: var(--text-primary);">${user.bankroll || 0}</td>
                <td style="padding: 12px;">
                  <span style="
                    padding: 4px 8px;
                    background: ${user.is_admin ? '#10b98122' : '#6b728022'};
                    border: 1px solid ${user.is_admin ? '#10b98144' : '#6b728044'};
                    border-radius: 4px;
                    color: ${user.is_admin ? '#10b981' : '#6b7280'};
                    font-size: 12px;
                    font-weight: 700;
                  ">
                    ${user.is_admin ? 'Yes' : 'No'}
                  </span>
                </td>
                <td style="padding: 12px; color: var(--text-secondary); font-size: 14px;">
                  ${new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  async loadTransactions() {
    const container = document.getElementById('transactions-list');
    if (!container) return;

    const { data: transactions, error } = await window.supabaseClient
      .from('revenue_tracking')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !transactions || transactions.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No transactions yet</div>';
      return;
    }

    container.innerHTML = transactions.map(tx => `
      <div style="
        padding: 16px;
        background: var(--bg-tertiary);
        border-radius: var(--radius-md);
        margin-bottom: 12px;
      ">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <div style="font-weight: 700; color: var(--text-primary);">${tx.transaction_type}</div>
          <div style="font-weight: 800; color: #10b981; font-size: 16px;">$${parseFloat(tx.amount).toFixed(2)}</div>
        </div>
        <div style="color: var(--text-secondary); font-size: 13px;">${tx.description || 'No description'}</div>
        <div style="color: var(--text-tertiary); font-size: 12px; margin-top: 8px;">
          ${new Date(tx.created_at).toLocaleString()}
        </div>
      </div>
    `).join('');

    const addBtn = document.getElementById('add-transaction-btn');
    if (addBtn) {
      addBtn.addEventListener('click', async () => {
        const type = document.getElementById('transaction-type').value;
        const amount = document.getElementById('transaction-amount').value;
        const description = document.getElementById('transaction-description').value;

        if (!type || !amount) {
          alert('Please fill in all required fields');
          return;
        }

        const { error } = await window.supabaseClient
          .from('revenue_tracking')
          .insert({
            transaction_type: type,
            amount: parseFloat(amount),
            description: description,
          });

        if (!error) {
          document.getElementById('transaction-type').value = '';
          document.getElementById('transaction-amount').value = '';
          document.getElementById('transaction-description').value = '';
          await this.loadTransactions();
          await this.loadStats();
          const container = document.getElementById('admin-container');
          this.render(container);
          this.attachEventListeners();
        }
      });
    }
  },

  async loadActivityLogs() {
    const container = document.getElementById('activity-logs-list');
    if (!container) return;

    const { data: logs, error } = await window.supabaseClient
      .from('admin_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !logs || logs.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No activity logs yet</div>';
      return;
    }

    container.innerHTML = logs.map(log => `
      <div style="
        padding: 16px;
        background: var(--bg-tertiary);
        border-radius: var(--radius-md);
        margin-bottom: 12px;
      ">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <div style="font-weight: 700; color: var(--text-primary);">${log.action_type}</div>
          <div style="color: var(--text-tertiary); font-size: 12px;">
            ${new Date(log.created_at).toLocaleString()}
          </div>
        </div>
        <div style="color: var(--text-secondary); font-size: 13px;">
          ${JSON.stringify(log.action_details)}
        </div>
      </div>
    `).join('');
  },

  async loadRecentActivity() {
    const container = document.getElementById('recent-activity-container');
    if (!container) return;

    const { data: logs } = await window.supabaseClient
      .from('admin_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!logs || logs.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 20px;">No recent activity</div>';
      return;
    }

    container.innerHTML = logs.map(log => `
      <div style="padding: 12px 0; border-bottom: 1px solid var(--border-subtle);">
        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${log.action_type}</div>
        <div style="font-size: 12px; color: var(--text-tertiary);">${new Date(log.created_at).toLocaleString()}</div>
      </div>
    `).join('');
  },
};

export default adminDashboard;
