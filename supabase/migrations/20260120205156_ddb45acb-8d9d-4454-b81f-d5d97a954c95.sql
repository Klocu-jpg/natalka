-- Add gender to profiles table (create if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  gender TEXT CHECK (gender IN ('female', 'male', 'other')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view partner profile" ON public.profiles FOR SELECT USING (user_id = get_partner_id(auth.uid()));
CREATE POLICY "Users can create own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Period tracker table
CREATE TABLE public.period_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  cycle_length INTEGER DEFAULT 28,
  share_with_partner BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.period_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own period entries" ON public.period_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Partners can view shared entries" ON public.period_entries FOR SELECT USING (share_with_partner = true AND user_id = get_partner_id(auth.uid()));
CREATE POLICY "Users can create own period entries" ON public.period_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own period entries" ON public.period_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own period entries" ON public.period_entries FOR DELETE USING (auth.uid() = user_id);

-- Event countdowns table
CREATE TABLE public.event_countdowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_id UUID,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  emoji TEXT DEFAULT '🎉',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.event_countdowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view event countdowns" ON public.event_countdowns FOR SELECT USING (auth.uid() = user_id OR user_id = get_partner_id(auth.uid()));
CREATE POLICY "Users can create event countdowns" ON public.event_countdowns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update event countdowns" ON public.event_countdowns FOR UPDATE USING (auth.uid() = user_id OR user_id = get_partner_id(auth.uid()));
CREATE POLICY "Users can delete event countdowns" ON public.event_countdowns FOR DELETE USING (auth.uid() = user_id OR user_id = get_partner_id(auth.uid()));

-- Savings goals table
CREATE TABLE public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL,
  title TEXT NOT NULL,
  target_amount NUMERIC NOT NULL DEFAULT 0,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  deadline DATE,
  emoji TEXT DEFAULT '💰',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view savings goals" ON public.savings_goals FOR SELECT USING (couple_id IN (SELECT id FROM couples WHERE user1_id = auth.uid() OR user2_id = auth.uid()));
CREATE POLICY "Users can create savings goals" ON public.savings_goals FOR INSERT WITH CHECK (couple_id IN (SELECT id FROM couples WHERE user1_id = auth.uid() OR user2_id = auth.uid()));
CREATE POLICY "Users can update savings goals" ON public.savings_goals FOR UPDATE USING (couple_id IN (SELECT id FROM couples WHERE user1_id = auth.uid() OR user2_id = auth.uid()));
CREATE POLICY "Users can delete savings goals" ON public.savings_goals FOR DELETE USING (couple_id IN (SELECT id FROM couples WHERE user1_id = auth.uid() OR user2_id = auth.uid()));

-- Savings contributions (history)
CREATE TABLE public.savings_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.savings_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contributions" ON public.savings_contributions FOR SELECT USING (goal_id IN (SELECT id FROM savings_goals WHERE couple_id IN (SELECT id FROM couples WHERE user1_id = auth.uid() OR user2_id = auth.uid())));
CREATE POLICY "Users can create contributions" ON public.savings_contributions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own contributions" ON public.savings_contributions FOR DELETE USING (auth.uid() = user_id);

-- Photo albums table
CREATE TABLE public.photo_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  date DATE,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view albums" ON public.photo_albums FOR SELECT USING (couple_id IN (SELECT id FROM couples WHERE user1_id = auth.uid() OR user2_id = auth.uid()));
CREATE POLICY "Users can create albums" ON public.photo_albums FOR INSERT WITH CHECK (couple_id IN (SELECT id FROM couples WHERE user1_id = auth.uid() OR user2_id = auth.uid()));
CREATE POLICY "Users can update albums" ON public.photo_albums FOR UPDATE USING (couple_id IN (SELECT id FROM couples WHERE user1_id = auth.uid() OR user2_id = auth.uid()));
CREATE POLICY "Users can delete albums" ON public.photo_albums FOR DELETE USING (couple_id IN (SELECT id FROM couples WHERE user1_id = auth.uid() OR user2_id = auth.uid()));

-- Photos table
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.photo_albums(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  taken_at DATE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view photos" ON public.photos FOR SELECT USING (album_id IN (SELECT id FROM photo_albums WHERE couple_id IN (SELECT id FROM couples WHERE user1_id = auth.uid() OR user2_id = auth.uid())));
CREATE POLICY "Users can create photos" ON public.photos FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Users can delete photos" ON public.photos FOR DELETE USING (album_id IN (SELECT id FROM photo_albums WHERE couple_id IN (SELECT id FROM couples WHERE user1_id = auth.uid() OR user2_id = auth.uid())));

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- Storage policies for photos bucket
CREATE POLICY "Users can view couple photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Users can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE USING (bucket_id = 'photos' AND auth.uid() IS NOT NULL);

-- Trigger to update savings_goals current_amount when contribution is added
CREATE OR REPLACE FUNCTION public.update_savings_goal_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.savings_goals SET current_amount = current_amount + NEW.amount WHERE id = NEW.goal_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.savings_goals SET current_amount = current_amount - OLD.amount WHERE id = OLD.goal_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_goal_on_contribution
AFTER INSERT OR DELETE ON public.savings_contributions
FOR EACH ROW EXECUTE FUNCTION public.update_savings_goal_amount();