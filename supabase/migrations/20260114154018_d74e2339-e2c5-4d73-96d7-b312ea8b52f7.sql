-- Create table for favorite recipes
CREATE TABLE public.favorite_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  recipe TEXT NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.favorite_recipes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view favorite recipes"
ON public.favorite_recipes
FOR SELECT
USING ((auth.uid() = user_id) OR (user_id = get_partner_id(auth.uid())));

CREATE POLICY "Users can create favorite recipes"
ON public.favorite_recipes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete favorite recipes"
ON public.favorite_recipes
FOR DELETE
USING ((auth.uid() = user_id) OR (user_id = get_partner_id(auth.uid())));