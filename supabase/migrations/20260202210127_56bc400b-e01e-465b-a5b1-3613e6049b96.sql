-- Add step_type column to track video/supplementary completion separately
ALTER TABLE public.user_progress 
ADD COLUMN step_type text DEFAULT NULL;

-- Create index for better performance
CREATE INDEX idx_user_progress_step_type ON public.user_progress(user_id, station_id, step_type);