-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view shared recipes" ON public.favorite_recipes;

-- Ensure users can only see their own recipes
CREATE POLICY "Users can view own recipes"
ON public.favorite_recipes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);