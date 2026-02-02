-- Allow professors and admins to delete submissions (for re-submission scenarios)
CREATE POLICY "Professors and admins can delete submissions"
ON public.activity_submissions
FOR DELETE
USING (has_role(auth.uid(), 'professor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));