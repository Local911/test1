/*
  # Add User Creation Trigger

  1. Changes
    - Add trigger function to handle new user creation
    - Create trigger to automatically create user record when auth.users is updated
    
  2. Details
    - Creates a record in public.users table when a new user signs up
    - Copies user ID and other relevant information from auth.users
*/

-- Create trigger function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.created_at,
    NEW.updated_at
  );
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create trigger for new user creation
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;
