-- Adicionar coluna para URL do anexo
ALTER TABLE public.support_tickets ADD COLUMN attachment_url text;

-- Criar bucket para anexos de suporte
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-attachments', 'support-attachments', true);

-- Políticas de storage
-- Usuários autenticados podem fazer upload
CREATE POLICY "Users can upload support attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'support-attachments' 
  AND auth.role() = 'authenticated'
);

-- Qualquer um pode visualizar (público)
CREATE POLICY "Support attachments are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'support-attachments');

-- Usuários podem deletar seus próprios arquivos (baseado no path que contém user_id)
CREATE POLICY "Users can delete own support attachments"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'support-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);