-- 1. Add audio_url column to activities table
ALTER TABLE public.activities ADD COLUMN audio_url TEXT;

-- 2. Create storage bucket for activity audios
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-audios', 'activity-audios', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policies for activity-audios bucket
CREATE POLICY "Activity audios are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'activity-audios');

CREATE POLICY "Admins and professors can upload activity audios"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'activity-audios'
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'professor')
  )
);

CREATE POLICY "Admins and professors can update activity audios"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'activity-audios'
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'professor')
  )
);

CREATE POLICY "Admins and professors can delete activity audios"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'activity-audios'
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'professor')
  )
);

-- 4. Insert the "Mentalização Guiada" activity
INSERT INTO public.activities (station_id, title, description, type, points, audio_url)
VALUES (
  '61cecb89-c9e3-4668-8bae-337283ef15d9',
  'Mentalização Guiada',
  '<p>Nesta atividade, você será conduzida por um processo de <strong>mentalização guiada</strong>, uma prática que convida a uma jornada interior de reflexão e autoconhecimento.</p><p><strong>Como funciona:</strong></p><ol><li>Ouça atentamente o áudio da mentalização guiada disponível abaixo</li><li>Permita-se vivenciar as imagens e sensações que surgirem</li><li>Após ouvir, escreva uma reflexão sobre a experiência</li></ol><p><em>Reserve um momento tranquilo para esta atividade. Encontre um lugar calmo, respire fundo e permita-se mergulhar nessa experiência.</em></p>',
  'essay',
  10,
  NULL
);