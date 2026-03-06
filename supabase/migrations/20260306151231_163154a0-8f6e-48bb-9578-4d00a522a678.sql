CREATE POLICY "Authenticated users can view shared recipes"
ON public.favorite_recipes
FOR SELECT
TO authenticated
USING (true);