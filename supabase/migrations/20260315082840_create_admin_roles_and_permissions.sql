/*
  # Create Admin Roles and Permissions System

  1. New Tables
    - `admin_roles`
      - `id` (uuid, primary key)
      - `role_name` (text, unique) - e.g., 'super_admin', 'moderator', 'content_manager'
      - `description` (text) - description of the role
      - `created_at` (timestamptz)
    
    - `admin_permissions`
      - `id` (uuid, primary key)
      - `permission_name` (text, unique) - e.g., 'manage_users', 'manage_challenges', 'view_analytics'
      - `description` (text) - description of what this permission allows
      - `created_at` (timestamptz)
    
    - `role_permissions`
      - `role_id` (uuid, foreign key to admin_roles)
      - `permission_id` (uuid, foreign key to admin_permissions)
      - `created_at` (timestamptz)
      - Primary key on (role_id, permission_id)
    
    - `user_admin_roles`
      - `user_id` (uuid, foreign key to auth.users)
      - `role_id` (uuid, foreign key to admin_roles)
      - `granted_by` (uuid, foreign key to auth.users) - who granted this role
      - `granted_at` (timestamptz)
      - Primary key on (user_id, role_id)

  2. Security
    - Enable RLS on all tables
    - Only super admins can manage roles and permissions
    - Admins can view their own roles and permissions
    - Add helper functions for permission checking

  3. Initial Data
    - Create default roles: super_admin, moderator, content_manager
    - Create default permissions
    - Assign all permissions to super_admin role
*/

-- Create admin_roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create admin_permissions table
CREATE TABLE IF NOT EXISTS admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_name text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id uuid REFERENCES admin_roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES admin_permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

-- Create user_admin_roles table
CREATE TABLE IF NOT EXISTS user_admin_roles (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES admin_roles(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- Enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_admin_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has a specific permission
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid uuid, perm_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_admin_roles uar
    JOIN role_permissions rp ON uar.role_id = rp.role_id
    JOIN admin_permissions ap ON rp.permission_id = ap.id
    WHERE uar.user_id = user_uuid
    AND ap.permission_name = perm_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION user_has_role(user_uuid uuid, r_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_admin_roles uar
    JOIN admin_roles ar ON uar.role_id = ar.id
    WHERE uar.user_id = user_uuid
    AND ar.role_name = r_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for admin_roles
CREATE POLICY "Admins can view all roles"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin_roles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can insert roles"
  ON admin_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update roles"
  ON admin_roles FOR UPDATE
  TO authenticated
  USING (user_has_role(auth.uid(), 'super_admin'))
  WITH CHECK (user_has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete roles"
  ON admin_roles FOR DELETE
  TO authenticated
  USING (user_has_role(auth.uid(), 'super_admin'));

-- RLS Policies for admin_permissions
CREATE POLICY "Admins can view all permissions"
  ON admin_permissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin_roles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can insert permissions"
  ON admin_permissions FOR INSERT
  TO authenticated
  WITH CHECK (user_has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update permissions"
  ON admin_permissions FOR UPDATE
  TO authenticated
  USING (user_has_role(auth.uid(), 'super_admin'))
  WITH CHECK (user_has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete permissions"
  ON admin_permissions FOR DELETE
  TO authenticated
  USING (user_has_role(auth.uid(), 'super_admin'));

-- RLS Policies for role_permissions
CREATE POLICY "Admins can view role permissions"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin_roles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage role permissions"
  ON role_permissions FOR ALL
  TO authenticated
  USING (user_has_role(auth.uid(), 'super_admin'))
  WITH CHECK (user_has_role(auth.uid(), 'super_admin'));

-- RLS Policies for user_admin_roles
CREATE POLICY "Users can view their own admin roles"
  ON user_admin_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can assign roles"
  ON user_admin_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can revoke roles"
  ON user_admin_roles FOR DELETE
  TO authenticated
  USING (user_has_role(auth.uid(), 'super_admin'));

-- Insert default roles
INSERT INTO admin_roles (role_name, description) VALUES
  ('super_admin', 'Full system access with all permissions'),
  ('moderator', 'Can manage users and moderate content'),
  ('content_manager', 'Can manage challenges and app content'),
  ('analytics_viewer', 'Can view analytics and reports')
ON CONFLICT (role_name) DO NOTHING;

-- Insert default permissions
INSERT INTO admin_permissions (permission_name, description) VALUES
  ('manage_users', 'Create, update, and delete user accounts'),
  ('manage_roles', 'Assign and revoke admin roles'),
  ('manage_challenges', 'Create, update, and delete daily challenges'),
  ('manage_leaderboard', 'Modify leaderboard scores and rankings'),
  ('view_analytics', 'Access analytics and user statistics'),
  ('manage_permissions', 'Create and modify permission settings'),
  ('ban_users', 'Ban or suspend user accounts'),
  ('moderate_content', 'Review and moderate user-generated content')
ON CONFLICT (permission_name) DO NOTHING;

-- Assign all permissions to super_admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE role_name = 'super_admin'),
  id
FROM admin_permissions
ON CONFLICT DO NOTHING;

-- Assign permissions to moderator role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE role_name = 'moderator'),
  id
FROM admin_permissions
WHERE permission_name IN ('manage_users', 'ban_users', 'moderate_content', 'view_analytics')
ON CONFLICT DO NOTHING;

-- Assign permissions to content_manager role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE role_name = 'content_manager'),
  id
FROM admin_permissions
WHERE permission_name IN ('manage_challenges', 'view_analytics')
ON CONFLICT DO NOTHING;

-- Assign permissions to analytics_viewer role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE role_name = 'analytics_viewer'),
  id
FROM admin_permissions
WHERE permission_name IN ('view_analytics')
ON CONFLICT DO NOTHING;