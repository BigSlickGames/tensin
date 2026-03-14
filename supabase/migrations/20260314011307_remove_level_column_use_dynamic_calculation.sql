/*
  # Remove Level Column - Use Dynamic Calculation
  
  1. Changes
    - Remove `level` column from `user_profiles` table
    - Level will now be calculated dynamically from experience using: Level = floor(experience / 100) + 1
    
  2. Notes
    - Level 1: 0-99 XP
    - Level 2: 100-199 XP
    - Level 3: 200-299 XP
    - Level N: (N-1)*100 to N*100-1 XP
    - This ensures that winning chips = gaining XP, and each level requires winning that many chips
    - Example: Level 25 requires 2400-2499 XP (need to win 2400-2499 chips total)
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'level'
  ) THEN
    ALTER TABLE user_profiles DROP COLUMN level;
  END IF;
END $$;
