/*
  # Final Fix for Authentication Schema

  1. Changes
    - Drop and recreate users table with proper CASCADE
    - Update RLS policies with proper permissions
    - Fix user creation trigger with better error handling
    - Add proper grants and permissions
    - Ensure proper foreign key constraints

  2. Security
    - Enable RLS with proper policies
    - Set up secure defaults
    - Add proper grants for authenticated and anonymous users
*/

-- Drop existing objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.users CASCADE;

-- Recreate users table with proper constraints
CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  full_name text,
  avatar_url text,
  subscription_tier text DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies with proper permissions
CREATE POLICY "Enable insert for authenticated users"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read access for users based on id"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create improved trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  profile_exists boolean;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = NEW.id
  ) INTO profile_exists;

  -- Only proceed if profile doesn't exist
  IF NOT profile_exists THEN
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
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.users TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure existing auth users have profiles
INSERT INTO public.users (id, full_name, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'User ' || substr(id::text, 1, 8)),
  created_at,
  updated_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;
