-- ============================================
-- MANUAL ADMIN ROLE ASSIGNMENT SCRIPT
-- ============================================
-- Run this in Supabase SQL Editor to assign admin roles to users
--
-- USAGE INSTRUCTIONS:
-- 1. Find the user's ID from auth.users table
-- 2. Replace 'USER_EMAIL_HERE' with the actual user email
-- 3. Replace 'ROLE_NAME_HERE' with desired role
-- 4. Run the query in Supabase SQL Editor
--
-- Available roles:
-- - super_admin (full access)
-- - moderator (user management, moderation)
-- - content_manager (challenge management)
-- - analytics_viewer (view only)
-- ============================================

-- METHOD 1: Assign role by user email
-- Replace 'user@example.com' with actual email
-- Replace 'super_admin' with desired role

INSERT INTO user_admin_roles (user_id, role_id, granted_by)
SELECT
  au.id as user_id,
  ar.id as role_id,
  au.id as granted_by  -- self-granted for initial setup
FROM auth.users au
CROSS JOIN admin_roles ar
WHERE au.email = 'user@example.com'  -- CHANGE THIS
  AND ar.role_name = 'super_admin'   -- CHANGE THIS
ON CONFLICT (user_id, role_id) DO NOTHING;


-- ============================================
-- METHOD 2: Assign role by user ID directly
-- Replace the UUID with actual user ID
-- ============================================

-- INSERT INTO user_admin_roles (user_id, role_id, granted_by)
-- SELECT
--   'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'::uuid as user_id,
--   ar.id as role_id,
--   'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'::uuid as granted_by
-- FROM admin_roles ar
-- WHERE ar.role_name = 'super_admin'  -- CHANGE THIS
-- ON CONFLICT (user_id, role_id) DO NOTHING;


-- ============================================
-- HELPFUL QUERIES
-- ============================================

-- View all users and their emails (to find user IDs)
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- View all available roles
-- SELECT id, role_name, description FROM admin_roles;

-- View all current admin role assignments
-- SELECT
--   au.email,
--   ar.role_name,
--   uar.granted_at
-- FROM user_admin_roles uar
-- JOIN auth.users au ON uar.user_id = au.id
-- JOIN admin_roles ar ON uar.role_id = ar.id
-- ORDER BY uar.granted_at DESC;

-- View user's permissions
-- SELECT
--   au.email,
--   ar.role_name,
--   ap.permission_name
-- FROM user_admin_roles uar
-- JOIN auth.users au ON uar.user_id = au.id
-- JOIN admin_roles ar ON uar.role_id = ar.id
-- JOIN role_permissions rp ON ar.id = rp.role_id
-- JOIN admin_permissions ap ON rp.permission_id = ap.id
-- WHERE au.email = 'user@example.com'  -- CHANGE THIS
-- ORDER BY ar.role_name, ap.permission_name;

-- Remove admin role from user
-- DELETE FROM user_admin_roles
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com')
--   AND role_id = (SELECT id FROM admin_roles WHERE role_name = 'super_admin');
