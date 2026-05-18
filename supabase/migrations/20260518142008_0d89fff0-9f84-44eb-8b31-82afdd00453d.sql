
-- 1. Add slots for users 3 and 4
ALTER TABLE public.couples ADD COLUMN IF NOT EXISTS user3_id uuid;
ALTER TABLE public.couples ADD COLUMN IF NOT EXISTS user4_id uuid;

-- 2. Helper: returns all non-null member ids of the couple containing p_user_id (including self)
CREATE OR REPLACE FUNCTION public.get_couple_member_ids(p_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m FROM (
    SELECT unnest(ARRAY[user1_id, user2_id, user3_id, user4_id]) AS m
    FROM public.couples
    WHERE p_user_id IN (user1_id, user2_id, user3_id, user4_id)
    LIMIT 1
  ) s
  WHERE m IS NOT NULL
$$;

-- 3. Keep get_partner_id for backward compat (e.g. edge functions): returns ANY other member
CREATE OR REPLACE FUNCTION public.get_partner_id(p_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m
  FROM public.get_couple_member_ids(p_user_id) AS m
  WHERE m <> p_user_id
  LIMIT 1
$$;

-- 4. Update couples table RLS policies for 4-member groups
DROP POLICY IF EXISTS "Users can view their couple" ON public.couples;
DROP POLICY IF EXISTS "Users can update their couple" ON public.couples;
DROP POLICY IF EXISTS "Users can delete their empty couple" ON public.couples;

CREATE POLICY "Users can view their couple" ON public.couples
FOR SELECT
USING (auth.uid() IN (user1_id, user2_id, user3_id, user4_id));

CREATE POLICY "Users can update their couple" ON public.couples
FOR UPDATE
USING (auth.uid() IN (user1_id, user2_id, user3_id, user4_id));

CREATE POLICY "Users can delete their empty couple" ON public.couples
FOR DELETE
USING (
  auth.uid() = user1_id
  AND user2_id IS NULL
  AND user3_id IS NULL
  AND user4_id IS NULL
);

-- 5. Update all RLS policies that used get_partner_id to use the multi-member function
-- calendar_events
DROP POLICY IF EXISTS "Users can view calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete calendar events" ON public.calendar_events;
CREATE POLICY "Users can view calendar events" ON public.calendar_events FOR SELECT USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can update calendar events" ON public.calendar_events FOR UPDATE USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can delete calendar events" ON public.calendar_events FOR DELETE USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());

-- chores
DROP POLICY IF EXISTS "Users can view chores" ON public.chores;
DROP POLICY IF EXISTS "Users can update chores" ON public.chores;
DROP POLICY IF EXISTS "Users can delete chores" ON public.chores;
CREATE POLICY "Users can view chores" ON public.chores FOR SELECT TO authenticated USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can update chores" ON public.chores FOR UPDATE TO authenticated USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can delete chores" ON public.chores FOR DELETE TO authenticated USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());

-- date_ideas
DROP POLICY IF EXISTS "Users can view date ideas" ON public.date_ideas;
DROP POLICY IF EXISTS "Users can update date ideas" ON public.date_ideas;
DROP POLICY IF EXISTS "Users can delete date ideas" ON public.date_ideas;
CREATE POLICY "Users can view date ideas" ON public.date_ideas FOR SELECT USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can update date ideas" ON public.date_ideas FOR UPDATE USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can delete date ideas" ON public.date_ideas FOR DELETE USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());

-- event_countdowns
DROP POLICY IF EXISTS "Users can view event countdowns" ON public.event_countdowns;
DROP POLICY IF EXISTS "Users can update event countdowns" ON public.event_countdowns;
DROP POLICY IF EXISTS "Users can delete event countdowns" ON public.event_countdowns;
CREATE POLICY "Users can view event countdowns" ON public.event_countdowns FOR SELECT USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can update event countdowns" ON public.event_countdowns FOR UPDATE USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can delete event countdowns" ON public.event_countdowns FOR DELETE USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());

-- favorite_recipes
DROP POLICY IF EXISTS "Users can view favorite recipes" ON public.favorite_recipes;
DROP POLICY IF EXISTS "Users can update favorite recipes" ON public.favorite_recipes;
DROP POLICY IF EXISTS "Users can delete favorite recipes" ON public.favorite_recipes;
CREATE POLICY "Users can view favorite recipes" ON public.favorite_recipes FOR SELECT USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can update favorite recipes" ON public.favorite_recipes FOR UPDATE USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can delete favorite recipes" ON public.favorite_recipes FOR DELETE USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());

-- meals
DROP POLICY IF EXISTS "Users can view meals" ON public.meals;
DROP POLICY IF EXISTS "Users can update meals" ON public.meals;
DROP POLICY IF EXISTS "Users can delete meals" ON public.meals;
CREATE POLICY "Users can view meals" ON public.meals FOR SELECT USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can update meals" ON public.meals FOR UPDATE USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can delete meals" ON public.meals FOR DELETE USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());

-- notes
DROP POLICY IF EXISTS "Users can view notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete notes" ON public.notes;
CREATE POLICY "Users can view notes" ON public.notes FOR SELECT USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can update notes" ON public.notes FOR UPDATE USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can delete notes" ON public.notes FOR DELETE USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());

-- shopping_items
DROP POLICY IF EXISTS "Users can view shopping items" ON public.shopping_items;
DROP POLICY IF EXISTS "Users can update shopping items" ON public.shopping_items;
DROP POLICY IF EXISTS "Users can delete shopping items" ON public.shopping_items;
CREATE POLICY "Users can view shopping items" ON public.shopping_items FOR SELECT USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can update shopping items" ON public.shopping_items FOR UPDATE USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can delete shopping items" ON public.shopping_items FOR DELETE USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());

-- tasks
DROP POLICY IF EXISTS "Users can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks" ON public.tasks;
CREATE POLICY "Users can view tasks" ON public.tasks FOR SELECT USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can update tasks" ON public.tasks FOR UPDATE USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());
CREATE POLICY "Users can delete tasks" ON public.tasks FOR DELETE USING (user_id IN (SELECT public.get_couple_member_ids(auth.uid())) OR user_id = auth.uid());

-- profiles partner-view
DROP POLICY IF EXISTS "Users can view partner profile" ON public.profiles;
CREATE POLICY "Users can view partner profile" ON public.profiles
FOR SELECT USING (
  user_id IN (SELECT public.get_couple_member_ids(auth.uid())) AND user_id <> auth.uid()
);

-- period_entries shared
DROP POLICY IF EXISTS "Partners can view shared entries" ON public.period_entries;
CREATE POLICY "Partners can view shared entries" ON public.period_entries
FOR SELECT USING (
  share_with_partner = true
  AND user_id IN (SELECT public.get_couple_member_ids(auth.uid()))
  AND user_id <> auth.uid()
);

-- 6. Rewrite join_couple to fill any open slot (up to 4)
CREATE OR REPLACE FUNCTION public.join_couple(p_invite_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid;
  v_target record;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_target
  FROM public.couples
  WHERE invite_code = lower(p_invite_code)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nieprawidłowy kod';
  END IF;

  IF v_user IN (v_target.user1_id, v_target.user2_id, v_target.user3_id, v_target.user4_id) THEN
    RAISE EXCEPTION 'Jesteś już członkiem tej grupy';
  END IF;

  IF v_target.user2_id IS NOT NULL
     AND v_target.user3_id IS NOT NULL
     AND v_target.user4_id IS NOT NULL THEN
    RAISE EXCEPTION 'Grupa jest pełna (max 4 osoby)';
  END IF;

  -- clean lobby: remove a different empty couple the user previously created
  DELETE FROM public.couples
  WHERE user1_id = v_user
    AND user2_id IS NULL
    AND user3_id IS NULL
    AND user4_id IS NULL
    AND id <> v_target.id;

  IF v_target.user2_id IS NULL THEN
    UPDATE public.couples SET user2_id = v_user WHERE id = v_target.id;
  ELSIF v_target.user3_id IS NULL THEN
    UPDATE public.couples SET user3_id = v_user WHERE id = v_target.id;
  ELSE
    UPDATE public.couples SET user4_id = v_user WHERE id = v_target.id;
  END IF;

  RETURN v_target.id;
END;
$$;

-- 7. Rewrite leave_couple to compact remaining members up
CREATE OR REPLACE FUNCTION public.leave_couple()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid;
  v_couple_id uuid;
  v_remaining uuid[];
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO v_couple_id
  FROM public.couples
  WHERE v_user IN (user1_id, user2_id, user3_id, user4_id)
  FOR UPDATE;

  IF v_couple_id IS NULL THEN
    RAISE EXCEPTION 'Nie należysz do żadnej grupy';
  END IF;

  SELECT array_remove(
    ARRAY[
      CASE WHEN user1_id = v_user THEN NULL ELSE user1_id END,
      CASE WHEN user2_id = v_user THEN NULL ELSE user2_id END,
      CASE WHEN user3_id = v_user THEN NULL ELSE user3_id END,
      CASE WHEN user4_id = v_user THEN NULL ELSE user4_id END
    ]::uuid[],
    NULL
  ) INTO v_remaining
  FROM public.couples
  WHERE id = v_couple_id;

  IF v_remaining IS NULL OR array_length(v_remaining, 1) IS NULL THEN
    DELETE FROM public.couples WHERE id = v_couple_id;
    RETURN;
  END IF;

  UPDATE public.couples
  SET user1_id = v_remaining[1],
      user2_id = v_remaining[2],
      user3_id = v_remaining[3],
      user4_id = v_remaining[4],
      invite_code = lower(substr(md5(random()::text || clock_timestamp()::text), 1, 8))
  WHERE id = v_couple_id;
END;
$$;
