-- Criar enum para tipo de ticket
CREATE TYPE support_ticket_type AS ENUM ('bug', 'improvement');

-- Criar enum para status do ticket
CREATE TYPE support_ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- Criar tabela de tickets de suporte
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  type support_ticket_type NOT NULL DEFAULT 'bug',
  status support_ticket_status NOT NULL DEFAULT 'open',
  response text,
  responded_by uuid,
  responded_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Usuários podem ver seus próprios tickets
CREATE POLICY "Users can view own tickets"
  ON public.support_tickets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins podem ver todos os tickets
CREATE POLICY "Admins can view all tickets"
  ON public.support_tickets
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Usuários autenticados podem criar tickets
CREATE POLICY "Users can create tickets"
  ON public.support_tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins podem atualizar qualquer ticket
CREATE POLICY "Admins can update tickets"
  ON public.support_tickets
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Usuários podem excluir seus próprios tickets não respondidos
CREATE POLICY "Users can delete own unanswered tickets"
  ON public.support_tickets
  FOR DELETE
  USING (auth.uid() = user_id AND response IS NULL);