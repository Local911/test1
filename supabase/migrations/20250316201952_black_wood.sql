/*
  # Add saved content table

  1. New Tables
    - `saved_content`
      - For storing user's saved content
      - Links to users table
      - Stores content data as JSONB
      
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create saved_content table
CREATE TABLE IF NOT EXISTS saved_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content_id text NOT NULL,
  platform text NOT NULL,
  content_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure unique saves per user
  UNIQUE(user_id, content_id)
);

-- Enable RLS
ALTER TABLE saved_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their saved content"
  ON saved_content
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_saved_content_user_id ON saved_content(user_id);
CREATE INDEX idx_saved_content_platform ON saved_content(platform);
CREATE INDEX idx_saved_content_created_at ON saved_content(created_at);
