/*
  # Fix Database Schema Issues

  1. Changes
    - Add missing metrics and engagement columns to platform_trends
    - Fix user profile creation timing
    - Add proper indexes and constraints
    
  2. Security
    - Update RLS policies
    - Add proper grants
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON platform_trends;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON platform_trends;

-- Add metrics and engagement columns if they don't exist
ALTER TABLE platform_trends
ADD COLUMN IF NOT EXISTS metrics jsonb DEFAULT '{
  "views": 0,
  "likes": 0,
  "comments": 0,
  "shares": 0,
  "saves": 0,
  "engagement_rate": 0
}'::jsonb,
ADD COLUMN IF NOT EXISTS engagement jsonb DEFAULT '{
  "total": 0,
  "daily_average": 0,
  "growth_rate": 0
}'::jsonb;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_platform_trends_platform ON platform_trends(platform);
CREATE INDEX IF NOT EXISTS idx_platform_trends_status ON platform_trends(status);
CREATE INDEX IF NOT EXISTS idx_platform_trends_category ON platform_trends(category);
CREATE INDEX IF NOT EXISTS idx_platform_trends_created_at ON platform_trends(created_at);

-- Enable RLS
ALTER TABLE platform_trends ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
  ON platform_trends
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON platform_trends
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON platform_trends TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create or replace function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Add delay to ensure auth.users record exists
  PERFORM pg_sleep(1);
  
  INSERT INTO public.users (
    id,
    full_name,
    avatar_url,
    primary_niche,
    sub_niche,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'primary_niche',
    NEW.raw_user_meta_data->>'sub_niche',
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    primary_niche = EXCLUDED.primary_niche,
    sub_niche = EXCLUDED.sub_niche,
    updated_at = EXCLUDED.updated_at;

  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
