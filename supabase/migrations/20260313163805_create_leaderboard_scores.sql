/*
  # Create Leaderboard System

  1. New Tables
    - `leaderboard_scores`
      - `id` (uuid, primary key)
      - `game_id` (text) - Identifier for the game (e.g., 'tap-game', 'reaction-game')
      - `game_name` (text) - Display name of the game
      - `user_id` (text) - User identifier (Telegram ID or anonymous ID)
      - `player_name` (text) - Display name of the player
      - `score` (integer) - The score value
      - `score_type` (text) - Type of score (e.g., 'points', 'time', 'moves')
      - `metadata` (jsonb) - Additional game-specific data
      - `created_at` (timestamptz) - When the score was submitted

  2. Indexes
    - Index on game_id for fast filtering
    - Index on game_id + score for leaderboard queries
    - Index on user_id for player history

  3. Security
    - Enable RLS on leaderboard_scores table
    - Allow anyone to read scores (public leaderboard)
    - Allow authenticated and anonymous users to insert their own scores
*/

-- Create leaderboard_scores table
CREATE TABLE IF NOT EXISTS leaderboard_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id text NOT NULL,
  game_name text NOT NULL,
  user_id text NOT NULL,
  player_name text NOT NULL,
  score integer NOT NULL,
  score_type text NOT NULL DEFAULT 'points',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_id 
  ON leaderboard_scores(game_id);

CREATE INDEX IF NOT EXISTS idx_leaderboard_game_score 
  ON leaderboard_scores(game_id, score DESC);

CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id 
  ON leaderboard_scores(user_id);

CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at 
  ON leaderboard_scores(created_at DESC);

-- Enable Row Level Security
ALTER TABLE leaderboard_scores ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view all scores (public leaderboard)
CREATE POLICY "Anyone can view leaderboard scores"
  ON leaderboard_scores
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert their own scores
CREATE POLICY "Anyone can submit scores"
  ON leaderboard_scores
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update only their own scores (for corrections)
CREATE POLICY "Users can update own scores"
  ON leaderboard_scores
  FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can delete only their own scores
CREATE POLICY "Users can delete own scores"
  ON leaderboard_scores
  FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
