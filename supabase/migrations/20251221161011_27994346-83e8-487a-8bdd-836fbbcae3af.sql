-- Add audio_url column to stations table
ALTER TABLE stations 
ADD COLUMN audio_url TEXT DEFAULT NULL;

-- Create storage bucket for station audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('station-audios', 'station-audios', true);

-- Policies for station-audios bucket
CREATE POLICY "Anyone can view station audios"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'station-audios');

CREATE POLICY "Admins can upload station audios"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'station-audios' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update station audios"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'station-audios' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete station audios"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'station-audios' AND has_role(auth.uid(), 'admin'::app_role));