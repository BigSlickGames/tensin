/*
  # Add email column to user_profiles

  1. Changes
    - Add `email` column to `user_profiles` table (text, nullable for backward compatibility)
    - Add index on email for faster lookups
  
  2. Notes
    - Email is nullable to support existing users who registered before this change
    - New users (Google OAuth and email/password) will have email populated
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email text;
    CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
  END IF;
END $$;
