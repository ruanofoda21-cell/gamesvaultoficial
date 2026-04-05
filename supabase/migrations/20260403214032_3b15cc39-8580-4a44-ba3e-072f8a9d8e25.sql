
DROP POLICY "Anyone can insert suggestions" ON public.suggestions;
CREATE POLICY "Authenticated users can insert suggestions"
  ON public.suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
