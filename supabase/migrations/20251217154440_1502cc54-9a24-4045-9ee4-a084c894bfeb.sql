-- Create storage bucket for journey cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('journey-covers', 'journey-covers', true);

-- Allow admins to upload images
CREATE POLICY "Admins can upload journey covers"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'journey-covers' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update images
CREATE POLICY "Admins can update journey covers"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'journey-covers' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete images
CREATE POLICY "Admins can delete journey covers"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'journey-covers' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow public read access to journey covers
CREATE POLICY "Journey covers are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'journey-covers');