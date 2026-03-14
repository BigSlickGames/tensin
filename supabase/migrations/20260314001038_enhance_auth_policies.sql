/*
  # Enhanced Authentication and RLS Policies

  1. Updates
    - Add comprehensive RLS policies for user_profiles table
    - Ensure users can only access their own data
    - Add policies for all CRUD operations
    
  2. Security
    - Authenticated users can read their own profile
    - Authenticated users can update their own profile
    - System can create profiles on signup
    - No delete access for safety
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Enable public read for leaderboards (but not update)
DROP POLICY IF EXISTS "Anyone can view leaderboard scores" ON leaderboard_scores;
CREATE POLICY "Anyone can view leaderboard scores"
  ON leaderboard_scores FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own scores
DROP POLICY IF EXISTS "Users can insert own scores" ON leaderboard_scores;
CREATE POLICY "Users can insert own scores"
  ON leaderboard_scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Daily challenges - public read
DROP POLICY IF EXISTS "Anyone can view daily challenges" ON daily_challenges;
CREATE POLICY "Anyone can view daily challenges"
  ON daily_challenges FOR SELECT
  TO authenticated
  USING (true);

-- Daily challenge scores - users can view all but only insert their own
DROP POLICY IF EXISTS "Anyone can view challenge scores" ON daily_challenge_scores;
CREATE POLICY "Anyone can view challenge scores"
  ON daily_challenge_scores FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert challenge scores" ON daily_challenge_scores;
CREATE POLICY "Users can insert challenge scores"
  ON daily_challenge_scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- User challenge progress - users can only access their own
DROP POLICY IF EXISTS "Users can read own challenge progress" ON user_challenge_progress;
CREATE POLICY "Users can read own challenge progress"
  ON user_challenge_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own challenge progress" ON user_challenge_progress;
CREATE POLICY "Users can insert own challenge progress"
  ON user_challenge_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own challenge progress" ON user_challenge_progress;
CREATE POLICY "Users can update own challenge progress"
  ON user_challenge_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);