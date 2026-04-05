
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Authenticated users can create games" ON public.games;
DROP POLICY IF EXISTS "Authenticated users can update games" ON public.games;
DROP POLICY IF EXISTS "Authenticated users can delete games" ON public.games;

-- Create restrictive policies for specific email only
CREATE POLICY "Only admin can create games"
ON public.games FOR INSERT TO authenticated
WITH CHECK (auth.jwt() ->> 'email' = 'kkzin107@gmail.com');

CREATE POLICY "Only admin can update games"
ON public.games FOR UPDATE TO authenticated
USING (auth.jwt() ->> 'email' = 'kkzin107@gmail.com');

CREATE POLICY "Only admin can delete games"
ON public.games FOR DELETE TO authenticated
USING (auth.jwt() ->> 'email' = 'kkzin107@gmail.com');
