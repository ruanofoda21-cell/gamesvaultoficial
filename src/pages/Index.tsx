import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import GameCard from "@/components/GameCard";
import { Gamepad2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const Index = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const CATEGORIES = ["Ação", "RPG", "FPS", "Aventura", "Programa", "Esporte", "Sobrevivência", "Terror", "Plataforma"];

  const { data: games, isLoading } = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
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

  const filtered = games?.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || g.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      <Header />

      {/* Banner - Free Download Manager */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <img
            src="https://cdn.neowin.com/news/images/uploaded/2025/06/1750452476_free_download_manager.webp"
            alt="Free Download Manager"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
            <h3 className="font-display text-sm sm:text-base font-bold tracking-wider text-foreground">
              PROGRAMA PARA INSTALAR SEUS JOGOS
            </h3>
            <a
              href="https://www.freedownloadmanager.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="gap-2 font-display text-xs tracking-wider bg-primary text-primary-foreground hover:bg-primary/90">
                FREE DOWNLOAD MANAGER
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative text-center space-y-4">
          <h2 className="font-display text-4xl md:text-5xl font-black tracking-wider gradient-text">
            GAME VAULT
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Os melhores jogos para download, tudo em um só lugar.
          </p>

          <div className="max-w-md mx-auto relative mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar jogos..."
              className="pl-10 bg-card border-border"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(null)}
              className="font-display text-xs tracking-wider border-primary/30"
            >
              TODOS
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className="font-display text-xs tracking-wider border-primary/30"
              >
                {cat.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <main className="container mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="neon-card rounded-lg h-72 animate-pulse" />
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isAdmin={user?.email === "kkzin107@gmail.com"}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
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
      </main>
    </div>
  );
};

export default Index;
