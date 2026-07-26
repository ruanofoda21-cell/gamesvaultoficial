
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS badges text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.game_info ADD COLUMN IF NOT EXISTS platforms text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.game_info ADD COLUMN IF NOT EXISTS languages text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.game_info ADD COLUMN IF NOT EXISTS age_rating text;
