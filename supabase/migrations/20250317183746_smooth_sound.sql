/*
  # Initial Database Schema for OnlyViral AI

  1. Types
    - Social platform types
    - Content types
    - Trend status types

  2. Tables
    - users (Core user profiles)
    - platform_trends (Social media trends)
    - trend_metrics (Trend performance metrics)
    - trend_analytics (Advanced trend analysis)
    - trend_logs (System logging)
    - competitor_profiles (Competitor tracking)
    - alerts (User alert settings)
    - saved_content (User saved content)
    - scheduled_posts (Scheduled social posts)

  3. Security
    - Row Level Security (RLS) on all tables
    - Proper policies for authenticated users
    - Secure default values
*/

-- Create enum types
CREATE TYPE social_platform AS ENUM (
  'tiktok',
  'instagram',
  'youtube',
  'snapchat',
  'twitter'
);

CREATE TYPE trend_type AS ENUM (
  'hashtag',
  'sound',
  'video',
  'reel',
  'short',
  'spotlight',
  'tweet'
);

CREATE TYPE trend_status AS ENUM (
  'active',
  'inactive',
  'rising',
  'falling'
);

CREATE TYPE content_type AS ENUM (
  'video',
  'image',
  'text',
  'audio',
  'mixed'
);

-- Create users table
CREATE TABLE users (
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

-- Create platform_trends table
CREATE TABLE platform_trends (
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

-- Create trend_metrics table
CREATE TABLE trend_metrics (
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

-- Create trend_analytics table
CREATE TABLE trend_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id uuid REFERENCES platform_trends(id) ON DELETE CASCADE,
  correlation_score numeric DEFAULT 0,
  virality_score numeric DEFAULT 0,
  prediction_confidence numeric DEFAULT 0,
  related_trends uuid[] DEFAULT '{}',
  geographic_distribution jsonb DEFAULT '{}',
  demographic_data jsonb DEFAULT '{}',
  peak_times jsonb DEFAULT '{}',
  analysis_timestamp timestamptz DEFAULT now(),
  
  CONSTRAINT valid_scores CHECK (
    correlation_score BETWEEN 0 AND 1 AND
    virality_score BETWEEN 0 AND 1 AND
    prediction_confidence BETWEEN 0 AND 1
  )
);

-- Create trend_logs table
CREATE TABLE trend_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform social_platform NOT NULL,
  event_type text NOT NULL,
  status text NOT NULL,
  request_data jsonb DEFAULT '{}',
  response_data jsonb DEFAULT '{}',
  error_message text,
  processing_time interval,
  created_at timestamptz DEFAULT now()
);

-- Create competitor_profiles table
CREATE TABLE competitor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  username text NOT NULL,
  followers integer DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  top_posts jsonb DEFAULT '[]',
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT competitor_profiles_followers_check CHECK (followers >= 0),
  CONSTRAINT competitor_profiles_engagement_rate_check CHECK (engagement_rate >= 0)
);

-- Create alerts table
CREATE TABLE alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  keywords text[] DEFAULT '{}',
  platforms text[] DEFAULT '{}',
  threshold numeric DEFAULT 0,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create saved_content table
CREATE TABLE saved_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content_id text NOT NULL,
  platform text NOT NULL,
  content_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT saved_content_user_id_content_id_key UNIQUE(user_id, content_id),
  CONSTRAINT valid_platform CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter')),
  CONSTRAINT valid_content_data CHECK (content_data IS NOT NULL AND content_data != '{}')
);

-- Create scheduled_posts table
CREATE TABLE scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  scheduled_time timestamptz NOT NULL,
  caption text NOT NULL,
  media_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_platform CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'published', 'failed')),
  CONSTRAINT future_schedule CHECK (scheduled_time > now())
);

-- Create indexes
CREATE INDEX idx_platform_trends_platform ON platform_trends(platform);
CREATE INDEX idx_platform_trends_status ON platform_trends(status);
CREATE INDEX idx_platform_trends_category ON platform_trends(category);
CREATE INDEX idx_platform_trends_created_at ON platform_trends(created_at);

CREATE INDEX idx_trend_metrics_trend_id ON trend_metrics(trend_id);
CREATE INDEX idx_trend_metrics_timestamp ON trend_metrics(timestamp);

CREATE INDEX idx_trend_analytics_trend_id ON trend_analytics(trend_id);

CREATE INDEX idx_trend_logs_platform ON trend_logs(platform);
CREATE INDEX idx_trend_logs_event_type ON trend_logs(event_type);
CREATE INDEX idx_trend_logs_created_at ON trend_logs(created_at);

CREATE INDEX idx_competitor_profiles_user_id ON competitor_profiles(user_id);
CREATE INDEX idx_competitor_profiles_platform ON competitor_profiles(platform);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);

CREATE INDEX idx_saved_content_user_id ON saved_content(user_id);
CREATE INDEX idx_saved_content_platform ON saved_content(platform);
CREATE INDEX idx_saved_content_created_at ON saved_content(created_at);
CREATE INDEX idx_saved_content_platform_created ON saved_content(platform, created_at);
CREATE INDEX idx_saved_content_content_id ON saved_content(content_id);

CREATE INDEX idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX idx_scheduled_posts_platform ON scheduled_posts(platform);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_scheduled_time ON scheduled_posts(scheduled_time);

CREATE INDEX idx_users_primary_niche ON users(primary_niche);
CREATE INDEX idx_users_sub_niche ON users(sub_niche);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read access for users based on id" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable read access for authenticated users" ON platform_trends
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON trend_metrics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON trend_analytics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON trend_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage own competitor profiles" ON competitor_profiles
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own alerts" ON alerts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their saved content" ON saved_content
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their scheduled posts" ON scheduled_posts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create helper functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ language plpgsql;

CREATE OR REPLACE FUNCTION update_scheduled_posts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    full_name,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      'User ' || substr(NEW.id::text, 1, 8)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NULL
    ),
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_platform_trends_last_updated
  BEFORE UPDATE ON platform_trends
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated_column();

CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_posts_timestamp
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_posts_timestamp();

CREATE TRIGGER update_saved_content_timestamp
  BEFORE INSERT OR UPDATE ON saved_content
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_posts_timestamp();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant auth schema permissions
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA auth
  GRANT SELECT ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA auth
  GRANT SELECT ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA auth
  GRANT EXECUTE ON FUNCTIONS TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA auth
  GRANT USAGE ON TYPES TO authenticated;
