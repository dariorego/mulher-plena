
-- Create conversation status enum
CREATE TYPE public.conversation_status AS ENUM ('open', 'closed');

-- Create conversations table
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  status conversation_status NOT NULL DEFAULT 'open',
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  attachment_url text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations RLS
CREATE POLICY "Participants can view own conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = participant_id);

CREATE POLICY "Professors and admins can view all conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'professor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Participants can create conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = participant_id);

CREATE POLICY "Professors and admins can update conversations"
  ON public.conversations FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'professor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Participants can update own conversations"
  ON public.conversations FOR UPDATE TO authenticated
  USING (auth.uid() = participant_id);

-- Messages RLS
CREATE POLICY "Participants can view messages in own conversations"
  ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id AND c.participant_id = auth.uid()
  ));

CREATE POLICY "Professors and admins can view all messages"
  ON public.messages FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'professor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Participants can insert messages in own conversations"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND c.participant_id = auth.uid()
    )
  );

CREATE POLICY "Professors and admins can insert messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    (has_role(auth.uid(), 'professor') OR has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Professors and admins can update messages"
  ON public.messages FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'professor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Participants can update messages in own conversations"
  ON public.messages FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id AND c.participant_id = auth.uid()
  ));

-- Trigger to update updated_at on conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('message-attachments', 'message-attachments', true);

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload message attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'message-attachments');

CREATE POLICY "Anyone can view message attachments"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'message-attachments');
