/*
  # Fix trend tables schema and policies

  1. Changes
    - Add missing columns to social_trends table
    - Add RLS policies for trend_logs table
    - Add performance indexes
    - Handle existing policies gracefully

  2. Security
    - Enable RLS on trend_logs table
    - Add policies for authenticated users (if not exists)
*/

-- Fix social_trends table
ALTER TABLE social_trends
ADD COLUMN IF NOT EXISTS thumbnail_url text,
ADD COLUMN IF NOT EXISTS creator_stats jsonb DEFAULT '{}'::jsonb;

-- Enable RLS on trend_logs
ALTER TABLE trend_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for trend_logs (with existence check)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'trend_logs' 
        AND policyname = 'Enable insert for authenticated users'
    ) THEN
        CREATE POLICY "Enable insert for authenticated users"
        ON trend_logs
        FOR INSERT
        TO authenticated
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'trend_logs' 
        AND policyname = 'Enable read access for authenticated users'
    ) THEN
        CREATE POLICY "Enable read access for authenticated users"
        ON trend_logs
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;
END
$$;

-- Add indexes for better performance (with existence check)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'trend_logs' 
        AND indexname = 'idx_trend_logs_platform'
    ) THEN
        CREATE INDEX idx_trend_logs_platform ON trend_logs(platform);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'trend_logs' 
        AND indexname = 'idx_trend_logs_event_type'
    ) THEN
        CREATE INDEX idx_trend_logs_event_type ON trend_logs(event_type);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'trend_logs' 
        AND indexname = 'idx_trend_logs_created_at'
    ) THEN
        CREATE INDEX idx_trend_logs_created_at ON trend_logs(created_at);
    END IF;
END
$$;
