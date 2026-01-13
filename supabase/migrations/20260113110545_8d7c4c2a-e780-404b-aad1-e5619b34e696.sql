-- Create couple_anniversary table to store relationship start date
CREATE TABLE public.couple_anniversaries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  name text NOT NULL DEFAULT 'Razem od',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(couple_id)
);

-- Enable Row Level Security
ALTER TABLE public.couple_anniversaries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their couple anniversary" 
ON public.couple_anniversaries 
FOR SELECT 
USING (
  couple_id IN (
    SELECT id FROM public.couples 
    WHERE user1_id = auth.uid() OR user2_id = auth.uid()
  )
);

CREATE POLICY "Users can create couple anniversary" 
ON public.couple_anniversaries 
FOR INSERT 
WITH CHECK (
  couple_id IN (
    SELECT id FROM public.couples 
    WHERE user1_id = auth.uid() OR user2_id = auth.uid()
  )
);

CREATE POLICY "Users can update couple anniversary" 
ON public.couple_anniversaries 
FOR UPDATE 
USING (
  couple_id IN (
    SELECT id FROM public.couples 
    WHERE user1_id = auth.uid() OR user2_id = auth.uid()
  )
);

CREATE POLICY "Users can delete couple anniversary" 
ON public.couple_anniversaries 
FOR DELETE 
USING (
  couple_id IN (
    SELECT id FROM public.couples 
    WHERE user1_id = auth.uid() OR user2_id = auth.uid()
  )
);