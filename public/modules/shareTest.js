(function() {
  let state = {
    container: null,
    isRunning: false
  };

  function start(container) {
    if (state.isRunning) {
      console.warn('Share Test already running');
      return;
    }

    state.container = container;
    state.isRunning = true;

    render();
  }

  function render() {
    state.container.innerHTML = `
      <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">
          Share & Invite System Test
        </h1>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">Share Options</h2>

          <div style="margin-bottom: 15px;">
            <p style="color: #6b7280; margin-bottom: 10px;">General Invite:</p>
            <div id="general-share"></div>
          </div>

          <div style="margin-bottom: 15px;">
            <p style="color: #6b7280; margin-bottom: 10px;">Tap Master Challenge (Score: 150):</p>
            <div id="tap-share"></div>
          </div>

          <div style="margin-bottom: 15px;">
            <p style="color: #6b7280; margin-bottom: 10px;">Reaction Test Challenge (Score: 250ms):</p>
            <div id="reaction-share"></div>
          </div>

          <div style="margin-bottom: 15px;">
            <p style="color: #6b7280; margin-bottom: 10px;">Memory Match Challenge (Score: 12 moves):</p>
            <div id="memory-share"></div>
          </div>

          <div style="margin-bottom: 15px;">
            <p style="color: #6b7280; margin-bottom: 10px;">Bubble Pop Challenge (Score: 450):</p>
            <div id="bubble-share"></div>
          </div>
        </div>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">How It Works</h2>
          <ul style="list-style: disc; padding-left: 20px; color: #6b7280; line-height: 1.8;">
            <li>Each share button generates a custom message</li>
            <li>Links include start parameters for deep linking</li>
            <li>When users click shared links, they see challenge notifications</li>
            <li>Works seamlessly in Telegram and with web share API</li>
            <li>Share buttons appear automatically after completing games</li>
          </ul>
        </div>
      </div>
    `;

    if (window.ShareManager) {
      const generalBtn = window.ShareManager.createShareButton({
        text: 'Invite Friends',
        icon: '🎮',
        style: 'primary'
      });
      state.container.querySelector('#general-share').appendChild(generalBtn);

      const tapBtn = window.ShareManager.createShareButton({
        text: 'Share Score',
        icon: '👆',
        style: 'success',
        gameName: 'Tap Master',
        score: 150
      });
      state.container.querySelector('#tap-share').appendChild(tapBtn);

      const reactionBtn = window.ShareManager.createShareButton({
        text: 'Share Score',
        icon: '⚡',
        style: 'success',
        gameName: 'Reaction Test',
        score: 250
      });
      state.container.querySelector('#reaction-share').appendChild(reactionBtn);

      const memoryBtn = window.ShareManager.createShareButton({
        text: 'Share Score',
        icon: '🧠',
        style: 'success',
        gameName: 'Memory Match',
        score: 12
      });
      state.container.querySelector('#memory-share').appendChild(memoryBtn);

      const bubbleBtn = window.ShareManager.createShareButton({
        text: 'Share Score',
        icon: '🫧',
        style: 'success',
        gameName: 'Bubble Pop',
        score: 450
      });
      state.container.querySelector('#bubble-share').appendChild(bubbleBtn);
    }
  }

  function cleanup() {
    if (state.container) {
      state.container.innerHTML = '';
    }
    state.isRunning = false;
  }

  window.ModuleRegistry.register({
    id: 'share-test',
    name: 'Share Test',
    icon: '📤',
    type: 'utility',
    description: 'Test share and invite functionality',
    start: start,
    stop: cleanup
  });
})();
