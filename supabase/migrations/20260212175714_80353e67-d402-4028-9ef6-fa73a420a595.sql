
-- Create journey_access table
CREATE TABLE public.journey_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, journey_id)
);

-- Enable RLS
ALTER TABLE public.journey_access ENABLE ROW LEVEL SECURITY;

-- Users can see their own access records
CREATE POLICY "Users can view own journey access"
ON public.journey_access
FOR SELECT
USING (auth.uid() = user_id);

-- Admins and professors can view all access records
CREATE POLICY "Admins and professors can view all journey access"
ON public.journey_access
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'professor'::app_role));

-- Only admins can grant access
CREATE POLICY "Admins can grant journey access"
ON public.journey_access
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can revoke access
CREATE POLICY "Admins can revoke journey access"
ON public.journey_access
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
