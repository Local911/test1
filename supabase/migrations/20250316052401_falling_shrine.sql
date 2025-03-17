/*
  # Initial Schema Setup for OnlyViral AI

  1. New Tables
    - `users`
      - Extended user profile data
      - Linked to Supabase auth.users
    - `trends`
      - Stores trend data across platforms
    - `competitor_profiles`
      - Stores tracked competitor information
    - `alerts`
      - User-configured alert settings
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Users table for extended profile data
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  avatar_url text,
  subscription_tier text DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trends table for storing trend data
CREATE TABLE IF NOT EXISTS trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  keyword text NOT NULL,
  growth_rate numeric NOT NULL,
  sentiment_score numeric NOT NULL,
  volume integer NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Competitor profiles table
CREATE TABLE IF NOT EXISTS competitor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  platform text NOT NULL,
  username text NOT NULL,
  followers integer DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Alerts table for user notification preferences
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  keywords text[] DEFAULT '{}',
  platforms text[] DEFAULT '{}',
  threshold numeric DEFAULT 0,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Everyone can read trends"
  ON trends
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read own competitor profiles"
  ON competitor_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own competitor profiles"
  ON competitor_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own alerts"
  ON alerts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);
