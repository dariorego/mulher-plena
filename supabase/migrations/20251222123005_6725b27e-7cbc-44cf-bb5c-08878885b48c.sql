-- Permitir que usuários excluam suas próprias submissions
CREATE POLICY "Users can delete own submissions" 
ON public.activity_submissions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Deletar a submission antiga da atividade Afirmação de Potencial (foi feita com VisionBoard antes da Roleta)
DELETE FROM public.activity_submissions 
WHERE id = 'e5c9e42d-6a4a-43d9-a7b9-16f3379b133a';