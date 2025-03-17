/*
  # Create alerts table and set up security

  1. New Tables
    - `alerts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `keywords` (text array)
      - `platforms` (text array)
      - `threshold` (numeric)
      - `enabled` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on alerts table
    - Add policies for authenticated users to manage their alerts
*/

-- Create alerts table if it doesn't exist
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  keywords text[] DEFAULT '{}' NOT NULL,
  platforms text[] DEFAULT '{}' NOT NULL,
  threshold numeric DEFAULT 0 NOT NULL,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Create policy if it doesn't exist
DO $$ 
DECLARE
  policy_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'alerts' 
    AND policyname = 'Users can manage own alerts'
  ) INTO policy_exists;

  IF NOT policy_exists THEN
    EXECUTE format('
      CREATE POLICY "Users can manage own alerts"
        ON alerts
        FOR ALL
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)
    ');
  END IF;
END $$;

-- Create trigger if it doesn't exist
DO $$ 
DECLARE
  trigger_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_alerts_updated_at'
  ) INTO trigger_exists;

  IF NOT trigger_exists THEN
    CREATE TRIGGER update_alerts_updated_at
      BEFORE UPDATE
      ON alerts
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END $$;
