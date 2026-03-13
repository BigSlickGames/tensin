(function() {
  const emojis = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎻'];
  let cards = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let isProcessing = false;
  let movesElement = null;
  let gridElement = null;
  let startButton = null;

  function start(container) {
    moves = 0;
    matchedPairs = 0;
    flippedCards = [];
    isProcessing = false;

    container.innerHTML = `
      <div class="game-container">
        <h2 class="game-title">Memory Match</h2>
        <p class="game-subtitle">Find all matching pairs!</p>

        <div class="game-stats">
          <div class="stat-item">
            <div class="stat-label">Moves</div>
            <div class="stat-value" id="memory-moves">0</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Pairs</div>
            <div class="stat-value" id="memory-pairs">0/8</div>
          </div>
        </div>

        <div class="memory-grid" id="memory-grid"></div>

        <button class="game-button" id="memory-start">Start Game</button>
        <div id="memory-share-container" style="margin-top: 15px; text-align: center;"></div>
        <div id="memory-leaderboard-container"></div>
      </div>
    `;

    movesElement = container.querySelector('#memory-moves');
    gridElement = container.querySelector('#memory-grid');
    startButton = container.querySelector('#memory-start');

    startButton.addEventListener('click', startGame);
  }

  function startGame() {
    const isRestart = startButton.textContent.includes('Play Again');

    moves = 0;
    matchedPairs = 0;
    flippedCards = [];
    isProcessing = false;

    movesElement.textContent = '0';
    document.querySelector('#memory-pairs').textContent = '0/8';

    cards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji: emoji,
        flipped: false,
        matched: false
      }));

    renderGrid();
    startButton.style.display = 'none';

    if (window.Analytics) {
      if (isRestart) {
        window.Analytics.trackGameRestart('Memory Match');
      } else {
        window.Analytics.trackGameStart('Memory Match');
      }
    }

    if (window.TelegramAdapter) {
      window.TelegramAdapter.haptic('impact', 'medium');
    }
  }

  function renderGrid() {
    gridElement.innerHTML = cards.map((card, index) => `
      <div class="memory-card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}" data-index="${index}">
        ${card.flipped || card.matched ? card.emoji : '❓'}
      </div>
    `).join('');

    gridElement.querySelectorAll('.memory-card').forEach(element => {
      element.addEventListener('click', () => handleCardClick(parseInt(element.dataset.index)));
    });
  }

  function handleCardClick(index) {
    if (isProcessing) return;

    const card = cards[index];

    if (card.flipped || card.matched || flippedCards.length >= 2) return;

    card.flipped = true;
    flippedCards.push(index);
    renderGrid();

    if (window.TelegramAdapter) {
      window.TelegramAdapter.haptic('impact', 'light');
    }

    if (flippedCards.length === 2) {
      moves++;
      movesElement.textContent = moves;
      checkMatch();
    }
  }

  function checkMatch() {
    isProcessing = true;

    const [index1, index2] = flippedCards;
    const card1 = cards[index1];
    const card2 = cards[index2];

    if (card1.emoji === card2.emoji) {
      setTimeout(() => {
        card1.matched = true;
        card2.matched = true;
        matchedPairs++;

        document.querySelector('#memory-pairs').textContent = `${matchedPairs}/8`;

        flippedCards = [];
        isProcessing = false;
        renderGrid();

        if (window.TelegramAdapter) {
          window.TelegramAdapter.haptic('notification', 'success');
        }

        if (matchedPairs === 8) {
          endGame();
        }
      }, 500);
    } else {
      setTimeout(() => {
        card1.flipped = false;
        card2.flipped = false;
        flippedCards = [];
        isProcessing = false;
        renderGrid();

        if (window.TelegramAdapter) {
          window.TelegramAdapter.haptic('impact', 'medium');
        }
      }, 1000);
    }
  }

  async function endGame() {
    startButton.style.display = 'block';
    startButton.textContent = `Play Again - ${moves} moves`;

    if (window.Analytics) {
      window.Analytics.trackGameEnd('Memory Match', moves);
    }

    const isDailyChallenge = await checkAndSubmitDailyChallenge(moves);

    if (!isDailyChallenge && window.LeaderboardManager) {
      await window.LeaderboardManager.submitScore('memory-game', 'Memory Match', moves, 'moves');
    }

    if (window.TelegramAdapter) {
      window.TelegramAdapter.haptic('notification', 'success');
    }

    showShareButton(moves);
    await showLeaderboard(moves);
  }

  async function checkAndSubmitDailyChallenge(finalScore) {
    if (window.DailyChallengeManager) {
      const challenge = window.DailyChallengeManager.currentChallenge;
      if (challenge && challenge.game_id === 'memory-game') {
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

  function showShareButton(finalMoves) {
    const shareContainer = document.querySelector('#memory-share-container');
    if (shareContainer && window.ShareManager) {
      shareContainer.innerHTML = '';
      const shareButton = window.ShareManager.createShareButton({
        text: 'Challenge Friends',
        icon: '��',
        style: 'success',
        gameName: 'Memory Match',
        score: finalMoves
      });
      shareContainer.appendChild(shareButton);
    }
  }

  async function showLeaderboard(currentScore) {
    const leaderboardContainer = document.querySelector('#memory-leaderboard-container');
    if (leaderboardContainer && window.LeaderboardManager) {
      const leaderboardHTML = await window.LeaderboardManager.createLeaderboardElement(
        'memory-game',
        currentScore,
        'moves'
      );
      leaderboardContainer.innerHTML = leaderboardHTML;
    }
  }

  function stop() {
    isProcessing = false;
    flippedCards = [];
  }

  window.ModuleRegistry.register({
    id: 'memory-game',
    name: 'Memory Match',
    icon: '🧠',
    type: 'game',
    description: 'Match all the pairs to win',
    start: start,
    stop: stop
  });
})();
