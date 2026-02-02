-- Criar tabela de eventos agendados
CREATE TABLE public.scheduled_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  meeting_link TEXT,
  journey_id UUID REFERENCES public.journeys(id) ON DELETE SET NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.scheduled_events ENABLE ROW LEVEL SECURITY;

-- Todos autenticados podem ler eventos
CREATE POLICY "Authenticated users can read events" 
ON public.scheduled_events FOR SELECT 
TO authenticated
USING (true);

-- Admins podem inserir eventos
CREATE POLICY "Admins can insert events" 
ON public.scheduled_events FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins podem atualizar eventos
CREATE POLICY "Admins can update events" 
ON public.scheduled_events FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins podem deletar eventos
CREATE POLICY "Admins can delete events" 
ON public.scheduled_events FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_scheduled_events_updated_at
  BEFORE UPDATE ON public.scheduled_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();