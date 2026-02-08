-- Drop the restrictive DELETE policies
DROP POLICY IF EXISTS "Admins and professors can delete any forum post" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.forum_posts;

-- Recreate as PERMISSIVE (default) so they OR together
CREATE POLICY "Admins and professors can delete any forum post"
ON public.forum_posts
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'professor'::app_role));

CREATE POLICY "Users can delete own posts"
ON public.forum_posts
FOR DELETE
USING (auth.uid() = user_id);