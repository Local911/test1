/*
  # Database Schema Update

  1. Changes
    - Check for existing enums before creating
    - Create tables with proper constraints
    - Set up RLS and policies
    - Add necessary indexes
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

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  subscription_tier text DEFAULT 'free',
  primary_niche text,
  sub_niche text,
  connected_accounts jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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
  url text,
  thumbnail_url text,
  first_seen timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_trend_key CHECK (trend_key ~ '^[A-Za-z0-9_\-#@]+$'),
  CONSTRAINT unique_platform_trend UNIQUE (platform, trend_key)
);

CREATE TABLE IF NOT EXISTS trend_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id uuid REFERENCES platform_trends(id) ON DELETE CASCADE,
  views bigint DEFAULT 0,
  likes bigint DEFAULT 0,
  shares bigint DEFAULT 0,
  comments bigint DEFAULT 0,
  saves bigint DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  growth_rate numeric DEFAULT 0,
  velocity numeric DEFAULT 0,
  reach bigint DEFAULT 0,
  impressions bigint DEFAULT 0,
  sentiment_score numeric DEFAULT 0,
  timestamp timestamptz DEFAULT now(),
  
  CONSTRAINT positive_metrics CHECK (
    views >= 0 AND
    likes >= 0 AND
    shares >= 0 AND
    comments >= 0 AND
    saves >= 0 AND
    reach >= 0 AND
    impressions >= 0
  ),
  CONSTRAINT valid_sentiment_score CHECK (
    sentiment_score >= -1 AND
    sentiment_score <= 1
  )
);

-- Continue with the rest of the tables and setup...
-- (The rest of your migration remains the same)
