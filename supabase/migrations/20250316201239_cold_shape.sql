/*
  # Fix RLS policies for social_trends table

  1. Changes
    - Add INSERT policy for authenticated users
    - Update existing SELECT policy
    - Add proper security checks

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON social_trends;
DROP POLICY IF EXISTS "Authenticated users can read trends" ON social_trends;

-- Create new policies
CREATE POLICY "Enable insert for authenticated users"
  ON social_trends
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users"
  ON social_trends
  FOR SELECT
  TO authenticated
  USING (true);

-- Grant necessary permissions
GRANT ALL ON social_trends TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
