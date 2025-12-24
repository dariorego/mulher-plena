-- Add card_image_url column to stations table
ALTER TABLE public.stations ADD COLUMN card_image_url text;

-- Create storage bucket for station images
INSERT INTO storage.buckets (id, name, public)
VALUES ('station-images', 'station-images', true);

-- RLS policies for the bucket
CREATE POLICY "Station images are publicly accessible"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'station-images');

CREATE POLICY "Authenticated users can upload station images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'station-images');

CREATE POLICY "Authenticated users can update station images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'station-images');

CREATE POLICY "Authenticated users can delete station images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'station-images');