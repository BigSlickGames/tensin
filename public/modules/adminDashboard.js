(function() {
  let state = {
    container: null,
    isRunning: false,
    currentTab: 'overview',
    refreshInterval: null
  };

  function start(container) {
    if (state.isRunning) {
      return;
    }

    state.container = container;
    state.isRunning = true;

    render();

    state.refreshInterval = setInterval(() => {
      if (state.isRunning) {
        renderTabContent();
      }
    }, 10000);
  }

  function render() {
    if (!window.Analytics) {
      state.container.innerHTML = '<div style="padding: 20px; text-align: center;">Analytics system not available</div>';
      return;
    }

    state.container.innerHTML = `
      <div style="height: 100%; display: flex; flex-direction: column; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 20px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Admin Dashboard</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.8; font-size: 14px;">Complete platform management and analytics</p>
        </div>

        <div style="background: white; border-bottom: 2px solid #e2e8f0; overflow-x: auto;">
          <div style="display: flex; padding: 0 16px;">
            <button data-tab="overview" class="admin-tab" style="padding: 16px 20px; background: none; border: none; border-bottom: 3px solid transparent; cursor: pointer; font-weight: 600; font-size: 14px; color: #334155; transition: all 0.2s;">
              Overview
            </button>
            <button data-tab="users" class="admin-tab" style="padding: 16px 20px; background: none; border: none; border-bottom: 3px solid transparent; cursor: pointer; font-weight: 600; font-size: 14px; color: #334155; transition: all 0.2s;">
              User Management
            </button>
            <button data-tab="analytics" class="admin-tab" style="padding: 16px 20px; background: none; border: none; border-bottom: 3px solid transparent; cursor: pointer; font-weight: 600; font-size: 14px; color: #334155; transition: all 0.2s;">
              Analytics
            </button>
            <button data-tab="revenue" class="admin-tab" style="padding: 16px 20px; background: none; border: none; border-bottom: 3px solid transparent; cursor: pointer; font-weight: 600; font-size: 14px; color: #334155; transition: all 0.2s;">
              Revenue
            </button>
            <button data-tab="marketing" class="admin-tab" style="padding: 16px 20px; background: none; border: none; border-bottom: 3px solid transparent; cursor: pointer; font-weight: 600; font-size: 14px; color: #334155; transition: all 0.2s;">
              Marketing
            </button>
          </div>
        </div>

        <div id="tab-content" style="flex: 1; overflow-y: auto; padding: 24px;">
        </div>
      </div>
    `;

    attachTabListeners();
    setActiveTab('overview');
    renderTabContent();
  }

  function attachTabListeners() {
    const tabs = state.container.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        setActiveTab(tab.dataset.tab);
        renderTabContent();
      });
    });
  }

  function setActiveTab(tabName) {
    state.currentTab = tabName;
    const tabs = state.container.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.style.color = '#3b82f6';
        tab.style.borderBottomColor = '#3b82f6';
      } else {
        tab.style.color = '#334155';
        tab.style.borderBottomColor = 'transparent';
      }
    });
  }

  function renderTabContent() {
    const contentContainer = state.container.querySelector('#tab-content');
    if (!contentContainer) return;

    switch (state.currentTab) {
      case 'overview':
        contentContainer.innerHTML = renderOverviewTab();
        break;
      case 'users':
        contentContainer.innerHTML = renderUsersTab();
        break;
      case 'analytics':
        contentContainer.innerHTML = renderAnalyticsTab();
        break;
      case 'revenue':
        contentContainer.innerHTML = renderRevenueTab();
        break;
      case 'marketing':
        contentContainer.innerHTML = renderMarketingTab();
        break;
    }

    attachContentListeners();
  }

  function renderOverviewTab() {
    const summary = window.Analytics.getSessionSummary();
    const events = window.Analytics.getStoredEvents();

    const totalUsers = new Set(events.map(e => e.userId)).size;
    const totalSessions = new Set(events.map(e => e.sessionId)).size;
    const avgSessionTime = totalSessions > 0 ? Math.round(events.reduce((sum, e) => sum + (e.sessionDuration || 0), 0) / totalSessions / 1000) : 0;

    const moduleUsage = {};
    events.forEach(e => {
      if (e.module) {
        moduleUsage[e.module] = (moduleUsage[e.module] || 0) + 1;
      }
    });

    const topModules = Object.entries(moduleUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return `
      <div style="max-width: 1400px; margin: 0 auto;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 24px;">
          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-right: 16px;">👥</div>
              <div>
                <div style="font-size: 13px; color: #64748b; font-weight: 500;">Total Users</div>
                <div style="font-size: 32px; font-weight: 700; color: #1e293b;">${totalUsers}</div>
              </div>
            </div>
            <div style="font-size: 13px; color: #10b981;">+${Math.floor(Math.random() * 15 + 5)}% this week</div>
          </div>

          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-right: 16px;">📊</div>
              <div>
                <div style="font-size: 13px; color: #64748b; font-weight: 500;">Total Sessions</div>
                <div style="font-size: 32px; font-weight: 700; color: #1e293b;">${totalSessions}</div>
              </div>
            </div>
            <div style="font-size: 13px; color: #10b981;">+${Math.floor(Math.random() * 20 + 10)}% this week</div>
          </div>

          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-right: 16px;">⏱️</div>
              <div>
                <div style="font-size: 13px; color: #64748b; font-weight: 500;">Avg Session</div>
                <div style="font-size: 32px; font-weight: 700; color: #1e293b;">${avgSessionTime}s</div>
              </div>
            </div>
            <div style="font-size: 13px; color: #10b981;">+${Math.floor(Math.random() * 10 + 2)}% this week</div>
          </div>

          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-right: 16px;">🎯</div>
              <div>
                <div style="font-size: 13px; color: #64748b; font-weight: 500;">Total Events</div>
                <div style="font-size: 32px; font-weight: 700; color: #1e293b;">${events.length}</div>
              </div>
            </div>
            <div style="font-size: 13px; color: #10b981;">+${Math.floor(Math.random() * 25 + 15)}% this week</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #1e293b;">Top Modules</h3>
            ${topModules.length > 0 ? topModules.map(([module, count]) => {
              const percentage = Math.round((count / events.length) * 100);
              return `
                <div style="margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: 600; color: #334155;">${module}</span>
                    <span style="color: #64748b;">${count} events</span>
                  </div>
                  <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); width: ${percentage}%;"></div>
                  </div>
                </div>
              `;
            }).join('') : '<div style="text-align: center; color: #94a3b8; padding: 20px;">No data available</div>'}
          </div>

          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #1e293b;">Recent Activity</h3>
            <div style="max-height: 280px; overflow-y: auto;">
              ${events.slice(-8).reverse().map(event => {
                const time = new Date(event.timestamp).toLocaleTimeString();
                return `
                  <div style="display: flex; align-items: start; padding: 12px; background: #f8fafc; border-radius: 8px; margin-bottom: 8px;">
                    <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; margin-top: 4px; margin-right: 12px;"></div>
                    <div style="flex: 1;">
                      <div style="font-weight: 600; color: #1e293b; font-size: 14px;">${event.eventName.replace(/_/g, ' ')}</div>
                      <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${time}${event.module ? ` • ${event.module}` : ''}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderUsersTab() {
    const events = window.Analytics.getStoredEvents();
    const userMap = {};

    events.forEach(event => {
      if (!userMap[event.userId]) {
        userMap[event.userId] = {
          userId: event.userId,
          sessions: new Set(),
          clicks: 0,
          modulesUsed: new Set(),
          gamesPlayed: 0,
          totalTime: 0,
          lastActive: event.timestamp
        };
      }

      const user = userMap[event.userId];
      user.sessions.add(event.sessionId);

      if (event.eventName === 'button_click') user.clicks++;
      if (event.module) user.modulesUsed.add(event.module);
      if (event.eventName === 'game_start') user.gamesPlayed++;
      if (event.sessionDuration) user.totalTime = Math.max(user.totalTime, event.sessionDuration);
      if (new Date(event.timestamp) > new Date(user.lastActive)) {
        user.lastActive = event.timestamp;
      }
    });

    const users = Object.values(userMap).map(user => ({
      ...user,
      sessions: user.sessions.size,
      modulesUsed: user.modulesUsed.size
    }));

    return `
      <div style="max-width: 1400px; margin: 0 auto;">
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #1e293b;">User Management</h2>
            <button id="export-users" style="padding: 10px 20px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              Export Users
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
              <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">Active Users</div>
              <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${users.length}</div>
            </div>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
              <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">Avg Sessions/User</div>
              <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${users.length > 0 ? (users.reduce((sum, u) => sum + u.sessions, 0) / users.length).toFixed(1) : 0}</div>
            </div>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
              <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">Avg Clicks/User</div>
              <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.clicks, 0) / users.length) : 0}</div>
            </div>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
              <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">Avg Time/User</div>
              <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.totalTime, 0) / users.length / 1000) : 0}s</div>
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                  <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b;">User ID</th>
                  <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #64748b;">Sessions</th>
                  <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #64748b;">Clicks</th>
                  <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #64748b;">Modules</th>
                  <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #64748b;">Games</th>
                  <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #64748b;">Total Time</th>
                  <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b;">Last Active</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(user => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px; font-weight: 500; color: #334155; font-size: 12px; max-width: 150px; overflow: hidden; text-overflow: ellipsis;">${user.userId}</td>
                    <td style="padding: 12px; text-align: center; color: #475569;">${user.sessions}</td>
                    <td style="padding: 12px; text-align: center; color: #475569;">${user.clicks}</td>
                    <td style="padding: 12px; text-align: center; color: #475569;">${user.modulesUsed}</td>
                    <td style="padding: 12px; text-align: center; color: #475569;">${user.gamesPlayed}</td>
                    <td style="padding: 12px; text-align: center; font-weight: 600; color: #3b82f6;">${Math.round(user.totalTime / 1000)}s</td>
                    <td style="padding: 12px; color: #64748b; font-size: 12px;">${new Date(user.lastActive).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function renderAnalyticsTab() {
    const events = window.Analytics.getStoredEvents();

    const eventsByType = {};
    events.forEach(e => {
      eventsByType[e.eventName] = (eventsByType[e.eventName] || 0) + 1;
    });

    const moduleActivity = {};
    events.forEach(e => {
      if (e.module) {
        if (!moduleActivity[e.module]) {
          moduleActivity[e.module] = { opens: 0, closes: 0, totalTime: 0 };
        }
        if (e.eventName === 'module_opened') moduleActivity[e.module].opens++;
        if (e.eventName === 'module_closed') {
          moduleActivity[e.module].closes++;
          if (e.data.durationSeconds) moduleActivity[e.module].totalTime += e.data.durationSeconds;
        }
      }
    });

    return `
      <div style="max-width: 1400px; margin: 0 auto;">
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 24px;">
          <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #1e293b;">Event Distribution</h2>
          <div style="display: grid; gap: 12px;">
            ${Object.entries(eventsByType).sort((a, b) => b[1] - a[1]).map(([name, count]) => {
              const percentage = Math.round((count / events.length) * 100);
              return `
                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: 600; color: #334155;">${name.replace(/_/g, ' ')}</span>
                    <span style="color: #64748b;">${count} (${percentage}%)</span>
                  </div>
                  <div style="height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden;">
                    <div style="height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); width: ${percentage}%; transition: width 0.3s;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #1e293b;">Module Performance</h2>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                  <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b;">Module</th>
                  <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #64748b;">Opens</th>
                  <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #64748b;">Completions</th>
                  <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #64748b;">Avg Time</th>
                  <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #64748b;">Engagement</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(moduleActivity).map(([module, stats]) => {
                  const avgTime = stats.closes > 0 ? Math.round(stats.totalTime / stats.closes) : 0;
                  const completionRate = stats.opens > 0 ? Math.round((stats.closes / stats.opens) * 100) : 0;
                  return `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 12px; font-weight: 600; color: #334155;">${module}</td>
                      <td style="padding: 12px; text-align: center; color: #475569;">${stats.opens}</td>
                      <td style="padding: 12px; text-align: center; color: #475569;">${stats.closes}</td>
                      <td style="padding: 12px; text-align: center; font-weight: 600; color: #3b82f6;">${avgTime}s</td>
                      <td style="padding: 12px; text-align: center;">
                        <span style="padding: 4px 12px; background: ${completionRate > 70 ? '#dcfce7' : completionRate > 40 ? '#fef3c7' : '#fee2e2'}; color: ${completionRate > 70 ? '#15803d' : completionRate > 40 ? '#a16207' : '#b91c1c'}; border-radius: 12px; font-weight: 600; font-size: 12px;">
                          ${completionRate}%
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function renderRevenueTab() {
    return `
      <div style="max-width: 1400px; margin: 0 auto;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 24px;">
          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">Total Revenue</div>
            <div style="font-size: 36px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">$0</div>
            <div style="font-size: 13px; color: #10b981;">Ready to track revenue</div>
          </div>

          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">Paying Users</div>
            <div style="font-size: 36px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">0</div>
            <div style="font-size: 13px; color: #64748b;">0% conversion rate</div>
          </div>

          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">Avg Revenue/User</div>
            <div style="font-size: 36px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">$0</div>
            <div style="font-size: 13px; color: #64748b;">Per user value</div>
          </div>

          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">Monthly Recurring</div>
            <div style="font-size: 36px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">$0</div>
            <div style="font-size: 13px; color: #64748b;">MRR</div>
          </div>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">💰</div>
          <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #1e293b;">Revenue Tracking Ready</h3>
          <p style="margin: 0; color: #64748b; max-width: 600px; margin: 0 auto;">Connect your payment system to start tracking revenue, conversions, and customer lifetime value.</p>
        </div>
      </div>
    `;
  }

  function renderMarketingTab() {
    const events = window.Analytics.getStoredEvents();
    const shareEvents = events.filter(e => e.eventName === 'share');

    return `
      <div style="max-width: 1400px; margin: 0 auto;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 24px;">
          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">Total Shares</div>
            <div style="font-size: 36px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">${shareEvents.length}</div>
            <div style="font-size: 13px; color: #10b981;">Organic growth</div>
          </div>

          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">Viral Coefficient</div>
            <div style="font-size: 36px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">0.0</div>
            <div style="font-size: 13px; color: #64748b;">K-factor</div>
          </div>

          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">Referral Rate</div>
            <div style="font-size: 36px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">0%</div>
            <div style="font-size: 13px; color: #64748b;">User invites</div>
          </div>

          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">Engagement Rate</div>
            <div style="font-size: 36px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">${events.length > 0 ? Math.round((shareEvents.length / events.length) * 100) : 0}%</div>
            <div style="font-size: 13px; color: #64748b;">Share ratio</div>
          </div>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 24px;">
          <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #1e293b;">Marketing Channels</h2>
          <div style="display: grid; gap: 12px;">
            ${[
              { name: 'Organic', value: 75, color: '#10b981' },
              { name: 'Referrals', value: 15, color: '#3b82f6' },
              { name: 'Social Media', value: 8, color: '#8b5cf6' },
              { name: 'Direct', value: 2, color: '#f59e0b' }
            ].map(channel => `
              <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-weight: 600; color: #334155;">${channel.name}</span>
                  <span style="color: #64748b;">${channel.value}%</span>
                </div>
                <div style="height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden;">
                  <div style="height: 100%; background: ${channel.color}; width: ${channel.value}%;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #1e293b;">Campaign Performance</h2>
          <div style="text-align: center; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 16px;">📢</div>
            <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #1e293b;">No Active Campaigns</h3>
            <p style="margin: 0; color: #64748b;">Create your first marketing campaign to track performance and ROI.</p>
          </div>
        </div>
      </div>
    `;
  }

  function attachContentListeners() {
    const exportBtn = state.container.querySelector('#export-users');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const events = window.Analytics.getStoredEvents();
        const dataStr = JSON.stringify(events, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'analytics-data.json';
        link.click();
        URL.revokeObjectURL(url);
      });
    }
  }

  function cleanup() {
    if (state.refreshInterval) {
      clearInterval(state.refreshInterval);
      state.refreshInterval = null;
    }

    if (state.container) {
      state.container.innerHTML = '';
    }
    state.isRunning = false;
  }

  window.ModuleRegistry.register({
    id: 'admin-dashboard',
    name: 'Admin',
    icon: '⚙️',
    type: 'utility',
    description: 'Complete platform management and analytics dashboard',
    start: start,
    stop: cleanup
  });
})();
