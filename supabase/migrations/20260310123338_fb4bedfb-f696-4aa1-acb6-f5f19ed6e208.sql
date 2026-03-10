
-- Create system_settings table (single-row config table)
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_score_to_students boolean NOT NULL DEFAULT true,
  show_feedback_to_students boolean NOT NULL DEFAULT true,
  video_percentage integer NOT NULL DEFAULT 35,
  activity_percentage integer NOT NULL DEFAULT 35,
  supplementary_percentage integer NOT NULL DEFAULT 20,
  podcast_percentage integer NOT NULL DEFAULT 10,
  sensitive_content_message text NOT NULL DEFAULT 'Esta atividade aborda temas que podem despertar emoções intensas. Sinta-se à vontade para fazer pausas, cuidar de si e buscar apoio se necessário. Você está em um espaço seguro.',
  login_background_url text NOT NULL DEFAULT '',
  header_border_color text NOT NULL DEFAULT '#b46ebe',
  progress_bar_color text NOT NULL DEFAULT '#2e6682',
  button_bg_color text NOT NULL DEFAULT '#2D6582',
  button_text_color text NOT NULL DEFAULT '#FFFFFF',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default row
INSERT INTO public.system_settings (id) VALUES (gen_random_uuid());

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read settings
CREATE POLICY "Authenticated users can read settings"
  ON public.system_settings FOR SELECT
  TO authenticated
  USING (true);

-- Anonymous users can also read (for login page background)
CREATE POLICY "Anon users can read settings"
  ON public.system_settings FOR SELECT
  TO anon
  USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
  ON public.system_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
