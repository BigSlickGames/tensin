(function() {
  let state = {
    container: null,
    isRunning: false,
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
        render();
      }
    }, 5000);
  }

  function render() {
    if (!window.Analytics) {
      state.container.innerHTML = '<div style="padding: 20px; text-align: center; color: #64748b;">Analytics not available</div>';
      return;
    }

    const summary = window.Analytics.getSessionSummary();
    const storedEvents = window.Analytics.getStoredEvents();

    const moduleEvents = {};
    storedEvents.forEach(event => {
      if (event.module) {
        if (!moduleEvents[event.module]) {
          moduleEvents[event.module] = { opens: 0, closes: 0, interactions: 0, totalTime: 0 };
        }

        if (event.eventName === 'module_opened') {
          moduleEvents[event.module].opens++;
        } else if (event.eventName === 'module_closed') {
          moduleEvents[event.module].closes++;
          if (event.data.durationSeconds) {
            moduleEvents[event.module].totalTime += event.data.durationSeconds;
          }
        } else {
          moduleEvents[event.module].interactions++;
        }
      }
    });

    const gameEvents = storedEvents.filter(e =>
      e.eventName === 'game_start' ||
      e.eventName === 'game_end' ||
      e.eventName === 'game_restart'
    );

    const clickEvents = storedEvents.filter(e => e.eventName === 'button_click');

    state.container.innerHTML = `
      <div style="height: 100%; overflow-y: auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="padding: 24px; max-width: 1200px; margin: 0 auto;">

          <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1e293b;">Session Overview</h2>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">Session Duration</div>
                <div style="font-size: 32px; font-weight: 700;">${Math.floor(summary.durationSeconds / 60)}m ${summary.durationSeconds % 60}s</div>
              </div>

              <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">Total Events</div>
                <div style="font-size: 32px; font-weight: 700;">${summary.totalEvents}</div>
              </div>

              <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">Button Clicks</div>
                <div style="font-size: 32px; font-weight: 700;">${clickEvents.length}</div>
              </div>

              <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">Modules Used</div>
                <div style="font-size: 32px; font-weight: 700;">${Object.keys(moduleEvents).length}</div>
              </div>
            </div>
          </div>

          <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1e293b;">Module Activity</h2>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #e2e8f0;">
                    <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b;">Module</th>
                    <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #64748b;">Opens</th>
                    <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #64748b;">Interactions</th>
                    <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #64748b;">Total Time</th>
                    <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #64748b;">Avg Time</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(moduleEvents).length > 0 ? Object.entries(moduleEvents).map(([moduleId, stats]) => {
                    const avgTime = stats.closes > 0 ? Math.round(stats.totalTime / stats.closes) : 0;
                    return `
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 12px; font-weight: 500; color: #334155;">${moduleId}</td>
                        <td style="padding: 12px; text-align: center; color: #475569;">${stats.opens}</td>
                        <td style="padding: 12px; text-align: center; color: #475569;">${stats.interactions}</td>
                        <td style="padding: 12px; text-align: center; color: #475569;">${stats.totalTime}s</td>
                        <td style="padding: 12px; text-align: center; font-weight: 600; color: #667eea;">${avgTime}s</td>
                      </tr>
                    `;
                  }).join('') : `
                    <tr>
                      <td colspan="5" style="padding: 24px; text-align: center; color: #94a3b8;">No module activity yet</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>

          <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1e293b;">Gaming Activity</h2>
            ${gameEvents.length > 0 ? `
              <div style="display: grid; gap: 12px;">
                ${gameEvents.slice(-10).reverse().map(event => {
                  const time = new Date(event.timestamp).toLocaleTimeString();
                  const isStart = event.eventName === 'game_start';
                  const isEnd = event.eventName === 'game_end';
                  const isRestart = event.eventName === 'game_restart';

                  let icon = '🎮';
                  let color = '#667eea';
                  let label = 'Started';

                  if (isEnd) {
                    icon = '🏁';
                    color = '#10b981';
                    label = 'Finished';
                  } else if (isRestart) {
                    icon = '🔄';
                    color = '#f59e0b';
                    label = 'Restarted';
                  }

                  return `
                    <div style="display: flex; align-items: center; padding: 16px; background: #f8fafc; border-radius: 12px; border-left: 4px solid ${color};">
                      <div style="font-size: 24px; margin-right: 16px;">${icon}</div>
                      <div style="flex: 1;">
                        <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">${event.data.gameName || 'Game'} - ${label}</div>
                        <div style="font-size: 13px; color: #64748b;">${time}${isEnd && event.data.score !== undefined ? ` • Score: ${event.data.score}` : ''}</div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : `
              <div style="padding: 24px; text-align: center; color: #94a3b8;">No game activity yet</div>
            `}
          </div>

          <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1e293b;">Event Timeline</h2>
            <div style="max-height: 400px; overflow-y: auto;">
              ${storedEvents.slice(-15).reverse().map(event => {
                const time = new Date(event.timestamp).toLocaleTimeString();
                const eventColors = {
                  'module_opened': '#667eea',
                  'module_closed': '#764ba2',
                  'button_click': '#4facfe',
                  'game_start': '#43e97b',
                  'game_end': '#f5576c',
                  'session_start': '#fbbf24'
                };
                const color = eventColors[event.eventName] || '#94a3b8';

                return `
                  <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                    <div style="width: 4px; background: ${color}; border-radius: 2px; margin-right: 12px;"></div>
                    <div style="flex: 1;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-weight: 600; color: #1e293b; font-size: 14px;">${event.eventName.replace(/_/g, ' ')}</span>
                        <span style="font-size: 12px; color: #94a3b8;">${time}</span>
                      </div>
                      ${event.module ? `<div style="font-size: 12px; color: #64748b;">Module: ${event.module}</div>` : ''}
                      ${Object.keys(event.data).length > 0 ? `
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                          ${Object.entries(event.data).slice(0, 3).map(([key, value]) =>
                            `<span style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; margin-right: 6px;">${key}: ${value}</span>`
                          ).join('')}
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="display: flex; gap: 12px; justify-content: center;">
            <button id="refresh-btn" style="padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
              Refresh Data
            </button>
            <button id="clear-events-btn" style="padding: 14px 28px; background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);">
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    `;

    attachEventListeners();
  }

  function attachEventListeners() {
    const clearBtn = state.container.querySelector('#clear-events-btn');
    const refreshBtn = state.container.querySelector('#refresh-btn');

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all analytics data?')) {
          window.Analytics.clearStoredEvents();
          render();
        }
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        render();
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
    id: 'analytics-viewer',
    name: 'Analytics',
    icon: '📊',
    type: 'utility',
    description: 'View session analytics and user behavior',
    start: start,
    stop: cleanup
  });
})();
