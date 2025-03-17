/*
  # Add Scheduled Posts Table

  1. New Tables
    - `scheduled_posts`
      - For storing scheduled social media posts
      - Links to users table
      - Tracks post status and scheduling details

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create scheduled_posts table
CREATE TABLE IF NOT EXISTS scheduled_posts (
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

-- Enable RLS
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their scheduled posts"
  ON scheduled_posts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX idx_scheduled_posts_platform ON scheduled_posts(platform);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_scheduled_time ON scheduled_posts(scheduled_time);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_scheduled_posts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger
CREATE TRIGGER update_scheduled_posts_timestamp
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_posts_timestamp();

-- Grant permissions
GRANT ALL ON scheduled_posts TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
