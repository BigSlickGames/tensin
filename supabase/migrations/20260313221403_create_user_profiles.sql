/*
  # Create User Profiles Table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique, not null)
      - `first_name` (text)
      - `last_name` (text)
      - `level` (integer, default 1)
      - `total_score` (integer, default 0)
      - `total_wins` (integer, default 0)
      - `rank` (integer, default 0)
      - `achievements` (jsonb, array of achievement codes)
      - `last_login` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policy for users to read all profiles (for leaderboards)
    - Add policy for users to update only their own profile
    - Add policy for users to read their own profile
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text,
  level integer DEFAULT 1,
  total_score integer DEFAULT 0,
  total_wins integer DEFAULT 0,
  rank integer DEFAULT 0,
  achievements jsonb DEFAULT '[]'::jsonb,
  last_login timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);