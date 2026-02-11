
CREATE TYPE deletion_request_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.activity_submissions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reason text NOT NULL DEFAULT '',
  status deletion_request_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own deletion requests"
  ON public.deletion_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own deletion requests"
  ON public.deletion_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and professors can view all requests"
  ON public.deletion_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'professor'::app_role));

CREATE POLICY "Admins and professors can update requests"
  ON public.deletion_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'professor'::app_role));
