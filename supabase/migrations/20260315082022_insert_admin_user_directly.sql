/*
  # Create Admin User Account Directly

  1. Changes
    - Insert admin user directly into auth.users with hashed password
    - Insert admin profile into user_profiles
    - Ensure admin has proper credentials and privileges

  2. Security
    - Admin email: admin@tensin.com
    - Password will be: Tensin@6 (hashed via crypt extension)
    - Only this account can have is_admin=true (enforced by trigger)

  3. Important Notes
    - Uses pgcrypto extension for password hashing
    - Email confirmation is bypassed for admin account
    - Admin gets 999,999 bankroll vs regular 1,000
*/

-- Ensure pgcrypto extension is available for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Delete any existing admin account to start fresh
DELETE FROM auth.users WHERE email = 'admin@tensin.com';
DELETE FROM user_profiles WHERE email = 'admin@tensin.com';

-- Insert admin user into auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@tensin.com',
  crypt('Tensin@6', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"username": "admin", "first_name": "Admin", "last_name": "Tensin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
RETURNING id;

-- Insert admin profile using the user ID we just created
INSERT INTO user_profiles (
  id,
  username,
  first_name,
  last_name,
  email,
  is_admin,
  experience,
  bankroll,
  total_score,
  total_wins,
  rank,
  achievements
)
SELECT 
  id,
  'admin',
  'Admin',
  'Tensin',
  'admin@tensin.com',
  true,
  0,
  999999,
  0,
  0,
  0,
  '[]'::jsonb
FROM auth.users
WHERE email = 'admin@tensin.com';
