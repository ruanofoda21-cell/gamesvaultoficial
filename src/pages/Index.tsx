import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import GameCard from "@/components/GameCard";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import SkeletonCard from "@/components/SkeletonCard";
import { Gamepad2, Search, Flame, Clock, TrendingUp, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

const CATEGORIES = ["Ação", "RPG", "FPS", "Aventura", "Simulação", "Esporte", "Sobrevivência", "Terror", "Plataforma"];

const CATEGORY_ICONS: Record<string, string> = {
  "Ação": "⚔️", "RPG": "🎭", "FPS": "🔫", "Aventura": "🗺️",
  "Simulação": "🎮", "Esporte": "⚽", "Sobrevivência": "🏕️",
  "Terror": "👻", "Plataforma": "🍄",
};

const Index = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: games, isLoading } = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("title", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: allRatings } = useQuery({
    queryKey: ["all-ratings"],
    queryFn: async () => {
      const { data } = await supabase.from("ratings").select("game_id, rating");
      return data || [];
    },
  });

  const { data: downloadCounts } = useQuery({
    queryKey: ["all-download-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("download_counts").select("game_id, count");
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("games").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast.success("Jogo removido!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Close autocomplete on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    return games?.filter((g) => {
      const matchesSearch =
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.category?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !activeCategory || g.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [games, search, activeCategory]);

  const searchSuggestions = useMemo(() => {
    if (!search || search.length < 2 || !games) return [];
    return games
      .filter(g => g.title.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 5);
  }, [search, games]);

  // Popular games (by average rating)
  const popularGames = useMemo(() => {
    if (!games || !allRatings) return [];
    const ratingMap: Record<string, { sum: number; count: number }> = {};
    allRatings.forEach(r => {
      if (!ratingMap[r.game_id]) ratingMap[r.game_id] = { sum: 0, count: 0 };
      ratingMap[r.game_id].sum += r.rating;
      ratingMap[r.game_id].count++;
    });
    return [...games]
      .filter(g => ratingMap[g.id]?.count > 0)
      .sort((a, b) => {
        const aAvg = (ratingMap[a.id]?.sum || 0) / (ratingMap[a.id]?.count || 1);
        const bAvg = (ratingMap[b.id]?.sum || 0) / (ratingMap[b.id]?.count || 1);
        return bAvg - aAvg;
      })
      .slice(0, 6);
  }, [games, allRatings]);

  // Recently added (last 7 days)
  const recentGames = useMemo(() => {
    if (!games) return [];
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return games.filter(g => new Date(g.created_at).getTime() > weekAgo).slice(0, 6);
  }, [games]);

  // Most downloaded
  const mostDownloaded = useMemo(() => {
    if (!games || !downloadCounts) return [];
    const dcMap: Record<string, number> = {};
    downloadCounts.forEach(d => { dcMap[d.game_id] = d.count; });
    return [...games]
      .filter(g => (dcMap[g.id] || 0) > 0)
      .sort((a, b) => (dcMap[b.id] || 0) - (dcMap[a.id] || 0))
      .slice(0, 6);
  }, [games, downloadCounts]);

  const isAdmin = user?.email === "kkzin107@gamevault.local";

  return (
    <div className="min-h-screen">
      <Header />

      {/* Banner - Free Download Manager */}
      <section className="bg-card/50 border-b border-border">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <img
            src="https://cdn.neowin.com/news/images/uploaded/2025/06/1750452476_free_download_manager.webp"
            alt="Free Download Manager"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
            <h3 className="font-display text-xs sm:text-sm font-bold tracking-wider text-foreground">
              PROGRAMA PARA INSTALAR SEUS JOGOS
            </h3>
            <a href="https://www.freedownloadmanager.org/" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-2 font-display text-xs tracking-wider">
                FREE DOWNLOAD MANAGER
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Hero with glassmorphism */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 hero-gradient animate-gradient" />
        <div className="container mx-auto px-4 relative text-center space-y-4">
          <h2 className="font-display text-4xl md:text-5xl font-black tracking-wider gradient-text animate-fade-in">
            GAME VAULT
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto animate-fade-in" style={{ animationDelay: "100ms" }}>
            Os melhores jogos para download, tudo em um só lugar.
          </p>

          {/* Search with autocomplete */}
          <div className="max-w-md mx-auto relative mt-6" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Buscar jogos..."
              className="pl-10 bg-card border-border"
            />
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border glassmorphism overflow-hidden z-20">
                {searchSuggestions.map(g => (
                  <button
                    key={g.id}
                    onClick={() => { setSearch(g.title); setShowSuggestions(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 flex items-center gap-3 transition-colors"
                  >
                    {g.image_url && <img src={g.image_url} alt="" className="w-8 h-8 rounded object-cover" />}
                    <div>
                      <span className="text-foreground">{g.title.replace(/🟩TORRENT🟩/g, "").replace(/🟩/g, "").trim()}</span>
                      {g.category && <span className="text-xs text-muted-foreground ml-2">{g.category}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Filters with icons */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(null)}
              className="font-display text-xs tracking-wider border-primary/30"
            >
              🎯 TODOS
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className="font-display text-xs tracking-wider border-primary/30"
              >
                {CATEGORY_ICONS[cat] || "🎮"} {cat.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-16 space-y-12">
        {/* Featured Carousel */}
        {!search && !activeCategory && games && games.length > 0 && (
          <FeaturedCarousel games={games} />
        )}

        {/* Compact Top 5 Ranking */}
        {!search && !activeCategory && popularGames.length > 0 && (
          <section className="neon-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold tracking-wider text-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                TOP 5 RANKING
              </h2>
              <Link to="/ranking">
                <Button variant="ghost" size="sm" className="font-display text-xs tracking-wider text-primary">
                  VER COMPLETO →
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {popularGames.slice(0, 5).map((game, i) => {
                const r = allRatings?.reduce(
                  (acc, cur) => {
                    if (cur.game_id === game.id) { acc.sum += cur.rating; acc.count++; }
                    return acc;
                  },
                  { sum: 0, count: 0 }
                );
                const avg = r && r.count > 0 ? (r.sum / r.count).toFixed(1) : "—";
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
                return (
                  <Link
                    key={game.id}
                    to={`/jogo/${game.id}`}
                    className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-primary/10 transition-colors opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${i * 60}ms`, animationFillMode: "forwards" }}
                  >
                    <span className="text-lg font-bold font-display w-8 text-center shrink-0">{medal}</span>
                    <img
                      src={game.image_url || "/placeholder.svg"}
                      alt={game.title}
                      className="h-10 w-10 rounded object-cover shrink-0"
                    />
                    <span className="font-display text-sm font-bold tracking-wider text-foreground truncate flex-1">
                      {game.title}
                    </span>
                    <span className="text-sm font-bold text-primary shrink-0">{avg} ⭐</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Recently Added */}
        {!search && !activeCategory && recentGames.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-bold tracking-wider text-foreground flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-neon-green" />
              ADICIONADOS RECENTEMENTE
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentGames.map((game, i) => (
                <GameCard key={game.id} game={game} isAdmin={isAdmin} onDelete={(id) => deleteMutation.mutate(id)} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Most Downloaded */}
        {!search && !activeCategory && mostDownloaded.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-bold tracking-wider text-foreground flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-accent" />
              MAIS BAIXADOS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mostDownloaded.map((game, i) => (
                <GameCard key={game.id} game={game} isAdmin={isAdmin} onDelete={(id) => deleteMutation.mutate(id)} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Games */}
        {!search && !activeCategory && popularGames.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-bold tracking-wider text-foreground flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-orange-400" />
              POPULARES
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularGames.map((game, i) => (
                <GameCard key={game.id} game={game} isAdmin={isAdmin} onDelete={(id) => deleteMutation.mutate(id)} index={i} />
              ))}
            </div>
          </section>
        )}



        {/* All Games / Filtered */}
        <section>
          {(search || activeCategory) && (
            <h2 className="font-display text-lg font-bold tracking-wider text-foreground mb-4">
              {search ? `RESULTADOS PARA "${search.toUpperCase()}"` : activeCategory?.toUpperCase()}
            </h2>
          )}
          {!search && !activeCategory && (
            <h2 className="font-display text-lg font-bold tracking-wider text-foreground flex items-center gap-2 mb-4">
              <Gamepad2 className="h-5 w-5 text-primary" />
              TODOS OS JOGOS
            </h2>
          )}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((game, i) => (
                <GameCard key={game.id} game={game} isAdmin={isAdmin} onDelete={(id) => deleteMutation.mutate(id)} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-4">
              <Gamepad2 className="h-16 w-16 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground font-display tracking-wider">
                {search ? "NENHUM JOGO ENCONTRADO" : "NENHUM JOGO POSTADO AINDA"}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
