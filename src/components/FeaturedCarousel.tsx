import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

interface FeaturedCarouselProps {
  games: Tables<"games">[];
}

const FeaturedCarousel = ({ games }: FeaturedCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const featured = games.slice(0, 5);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) return null;

  const game = featured[current];

  return (
    <section className="relative overflow-hidden rounded-xl border border-border mx-4 lg:mx-0">
      <div className="relative h-64 sm:h-80 md:h-96">
        {game.image_url && (
          <img
            src={game.image_url}
            alt={game.title}
            className="w-full h-full object-cover transition-all duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 p-6 sm:p-8 space-y-3 max-w-lg">
          <span className="text-[10px] font-display tracking-[0.3em] text-primary uppercase">
            Em Destaque
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground">
            {game.title}
          </h2>
          {game.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {game.description}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <Link to={`/jogo/${game.id}`}>
              <Button size="sm" className="gap-2 font-display text-xs tracking-wider">
                VER DETALHES
              </Button>
            </Link>
            <a href={game.download_link} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2 font-display text-xs tracking-wider border-primary/30">
                <Download className="h-3 w-3" />
                DOWNLOAD
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      {featured.length > 1 && (
        <>
          <div className="absolute bottom-4 right-4 flex gap-1.5">
            {featured.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent(c => (c - 1 + featured.length) % featured.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full glassmorphism text-foreground hover:bg-primary/20 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrent(c => (c + 1) % featured.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full glassmorphism text-foreground hover:bg-primary/20 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </section>
  );
};

export default FeaturedCarousel;
