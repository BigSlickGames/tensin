class DailyChallengeManager {
  constructor() {
    this.currentChallenge = null;
    this.playerScore = null;
    this.topScores = [];
    this.cache = {
      challenge: null,
      timestamp: 0,
      ttl: 60000
    };
  }

  async initialize() {
    try {
      await this.ensureTodayChallenge();
      await this.loadCurrentChallenge();
      console.log('Daily Challenge Manager initialized');
    } catch (error) {
      console.error('Error initializing Daily Challenge Manager:', error);
    }
  }

  async ensureTodayChallenge() {
    const today = new Date().toISOString().split('T')[0];

    const { data: existing, error: fetchError } = await window.supabase
      .from('daily_challenges')
      .select('*')
      .eq('challenge_date', today)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking for today\'s challenge:', fetchError);
      return;
    }

    if (!existing) {
      const games = [
        { id: 'tap-game', name: 'Tap Master' },
        { id: 'reaction-game', name: 'Reaction Test' },
        { id: 'memory-game', name: 'Memory Match' },
        { id: 'bubble-pop', name: 'Bubble Pop' }
      ];

      const seed = new Date(today).getTime();
      const gameIndex = Math.floor((seed / 86400000) % games.length);
      const selectedGame = games[gameIndex];

      const { error: insertError } = await window.supabase
        .from('daily_challenges')
        .insert({
          challenge_date: today,
          game_id: selectedGame.id,
          game_name: selectedGame.name
        });

      if (insertError) {
        console.error('Error creating today\'s challenge:', insertError);
      }
    }
  }

  async loadCurrentChallenge() {
    const now = Date.now();
    if (this.cache.challenge && (now - this.cache.timestamp) < this.cache.ttl) {
      this.currentChallenge = this.cache.challenge;
      return this.currentChallenge;
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await window.supabase
      .from('daily_challenges')
      .select('*')
      .eq('challenge_date', today)
      .maybeSingle();

    if (error) {
      console.error('Error loading challenge:', error);
      return null;
    }

    this.currentChallenge = data;
    this.cache.challenge = data;
    this.cache.timestamp = now;

    if (data) {
      await this.loadTopScores();
      await this.loadPlayerScore();
    }

    return data;
  }

  async loadTopScores(limit = 10) {
    if (!this.currentChallenge) return [];

    const scoreType = this.getScoreTypeForGame(this.currentChallenge.game_id);
    const orderDirection = scoreType === 'time' || scoreType === 'moves' ? 'asc' : 'desc';

    const { data, error } = await window.supabase
      .from('daily_challenge_scores')
      .select('*')
      .eq('challenge_id', this.currentChallenge.id)
      .order('score', { ascending: orderDirection === 'asc' })
      .limit(limit);

    if (error) {
      console.error('Error loading top scores:', error);
      return [];
    }

    this.topScores = data || [];
    return this.topScores;
  }

  async loadPlayerScore() {
    if (!this.currentChallenge) return null;

    const playerId = this.getPlayerId();

    const { data, error } = await window.supabase
      .from('daily_challenge_scores')
      .select('*')
      .eq('challenge_id', this.currentChallenge.id)
      .eq('player_id', playerId)
      .maybeSingle();

    if (error) {
      console.error('Error loading player score:', error);
      return null;
    }

    this.playerScore = data;
    return data;
  }

  async submitScore(score, metadata = {}) {
    if (!this.currentChallenge) {
      throw new Error('No active challenge');
    }

    if (this.playerScore) {
      throw new Error('You have already submitted a score for today\'s challenge');
    }

    const playerId = this.getPlayerId();
    const playerName = this.getPlayerName();
    const scoreType = this.getScoreTypeForGame(this.currentChallenge.game_id);

    const { data, error } = await window.supabase
      .from('daily_challenge_scores')
      .insert({
        challenge_id: this.currentChallenge.id,
        player_id: playerId,
        player_name: playerName,
        score: score,
        score_type: scoreType,
        metadata: metadata
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('You have already submitted a score for today\'s challenge');
      }
      throw error;
    }

    this.playerScore = data;
    await this.loadTopScores();

    return data;
  }

  async hasSubmittedToday() {
    await this.loadPlayerScore();
    return this.playerScore !== null;
  }

  getScoreTypeForGame(gameId) {
    const scoreTypes = {
      'tap-game': 'points',
      'reaction-game': 'time',
      'memory-game': 'moves',
      'bubble-pop': 'points'
    };
    return scoreTypes[gameId] || 'points';
  }

  getPlayerId() {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      return `telegram_${window.Telegram.WebApp.initDataUnsafe.user.id}`;
    }

    let anonymousId = localStorage.getItem('anonymous_player_id');
    if (!anonymousId) {
      anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('anonymous_player_id', anonymousId);
    }
    return anonymousId;
  }

  getPlayerName() {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      return user.username || user.first_name || 'Telegram User';
    }

    let name = localStorage.getItem('anonymous_player_name');
    if (!name) {
      name = `Player${Math.floor(Math.random() * 9999)}`;
      localStorage.setItem('anonymous_player_name', name);
    }
    return name;
  }

  getTimeUntilNextChallenge() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, totalMs: diff };
  }

  formatScore(score, scoreType) {
    if (scoreType === 'time') {
      return `${score}ms`;
    } else if (scoreType === 'moves') {
      return `${score} moves`;
    }
    return score.toLocaleString();
  }

  async renderChallengeCard(container) {
    await this.loadCurrentChallenge();

    if (!this.currentChallenge) {
      container.innerHTML = '<p class="text-gray-400">No challenge available</p>';
      return;
    }

    const hasSubmitted = await this.hasSubmittedToday();
    const scoreType = this.getScoreTypeForGame(this.currentChallenge.game_id);
    const timeUntil = this.getTimeUntilNextChallenge();

    container.innerHTML = `
      <div class="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold text-yellow-400 mb-1">🏆 Daily Challenge</h2>
            <p class="text-gray-300 text-sm">One attempt per day</p>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-400 mb-1">Next in</div>
            <div id="challenge-countdown" class="text-lg font-bold text-yellow-400">
              ${String(timeUntil.hours).padStart(2, '0')}:${String(timeUntil.minutes).padStart(2, '0')}:${String(timeUntil.seconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        <div class="bg-black/30 rounded-lg p-4 mb-4">
          <h3 class="text-xl font-bold text-white mb-2">${this.currentChallenge.game_name}</h3>
          ${hasSubmitted ? `
            <div class="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-3">
              <p class="text-green-400 font-semibold">✓ Challenge Completed!</p>
              <p class="text-white text-lg mt-1">Your Score: ${this.formatScore(this.playerScore.score, scoreType)}</p>
            </div>
          ` : `
            <button id="start-challenge-btn" class="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors">
              Start Challenge
            </button>
          `}
        </div>

        <div class="bg-black/30 rounded-lg p-4">
          <h4 class="text-lg font-bold text-white mb-3">🏅 Today's Top Players</h4>
          <div id="challenge-leaderboard" class="space-y-2 max-h-64 overflow-y-auto">
            ${await this.renderTopScores()}
          </div>
        </div>
      </div>
    `;

    this.startCountdown();
    this.attachEventListeners();
  }

  async renderTopScores() {
    if (this.topScores.length === 0) {
      return '<p class="text-gray-400 text-sm text-center py-4">No scores yet. Be the first!</p>';
    }

    const playerId = this.getPlayerId();
    const scoreType = this.getScoreTypeForGame(this.currentChallenge.game_id);

    return this.topScores.map((score, index) => {
      const isCurrentPlayer = score.player_id === playerId;
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

      return `
        <div class="flex items-center justify-between p-3 rounded-lg ${isCurrentPlayer ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-white/5'}">
          <div class="flex items-center gap-3">
            <span class="text-xl font-bold ${isCurrentPlayer ? 'text-blue-400' : 'text-gray-400'} w-8">
              ${medal || `#${index + 1}`}
            </span>
            <span class="text-white font-medium">${score.player_name}</span>
          </div>
          <span class="text-yellow-400 font-bold">${this.formatScore(score.score, scoreType)}</span>
        </div>
      `;
    }).join('');
  }

  startCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      const timeUntil = this.getTimeUntilNextChallenge();
      const countdownEl = document.getElementById('challenge-countdown');

      if (countdownEl) {
        countdownEl.textContent =
          `${String(timeUntil.hours).padStart(2, '0')}:${String(timeUntil.minutes).padStart(2, '0')}:${String(timeUntil.seconds).padStart(2, '0')}`;
      }

      if (timeUntil.totalMs <= 0) {
        clearInterval(this.countdownInterval);
        this.cache.challenge = null;
        this.currentChallenge = null;
        this.playerScore = null;
        this.initialize();
      }
    }, 1000);
  }

  attachEventListeners() {
    const startBtn = document.getElementById('start-challenge-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (this.currentChallenge) {
          const moduleId = this.currentChallenge.game_id;
          if (window.ModuleLoader) {
            window.ModuleLoader.loadModule(moduleId);
          }
        }
      });
    }
  }

  cleanup() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}

window.DailyChallengeManager = new DailyChallengeManager();
