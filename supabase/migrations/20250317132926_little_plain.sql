/*
  # Add sub-niche field to users table

  1. Changes
    - Add sub_niche column to users table
    - Make it optional (nullable)
    - Add index for better query performance
*/

-- Add sub_niche column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS sub_niche text;

-- Create index for sub_niche for better query performance
CREATE INDEX IF NOT EXISTS idx_users_sub_niche ON users(sub_niche);
