-- Create meals table for weekly meal planning
CREATE TABLE public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  name TEXT NOT NULL,
  recipe TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Policies - users can see their own and partner's meals
CREATE POLICY "Users can view meals"
ON public.meals FOR SELECT
USING (auth.uid() = user_id OR user_id = get_partner_id(auth.uid()));

CREATE POLICY "Users can create meals"
ON public.meals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update meals"
ON public.meals FOR UPDATE
USING (auth.uid() = user_id OR user_id = get_partner_id(auth.uid()));

CREATE POLICY "Users can delete meals"
ON public.meals FOR DELETE
USING (auth.uid() = user_id OR user_id = get_partner_id(auth.uid()));