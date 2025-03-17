/*
  # Add User Profile Columns

  1. Changes
    - Add primary_niche column to users table
    - Add connected_accounts column to users table
    - Set default values for new columns
    
  2. Details
    - primary_niche: Store user's main content category
    - connected_accounts: Store social media usernames as JSONB
*/

-- Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS primary_niche text,
ADD COLUMN IF NOT EXISTS connected_accounts jsonb DEFAULT '{}'::jsonb;

-- Create index for primary_niche for better query performance
CREATE INDEX IF NOT EXISTS idx_users_primary_niche ON users(primary_niche);

-- Update existing users with default values
UPDATE users
SET 
  connected_accounts = '{}'::jsonb,
  updated_at = now()
WHERE connected_accounts IS NULL;
