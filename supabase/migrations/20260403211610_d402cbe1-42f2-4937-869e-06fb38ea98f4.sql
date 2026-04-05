
CREATE TABLE public.suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert suggestions"
  ON public.suggestions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only admin can view suggestions"
  ON public.suggestions
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'email'::text) = 'kkzin107@gmail.com'::text);

CREATE POLICY "Only admin can update suggestions"
  ON public.suggestions
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email'::text) = 'kkzin107@gmail.com'::text);

CREATE POLICY "Only admin can delete suggestions"
  ON public.suggestions
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'email'::text) = 'kkzin107@gmail.com'::text);
