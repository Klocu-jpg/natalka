-- Create couples table to link partners
CREATE TABLE public.couples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invite_code TEXT NOT NULL UNIQUE DEFAULT substring(md5(random()::text), 1, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expense categories enum-like
CREATE TABLE public.expense_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL
);

-- Insert default categories
INSERT INTO public.expense_categories (id, name, icon, color) VALUES
  ('groceries', 'Zakupy spożywcze', '🛒', '#E879F9'),
  ('restaurant', 'Restauracje', '🍽️', '#F97316'),
  ('transport', 'Transport', '🚗', '#3B82F6'),
  ('entertainment', 'Rozrywka', '🎬', '#10B981'),
  ('bills', 'Rachunki', '📄', '#EF4444'),
  ('shopping', 'Zakupy', '🛍️', '#8B5CF6'),
  ('health', 'Zdrowie', '💊', '#06B6D4'),
  ('other', 'Inne', '📦', '#6B7280');

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.expense_categories(id) DEFAULT 'other',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Everyone can read categories
CREATE POLICY "Anyone can read expense categories" ON public.expense_categories FOR SELECT USING (true);

-- Couples policies
CREATE POLICY "Users can view their couple" ON public.couples FOR SELECT 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can create couple" ON public.couples FOR INSERT 
  WITH CHECK (auth.uid() = user1_id);
CREATE POLICY "Users can update their couple" ON public.couples FOR UPDATE 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Expenses policies - can see own or partner's expenses through couple
CREATE POLICY "Users can view expenses" ON public.expenses FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    couple_id IN (SELECT id FROM public.couples WHERE user1_id = auth.uid() OR user2_id = auth.uid())
  );
CREATE POLICY "Users can create expenses" ON public.expenses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.expenses FOR UPDATE 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to get partner's user_id
CREATE OR REPLACE FUNCTION public.get_partner_id(p_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN user1_id = p_user_id THEN user2_id
    WHEN user2_id = p_user_id THEN user1_id
    ELSE NULL
  END
  FROM public.couples
  WHERE user1_id = p_user_id OR user2_id = p_user_id
  LIMIT 1;
$$;

-- Update existing tables RLS to include partner access
-- Shopping items
DROP POLICY IF EXISTS "Users can view their own shopping items" ON public.shopping_items;
CREATE POLICY "Users can view shopping items" ON public.shopping_items FOR SELECT 
  USING (auth.uid() = user_id OR user_id = public.get_partner_id(auth.uid()));

DROP POLICY IF EXISTS "Users can create their own shopping items" ON public.shopping_items;
CREATE POLICY "Users can create shopping items" ON public.shopping_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own shopping items" ON public.shopping_items;
CREATE POLICY "Users can update shopping items" ON public.shopping_items FOR UPDATE 
  USING (auth.uid() = user_id OR user_id = public.get_partner_id(auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own shopping items" ON public.shopping_items;
CREATE POLICY "Users can delete shopping items" ON public.shopping_items FOR DELETE 
  USING (auth.uid() = user_id OR user_id = public.get_partner_id(auth.uid()));

-- Tasks
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
CREATE POLICY "Users can view tasks" ON public.tasks FOR SELECT 
  USING (auth.uid() = user_id OR user_id = public.get_partner_id(auth.uid()));

DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
CREATE POLICY "Users can create tasks" ON public.tasks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
CREATE POLICY "Users can update tasks" ON public.tasks FOR UPDATE 
  USING (auth.uid() = user_id OR user_id = public.get_partner_id(auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
CREATE POLICY "Users can delete tasks" ON public.tasks FOR DELETE 
  USING (auth.uid() = user_id OR user_id = public.get_partner_id(auth.uid()));

-- Calendar events
DROP POLICY IF EXISTS "Users can view their own calendar events" ON public.calendar_events;
CREATE POLICY "Users can view calendar events" ON public.calendar_events FOR SELECT 
  USING (auth.uid() = user_id OR user_id = public.get_partner_id(auth.uid()));

DROP POLICY IF EXISTS "Users can create their own calendar events" ON public.calendar_events;
CREATE POLICY "Users can create calendar events" ON public.calendar_events FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own calendar events" ON public.calendar_events;
CREATE POLICY "Users can update calendar events" ON public.calendar_events FOR UPDATE 
  USING (auth.uid() = user_id OR user_id = public.get_partner_id(auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own calendar events" ON public.calendar_events;
CREATE POLICY "Users can delete calendar events" ON public.calendar_events FOR DELETE 
  USING (auth.uid() = user_id OR user_id = public.get_partner_id(auth.uid()));

-- Date ideas
DROP POLICY IF EXISTS "Users can view their own date ideas" ON public.date_ideas;
CREATE POLICY "Users can view date ideas" ON public.date_ideas FOR SELECT 
  USING (auth.uid() = user_id OR user_id = public.get_partner_id(auth.uid()));

DROP POLICY IF EXISTS "Users can create their own date ideas" ON public.date_ideas;
CREATE POLICY "Users can create date ideas" ON public.date_ideas FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own date ideas" ON public.date_ideas;
CREATE POLICY "Users can update date ideas" ON public.date_ideas FOR UPDATE 
  USING (auth.uid() = user_id OR user_id = public.get_partner_id(auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own date ideas" ON public.date_ideas;
CREATE POLICY "Users can delete date ideas" ON public.date_ideas FOR DELETE 
  USING (auth.uid() = user_id OR user_id = public.get_partner_id(auth.uid()));

-- Notes
DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes;
CREATE POLICY "Users can view notes" ON public.notes FOR SELECT 
  USING (auth.uid() = user_id OR user_id = public.get_partner_id(auth.uid()));

DROP POLICY IF EXISTS "Users can create their own notes" ON public.notes;
CREATE POLICY "Users can create notes" ON public.notes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
CREATE POLICY "Users can update notes" ON public.notes FOR UPDATE 
  USING (auth.uid() = user_id OR user_id = public.get_partner_id(auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;
CREATE POLICY "Users can delete notes" ON public.notes FOR DELETE 
  USING (auth.uid() = user_id OR user_id = public.get_partner_id(auth.uid()));