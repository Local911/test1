-- Create storage bucket for scheduled posts if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('scheduled-posts', 'scheduled-posts')
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy for authenticated users
CREATE POLICY "Authenticated users can upload scheduled post media"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'scheduled-posts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can read their own media"
ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'scheduled-posts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
