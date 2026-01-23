-- Tabela na zaczepki/wiadomości między partnerami
CREATE TABLE public.nudges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  message TEXT NOT NULL,
  emoji TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Włącz RLS
ALTER TABLE public.nudges ENABLE ROW LEVEL SECURITY;

-- Polityki: nadawca i odbiorca mogą widzieć wiadomości
CREATE POLICY "Users can view nudges they sent or received"
ON public.nudges
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Tylko zalogowani użytkownicy mogą wysyłać
CREATE POLICY "Users can create nudges"
ON public.nudges
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Odbiorca może oznaczyć jako przeczytane
CREATE POLICY "Recipients can update nudges"
ON public.nudges
FOR UPDATE
USING (auth.uid() = recipient_id);

-- Nadawca może usunąć swoje wiadomości
CREATE POLICY "Senders can delete their nudges"
ON public.nudges
FOR DELETE
USING (auth.uid() = sender_id);

-- Włącz realtime dla natychmiastowych powiadomień
ALTER PUBLICATION supabase_realtime ADD TABLE public.nudges;