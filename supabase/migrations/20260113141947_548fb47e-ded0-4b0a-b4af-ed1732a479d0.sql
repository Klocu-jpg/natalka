-- Join a couple via invite code without requiring public SELECT on couples
-- This enables a safe 2-person "lobby" flow: creator creates a couple, partner joins by code.

CREATE OR REPLACE FUNCTION public.join_couple(invite_code text)
RETURNS public.couples
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid;
  v_target public.couples;
  v_updated public.couples;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock the target row to avoid race conditions
  SELECT * INTO v_target
  FROM public.couples
  WHERE public.couples.invite_code = lower(join_couple.invite_code)
    AND public.couples.user2_id IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nieprawidłowy kod lub para już ma partnera';
  END IF;

  IF v_target.user1_id = v_user THEN
    RAISE EXCEPTION 'Nie możesz dołączyć do własnej pary';
  END IF;

  -- If the user previously created an empty couple, remove it (clean lobby)
  DELETE FROM public.couples
  WHERE user1_id = v_user
    AND user2_id IS NULL;

  -- Join the target couple (still ensure it's empty)
  UPDATE public.couples
  SET user2_id = v_user
  WHERE id = v_target.id
    AND user2_id IS NULL
  RETURNING * INTO v_updated;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nieprawidłowy kod lub para już ma partnera';
  END IF;

  RETURN v_updated;
END;
$$;

-- Allow signed-in users to execute the function
REVOKE ALL ON FUNCTION public.join_couple(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_couple(text) TO authenticated;