import { Download, Calendar, Trash2, Edit, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/StarRating";
import GameBadge from "@/components/GameBadge";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface GameCardProps {
  game: Tables<"games">;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (game: Tables<"games">) => void;
  index?: number;
}

const GameCard = ({ game, isAdmin, onDelete, onEdit, index = 0 }: GameCardProps) => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const isTorrent = game.title.includes("TORRENT");
  const isNew = (Date.now() - new Date(game.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000;

  const { data: downloadCount } = useQuery({
    queryKey: ["download_count", game.id],
    queryFn: async () => {
      const { data } = await supabase.from("download_counts").select("count").eq("game_id", game.id).maybeSingle();
      return data?.count ?? 0;
    },
  });

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase.rpc("increment_download", { p_game_id: game.id });
    } catch {}
  };

  return (
    <Link to={`/jogo/${game.id}`} className="block">
      <article
        className="neon-card rounded-lg overflow-hidden group opacity-0 animate-fade-in-up"
        style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
      >
        <div className="relative h-48 overflow-hidden">
          {game.image_url ? (
            <img
              src={game.image_url}
              alt={game.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Sem imagem</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {isNew && <GameBadge type="new" />}
            {isTorrent && <GameBadge type="torrent" />}
          </div>

          {/* Favorite button */}
          {user && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite.mutate(game.id); }}
              className="absolute top-2 right-2 p-1.5 rounded-full glassmorphism transition-all hover:scale-110"
            >
              <Heart className={cn("h-4 w-4 transition-colors", isFavorite(game.id) ? "fill-red-500 text-red-500" : "text-foreground/70")} />
            </button>
          )}
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-bold tracking-wide text-foreground leading-tight line-clamp-1">
              {game.title.replace(/🟩TORRENT🟩/g, "").replace(/🟩/g, "").trim()}
            </h3>
            {game.category && (
              <Badge variant="outline" className="shrink-0 border-primary/30 text-primary font-display text-[10px] tracking-wider">
                {game.category}
              </Badge>
            )}
          </div>

          {game.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {game.description}
            </p>
          )}

          <div className="flex items-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(game.created_at), "dd MMM yyyy", { locale: ptBR })}
            </span>
          </div>

          <StarRating gameId={game.id} />

          <div className="flex items-center gap-2 pt-1" onClick={(e) => e.preventDefault()}>
            <a href={game.download_link} target="_blank" rel="noopener noreferrer" className="flex-1" onClick={(e) => { e.stopPropagation(); handleDownload(e); }}>
              <Button className="w-full gap-2 font-display text-xs tracking-wider" size="sm">
                <Download className="h-4 w-4" />
                DOWNLOAD
              </Button>
            </a>

            {isAdmin && (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(game); }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(game.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
};

export default GameCard;
