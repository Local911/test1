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

-- Create enum types if they don't exist
DO $$ 
BEGIN
  -- Create social_platform enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'social_platform') THEN
    CREATE TYPE social_platform AS ENUM (
      'tiktok',
      'instagram',
      'youtube',
      'snapchat',
      'twitter'
    );
  END IF;

  -- Create trend_type enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trend_type') THEN
    CREATE TYPE trend_type AS ENUM (
      'hashtag',
      'sound',
      'video',
      'reel',
      'short',
      'spotlight',
      'tweet'
    );
  END IF;

  -- Create trend_status enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trend_status') THEN
    CREATE TYPE trend_status AS ENUM (
      'active',
      'inactive',
      'rising',
      'falling'
    );
  END IF;

  -- Create content_type enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type') THEN
    CREATE TYPE content_type AS ENUM (
      'video',
      'image',
      'text',
      'audio',
      'mixed'
    );
  END IF;
END $$;

-- Create platform_trends table with metrics column
CREATE TABLE IF NOT EXISTS platform_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform social_platform NOT NULL,
  trend_key text NOT NULL,
  title text NOT NULL,
  description text,
  content_type content_type NOT NULL,
  status trend_status DEFAULT 'active',
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  creator_id text,
  creator_username text,
  creator_metrics jsonb DEFAULT '{}',
  metrics jsonb DEFAULT '{
    "views": 0,
    "likes": 0,
    "comments": 0,
    "shares": 0,
    "saves": 0,
    "engagement_rate": 0
  }'::jsonb,
  engagement jsonb DEFAULT '{
    "total": 0,
    "daily_average": 0,
    "growth_rate": 0
  }'::jsonb,
  url text,
  thumbnail_url text,
  first_seen timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_trend_key CHECK (trend_key ~ '^[A-Za-z0-9_\-#@]+$'),
  CONSTRAINT unique_platform_trend UNIQUE (platform, trend_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_platform_trends_platform ON platform_trends(platform);
CREATE INDEX IF NOT EXISTS idx_platform_trends_status ON platform_trends(status);
CREATE INDEX IF NOT EXISTS idx_platform_trends_category ON platform_trends(category);
CREATE INDEX IF NOT EXISTS idx_platform_trends_created_at ON platform_trends(created_at);

-- Enable RLS
ALTER TABLE platform_trends ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
  ON platform_trends
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger
CREATE TRIGGER update_platform_trends_last_updated
  BEFORE UPDATE ON platform_trends
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated_column();

-- Grant permissions
GRANT ALL ON platform_trends TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
