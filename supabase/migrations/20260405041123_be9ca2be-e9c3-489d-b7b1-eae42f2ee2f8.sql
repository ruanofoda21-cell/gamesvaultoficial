CREATE TABLE public.game_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL UNIQUE,
  detected_title TEXT,
  developer TEXT,
  publisher TEXT,
  release_year INTEGER,
  genre TEXT,
  file_size TEXT,
  description_full TEXT,
  screenshots TEXT[] DEFAULT '{}',
  req_min_os TEXT,
  req_min_cpu TEXT,
  req_min_ram TEXT,
  req_min_gpu TEXT,
  req_min_storage TEXT,
  req_rec_os TEXT,
  req_rec_cpu TEXT,
  req_rec_ram TEXT,
  req_rec_gpu TEXT,
  req_rec_storage TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.game_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view game info"
  ON public.game_info FOR SELECT
  USING (true);

CREATE POLICY "Only admin can manage game info"
  ON public.game_info FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'email'::text) = 'kkzin107@gamevault.local'::text)
  WITH CHECK ((auth.jwt() ->> 'email'::text) = 'kkzin107@gamevault.local'::text);