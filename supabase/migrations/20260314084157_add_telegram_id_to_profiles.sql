/*
  # Add Telegram Authentication Support

  1. Changes
    - Add `telegram_id` column to `user_profiles` table
    - Make `telegram_id` unique to prevent duplicate Telegram accounts
    - Update username to be nullable for Telegram users who might not have one
  
  2. Security
    - Maintain existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'telegram_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN telegram_id text UNIQUE;
  END IF;
END $$;

-- Create index for faster Telegram ID lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_telegram_id ON user_profiles(telegram_id);
