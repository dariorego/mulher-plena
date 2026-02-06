
CREATE TABLE public.user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL DEFAULT 'platform',
  resource_id uuid,
  journey_id uuid,
  station_id uuid,
  activity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índices para consultas frequentes
CREATE INDEX idx_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action ON public.user_activity_logs(action);

-- Habilitar RLS
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Usuários podem inserir seus próprios logs
CREATE POLICY "Users can insert own logs"
  ON public.user_activity_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todos os logs
CREATE POLICY "Admins can view all logs"
  ON public.user_activity_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Usuários podem ver seus próprios logs
CREATE POLICY "Users can view own logs"
  ON public.user_activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);
