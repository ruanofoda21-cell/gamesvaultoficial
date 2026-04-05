import { Download, Calendar, Tag, Trash2, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/StarRating";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GameCardProps {
  game: Tables<"games">;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (game: Tables<"games">) => void;
}

const GameCard = ({ game, isAdmin, onDelete, onEdit }: GameCardProps) => {
  return (
    <Link to={`/jogo/${game.id}`} className="block">
    <article className="neon-card rounded-lg overflow-hidden group">
      {game.image_url && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={game.image_url}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        </div>
      )}

      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-bold tracking-wide text-foreground leading-tight">
            {game.title}
          </h3>
          {game.category && (
            <Badge variant="outline" className="shrink-0 border-primary/30 text-primary font-display text-[10px] tracking-wider">
              {game.category}
            </Badge>
          )}
        </div>

        {game.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {game.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(game.created_at), "dd MMM yyyy", { locale: ptBR })}
        </div>

        <StarRating gameId={game.id} />

        <div className="flex items-center gap-2 pt-1" onClick={(e) => e.preventDefault()}>
          <a href={game.download_link} target="_blank" rel="noopener noreferrer" className="flex-1" onClick={(e) => e.stopPropagation()}>
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
