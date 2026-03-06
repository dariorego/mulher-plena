CREATE POLICY "Stations are viewable by everyone"
ON public.stations
FOR SELECT
TO anon
USING (true);