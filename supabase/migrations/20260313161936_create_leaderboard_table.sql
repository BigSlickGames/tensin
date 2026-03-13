/*
  # Create Leaderboard System

  ## Overview
  This migration creates a leaderboard system for tracking game scores across the platform.

  ## 1. New Tables
  
  ### `leaderboard`
  Stores all game scores and player information.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each score entry
  - `game_id` (text, not null) - Identifier for the game (e.g., 'tap-game', 'memory-game')
  - `player_name` (text, not null) - Display name of the player
  - `score` (integer, not null) - Score achieved by the player
  - `user_id` (text, not null) - Unique user identifier (Telegram ID or local ID)
  - `played_at` (timestamptz, not null) - Timestamp when the score was recorded
  - `created_at` (timestamptz, default now()) - Record creation timestamp

  **Indexes:**
  - Index on `game_id` for efficient game-specific queries
  - Index on `user_id` for efficient user-specific queries
  - Composite index on `(game_id, score DESC)` for leaderboard queries

  ## 2. Security
  
  **Row Level Security (RLS):**
  - RLS enabled on `leaderboard` table
  - Public read access for leaderboard viewing
  - Authenticated and anonymous users can insert their own scores
  - No update or delete permissions (scores are immutable for integrity)

  **Policies:**
  1. Anyone can view leaderboard entries
  2. Anyone can insert their own scores
  3. No updates or deletes allowed (data integrity)

  ## 3. Design Decisions
  
  - Scores are immutable once saved (no updates/deletes) to maintain leaderboard integrity
  - Uses text-based `game_id` for flexibility with dynamic module system
  - Supports both Telegram users and local anonymous users via `user_id`
  - Timestamps enable time-based queries and historical analysis
*/

CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id text NOT NULL,
  player_name text NOT NULL,
  score integer NOT NULL,
  user_id text NOT NULL,
  played_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_game_id ON leaderboard(game_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_score ON leaderboard(game_id, score DESC);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard entries"
  ON leaderboard
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert scores"
  ON leaderboard
  FOR INSERT
  WITH CHECK (true);
