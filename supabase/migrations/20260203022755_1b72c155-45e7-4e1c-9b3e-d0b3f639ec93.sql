-- Permitir que admins e professores excluam qualquer post do fórum
CREATE POLICY "Admins and professors can delete any forum post"
ON public.forum_posts
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'professor'::app_role)
);