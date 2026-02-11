
-- Fix admin RPCs to check caller has admin role

CREATE OR REPLACE FUNCTION public.admin_get_user_count()
 RETURNS bigint
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  RETURN (SELECT count(*) FROM auth.users);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_couple_count()
 RETURNS bigint
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  RETURN (SELECT count(*) FROM public.couples WHERE user2_id IS NOT NULL);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_users()
 RETURNS TABLE(id uuid, email text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  RETURN QUERY
  SELECT u.id, u.email::text, u.created_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_user_growth(days_back integer DEFAULT 30)
 RETURNS TABLE(day date, count bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  RETURN QUERY
  SELECT date_trunc('day', u.created_at)::date AS day, count(*) AS count
  FROM auth.users u
  WHERE u.created_at >= now() - (days_back || ' days')::interval
  GROUP BY 1
  ORDER BY 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_couple_growth(days_back integer DEFAULT 30)
 RETURNS TABLE(day date, count bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  RETURN QUERY
  SELECT date_trunc('day', c.created_at)::date AS day, count(*) AS count
  FROM public.couples c
  WHERE c.user2_id IS NOT NULL
    AND c.created_at >= now() - (days_back || ' days')::interval
  GROUP BY 1
  ORDER BY 1;
END;
$$;
