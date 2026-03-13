/*
  # Add Bankroll and Experience System
  
  1. Changes
    - Add `bankroll` column (integer, default 1000) - player's currency balance
    - Add `experience` column (integer, default 0) - experience points for leveling
    
  2. Notes
    - Bankroll starts at 1000 coins for new players
    - Experience determines level progression
    - Level calculation: Level = floor(experience / 100) + 1
    - Each level requires 100 XP (Level 1: 0-99 XP, Level 2: 100-199 XP, etc.)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'bankroll'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN bankroll integer DEFAULT 1000;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'experience'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN experience integer DEFAULT 0;
  END IF;
END $$;
