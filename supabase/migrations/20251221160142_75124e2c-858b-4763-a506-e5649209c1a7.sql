-- Create storage bucket for forum audios
INSERT INTO storage.buckets (id, name, public)
VALUES ('forum-audios', 'forum-audios', true);

-- Policy: Users can upload their own audio
CREATE POLICY "Users can upload own audio" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'forum-audios' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Anyone authenticated can view audio
CREATE POLICY "Anyone can view audio" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'forum-audios');

-- Policy: Users can delete their own audio
CREATE POLICY "Users can delete own audio" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'forum-audios' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add audio_url column to forum_posts
ALTER TABLE forum_posts 
ADD COLUMN audio_url TEXT DEFAULT NULL;