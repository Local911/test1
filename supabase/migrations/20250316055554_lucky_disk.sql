/*
  # Update competitor profiles table

  1. Changes
    - Add top_posts column for storing competitor's best performing content
    - Set default values for numeric columns
    - Add check constraints for data validation

  2. New Columns
    - top_posts (jsonb) - Array of top performing posts with engagement metrics
    
  3. Constraints
    - Ensure followers count is non-negative
    - Ensure engagement rate is non-negative
*/

-- Add missing columns to competitor_profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'competitor_profiles' 
    AND column_name = 'top_posts'
  ) THEN
    ALTER TABLE competitor_profiles
    ADD COLUMN top_posts jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Set default values for existing columns
ALTER TABLE competitor_profiles
ALTER COLUMN followers SET DEFAULT 0,
ALTER COLUMN engagement_rate SET DEFAULT 0;

-- Add check constraints if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'competitor_profiles' 
    AND constraint_name = 'competitor_profiles_followers_check'
  ) THEN
    ALTER TABLE competitor_profiles
    ADD CONSTRAINT competitor_profiles_followers_check 
    CHECK (followers >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'competitor_profiles' 
    AND constraint_name = 'competitor_profiles_engagement_rate_check'
  ) THEN
    ALTER TABLE competitor_profiles
    ADD CONSTRAINT competitor_profiles_engagement_rate_check 
    CHECK (engagement_rate >= 0);
  END IF;
END $$;
