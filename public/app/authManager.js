class AuthManager {
  constructor() {
    this.currentUser = null;
    this.supabase = null;
  }

  async initialize() {
    const supabaseUrl = window.ENV?.VITE_SUPABASE_URL;
    const supabaseKey = window.ENV?.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && typeof supabase !== 'undefined') {
      this.supabase = supabase.createClient(supabaseUrl, supabaseKey);

      const { data: { session } } = await this.supabase.auth.getSession();
      if (session) {
        await this.loadUserProfile(session.user.id);
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
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
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

  async signUp(username, password, firstName, lastName = '') {
    try {
      const email = `${username}@tensins.local`;

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
            level: 1,
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

  async signIn(username, password) {
    try {
      const email = `${username}@tensins.local`;

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
