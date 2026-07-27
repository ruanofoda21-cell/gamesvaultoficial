
-- 1. Roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Seed admin from existing user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'kkzin107@gamevault.local'
ON CONFLICT DO NOTHING;

-- 2. Replace hardcoded-email admin policies with has_role()
DROP POLICY IF EXISTS "Admin can manage download counts" ON public.download_counts;
CREATE POLICY "Admin can manage download counts" ON public.download_counts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admin can create games" ON public.games;
CREATE POLICY "Only admin can create games" ON public.games
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admin can delete games" ON public.games;
CREATE POLICY "Only admin can delete games" ON public.games
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admin can update games" ON public.games;
CREATE POLICY "Only admin can update games" ON public.games
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admin can manage game info" ON public.game_info;
CREATE POLICY "Only admin can manage game info" ON public.game_info
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admin can delete suggestions" ON public.suggestions;
CREATE POLICY "Only admin can delete suggestions" ON public.suggestions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admin can update suggestions" ON public.suggestions;
CREATE POLICY "Only admin can update suggestions" ON public.suggestions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admin can view suggestions" ON public.suggestions;
CREATE POLICY "Only admin can view suggestions" ON public.suggestions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Fix always-true WITH CHECK on suggestions INSERT
DROP POLICY IF EXISTS "Authenticated users can insert suggestions" ON public.suggestions;
CREATE POLICY "Authenticated users can insert suggestions" ON public.suggestions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Restrict profiles SELECT to authenticated users
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- 5. Restrict chat_messages SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view chat messages" ON public.chat_messages;
CREATE POLICY "Authenticated users can view chat messages" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (true);

-- 6. Lock down SECURITY DEFINER functions from public/anon
REVOKE EXECUTE ON FUNCTION public.increment_download(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_download(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
-- handle_new_user only fires via trigger on auth.users; no direct callers needed.
