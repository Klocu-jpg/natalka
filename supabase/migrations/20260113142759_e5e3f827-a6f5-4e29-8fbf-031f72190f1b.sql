-- Replace join_couple with a version that returns only the couple id
DROP FUNCTION IF EXISTS public.join_couple(text);

CREATE FUNCTION public.join_couple(invite_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid;
  v_target_id uuid;
  v_joined_id uuid;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock the target row to avoid race conditions
  SELECT id INTO v_target_id
  FROM public.couples
  WHERE public.couples.invite_code = lower(invite_code)
    AND public.couples.user2_id IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nieprawidłowy kod lub para już ma partnera';
  END IF;

  -- Prevent joining own couple
  IF EXISTS (
    SELECT 1 FROM public.couples c
    WHERE c.id = v_target_id AND c.user1_id = v_user
  ) THEN
    RAISE EXCEPTION 'Nie możesz dołączyć do własnej pary';
  END IF;

  -- If the user previously created an empty couple, remove it (clean lobby)
  DELETE FROM public.couples
  WHERE user1_id = v_user
    AND user2_id IS NULL;

  -- Join the target couple (still ensure it's empty)
  UPDATE public.couples
  SET user2_id = v_user
  WHERE id = v_target_id
    AND user2_id IS NULL
  RETURNING id INTO v_joined_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nieprawidłowy kod lub para już ma partnera';
  END IF;

  RETURN v_joined_id;
END;
$$;

REVOKE ALL ON FUNCTION public.join_couple(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_couple(text) TO authenticated;