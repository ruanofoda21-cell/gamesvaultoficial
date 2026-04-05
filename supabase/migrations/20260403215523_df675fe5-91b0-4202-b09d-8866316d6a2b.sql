
-- Update RLS policies for games table
DROP POLICY "Only admin can create games" ON public.games;
CREATE POLICY "Only admin can create games" ON public.games FOR INSERT TO authenticated WITH CHECK ((auth.jwt() ->> 'email'::text) = 'kkzin107@gamevault.local'::text);

DROP POLICY "Only admin can delete games" ON public.games;
CREATE POLICY "Only admin can delete games" ON public.games FOR DELETE TO authenticated USING ((auth.jwt() ->> 'email'::text) = 'kkzin107@gamevault.local'::text);

DROP POLICY "Only admin can update games" ON public.games;
CREATE POLICY "Only admin can update games" ON public.games FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'email'::text) = 'kkzin107@gamevault.local'::text);

-- Update RLS policies for suggestions table
DROP POLICY "Only admin can delete suggestions" ON public.suggestions;
CREATE POLICY "Only admin can delete suggestions" ON public.suggestions FOR DELETE TO authenticated USING ((auth.jwt() ->> 'email'::text) = 'kkzin107@gamevault.local'::text);

DROP POLICY "Only admin can update suggestions" ON public.suggestions;
CREATE POLICY "Only admin can update suggestions" ON public.suggestions FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'email'::text) = 'kkzin107@gamevault.local'::text);

DROP POLICY "Only admin can view suggestions" ON public.suggestions;
CREATE POLICY "Only admin can view suggestions" ON public.suggestions FOR SELECT TO authenticated USING ((auth.jwt() ->> 'email'::text) = 'kkzin107@gamevault.local'::text);
