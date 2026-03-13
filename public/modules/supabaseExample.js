(function() {
  let state = {
    container: null,
    isRunning: false
  };

  function start(container) {
    if (state.isRunning) {
      console.warn('Supabase Example already running');
      return;
    }

    state.container = container;
    state.isRunning = true;

    render();
    testSupabaseIntegration();
  }

  function render() {
    state.container.innerHTML = `
      <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">
          Supabase Integration Test
        </h1>

        <div id="status" style="padding: 15px; border-radius: 8px; margin-bottom: 20px; background: #f3f4f6;">
          <p>Checking connection...</p>
        </div>

        <div id="test-controls" style="margin-bottom: 20px;">
          <button id="save-test-score" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 10px;">
            Save Test Score
          </button>
          <button id="load-leaderboard" style="padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 10px;">
            Load Leaderboard
          </button>
          <button id="load-stats" style="padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Load User Stats
          </button>
        </div>

        <div id="results" style="padding: 15px; border-radius: 8px; background: #f9fafb; min-height: 100px;">
          <p style="color: #6b7280;">Results will appear here...</p>
        </div>
      </div>
    `;

    state.container.querySelector('#save-test-score').addEventListener('click', saveTestScore);
    state.container.querySelector('#load-leaderboard').addEventListener('click', loadLeaderboard);
    state.container.querySelector('#load-stats').addEventListener('click', loadUserStats);
  }

  async function testSupabaseIntegration() {
    const statusEl = state.container.querySelector('#status');

    const isAvailable = await window.SupabaseClient.initialize();

    if (isAvailable) {
      statusEl.innerHTML = `
        <p style="color: #10b981; font-weight: bold;">✓ Supabase Connected</p>
        <p style="font-size: 14px; color: #6b7280; margin-top: 5px;">
          Database is ready. You can save scores and view leaderboards.
        </p>
      `;
    } else {
      statusEl.innerHTML = `
        <p style="color: #f59e0b; font-weight: bold;">⚠ Offline Mode</p>
        <p style="font-size: 14px; color: #6b7280; margin-top: 5px;">
          Running without database. Scores won't be saved.
        </p>
      `;
    }
  }

  async function saveTestScore() {
    const resultsEl = state.container.querySelector('#results');
    resultsEl.innerHTML = '<p style="color: #6b7280;">Saving score...</p>';

    const randomScore = Math.floor(Math.random() * 1000) + 100;
    const playerName = window.SupabaseClient.getPlayerName();

    const result = await window.SupabaseClient.saveScore('test-game', randomScore, playerName);

    if (result.offline) {
      resultsEl.innerHTML = `
        <p style="color: #f59e0b; font-weight: bold;">Offline Mode</p>
        <p style="margin-top: 10px;">Score: ${randomScore} (not saved)</p>
      `;
    } else if (result.success) {
      resultsEl.innerHTML = `
        <p style="color: #10b981; font-weight: bold;">✓ Score Saved Successfully</p>
        <pre style="margin-top: 10px; padding: 10px; background: white; border-radius: 4px; overflow-x: auto; font-size: 12px;">${JSON.stringify(result.data, null, 2)}</pre>
      `;
    } else {
      resultsEl.innerHTML = `
        <p style="color: #ef4444; font-weight: bold;">✗ Error Saving Score</p>
        <p style="margin-top: 10px; color: #6b7280;">${result.error}</p>
      `;
    }
  }

  async function loadLeaderboard() {
    const resultsEl = state.container.querySelector('#results');
    resultsEl.innerHTML = '<p style="color: #6b7280;">Loading leaderboard...</p>';

    const result = await window.SupabaseClient.getLeaderboard('test-game', 5);

    if (result.offline) {
      resultsEl.innerHTML = `
        <p style="color: #f59e0b; font-weight: bold;">Offline Mode</p>
        <p style="margin-top: 10px;">No leaderboard data available</p>
      `;
    } else if (result.success) {
      if (result.data.length === 0) {
        resultsEl.innerHTML = `
          <p style="color: #6b7280;">No scores yet. Save a test score first!</p>
        `;
      } else {
        let html = '<p style="font-weight: bold; margin-bottom: 10px;">Top 5 Scores:</p><div style="background: white; border-radius: 4px; overflow: hidden;">';
        result.data.forEach((entry, index) => {
          html += `
            <div style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
              <span style="font-weight: bold;">#${index + 1}</span>
              <span style="margin-left: 10px;">${entry.player_name}</span>
              <span style="float: right; font-weight: bold; color: #3b82f6;">${entry.score}</span>
            </div>
          `;
        });
        html += '</div>';
        resultsEl.innerHTML = html;
      }
    } else {
      resultsEl.innerHTML = `
        <p style="color: #ef4444; font-weight: bold;">✗ Error Loading Leaderboard</p>
        <p style="margin-top: 10px; color: #6b7280;">${result.error}</p>
      `;
    }
  }

  async function loadUserStats() {
    const resultsEl = state.container.querySelector('#results');
    resultsEl.innerHTML = '<p style="color: #6b7280;">Loading stats...</p>';

    const result = await window.SupabaseClient.getUserStats();

    if (result.offline) {
      resultsEl.innerHTML = `
        <p style="color: #f59e0b; font-weight: bold;">Offline Mode</p>
        <p style="margin-top: 10px;">No stats available</p>
      `;
    } else if (result.success) {
      if (!result.data || result.data.totalGames === 0) {
        resultsEl.innerHTML = `
          <p style="color: #6b7280;">No games played yet. Save a test score first!</p>
        `;
      } else {
        const stats = result.data;
        let html = `
          <div style="background: white; border-radius: 4px; padding: 15px;">
            <p style="font-weight: bold; margin-bottom: 10px;">Your Stats:</p>
            <div style="margin-bottom: 10px;">
              <span style="color: #6b7280;">Total Games:</span>
              <span style="float: right; font-weight: bold;">${stats.totalGames}</span>
            </div>
            <div style="margin-bottom: 10px;">
              <span style="color: #6b7280;">Total Score:</span>
              <span style="float: right; font-weight: bold;">${stats.totalScore}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <span style="color: #6b7280;">Average Score:</span>
              <span style="float: right; font-weight: bold;">${stats.averageScore}</span>
            </div>
            <p style="font-weight: bold; margin-bottom: 10px;">By Game:</p>
        `;

        for (const [gameId, gameStats] of Object.entries(stats.gameStats)) {
          html += `
            <div style="margin-bottom: 10px; padding: 10px; background: #f9fafb; border-radius: 4px;">
              <p style="font-weight: bold; margin-bottom: 5px;">${gameId}</p>
              <div style="font-size: 14px; color: #6b7280;">
                <div>Games: ${gameStats.gamesPlayed}</div>
                <div>High Score: ${gameStats.highScore}</div>
                <div>Average: ${Math.round(gameStats.totalScore / gameStats.gamesPlayed)}</div>
              </div>
            </div>
          `;
        }

        html += '</div>';
        resultsEl.innerHTML = html;
      }
    } else {
      resultsEl.innerHTML = `
        <p style="color: #ef4444; font-weight: bold;">✗ Error Loading Stats</p>
        <p style="margin-top: 10px; color: #6b7280;">${result.error}</p>
      `;
    }
  }

  function cleanup() {
    if (state.container) {
      state.container.innerHTML = '';
    }
    state.isRunning = false;
  }

  window.ModuleRegistry.register({
    id: 'supabase-example',
    name: 'Supabase Test',
    icon: '💾',
    type: 'utility',
    description: 'Test Supabase integration and database features',
    start: start,
    stop: cleanup
  });
})();
