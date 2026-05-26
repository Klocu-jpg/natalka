
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.diet_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  likes TEXT,
  dislikes TEXT,
  allergies TEXT,
  diet_type TEXT,
  health_conditions TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.diet_preferences TO authenticated;
GRANT ALL ON public.diet_preferences TO service_role;

ALTER TABLE public.diet_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diet preferences"
ON public.diet_preferences FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view partner diet preferences"
ON public.diet_preferences FOR SELECT TO authenticated
USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())));

CREATE POLICY "Users can insert own diet preferences"
ON public.diet_preferences FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diet preferences"
ON public.diet_preferences FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diet preferences"
ON public.diet_preferences FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_diet_preferences_updated_at
BEFORE UPDATE ON public.diet_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
