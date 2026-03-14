/*
  # Remove App Store Tables

  1. Cleanup
    - Drop app_store_apps table
    - Drop app_store_categories table
    - Drop app_store_reviews table
    - Drop app_store_installations table
    - Remove app store related policies

  2. Notes
    - This migration removes all app store functionality
    - Data will be permanently deleted
*/

DROP TABLE IF EXISTS app_store_reviews CASCADE;
DROP TABLE IF EXISTS app_store_installations CASCADE;
DROP TABLE IF EXISTS app_store_apps CASCADE;
DROP TABLE IF EXISTS app_store_categories CASCADE;
