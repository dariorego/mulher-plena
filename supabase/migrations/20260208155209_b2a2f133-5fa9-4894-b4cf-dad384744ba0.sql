
-- Create storage bucket for activity videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-videos', 'activity-videos', true);

-- Allow authenticated users to upload videos to their own folder
CREATE POLICY "Users can upload their own activity videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'activity-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own videos
CREATE POLICY "Users can update their own activity videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'activity-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to activity videos
CREATE POLICY "Activity videos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'activity-videos');

-- Allow users to delete their own videos
CREATE POLICY "Users can delete their own activity videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'activity-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Insert the activity record
INSERT INTO public.activities (station_id, title, type, description, points)
VALUES (
  '058ac9d6-9e47-4db2-9cc6-9a84f2729d93',
  'Relato de Reconciliação com a História Familiar',
  'essay',
  '<p>Elabore um <strong>texto escrito</strong> ou produza um <strong>vídeo</strong>, com duração máxima de três minutos, relatando de que forma os conteúdos abordados na jornada contribuíram para ampliar sua compreensão acerca das relações familiares e da maneira como você percebe o passado.</p><p>Você pode enviar <strong>apenas o texto</strong>, <strong>apenas o vídeo</strong>, ou <strong>ambos</strong>.</p>',
  15
);
