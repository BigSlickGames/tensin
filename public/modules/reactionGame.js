(function() {
  let bestTime = null;
  let currentTime = null;
  let isWaiting = false;
  let isReady = false;
  let startTime = null;
  let timeout = null;
  let reactionBox = null;
  let bestElement = null;
  let currentElement = null;
  let startButton = null;
  let messageElement = null;

  function start(container) {
    bestTime = localStorage.getItem('reaction-best') ? parseInt(localStorage.getItem('reaction-best')) : null;
    currentTime = null;
    isWaiting = false;
    isReady = false;

    container.innerHTML = `
      <div class="game-container">
        <h2 class="game-title">Reaction Test</h2>
        <p class="game-subtitle">Test your reflexes!</p>

        <div class="game-stats">
          ${bestTime ? `
            <div class="stat-item">
              <div class="stat-label">Best</div>
              <div class="stat-value" id="reaction-best">${bestTime}ms</div>
            </div>
          ` : ''}
          <div class="stat-item">
            <div class="stat-label">Current</div>
            <div class="stat-value" id="reaction-current">-</div>
          </div>
        </div>

        <div class="reaction-box" id="reaction-box">
          <span id="reaction-message">Click Start to begin</span>
        </div>

        <button class="game-button" id="reaction-start">Start Test</button>
        <div id="reaction-share-container" style="margin-top: 15px; text-align: center;"></div>
        <div id="reaction-leaderboard-container"></div>
      </div>
    `;

    reactionBox = container.querySelector('#reaction-box');
    bestElement = container.querySelector('#reaction-best');
    currentElement = container.querySelector('#reaction-current');
    startButton = container.querySelector('#reaction-start');
    messageElement = container.querySelector('#reaction-message');

    startButton.addEventListener('click', startTest);
    reactionBox.addEventListener('click', handleClick);
  }

  function startTest() {
    if (isWaiting || isReady) return;

    const isRestart = currentTime !== null;

    currentTime = null;
    currentElement.textContent = '-';
    isWaiting = true;
    isReady = false;

    reactionBox.classList.remove('ready', 'early');
    messageElement.textContent = 'Wait for green...';
    startButton.style.display = 'none';

    if (window.Analytics) {
      if (isRestart) {
        window.Analytics.trackGameRestart('Reaction Test');
      } else {
        window.Analytics.trackGameStart('Reaction Test');
      }
    }

    if (window.TelegramAdapter) {
      window.TelegramAdapter.haptic('impact', 'medium');
    }

    const delay = 2000 + Math.random() * 3000;

    timeout = setTimeout(() => {
      isWaiting = false;
      isReady = true;
      startTime = Date.now();

      reactionBox.classList.add('ready');
      messageElement.textContent = 'Click now!';

      if (window.TelegramAdapter) {
        window.TelegramAdapter.haptic('impact', 'light');
      }
    }, delay);
  }

  function handleClick() {
    if (isWaiting) {
      clearTimeout(timeout);
      isWaiting = false;
      isReady = false;

      reactionBox.classList.add('early');
      messageElement.textContent = 'Too early! Try again';
      startButton.style.display = 'block';

      if (window.TelegramAdapter) {
        window.TelegramAdapter.haptic('notification', 'error');
      }

      return;
    }

    if (isReady) {
      const endTime = Date.now();
      currentTime = endTime - startTime;
      isReady = false;

      currentElement.textContent = `${currentTime}ms`;

      if (window.Analytics) {
        window.Analytics.trackGameEnd('Reaction Test', currentTime, currentTime);
      }

      const chips = window.ProgressionManager.calculateChipsForGame('reaction-game', currentTime, 'time');
      const progressResult = await window.ProgressionManager.awardChips(chips, 'Reaction Test');

      if (progressResult) {
        window.ProgressionManager.showProgressNotification(progressResult);
      }

      const isDailyChallenge = await checkAndSubmitDailyChallenge(currentTime);

      if (!isDailyChallenge && window.LeaderboardManager) {
        await window.LeaderboardManager.submitScore('reaction-game', 'Reaction Test', currentTime, 'time');
      }

      if (!bestTime || currentTime < bestTime) {
        bestTime = currentTime;
        localStorage.setItem('reaction-best', bestTime);

        if (bestElement) {
          bestElement.textContent = `${bestTime}ms`;
        }

        messageElement.textContent = 'New record!';

        if (window.TelegramAdapter) {
          window.TelegramAdapter.haptic('notification', 'success');
        }
      } else {
        messageElement.textContent = `${currentTime}ms - Try again`;

        if (window.TelegramAdapter) {
          window.TelegramAdapter.haptic('impact', 'medium');
        }
      }

      reactionBox.classList.remove('ready');
      startButton.style.display = 'block';

      showShareButton(currentTime);
      await showLeaderboard(currentTime);
    }
  }

  function showShareButton(score) {
    const shareContainer = document.querySelector('#reaction-share-container');
    if (shareContainer && window.ShareManager) {
      shareContainer.innerHTML = '';
      const shareButton = window.ShareManager.createShareButton({
        text: 'Challenge Friends',
        icon: '⚡',
        style: 'success',
        gameName: 'Reaction Test',
        score: score
      });
      shareContainer.appendChild(shareButton);
    }
  }

  async function showLeaderboard(currentScore) {
    const leaderboardContainer = document.querySelector('#reaction-leaderboard-container');
    if (leaderboardContainer && window.LeaderboardManager) {
      const leaderboardHTML = await window.LeaderboardManager.createLeaderboardElement(
        'reaction-game',
        currentScore,
        'time'
      );
      leaderboardContainer.innerHTML = leaderboardHTML;
    }
  }

  async function checkAndSubmitDailyChallenge(finalScore) {
    if (window.DailyChallengeManager) {
      const challenge = window.DailyChallengeManager.currentChallenge;
      if (challenge && challenge.game_id === 'reaction-game') {
        const hasSubmitted = await window.DailyChallengeManager.hasSubmittedToday();
        if (!hasSubmitted) {
          try {
            await window.DailyChallengeManager.submitScore(finalScore);
            return true;
          } catch (error) {
            console.error('Error submitting to daily challenge:', error);
          }
        }
      }
    }
    return false;
  }

  function stop() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    isWaiting = false;
    isReady = false;
  }

  window.ModuleRegistry.register({
    id: 'reaction-game',
    name: 'Reaction Test',
    icon: '⚡',
    type: 'game',
    description: 'Test your reaction speed',
    start: start,
    stop: stop
  });
})();
