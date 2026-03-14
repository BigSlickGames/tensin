/*
  # Create User Challenge Progress Table

  1. New Tables
    - `user_challenge_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `challenge_id` (text) - The challenge type (login, play-3-games, etc.)
      - `progress` (integer) - Current progress toward goal
      - `target` (integer) - Goal/target for completion
      - `completed` (boolean) - Whether challenge is completed
      - `completed_at` (timestamptz) - When completed
      - `reset_at` (date) - The date this progress was last reset (for daily tracking)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `user_challenge_progress` table
    - Add policy for users to read their own progress
    - Add policy for users to update their own progress
    - Add policy for users to insert their own progress
*/

CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id text NOT NULL,
  progress integer DEFAULT 0,
  target integer NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  reset_at date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id, reset_at)
);

ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own challenge progress"
  ON user_challenge_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenge progress"
  ON user_challenge_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress"
  ON user_challenge_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create an index for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user_id 
  ON user_challenge_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_reset_at 
  ON user_challenge_progress(reset_at);
