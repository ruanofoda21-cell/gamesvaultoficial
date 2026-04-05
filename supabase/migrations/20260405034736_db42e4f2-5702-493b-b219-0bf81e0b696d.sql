
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, game_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can view ratings
CREATE POLICY "Anyone can view ratings"
  ON public.ratings FOR SELECT
  USING (true);

-- Logged-in users can insert their own rating
CREATE POLICY "Authenticated users can insert own rating"
  ON public.ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Logged-in users can update their own rating
CREATE POLICY "Authenticated users can update own rating"
  ON public.ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Logged-in users can delete their own rating
CREATE POLICY "Authenticated users can delete own rating"
  ON public.ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
