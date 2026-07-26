import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import StarRating from "@/components/StarRating";
import CommentSection from "@/components/CommentSection";
import GameBadge from "@/components/GameBadge";
import { ArrowLeft, Download, HardDrive, Monitor, Cpu, MemoryStick, Loader2, Calendar, Tag, User, Building, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";


interface GameInfo {
  detected_title: string;
  developer: string;
  publisher: string;
  release_year: number;
  genre: string;
  file_size: string;
  description_full: string;
  screenshots: string[];
  requirements_min: { os: string; cpu: string; ram: string; gpu: string; storage: string };
  requirements_rec: { os: string; cpu: string; ram: string; gpu: string; storage: string };
}

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  

  const { data: game, isLoading: gameLoading } = useQuery({
    queryKey: ["game", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("games").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: gameInfo, isLoading: infoLoading } = useQuery({
    queryKey: ["game-info", id],
    queryFn: async () => {
      const { data: dbData } = await supabase.from("game_info").select("*").eq("game_id", id!).maybeSingle();
      if (dbData) {
        return {
          detected_title: dbData.detected_title, developer: dbData.developer, publisher: dbData.publisher,
          release_year: dbData.release_year, genre: dbData.genre, file_size: dbData.file_size,
          description_full: dbData.description_full, screenshots: dbData.screenshots || [],
          requirements_min: { os: dbData.req_min_os, cpu: dbData.req_min_cpu, ram: dbData.req_min_ram, gpu: dbData.req_min_gpu, storage: dbData.req_min_storage },
          requirements_rec: { os: dbData.req_rec_os, cpu: dbData.req_rec_cpu, ram: dbData.req_rec_ram, gpu: dbData.req_rec_gpu, storage: dbData.req_rec_storage },
        } as GameInfo;
      }
      if (!game) return null;
      const { data: aiData, error } = await supabase.functions.invoke("get-game-info", {
        body: { game_id: id, title: game.title, description: game.description },
      });
      if (error) throw error;
      if (!aiData || aiData.error) return null;
      return {
        detected_title: aiData.detected_title, developer: aiData.developer, publisher: aiData.publisher,
        release_year: aiData.release_year, genre: aiData.genre, file_size: aiData.file_size,
        description_full: aiData.description_full, screenshots: aiData.screenshots || [],
        requirements_min: { os: aiData.req_min_os, cpu: aiData.req_min_cpu, ram: aiData.req_min_ram, gpu: aiData.req_min_gpu, storage: aiData.req_min_storage },
        requirements_rec: { os: aiData.req_rec_os, cpu: aiData.req_rec_cpu, ram: aiData.req_rec_ram, gpu: aiData.req_rec_gpu, storage: aiData.req_rec_storage },
      } as GameInfo;
    },
    enabled: !!id && !gameLoading,
  });

  const handleDownload = async () => {
    if (id) {
      try { await supabase.rpc("increment_download", { p_game_id: id }); } catch {}
    }
  };


  if (gameLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Jogo não encontrado.</p>
          <Link to="/"><Button variant="outline" className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" /> Voltar</Button></Link>
        </div>
      </div>
    );
  }

  const isTorrent = game.title.includes("TORRENT");
  const cleanTitle = game.title.replace(/🟩TORRENT🟩/g, "").replace(/🟩/g, "").trim();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Banner */}
      <div className="relative">
        {game.image_url && (
          <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
            <img src={game.image_url} alt={game.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
        )}

        <div className="container mx-auto px-4 relative -mt-24 z-10 pb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-3xl md:text-4xl font-black tracking-wider text-foreground">
                  {cleanTitle}
                </h1>
                {isTorrent && <GameBadge type="torrent" />}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {game.category && (
                  <Badge variant="outline" className="border-primary/30 text-primary font-display text-xs tracking-wider">
                    {game.category}
                  </Badge>
                )}
                {((game as any).badges as string[] | undefined)?.filter(b => b.toLowerCase() !== "torrent").map((b) => (
                  <GameBadge key={b} label={b} />
                ))}
                <span className="text-xs text-muted-foreground flex items-center gap-1 ml-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(game.created_at), "dd MMM yyyy", { locale: ptBR })}
                </span>
              </div>

              <StarRating gameId={game.id} />

              {game.description && (
                <p className="text-muted-foreground leading-relaxed max-w-2xl">{game.description}</p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <a href={game.download_link} target="_blank" rel="noopener noreferrer" onClick={handleDownload}>
                  <Button className="gap-2 font-display tracking-wider" size="lg">
                    <Download className="h-5 w-5" /> DOWNLOAD
                  </Button>
                </a>
                {user && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => toggleFavorite.mutate(game.id)}
                    className="gap-2 border-primary/30"
                  >
                    <Heart className={cn("h-5 w-5", isFavorite(game.id) ? "fill-red-500 text-red-500" : "")} />
                    {isFavorite(game.id) ? "FAVORITADO" : "FAVORITAR"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* AI-detected info */}
      <div className="container mx-auto px-4 pb-16 space-y-10">
        {infoLoading ? (
          <div className="flex items-center gap-3 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="font-display text-sm tracking-wider">CARREGANDO INFORMAÇÕES DO JOGO...</span>
          </div>
        ) : gameInfo && !(gameInfo as any).error ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InfoCard icon={<HardDrive className="h-5 w-5 text-primary" />} label="TAMANHO" value={gameInfo.file_size} />
              <InfoCard icon={<User className="h-5 w-5 text-primary" />} label="DESENVOLVEDOR" value={gameInfo.developer} />
              <InfoCard icon={<Building className="h-5 w-5 text-primary" />} label="PUBLICADORA" value={gameInfo.publisher} />
              <InfoCard icon={<Tag className="h-5 w-5 text-primary" />} label="ANO" value={String(gameInfo.release_year)} />
            </div>


            {gameInfo.screenshots && gameInfo.screenshots.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-bold tracking-wider text-foreground mb-4">SCREENSHOTS</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gameInfo.screenshots.map((url, i) => (
                    <div key={i} className="rounded-lg overflow-hidden border border-border opacity-0 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms`, animationFillMode: "forwards" }}>
                      <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" onError={(e) => (e.currentTarget.style.display = "none")} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {gameInfo.requirements_min && (
              <section>
                <h2 className="font-display text-lg font-bold tracking-wider text-foreground mb-4">REQUISITOS DO SISTEMA</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RequirementsCard title="MÍNIMOS" reqs={gameInfo.requirements_min} />
                  {gameInfo.requirements_rec && <RequirementsCard title="RECOMENDADOS" reqs={gameInfo.requirements_rec} />}
                </div>
              </section>
            )}
          </>
        ) : null}

        {/* Comments Section */}
        {id && <CommentSection gameId={id} />}
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="neon-card rounded-lg p-4 space-y-2">
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-display text-[10px] tracking-wider text-muted-foreground">{label}</span>
    </div>
    <p className="text-sm font-semibold text-foreground truncate">{value}</p>
  </div>
);

const RequirementsCard = ({ title, reqs }: { title: string; reqs: { os: string; cpu: string; ram: string; gpu: string; storage: string } }) => (
  <div className="neon-card rounded-lg p-5 space-y-3">
    <h3 className="font-display text-sm font-bold tracking-wider text-primary">{title}</h3>
    <div className="space-y-2 text-sm">
      <ReqRow icon={<Monitor className="h-4 w-4" />} label="SO" value={reqs.os} />
      <ReqRow icon={<Cpu className="h-4 w-4" />} label="CPU" value={reqs.cpu} />
      <ReqRow icon={<MemoryStick className="h-4 w-4" />} label="RAM" value={reqs.ram} />
      <ReqRow icon={<Monitor className="h-4 w-4" />} label="GPU" value={reqs.gpu} />
      <ReqRow icon={<HardDrive className="h-4 w-4" />} label="Armazenamento" value={reqs.storage} />
    </div>
  </div>
);

const ReqRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <span className="text-muted-foreground mt-0.5">{icon}</span>
    <div>
      <span className="text-muted-foreground text-xs">{label}</span>
      <p className="text-foreground">{value}</p>
    </div>
  </div>
);

export default GameDetail;
