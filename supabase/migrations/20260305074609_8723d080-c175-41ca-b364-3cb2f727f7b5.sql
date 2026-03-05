
CREATE TABLE public.chores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE,
  title text NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  assigned_to text DEFAULT 'both',
  completed boolean NOT NULL DEFAULT false,
  recurring boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create chores" ON public.chores FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view chores" ON public.chores FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR user_id = get_partner_id(auth.uid()));

CREATE POLICY "Users can update chores" ON public.chores FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR user_id = get_partner_id(auth.uid()));

CREATE POLICY "Users can delete chores" ON public.chores FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR user_id = get_partner_id(auth.uid()));
