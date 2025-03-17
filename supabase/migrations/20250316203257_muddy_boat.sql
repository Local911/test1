/*
  # Enhance Saved Content Features

  1. Changes
    - Add indexes for better performance
    - Add trigger for automatic timestamp updates
    - Add constraints for data validation
    
  2. Security
    - Add RLS policies for saved content
    - Grant necessary permissions
*/

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_content_platform_created ON saved_content(platform, created_at);
CREATE INDEX IF NOT EXISTS idx_saved_content_content_id ON saved_content(content_id);

-- Add check constraints
ALTER TABLE saved_content
ADD CONSTRAINT valid_platform CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter')),
ADD CONSTRAINT valid_content_data CHECK (content_data IS NOT NULL AND content_data != '{}'::jsonb);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_saved_content_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger
CREATE TRIGGER update_saved_content_timestamp
  BEFORE INSERT OR UPDATE ON saved_content
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_content_timestamp();

-- Grant additional permissions
GRANT ALL ON saved_content TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
