/*
  # Create App Store Data Tables

  1. New Tables
    - `module_metadata`
      - `id` (text, primary key) - module ID
      - `name` (text) - module name
      - `icon` (text) - module icon emoji
      - `type` (text) - module type (game, tool, utility)
      - `description` (text) - module description
      - `is_featured` (boolean) - whether module is featured
      - `launch_count` (integer) - total launches
      - `created_at` (timestamptz) - when module was added
      - `updated_at` (timestamptz) - last update time

  2. Security
    - Enable RLS on `module_metadata` table
    - Add policy for anyone to read module metadata
    - Add policy for system to manage metadata
*/

CREATE TABLE IF NOT EXISTS module_metadata (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text DEFAULT '📦',
  type text DEFAULT 'tool',
  description text DEFAULT '',
  is_featured boolean DEFAULT false,
  launch_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE module_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read module metadata"
  ON module_metadata
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage module metadata"
  ON module_metadata
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_module_featured ON module_metadata(is_featured, launch_count DESC);
CREATE INDEX IF NOT EXISTS idx_module_launch_count ON module_metadata(launch_count DESC);
CREATE INDEX IF NOT EXISTS idx_module_created_at ON module_metadata(created_at DESC);
