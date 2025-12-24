-- Create landing_sections table for managing public landing page content
CREATE TABLE public.landing_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT,
  image_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_cta BOOLEAN NOT NULL DEFAULT FALSE,
  cta_text TEXT,
  cta_link TEXT DEFAULT '/login',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_sections ENABLE ROW LEVEL SECURITY;

-- Public can view active sections (landing page is public)
CREATE POLICY "Landing sections are viewable by everyone"
ON public.landing_sections
FOR SELECT
USING (is_active = true);

-- Admins can manage all sections
CREATE POLICY "Admins can manage landing sections"
ON public.landing_sections
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_landing_sections_updated_at
BEFORE UPDATE ON public.landing_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for landing page images
INSERT INTO storage.buckets (id, name, public) VALUES ('landing-images', 'landing-images', true);

-- Storage policies for landing images
CREATE POLICY "Landing images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'landing-images');

CREATE POLICY "Admins can upload landing images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'landing-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update landing images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'landing-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete landing images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'landing-images' AND has_role(auth.uid(), 'admin'::app_role));