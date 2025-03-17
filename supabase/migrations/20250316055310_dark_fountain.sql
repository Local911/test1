/*
  # Social Media Trend Monitoring System

  1. New Tables
    - `social_trends`
      - `id` (uuid, primary key)
      - `platform` (text) - Social media platform
      - `trend_type` (text) - Type of trend (hashtag, sound, video, etc.)
      - `content_id` (text) - Platform-specific content identifier
      - `title` (text) - Title or name of the trend
      - `description` (text, nullable) - Description or context
      - `category` (text) - Content category/niche
      - `metrics` (jsonb) - Platform-specific metrics
      - `engagement` (jsonb) - Engagement statistics
      - `creator_stats` (jsonb, nullable) - Creator-related statistics
      - `timestamp` (timestamptz) - When the trend was recorded
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `social_trends` table
    - Add policies for authenticated users to read trends
*/

-- Create enum for social media platforms
CREATE TYPE social_platform AS ENUM (
  'tiktok',
  'instagram',
  'youtube',
  'snapchat',
  'twitter'
);

-- Create enum for trend types
CREATE TYPE trend_type AS ENUM (
  'hashtag',
  'sound',
  'video',
  'reel',
  'short',
  'spotlight',
  'tweet'
);

-- Create the social_trends table
CREATE TABLE IF NOT EXISTS social_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform social_platform NOT NULL,
  trend_type trend_type NOT NULL,
  content_id text NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  engagement jsonb NOT NULL DEFAULT '{}'::jsonb,
  creator_stats jsonb,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_social_trends_platform ON social_trends(platform);
CREATE INDEX IF NOT EXISTS idx_social_trends_trend_type ON social_trends(trend_type);
CREATE INDEX IF NOT EXISTS idx_social_trends_category ON social_trends(category);
CREATE INDEX IF NOT EXISTS idx_social_trends_timestamp ON social_trends(timestamp);

-- Enable Row Level Security
ALTER TABLE social_trends ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read trends
CREATE POLICY "Authenticated users can read trends"
  ON social_trends
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_social_trends_updated_at
  BEFORE UPDATE ON social_trends
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
