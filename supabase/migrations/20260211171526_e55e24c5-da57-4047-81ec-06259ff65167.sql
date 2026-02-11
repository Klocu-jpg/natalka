
-- Function to list users with email and creation date (admin only)
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(id uuid, email text, created_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.email::text, u.created_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
$$;

-- Function to get daily user registration counts for charts
CREATE OR REPLACE FUNCTION public.admin_user_growth(days_back int DEFAULT 30)
RETURNS TABLE(day date, count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT date_trunc('day', u.created_at)::date AS day, count(*) AS count
  FROM auth.users u
  WHERE u.created_at >= now() - (days_back || ' days')::interval
  GROUP BY day
  ORDER BY day;
$$;

-- Function to get daily couple creation counts for charts
CREATE OR REPLACE FUNCTION public.admin_couple_growth(days_back int DEFAULT 30)
RETURNS TABLE(day date, count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT date_trunc('day', c.created_at)::date AS day, count(*) AS count
  FROM public.couples c
  WHERE c.user2_id IS NOT NULL
    AND c.created_at >= now() - (days_back || ' days')::interval
  GROUP BY day
  ORDER BY day;
$$;
