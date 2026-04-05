import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { Trophy, Download, Heart, Star, Medal, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORIES = ["Todos", "Ação", "RPG", "FPS", "Aventura", "Simulação", "Esporte", "Sobrevivência", "Terror", "Plataforma"];

const Ranking = () => {
  const [category, setCategory] = useState("Todos");

  const { data: games } = useQuery({
    queryKey: ["all-games"],
    queryFn: async () => {
      const { data } = await supabase.from("games").select("*");
      return data || [];
    },
  });

  const { data: ratings } = useQuery({
    queryKey: ["all-ratings"],
    queryFn: async () => {
      const { data } = await supabase.from("ratings").select("*");
      return data || [];
    },
  });

  const { data: downloads } = useQuery({
    queryKey: ["all-downloads"],
    queryFn: async () => {
      const { data } = await supabase.from("download_counts").select("*");
      return data || [];
    },
  });

  const { data: favorites } = useQuery({
    queryKey: ["all-favorites"],
    queryFn: async () => {
      const { data } = await supabase.from("favorites").select("game_id");
      return data || [];
    },
  });

  const filtered = games?.filter(g => category === "Todos" || g.category === category) || [];

  const ratingMap: Record<string, { sum: number; count: number }> = {};
  ratings?.forEach(r => {
    if (!ratingMap[r.game_id]) ratingMap[r.game_id] = { sum: 0, count: 0 };
    ratingMap[r.game_id].sum += r.rating;
    ratingMap[r.game_id].count += 1;
  });

  const downloadMap: Record<string, number> = {};
  downloads?.forEach(d => { downloadMap[d.game_id] = d.count; });

  const favMap: Record<string, number> = {};
  favorites?.forEach(f => { favMap[f.game_id] = (favMap[f.game_id] || 0) + 1; });

  const topRated = [...filtered]
    .filter(g => ratingMap[g.id]?.count > 0)
    .sort((a, b) => (ratingMap[b.id]?.sum / ratingMap[b.id]?.count) - (ratingMap[a.id]?.sum / ratingMap[a.id]?.count));

  const topDownloaded = [...filtered].sort((a, b) => (downloadMap[b.id] || 0) - (downloadMap[a.id] || 0));
  const topFavorited = [...filtered].sort((a, b) => (favMap[b.id] || 0) - (favMap[a.id] || 0));

  const getMedal = (i: number) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `#${i + 1}`;
  };

  const RankList = ({ list, getValue }: { list: typeof filtered; getValue: (g: typeof filtered[0]) => string }) => (
    <div className="space-y-2">
      {list.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhum jogo encontrado.</p>}
      {list.slice(0, 20).map((game, i) => (
        <Link
          key={game.id}
          to={`/jogo/${game.id}`}
          className="neon-card rounded-lg p-3 flex items-center gap-4 hover:scale-[1.01] transition-transform opacity-0 animate-fade-in-up"
          style={{ animationDelay: `${i * 40}ms`, animationFillMode: "forwards" }}
        >
          <span className="text-xl font-bold font-display w-10 text-center shrink-0">{getMedal(i)}</span>
          <img
            src={game.image_url || "/placeholder.svg"}
            alt={game.title}
            className="h-12 w-12 rounded object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm font-bold tracking-wider text-foreground truncate">{game.title}</p>
            <p className="text-xs text-muted-foreground">{game.category || "Outros"}</p>
          </div>
          <span className="text-sm font-bold text-primary shrink-0">{getValue(game)}</span>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-7 w-7 text-yellow-400" />
          <h1 className="font-display text-2xl font-bold tracking-wider text-foreground">RANKING</h1>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? "default" : "outline"}
              onClick={() => setCategory(c)}
              className="text-xs"
            >
              {c}
            </Button>
          ))}
        </div>

        <Tabs defaultValue="rated" className="space-y-4">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="rated" className="gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Star className="h-3 w-3" /> Mais Avaliados
            </TabsTrigger>
            <TabsTrigger value="downloaded" className="gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Download className="h-3 w-3" /> Mais Baixados
            </TabsTrigger>
            <TabsTrigger value="favorited" className="gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Heart className="h-3 w-3" /> Mais Favoritados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rated">
            <RankList
              list={topRated}
              getValue={g => {
                const r = ratingMap[g.id];
                return r ? `${(r.sum / r.count).toFixed(1)} ⭐ (${r.count})` : "—";
              }}
            />
          </TabsContent>
          <TabsContent value="downloaded">
            <RankList list={topDownloaded} getValue={g => `${downloadMap[g.id] || 0} downloads`} />
          </TabsContent>
          <TabsContent value="favorited">
            <RankList list={topFavorited} getValue={g => `${favMap[g.id] || 0} ❤️`} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Ranking;
