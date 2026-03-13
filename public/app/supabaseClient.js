class SupabaseClient {
  constructor() {
    this.client = null;
    this.isAvailable = false;
    this.initializationAttempted = false;
  }

  async initialize() {
    if (this.initializationAttempted) {
      return this.isAvailable;
    }

    this.initializationAttempted = true;

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase not configured - running in offline mode');
        return false;
      }

      if (typeof supabase === 'undefined') {
        console.warn('Supabase library not loaded - running in offline mode');
        return false;
      }

      this.client = supabase.createClient(supabaseUrl, supabaseKey);

      const { data, error } = await this.client
        .from('leaderboard')
        .select('count')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        console.warn('Supabase connection error:', error.message);
        this.isAvailable = false;
      } else {
        this.isAvailable = true;
        console.log('Supabase connected successfully');
      }
    } catch (error) {
      console.warn('Supabase initialization failed:', error.message);
      this.isAvailable = false;
    }

    return this.isAvailable;
  }

  async saveScore(game, score, playerName = 'Anonymous') {
    if (!this.isAvailable) {
      console.log('Offline mode - score not saved:', { game, score, playerName });
      return { success: false, offline: true };
    }

    try {
      const userId = this.getUserId();

      const { data, error } = await this.client
        .from('leaderboard')
        .insert({
          game_id: game,
          player_name: playerName,
          score: score,
          user_id: userId,
          played_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error saving score:', error);
        return { success: false, error: error.message };
      }

      console.log('Score saved successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error saving score:', error);
      return { success: false, error: error.message };
    }
  }

  async getLeaderboard(game, limit = 10) {
    if (!this.isAvailable) {
      console.log('Offline mode - returning empty leaderboard');
      return { success: true, data: [], offline: true };
    }

    try {
      const { data, error } = await this.client
        .from('leaderboard')
        .select('*')
        .eq('game_id', game)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return { success: false, error: error.message, data: [] };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Unexpected error fetching leaderboard:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async getUserStats(userId = null) {
    if (!this.isAvailable) {
      console.log('Offline mode - returning empty stats');
      return { success: true, data: null, offline: true };
    }

    try {
      const targetUserId = userId || this.getUserId();

      const { data, error } = await this.client
        .from('leaderboard')
        .select('game_id, score, played_at')
        .eq('user_id', targetUserId)
        .order('played_at', { ascending: false });

      if (error) {
        console.error('Error fetching user stats:', error);
        return { success: false, error: error.message, data: null };
      }

      const stats = this.aggregateStats(data || []);
      return { success: true, data: stats };
    } catch (error) {
      console.error('Unexpected error fetching user stats:', error);
      return { success: false, error: error.message, data: null };
    }
  }

  aggregateStats(records) {
    const gameStats = {};
    let totalGames = 0;
    let totalScore = 0;

    records.forEach(record => {
      if (!gameStats[record.game_id]) {
        gameStats[record.game_id] = {
          gamesPlayed: 0,
          highScore: 0,
          totalScore: 0,
          lastPlayed: null
        };
      }

      const game = gameStats[record.game_id];
      game.gamesPlayed++;
      game.totalScore += record.score;
      game.highScore = Math.max(game.highScore, record.score);

      if (!game.lastPlayed || new Date(record.played_at) > new Date(game.lastPlayed)) {
        game.lastPlayed = record.played_at;
      }

      totalGames++;
      totalScore += record.score;
    });

    return {
      totalGames,
      totalScore,
      averageScore: totalGames > 0 ? Math.round(totalScore / totalGames) : 0,
      gameStats
    };
  }

  getUserId() {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      return `telegram_${window.Telegram.WebApp.initDataUnsafe.user.id}`;
    }

    let localUserId = localStorage.getItem('platform_user_id');
    if (!localUserId) {
      localUserId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('platform_user_id', localUserId);
    }

    return localUserId;
  }

  getPlayerName() {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      return user.username || `${user.first_name} ${user.last_name || ''}`.trim();
    }

    return localStorage.getItem('platform_player_name') || 'Anonymous';
  }

  setPlayerName(name) {
    localStorage.setItem('platform_player_name', name);
  }
}

window.SupabaseClient = new SupabaseClient();

window.SupabaseClient.initialize().catch(err => {
  console.warn('Supabase initialization error:', err);
});
