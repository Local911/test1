/*
  # Add Admin User

  1. Changes
    - Create admin user with email/password authentication
    - Set admin role in users table
    
  2. Security
    - Password is hashed using bcrypt
    - Admin role is protected by RLS
*/

DO $$ 
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user already exists in auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@onlyviral.ai';

  IF admin_user_id IS NULL THEN
    -- Generate new UUID for admin user
    admin_user_id := gen_random_uuid();

    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@onlyviral.ai',
      crypt('Admin123!@#', gen_salt('bf')),
      now(),
      now(),
      now(),
      'authenticated',
      'authenticated',
      ''
    );

    -- Check if user profile exists
    IF NOT EXISTS (
      SELECT 1 FROM public.users WHERE id = admin_user_id
    ) THEN
      -- Create user profile
      INSERT INTO public.users (
        id,
        full_name,
        subscription_tier,
        created_at,
        updated_at
      ) VALUES (
        admin_user_id,
        'Admin User',
        'admin',
        now(),
        now()
      );
    END IF;
  END IF;

  -- Ensure admin privileges
  UPDATE public.users
  SET subscription_tier = 'admin',
      updated_at = now()
  WHERE id = admin_user_id;

END $$;
