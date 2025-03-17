/*
  # Fix Platform Trends Schema

  1. Changes
    - Add metrics column to platform_trends table
    - Add engagement column to platform_trends table
    - Update existing tables with proper column structure
    
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Add metrics and engagement columns to platform_trends if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'platform_trends' 
    AND column_name = 'metrics'
  ) THEN
    ALTER TABLE platform_trends 
    ADD COLUMN metrics jsonb DEFAULT '{
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "saves": 0,
      "engagement_rate": 0
    }'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'platform_trends' 
    AND column_name = 'engagement'
  ) THEN
    ALTER TABLE platform_trends 
    ADD COLUMN engagement jsonb DEFAULT '{
      "total": 0,
      "daily_average": 0,
      "growth_rate": 0
    }'::jsonb;
  END IF;
END $$;

-- Create indexes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'platform_trends' 
    AND indexname = 'idx_platform_trends_platform'
  ) THEN
    CREATE INDEX idx_platform_trends_platform ON platform_trends(platform);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'platform_trends' 
    AND indexname = 'idx_platform_trends_status'
  ) THEN
    CREATE INDEX idx_platform_trends_status ON platform_trends(status);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'platform_trends' 
    AND indexname = 'idx_platform_trends_category'
  ) THEN
    CREATE INDEX idx_platform_trends_category ON platform_trends(category);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'platform_trends' 
    AND indexname = 'idx_platform_trends_created_at'
  ) THEN
    CREATE INDEX idx_platform_trends_created_at ON platform_trends(created_at);
  END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE platform_trends ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DO $$
BEGIN
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON platform_trends;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'platform_trends' 
    AND policyname = 'Enable read access for authenticated users'
  ) THEN
    CREATE POLICY "Enable read access for authenticated users"
      ON platform_trends
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Create or replace function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_platform_trends_last_updated'
  ) THEN
    CREATE TRIGGER update_platform_trends_last_updated
      BEFORE UPDATE ON platform_trends
      FOR EACH ROW
      EXECUTE FUNCTION update_last_updated_column();
  END IF;
END $$;

-- Grant permissions
GRANT ALL ON platform_trends TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
