/*
  # Create Daily Challenges System

  1. New Tables
    - `daily_challenges`
      - `id` (uuid, primary key) - Unique challenge ID
      - `challenge_date` (date, unique) - Date of the challenge
      - `game_id` (text) - ID of the game for this challenge
      - `game_name` (text) - Display name of the game
      - `created_at` (timestamptz) - When challenge was created
      
    - `daily_challenge_scores`
      - `id` (uuid, primary key) - Unique score ID
      - `challenge_id` (uuid, foreign key) - Reference to daily_challenges
      - `player_id` (text) - Telegram user ID or anonymous ID
      - `player_name` (text) - Player display name
      - `score` (integer) - Score achieved
      - `score_type` (text) - Type of score (points, time, moves)
      - `metadata` (jsonb) - Additional game data
      - `created_at` (timestamptz) - When score was submitted
      - Unique constraint on (challenge_id, player_id) - One score per player per day

  2. Security
    - Enable RLS on both tables
    - Public read access for viewing challenges and scores
    - Authenticated and anonymous users can submit scores
    - Players can only submit one score per challenge

  3. Indexes
    - Index on challenge_date for quick lookups
    - Index on challenge_id for leaderboard queries
    - Composite index on (challenge_id, score) for rankings
*/

-- Create daily_challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date date UNIQUE NOT NULL,
  game_id text NOT NULL,
  game_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create daily_challenge_scores table
CREATE TABLE IF NOT EXISTS daily_challenge_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES daily_challenges(id) ON DELETE CASCADE NOT NULL,
  player_id text NOT NULL,
  player_name text NOT NULL,
  score integer NOT NULL,
  score_type text NOT NULL DEFAULT 'points',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, player_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_daily_challenge_scores_challenge ON daily_challenge_scores(challenge_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenge_scores_ranking ON daily_challenge_scores(challenge_id, score DESC);

-- Enable RLS
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenge_scores ENABLE ROW LEVEL SECURITY;

-- Policies for daily_challenges
CREATE POLICY "Anyone can view challenges"
  ON daily_challenges FOR SELECT
  USING (true);

CREATE POLICY "Service can create challenges"
  ON daily_challenges FOR INSERT
  WITH CHECK (true);

-- Policies for daily_challenge_scores
CREATE POLICY "Anyone can view challenge scores"
  ON daily_challenge_scores FOR SELECT
  USING (true);

CREATE POLICY "Anyone can submit challenge scores"
  ON daily_challenge_scores FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Players cannot update challenge scores"
  ON daily_challenge_scores FOR UPDATE
  USING (false);

CREATE POLICY "Players cannot delete challenge scores"
  ON daily_challenge_scores FOR DELETE
  USING (false);