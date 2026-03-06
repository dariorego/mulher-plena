CREATE POLICY "Journeys are viewable by everyone"
ON public.journeys
FOR SELECT
TO anon
USING (true);