
-- Add supplementary_type column to stations
ALTER TABLE public.stations ADD COLUMN supplementary_type text DEFAULT 'video';

-- Auto-detect existing types
UPDATE public.stations SET supplementary_type = 'podcast' WHERE supplementary_url ILIKE '%spotify.com%';
UPDATE public.stations SET supplementary_type = 'article' WHERE supplementary_url IS NOT NULL AND supplementary_url NOT ILIKE '%youtube.com%' AND supplementary_url NOT ILIKE '%youtu.be%' AND supplementary_url NOT ILIKE '%vimeo.com%' AND supplementary_url NOT ILIKE '%spotify.com%';
