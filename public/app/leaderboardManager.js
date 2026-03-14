class LeaderboardManager {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 30000;
  }

  getUserInfo() {
    const currentUser = window.AuthManager?.getCurrentUser();

    if (currentUser) {
      return {
        userId: currentUser.id,
        playerName: currentUser.username || currentUser.first_name
      };
    }

    return {
      userId: 'guest',
      playerName: 'Guest'
    };
  }

  async submitScore(gameId, gameName, score, scoreType = 'points', metadata = {}) {
    if (!window.SupabaseClient?.client) {
      console.warn('Supabase not available. Score not submitted.');
      return { success: false, error: 'Supabase not available' };
    }

    const { userId, playerName } = this.getUserInfo();

    try {
      const { data, error } = await window.SupabaseClient.client
        .from('leaderboard_scores')
        .insert({
          game_id: gameId,
          game_name: gameName,
          user_id: userId,
          player_name: playerName,
          score: score,
          score_type: scoreType,
          metadata: metadata
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to submit score:', error);
        return { success: false, error: error.message };
      }

      this.clearCache(gameId);

      console.log(`Score submitted: ${score} for ${gameName}`);
      return { success: true, data };
    } catch (error) {
      console.error('Error submitting score:', error);
      return { success: false, error: error.message };
    }
  }

  async getLeaderboard(gameId, limit = 10, scoreType = 'points') {
    if (!window.SupabaseClient?.client) {
      console.warn('Supabase not available. Returning empty leaderboard.');
      return [];
    }

    const cacheKey = `${gameId}_${limit}_${scoreType}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const isLowerBetter = scoreType === 'time' || scoreType === 'moves';

      const { data, error } = await window.SupabaseClient.client
        .from('leaderboard_scores')
        .select('*')
        .eq('game_id', gameId)
        .eq('score_type', scoreType)
        .order('score', { ascending: isLowerBetter })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch leaderboard:', error);
        return [];
      }

      this.cache.set(cacheKey, {
        data: data || [],
        timestamp: Date.now()
      });

      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  async getUserBestScore(gameId, scoreType = 'points') {
    if (!window.SupabaseClient?.client) {
      return null;
    }

    const { userId } = this.getUserInfo();
    const isLowerBetter = scoreType === 'time' || scoreType === 'moves';

    try {
      const { data, error } = await window.SupabaseClient.client
        .from('leaderboard_scores')
        .select('*')
        .eq('game_id', gameId)
        .eq('user_id', userId)
        .eq('score_type', scoreType)
        .order('score', { ascending: isLowerBetter })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Failed to fetch user best score:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user best score:', error);
      return null;
    }
  }

  async getUserRank(gameId, score, scoreType = 'points') {
    if (!window.SupabaseClient?.client) {
      return null;
    }

    try {
      const isLowerBetter = scoreType === 'time' || scoreType === 'moves';
      const operator = isLowerBetter ? 'lt' : 'gt';

      const { count, error } = await window.SupabaseClient.client
        .from('leaderboard_scores')
        .select('*', { count: 'exact', head: true })
        .eq('game_id', gameId)
        .eq('score_type', scoreType)
        [operator]('score', score);

      if (error) {
        console.error('Failed to fetch user rank:', error);
        return null;
      }

      return count + 1;
    } catch (error) {
      console.error('Error fetching user rank:', error);
      return null;
    }
  }

  clearCache(gameId = null) {
    if (gameId) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(gameId)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  createLeaderboardUI(scores, currentScore = null, scoreType = 'points') {
    if (!scores || scores.length === 0) {
      return `
        <div style="text-align: center; padding: 20px; color: #6b7280;">
          <p>No scores yet. Be the first!</p>
        </div>
      `;
    }

    const isLowerBetter = scoreType === 'time' || scoreType === 'moves';
    const { userId } = this.getUserInfo();

    const formatScore = (score, type) => {
      if (type === 'time') {
        return `${score}ms`;
      } else if (type === 'moves') {
        return `${score} moves`;
      }
      return score.toLocaleString();
    };

    const getRankEmoji = (rank) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return `${rank}.`;
    };

    return `
      <div style="background: #1f2937; border-radius: 12px; padding: 15px; margin-top: 15px;">
        <h3 style="color: #f9fafb; font-size: 16px; font-weight: bold; margin-bottom: 12px; text-align: center;">
          🏆 Leaderboard
        </h3>
        <div style="max-height: 300px; overflow-y: auto;">
          ${scores.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = entry.user_id === userId;
            const isNewScore = currentScore !== null && entry.score === currentScore && isCurrentUser;

            return `
              <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 12px;
                margin-bottom: 6px;
                background: ${isCurrentUser ? '#3b82f6' : '#374151'};
                border-radius: 8px;
                ${isNewScore ? 'animation: pulse 2s infinite;' : ''}
              ">
                <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
                  <span style="
                    font-size: ${rank <= 3 ? '20px' : '14px'};
                    font-weight: bold;
                    min-width: 30px;
                    color: ${isCurrentUser ? '#fff' : '#9ca3af'};
                  ">
                    ${getRankEmoji(rank)}
                  </span>
                  <span style="
                    color: ${isCurrentUser ? '#fff' : '#f9fafb'};
                    font-weight: ${isCurrentUser ? 'bold' : 'normal'};
                    font-size: 14px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  ">
                    ${entry.player_name}${isCurrentUser ? ' (You)' : ''}
                  </span>
                </div>
                <span style="
                  color: ${isCurrentUser ? '#fff' : '#f9fafb'};
                  font-weight: bold;
                  font-size: 16px;
                  white-space: nowrap;
                ">
                  ${formatScore(entry.score, scoreType)}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  async createLeaderboardElement(gameId, currentScore = null, scoreType = 'points') {
    const scores = await this.getLeaderboard(gameId, 10, scoreType);
    return this.createLeaderboardUI(scores, currentScore, scoreType);
  }
}

window.LeaderboardManager = new LeaderboardManager();
