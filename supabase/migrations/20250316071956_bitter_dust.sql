/*
  # Social Media Trend Monitoring System Schema

  1. New Tables
    - `platform_trends`
      - Core trend data across all platforms
    - `trend_metrics`
      - Detailed engagement and performance metrics
    - `trend_analytics`
      - Advanced analytics and correlations
    - `trend_logs`
      - System logs and API responses

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Create enum types
CREATE TYPE trend_status AS ENUM ('active', 'inactive', 'rising', 'falling');
CREATE TYPE content_type AS ENUM ('video', 'image', 'text', 'audio', 'mixed');
CREATE TYPE platform_type AS ENUM ('tiktok', 'instagram', 'youtube', 'snapchat', 'twitter');

-- Platform trends table
CREATE TABLE platform_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform platform_type NOT NULL,
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

-- Trend metrics table
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

-- Trend analytics table
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

-- Trend logs table
CREATE TABLE trend_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform platform_type NOT NULL,
  event_type text NOT NULL,
  status text NOT NULL,
  request_data jsonb DEFAULT '{}',
  response_data jsonb DEFAULT '{}',
  error_message text,
  processing_time interval,
  created_at timestamptz DEFAULT now()
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
CREATE INDEX idx_trend_logs_created_at ON trend_logs(created_at);

-- Enable RLS
ALTER TABLE platform_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
  ON platform_trends FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable read access for authenticated users"
  ON trend_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable read access for authenticated users"
  ON trend_analytics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable read access for authenticated users"
  ON trend_logs FOR SELECT
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

-- Create trigger for last_updated
CREATE TRIGGER update_platform_trends_last_updated
  BEFORE UPDATE ON platform_trends
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated_column();

-- Create function to log API events
CREATE OR REPLACE FUNCTION log_trend_event(
  p_platform platform_type,
  p_event_type text,
  p_status text,
  p_request_data jsonb DEFAULT '{}',
  p_response_data jsonb DEFAULT '{}',
  p_error_message text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO trend_logs (
    platform,
    event_type,
    status,
    request_data,
    response_data,
    error_message,
    processing_time
  ) VALUES (
    p_platform,
    p_event_type,
    p_status,
    p_request_data,
    p_response_data,
    p_error_message,
    clock_timestamp() - transaction_timestamp()
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ language plpgsql security definer;
