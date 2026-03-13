/*
  # Add App Visibility Controls

  1. Changes
    - Add `is_public` column to `module_metadata` table
      - Boolean field to control whether an app is visible to the public
      - Defaults to true (public) for backward compatibility
    
  2. Security
    - No changes to RLS policies (remains read-only for public)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'module_metadata' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE module_metadata ADD COLUMN is_public boolean DEFAULT true;
  END IF;
END $$;
