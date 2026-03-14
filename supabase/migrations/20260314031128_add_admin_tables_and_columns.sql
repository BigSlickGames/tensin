/*
  # Add Admin Tables and Columns

  1. Changes
    - Add `is_admin` column to `user_profiles` table to identify admin users
    - Create `admin_activity_logs` table to track all admin actions
    - Create `revenue_tracking` table for revenue management
    - Create `marketing_campaigns` table for marketing management
    - Create `system_analytics` table for platform-wide analytics
    
  2. Security
    - Enable RLS on all new tables
    - Add policies for admin-only access
    - Ensure regular users cannot access admin data
*/

-- Add is_admin column to user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Create admin activity logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) NOT NULL,
  action_type text NOT NULL,
  action_details jsonb DEFAULT '{}',
  target_user_id uuid REFERENCES auth.users(id),
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view activity logs"
  ON admin_activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can insert activity logs"
  ON admin_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create revenue tracking table
CREATE TABLE IF NOT EXISTS revenue_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  transaction_type text NOT NULL,
  amount decimal(10, 2) NOT NULL,
  currency text DEFAULT 'USD',
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view revenue"
  ON revenue_tracking FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can insert revenue"
  ON revenue_tracking FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create marketing campaigns table
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'draft',
  start_date timestamptz,
  end_date timestamptz,
  target_audience jsonb DEFAULT '{}',
  budget decimal(10, 2),
  spent decimal(10, 2) DEFAULT 0,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view campaigns"
  ON marketing_campaigns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can manage campaigns"
  ON marketing_campaigns FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create system analytics table
CREATE TABLE IF NOT EXISTS system_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_type text NOT NULL,
  dimensions jsonb DEFAULT '{}',
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE system_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view analytics"
  ON system_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can insert analytics"
  ON system_analytics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_user_id ON revenue_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_created_at ON revenue_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_system_analytics_metric_name ON system_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_analytics_recorded_at ON system_analytics(recorded_at DESC);
