
CREATE OR REPLACE FUNCTION public.leave_couple()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid;
  v_couple record;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_couple
  FROM public.couples
  WHERE user1_id = v_user OR user2_id = v_user
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nie należysz do żadnej pary';
  END IF;

  -- No partner: just delete the couple
  IF v_couple.user2_id IS NULL THEN
    DELETE FROM public.couples WHERE id = v_couple.id;
    RETURN;
  END IF;

  -- Partner exists: keep them, free the slot, rotate invite code
  IF v_couple.user1_id = v_user THEN
    UPDATE public.couples
    SET user1_id = v_couple.user2_id,
        user2_id = NULL,
        invite_code = lower(substr(md5(random()::text || clock_timestamp()::text), 1, 8))
    WHERE id = v_couple.id;
  ELSE
    UPDATE public.couples
    SET user2_id = NULL,
        invite_code = lower(substr(md5(random()::text || clock_timestamp()::text), 1, 8))
    WHERE id = v_couple.id;
  END IF;
END;
$$;
