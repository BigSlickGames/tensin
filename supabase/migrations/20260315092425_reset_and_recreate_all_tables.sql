/*
  # Reset Database and Recreate All Tables

  ## Overview
  Drops all existing tables and recreates the complete database schema from scratch.
  This migration creates all tables needed for the gaming platform including:
  - User profiles with auth integration
  - Leaderboards and game scoring
  - Daily challenges and progress tracking
  - Admin roles and permissions
  - Analytics and revenue tracking

  ## Important Notes
  1. This migration drops ALL existing data
  2. Creates fresh schema with proper RLS policies
  3. Sets up automatic triggers for profile creation
  4. Configures admin role system with granular permissions

  ## Tables Created
  1. user_profiles - Core user data with bankroll and experience
  2. leaderboard_scores - Game scores and rankings
  3. daily_challenges - Daily challenge definitions
  4. daily_challenge_scores - User scores for daily challenges
  5. user_challenge_progress - Track user progress on challenges
  6. admin_roles - Admin role definitions
  7. admin_permissions - Granular permission definitions
  8. role_permissions - Links roles to permissions
  9. user_admin_roles - Assigns roles to users
  10. admin_activity_logs - Audit log for admin actions
  11. revenue_tracking - Financial transaction tracking
  12. system_analytics - System metrics and analytics

  ## Security
  All tables have RLS enabled with appropriate policies
*/

-- Drop all existing tables in reverse dependency order
DROP TABLE IF EXISTS user_admin_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS admin_permissions CASCADE;
DROP TABLE IF EXISTS admin_roles CASCADE;
DROP TABLE IF EXISTS system_analytics CASCADE;
DROP TABLE IF EXISTS marketing_campaigns CASCADE;
DROP TABLE IF EXISTS revenue_tracking CASCADE;
DROP TABLE IF EXISTS admin_activity_logs CASCADE;
DROP TABLE IF EXISTS user_challenge_progress CASCADE;
DROP TABLE IF EXISTS daily_challenge_scores CASCADE;
DROP TABLE IF EXISTS daily_challenges CASCADE;
DROP TABLE IF EXISTS leaderboard_scores CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS module_metadata CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =============================================================================
-- USER PROFILES TABLE
-- =============================================================================

CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE,
  telegram_id text UNIQUE,
  bankroll integer DEFAULT 1000 NOT NULL,
  experience integer DEFAULT 0 NOT NULL,
  avatar_url text,
  first_name text,
  last_name text,
  is_admin boolean DEFAULT false NOT NULL,
  last_login timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE INDEX idx_user_profiles_telegram_id ON user_profiles(telegram_id);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_experience ON user_profiles(experience DESC);

-- =============================================================================
-- LEADERBOARD TABLES
-- =============================================================================

CREATE TABLE leaderboard_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id text NOT NULL,
  game_name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  player_name text NOT NULL,
  score integer NOT NULL,
  score_type text DEFAULT 'points' NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE leaderboard_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard scores"
  ON leaderboard_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert scores"
  ON leaderboard_scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_leaderboard_game_id ON leaderboard_scores(game_id);
CREATE INDEX idx_leaderboard_score ON leaderboard_scores(score DESC);
CREATE INDEX idx_leaderboard_user_id ON leaderboard_scores(user_id);

-- =============================================================================
-- DAILY CHALLENGES
-- =============================================================================

CREATE TABLE daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date date UNIQUE NOT NULL,
  game_id text NOT NULL,
  game_name text NOT NULL,
  description text,
  target_score integer,
  reward_experience integer DEFAULT 100,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily challenges"
  ON daily_challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage challenges"
  ON daily_challenges FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

CREATE INDEX idx_daily_challenges_date ON daily_challenges(challenge_date DESC);

-- =============================================================================
-- DAILY CHALLENGE SCORES
-- =============================================================================

CREATE TABLE daily_challenge_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES daily_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player_name text NOT NULL,
  score integer NOT NULL,
  score_type text DEFAULT 'points' NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE daily_challenge_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all challenge scores"
  ON daily_challenge_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own challenge scores"
  ON daily_challenge_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_daily_challenge_scores_challenge ON daily_challenge_scores(challenge_id);
CREATE INDEX idx_daily_challenge_scores_user ON daily_challenge_scores(user_id);

-- =============================================================================
-- USER CHALLENGE PROGRESS
-- =============================================================================

CREATE TABLE user_challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id text NOT NULL,
  progress integer DEFAULT 0 NOT NULL,
  target integer NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  completed_at timestamptz,
  reset_at date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, challenge_id, reset_at)
);

ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_challenge_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_challenge_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_challenge_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_challenge_progress_user ON user_challenge_progress(user_id);
CREATE INDEX idx_user_challenge_progress_reset ON user_challenge_progress(reset_at);

-- =============================================================================
-- ADMIN ROLES AND PERMISSIONS
-- =============================================================================

CREATE TABLE admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text UNIQUE NOT NULL,
  description text DEFAULT '' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view roles"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only super admins can manage roles"
  ON admin_roles FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

-- Create default admin roles
INSERT INTO admin_roles (role_name, description) VALUES
  ('super_admin', 'Full system access with all permissions'),
  ('content_moderator', 'Can moderate user content and manage challenges'),
  ('analytics_viewer', 'Can view analytics and reports'),
  ('support_agent', 'Can assist users and view basic data');

CREATE TABLE admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_name text UNIQUE NOT NULL,
  description text DEFAULT '' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view permissions"
  ON admin_permissions FOR SELECT
  TO authenticated
  USING (true);

-- Create default permissions
INSERT INTO admin_permissions (permission_name, description) VALUES
  ('manage_users', 'Create, edit, and delete user accounts'),
  ('manage_content', 'Create, edit, and delete game content'),
  ('manage_challenges', 'Create and manage daily challenges'),
  ('view_analytics', 'Access analytics and reporting'),
  ('manage_revenue', 'View and manage revenue data'),
  ('manage_admins', 'Assign and revoke admin roles'),
  ('view_logs', 'View system and admin activity logs'),
  ('manage_system', 'Configure system settings');

CREATE TABLE role_permissions (
  role_id uuid REFERENCES admin_roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES admin_permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (role_id, permission_id)
);

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view role permissions"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM admin_roles r, admin_permissions p
WHERE r.role_name = 'super_admin';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM admin_roles r, admin_permissions p
WHERE r.role_name = 'content_moderator' AND p.permission_name IN ('manage_content', 'manage_challenges', 'view_logs');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM admin_roles r, admin_permissions p
WHERE r.role_name = 'analytics_viewer' AND p.permission_name IN ('view_analytics', 'view_logs');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM admin_roles r, admin_permissions p
WHERE r.role_name = 'support_agent' AND p.permission_name IN ('view_analytics');

CREATE TABLE user_admin_roles (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES admin_roles(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, role_id)
);

ALTER TABLE user_admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own admin roles"
  ON user_admin_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage admin roles"
  ON user_admin_roles FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

-- =============================================================================
-- ADMIN ACTIVITY LOGS
-- =============================================================================

CREATE TABLE admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  action_details jsonb DEFAULT '{}'::jsonb,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity logs"
  ON admin_activity_logs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "System can insert activity logs"
  ON admin_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_admin_logs_admin ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_logs_created ON admin_activity_logs(created_at DESC);

-- =============================================================================
-- REVENUE TRACKING
-- =============================================================================

CREATE TABLE revenue_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  transaction_type text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD' NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view revenue"
  ON revenue_tracking FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "System can insert revenue records"
  ON revenue_tracking FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_revenue_created ON revenue_tracking(created_at DESC);
CREATE INDEX idx_revenue_user ON revenue_tracking(user_id);

-- =============================================================================
-- SYSTEM ANALYTICS
-- =============================================================================

CREATE TABLE system_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_type text NOT NULL,
  dimensions jsonb DEFAULT '{}'::jsonb,
  recorded_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE system_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view analytics"
  ON system_analytics FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "System can insert analytics"
  ON system_analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_analytics_metric ON system_analytics(metric_name);
CREATE INDEX idx_analytics_recorded ON system_analytics(recorded_at DESC);

-- =============================================================================
-- TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_challenge_progress_updated_at
  BEFORE UPDATE ON user_challenge_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
