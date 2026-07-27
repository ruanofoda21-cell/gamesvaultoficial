import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import GameCard from "@/components/GameCard";
import SkeletonCard from "@/components/SkeletonCard";
import { Flame, Clock, TrendingUp, Trophy, Sparkles, Download, Gamepad2 } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Ação", "RPG", "FPS", "Aventura", "Simulação", "Esporte", "Sobrevivência", "Terror", "Plataforma"];

type Tab = "hot" | "top" | "recent";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("hot");
  const [heroIndex, setHeroIndex] = useState(0);

  const { data: games, isLoading } = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase.from("games").select("*").order("title", { ascending: false });
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

  const filtered = useMemo(() => {
    return games?.filter((g) => {
      const matchesSearch =
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.category?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !activeCategory || g.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [games, search, activeCategory]);

  const featured = useMemo(() => (games || []).slice(0, 5), [games]);
  const hero = featured[heroIndex];

  const popularGames = useMemo(() => {
    if (!games || !allRatings) return [];
    const ratingMap: Record<string, { sum: number; count: number }> = {};
    allRatings.forEach((r) => {
      if (!ratingMap[r.game_id]) ratingMap[r.game_id] = { sum: 0, count: 0 };
      ratingMap[r.game_id].sum += r.rating;
      ratingMap[r.game_id].count++;
    });
    return [...games]
      .filter((g) => ratingMap[g.id]?.count > 0)
      .sort((a, b) => {
        const aAvg = (ratingMap[a.id]?.sum || 0) / (ratingMap[a.id]?.count || 1);
        const bAvg = (ratingMap[b.id]?.sum || 0) / (ratingMap[b.id]?.count || 1);
        return bAvg - aAvg;
      });
  }, [games, allRatings]);

  const recentGames = useMemo(() => {
    if (!games) return [];
    return [...games].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);
  }, [games]);

  const mostDownloaded = useMemo(() => {
    if (!games || !downloadCounts) return [];
    const dcMap: Record<string, number> = {};
    downloadCounts.forEach((d) => {
      dcMap[d.game_id] = d.count;
    });
    return [...games]
      .filter((g) => (dcMap[g.id] || 0) > 0)
      .sort((a, b) => (dcMap[b.id] || 0) - (dcMap[a.id] || 0))
      .slice(0, 8);
  }, [games, downloadCounts]);

  const tabGames = tab === "hot" ? mostDownloaded : tab === "top" ? popularGames.slice(0, 8) : recentGames;

  const surpriseMe = () => {
    if (!games?.length) return;
    const g = games[Math.floor(Math.random() * games.length)];
    navigate(`/jogo/${g.id}`);
  };

  const isAdmin = user?.email === "kkzin107@gamevault.local";
  const cleanTitle = (t: string) => t.replace(/🟩TORRENT🟩/g, "").replace(/🟩/g, "").trim();

  return (
    <Layout search={search} onSearchChange={setSearch}>
      <div className="px-6 py-6 space-y-8 max-w-[1400px] mx-auto">
        {/* Featured hero */}
        {!search && !activeCategory && hero && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">Destaque</h2>
            <Link
              to={`/jogo/${hero.id}`}
              className="block relative rounded-xl overflow-hidden border border-border group aspect-[21/9] bg-card"
            >
              {hero.image_url && (
                <img
                  src={hero.image_url}
                  alt={hero.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 space-y-2 max-w-2xl">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground drop-shadow-lg">
                  {cleanTitle(hero.title)}
                </h3>
                {hero.description && (
                  <p className="text-sm text-foreground/80 line-clamp-2 md:line-clamp-3">{hero.description}</p>
                )}
              </div>
              {featured.length > 1 && (
                <div className="absolute bottom-4 right-4 flex gap-1.5">
                  {featured.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.preventDefault();
                        setHeroIndex(i);
                      }}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        i === heroIndex ? "w-6 bg-primary" : "w-1.5 bg-foreground/40 hover:bg-foreground/70"
                      )}
                    />
                  ))}
                </div>
              )}
            </Link>
          </section>
        )}

        {/* Tabs row */}
        {!search && !activeCategory && (
          <div className="flex flex-wrap items-center gap-2">
            <TabPill active={tab === "hot"} onClick={() => setTab("hot")} icon={<Flame className="h-3.5 w-3.5 text-orange-400" />} label="Em alta" />
            <TabPill active={tab === "top"} onClick={() => setTab("top")} icon={<Trophy className="h-3.5 w-3.5 text-yellow-400" />} label="Melhor avaliados" />
            <TabPill active={tab === "recent"} onClick={() => setTab("recent")} icon={<Clock className="h-3.5 w-3.5 text-primary" />} label="Recentes" />
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={surpriseMe} className="gap-2 text-xs border-border hover:bg-secondary">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Surpreenda-me
            </Button>
          </div>
        )}

        {/* Tab section */}
        {!search && !activeCategory && tabGames.length > 0 && (
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tabGames.map((g, i) => (
                <GameCard key={g.id} game={g} isAdmin={isAdmin} onDelete={(id) => deleteMutation.mutate(id)} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        {!search && !activeCategory && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-foreground">Categorias</h2>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className="px-4 py-1.5 rounded-full text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* All / filtered */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {search
                ? `Resultados para "${search}"`
                : activeCategory
                ? activeCategory
                : "Catálogo"}
            </h2>
            {activeCategory && (
              <Button variant="ghost" size="sm" onClick={() => setActiveCategory(null)} className="text-xs text-muted-foreground">
                Limpar filtro
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((game, i) => (
                <GameCard key={game.id} game={game} isAdmin={isAdmin} onDelete={(id) => deleteMutation.mutate(id)} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-3 border border-dashed border-border rounded-xl">
              <Gamepad2 className="h-12 w-12 text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground text-sm">
                {search ? "Nenhum jogo encontrado" : "Nenhum jogo postado ainda"}
              </p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

const TabPill = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium border transition-colors",
      active
        ? "bg-secondary border-border text-foreground"
        : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60"
    )}
  >
    {icon}
    {label}
  </button>
);

export default Index;
