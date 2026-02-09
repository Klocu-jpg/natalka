
-- Fix expense_categories: restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can read expense categories" ON public.expense_categories;
CREATE POLICY "Authenticated users can read expense categories"
  ON public.expense_categories
  FOR SELECT
  TO authenticated
  USING (true);
