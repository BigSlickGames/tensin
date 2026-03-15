/*
  # Create Admin Account Security

  1. Changes
    - Add unique constraint on email in user_profiles
    - Add trigger to prevent any user except admin@tensin.com from having is_admin=true
    - Add function to enforce single admin policy

  2. Security
    - Only admin@tensin.com can have is_admin=true
    - Any attempt to set is_admin=true on other accounts will be blocked
    - Existing admin privileges are protected
*/

-- Add unique constraint on email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_profiles_email_key'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- Create function to enforce single admin policy
CREATE OR REPLACE FUNCTION enforce_single_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow admin@tensin.com to have is_admin=true
  IF NEW.is_admin = true AND NEW.email != 'admin@tensin.com' THEN
    RAISE EXCEPTION 'Only admin@tensin.com can have admin privileges';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS check_admin_privileges ON user_profiles;

CREATE TRIGGER check_admin_privileges
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_admin();

-- Ensure no existing users have admin privileges except admin@tensin.com
UPDATE user_profiles
SET is_admin = false
WHERE email != 'admin@tensin.com' AND is_admin = true;
