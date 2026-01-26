-- Add UPDATE policy for favorite_recipes
CREATE POLICY "Users can update favorite recipes"
ON public.favorite_recipes
FOR UPDATE
USING (auth.uid() = user_id OR user_id = get_partner_id(auth.uid()));