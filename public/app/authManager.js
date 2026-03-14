class AuthManager {
  constructor() {
    this.currentUser = null;
    this.supabase = null;
  }

  async initialize() {
    if (window.SupabaseClient && window.SupabaseClient.isAvailable) {
      this.supabase = window.SupabaseClient.client;

      const { data: { session } } = await this.supabase.auth.getSession();
      if (session) {
        await this.loadUserProfile(session.user.id);
      } else if (window.TelegramAdapter && window.TelegramAdapter.isAvailable) {
        await this.authenticateWithTelegram();
      }

      this.supabase.auth.onAuthStateChange((event, session) => {
        (async () => {
          if (event === 'SIGNED_IN' && session) {
            await this.loadUserProfile(session.user.id);
            if (window.UIManager) {
              window.UIManager.refresh();
            }
          } else if (event === 'SIGNED_OUT') {
            this.currentUser = null;
            if (window.UIManager) {
              window.UIManager.refresh();
            }
          }
        })();
      });
    }
  }

  async loadUserProfile(userId) {
    try {
      let { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!data) {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (user) {
          const username = user.user_metadata?.username ||
                          user.user_metadata?.preferred_username ||
                          user.email?.split('@')[0] ||
                          `user_${userId.substring(0, 8)}`;

          const firstName = user.user_metadata?.first_name ||
                           user.user_metadata?.given_name ||
                           user.user_metadata?.name?.split(' ')[0] ||
                           'User';

          const lastName = user.user_metadata?.last_name ||
                          user.user_metadata?.family_name ||
                          user.user_metadata?.name?.split(' ').slice(1).join(' ') ||
                          '';

          const { data: newProfile, error: insertError } = await this.supabase
            .from('user_profiles')
            .insert({
              id: userId,
              username,
              first_name: firstName,
              last_name: lastName,
              email: user.email,
              experience: 0,
              bankroll: 1000,
              total_score: 0,
              total_wins: 0,
              rank: 0,
              achievements: []
            })
            .select()
            .single();

          if (!insertError) {
            data = newProfile;
          }
        }
      }

      if (data) {
        if (window.ProgressionManager) {
          data.level = window.ProgressionManager.calculateLevel(data.experience || 0);
        }
        this.currentUser = data;
        await this.updateLastLogin(userId);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  }

  async updateLastLogin(userId) {
    try {
      await this.supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (err) {
      console.error('Error updating last login:', err);
    }
  }

  async authenticateWithTelegram() {
    try {
      if (!window.TelegramAdapter || !window.TelegramAdapter.isAvailable) {
        return { success: false, error: 'Telegram not available' };
      }

      const telegramUser = window.TelegramAdapter.getUser();
      const webApp = window.TelegramAdapter.webApp;

      if (!webApp || !webApp.initData) {
        return { success: false, error: 'No Telegram init data' };
      }

      const initData = webApp.initDataUnsafe;
      const telegramData = {
        id: telegramUser.id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        auth_date: initData.auth_date,
        hash: initData.hash
      };

      const apiUrl = `${window.ENV?.VITE_SUPABASE_URL}/functions/v1/telegram-auth`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramData })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Authentication failed');
      }

      if (result.session?.properties?.access_token) {
        const { error } = await this.supabase.auth.setSession({
          access_token: result.session.properties.access_token,
          refresh_token: result.session.properties.refresh_token
        });

        if (error) throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Telegram auth error:', error);
      return { success: false, error: error.message };
    }
  }

  async signInWithGoogle() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  async signUpWithEmail(email, username, password, firstName, lastName = '') {
    try {
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await this.supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            username,
            first_name: firstName,
            last_name: lastName,
            email: email,
            experience: 0,
            bankroll: 1000,
            total_score: 0,
            total_wins: 0,
            rank: 0,
            achievements: []
          });

        if (profileError) throw profileError;

        await this.loadUserProfile(authData.user.id);
        return { success: true };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  async signInWithEmail(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        await this.loadUserProfile(data.user.id);
        return { success: true };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  async signUp(username, password, firstName, lastName = '') {
    const email = `${username}@tensins.local`;
    return this.signUpWithEmail(email, username, password, firstName, lastName);
  }

  async signIn(username, password) {
    const email = `${username}@tensins.local`;
    return this.signInWithEmail(email, password);
  }

  async signOut() {
    try {
      await this.supabase.auth.signOut();
      this.currentUser = null;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async updateUserStats(scoreChange, winsChange = 0) {
    if (!this.currentUser) return;

    try {
      const newScore = this.currentUser.total_score + scoreChange;
      const newWins = this.currentUser.total_wins + winsChange;

      const { error } = await this.supabase
        .from('user_profiles')
        .update({
          total_score: newScore,
          total_wins: newWins,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentUser.id);

      if (!error) {
        this.currentUser.total_score = newScore;
        this.currentUser.total_wins = newWins;
      }
    } catch (err) {
      console.error('Error updating user stats:', err);
    }
  }

  async updateBankroll(amount) {
    if (!this.currentUser) return false;

    try {
      const newBankroll = this.currentUser.bankroll + amount;

      if (newBankroll < 0) {
        return false;
      }

      const { error } = await this.supabase
        .from('user_profiles')
        .update({
          bankroll: newBankroll,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentUser.id);

      if (!error) {
        this.currentUser.bankroll = newBankroll;
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating bankroll:', err);
      return false;
    }
  }

  async addExperience(amount) {
    if (!this.currentUser) return;

    try {
      const newExperience = this.currentUser.experience + amount;
      const oldLevel = this.currentUser.level;
      const newLevel = Math.floor(newExperience / 1000) + 1;

      const { error } = await this.supabase
        .from('user_profiles')
        .update({
          experience: newExperience,
          level: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentUser.id);

      if (!error) {
        this.currentUser.experience = newExperience;
        this.currentUser.level = newLevel;

        if (newLevel > oldLevel) {
          return { leveledUp: true, newLevel };
        }
      }
      return { leveledUp: false };
    } catch (err) {
      console.error('Error adding experience:', err);
      return { leveledUp: false };
    }
  }

  getBankroll() {
    return this.currentUser?.bankroll || 0;
  }

  getExperience() {
    return this.currentUser?.experience || 0;
  }

  getLevel() {
    return this.currentUser?.level || 1;
  }
}

window.AuthManager = new AuthManager();
