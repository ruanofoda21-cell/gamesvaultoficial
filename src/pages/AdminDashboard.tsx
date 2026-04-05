import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Navigate, Link } from "react-router-dom";
import { ArrowLeft, Gamepad2, Star, MessageCircle, Download, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: games } = useQuery({
    queryKey: ["admin-games"],
    queryFn: async () => {
      const { data } = await supabase.from("games").select("id, title").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: ratings } = useQuery({
    queryKey: ["admin-ratings"],
    queryFn: async () => {
      const { data } = await supabase.from("ratings").select("game_id, rating");
      return data || [];
    },
  });

  const { data: comments } = useQuery({
    queryKey: ["admin-comments"],
    queryFn: async () => {
      const { data } = await supabase.from("comments").select("id");
      return data || [];
    },
  });

  const { data: downloads } = useQuery({
    queryKey: ["admin-downloads"],
    queryFn: async () => {
      const { data } = await supabase.from("download_counts").select("game_id, count");
      return data || [];
    },
  });

  const { data: suggestions } = useQuery({
    queryKey: ["admin-suggestions-count"],
    queryFn: async () => {
      const { data } = await supabase.from("suggestions").select("id, read");
      return data || [];
    },
    enabled: user?.email === "kkzin107@gamevault.local",
  });

  if (authLoading) return null;
  if (!user || user.email !== "kkzin107@gamevault.local") return <Navigate to="/" />;

  const totalDownloads = downloads?.reduce((sum, d) => sum + d.count, 0) || 0;
  const avgRating = ratings && ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : "0";
  const unreadSuggestions = suggestions?.filter(s => !s.read).length || 0;

  // Top games by ratings
  const ratingMap: Record<string, { sum: number; count: number; title: string }> = {};
  ratings?.forEach(r => {
    if (!ratingMap[r.game_id]) {
      const game = games?.find(g => g.id === r.game_id);
      ratingMap[r.game_id] = { sum: 0, count: 0, title: game?.title || "?" };
    }
    ratingMap[r.game_id].sum += r.rating;
    ratingMap[r.game_id].count++;
  });
  const topRated = Object.entries(ratingMap)
    .map(([id, v]) => ({ id, title: v.title, avg: v.sum / v.count, count: v.count }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  // Top downloaded
  const topDownloaded = [...(downloads || [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(d => {
      const game = games?.find(g => g.id === d.game_id);
      return { title: game?.title || "?", count: d.count };
    });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h2 className="font-display text-2xl font-bold tracking-wider gradient-text">DASHBOARD ADMIN</h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={<Gamepad2 className="h-6 w-6 text-primary" />} label="JOGOS" value={String(games?.length || 0)} />
          <StatCard icon={<Star className="h-6 w-6 text-yellow-400" />} label="MÉDIA GERAL" value={avgRating} />
          <StatCard icon={<Download className="h-6 w-6 text-neon-green" />} label="DOWNLOADS" value={String(totalDownloads)} />
          <StatCard icon={<MessageCircle className="h-6 w-6 text-accent" />} label="COMENTÁRIOS" value={String(comments?.length || 0)} />
          <StatCard icon={<Users className="h-6 w-6 text-orange-400" />} label="SUGESTÕES" value={`${unreadSuggestions} novas`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Rated */}
          <div className="neon-card rounded-lg p-5 space-y-4">
            <h3 className="font-display text-sm font-bold tracking-wider text-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" /> MELHORES AVALIADOS
            </h3>
            {topRated.length > 0 ? (
              <div className="space-y-3">
                {topRated.map((g, i) => (
                  <div key={g.id} className="flex items-center justify-between">
                    <span className="text-sm text-foreground truncate flex-1">
                      <span className="text-muted-foreground mr-2">{i + 1}.</span>
                      {g.title.replace(/🟩TORRENT🟩/g, "").replace(/🟩/g, "").trim()}
                    </span>
                    <span className="text-xs text-primary font-bold ml-2">⭐ {g.avg.toFixed(1)} ({g.count})</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Sem avaliações ainda</p>}
          </div>

          {/* Top Downloaded */}
          <div className="neon-card rounded-lg p-5 space-y-4">
            <h3 className="font-display text-sm font-bold tracking-wider text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-neon-green" /> MAIS BAIXADOS
            </h3>
            {topDownloaded.length > 0 ? (
              <div className="space-y-3">
                {topDownloaded.map((g, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-foreground truncate flex-1">
                      <span className="text-muted-foreground mr-2">{i + 1}.</span>
                      {g.title.replace(/🟩TORRENT🟩/g, "").replace(/🟩/g, "").trim()}
                    </span>
                    <span className="text-xs text-neon-green font-bold ml-2">📥 {g.count}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Sem downloads ainda</p>}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="neon-card rounded-lg p-4 space-y-2 text-center">
    <div className="flex justify-center">{icon}</div>
    <p className="text-xl font-bold text-foreground">{value}</p>
    <p className="font-display text-[10px] tracking-wider text-muted-foreground">{label}</p>
  </div>
);

export default AdminDashboard;
