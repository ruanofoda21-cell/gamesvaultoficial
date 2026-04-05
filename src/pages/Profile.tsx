import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import Header from "@/components/Header";
import GameCard from "@/components/GameCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User, Heart, Star, Edit2, Check, Trophy, Gamepad2 } from "lucide-react";
import { Navigate, Link } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { favorites } = useFavorites();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
      }
      return data;
    },
    enabled: !!user,
  });

  const { data: userRatings } = useQuery({
    queryKey: ["user-ratings", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("ratings").select("*").eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: favoriteGames } = useQuery({
    queryKey: ["favorite-games", favorites],
    queryFn: async () => {
      if (favorites.length === 0) return [];
      const { data } = await supabase.from("games").select("*").in("id", favorites);
      return data || [];
    },
    enabled: favorites.length > 0,
  });

  const { data: userComments } = useQuery({
    queryKey: ["user-comments", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("comments").select("*").eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName, bio })
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil atualizado!");
    },
  });

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" />;

  // Achievements
  const achievements = [
    { id: "first_rating", label: "Primeira Avaliação", icon: "⭐", unlocked: (userRatings?.length || 0) >= 1 },
    { id: "10_ratings", label: "Avaliou 10 Jogos", icon: "🌟", unlocked: (userRatings?.length || 0) >= 10 },
    { id: "first_comment", label: "Primeiro Comentário", icon: "💬", unlocked: (userComments?.length || 0) >= 1 },
    { id: "first_fav", label: "Primeiro Favorito", icon: "❤️", unlocked: favorites.length >= 1 },
    { id: "5_favs", label: "5 Favoritos", icon: "💖", unlocked: favorites.length >= 5 },
    { id: "collector", label: "Colecionador (10 Favs)", icon: "🏆", unlocked: favorites.length >= 10 },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Profile Header */}
        <div className="neon-card rounded-lg p-6 flex flex-col sm:flex-row items-center gap-6 animate-fade-in">
          <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-3xl font-bold text-primary font-display">
              {(profile?.display_name || "U")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 text-center sm:text-left space-y-2">
            {editing ? (
              <div className="space-y-3 max-w-sm">
                <div><Label>Nome</Label><Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="bg-card border-border" /></div>
                <div><Label>Bio</Label><Textarea value={bio} onChange={e => setBio(e.target.value)} className="bg-card border-border" maxLength={200} /></div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateProfile.mutate()} className="gap-1"><Check className="h-3 w-3" /> Salvar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h2 className="font-display text-xl font-bold tracking-wider text-foreground">{profile?.display_name || "Usuário"}</h2>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditing(true)}><Edit2 className="h-3 w-3" /></Button>
                </div>
                {profile?.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
              </>
            )}
            <div className="flex gap-4 text-xs text-muted-foreground justify-center sm:justify-start">
              <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {userRatings?.length || 0} avaliações</span>
              <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {favorites.length} favoritos</span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <section>
          <h2 className="font-display text-lg font-bold tracking-wider text-foreground flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-400" /> CONQUISTAS
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {achievements.map(a => (
              <div key={a.id} className={`neon-card rounded-lg p-3 text-center space-y-1 transition-all ${a.unlocked ? "" : "opacity-30 grayscale"}`}>
                <span className="text-2xl">{a.icon}</span>
                <p className="text-[10px] font-display tracking-wider text-foreground">{a.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Favorite Games */}
        <section>
          <h2 className="font-display text-lg font-bold tracking-wider text-foreground flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-red-400" /> MEUS FAVORITOS
          </h2>
          {favoriteGames && favoriteGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteGames.map((game, i) => (
                <GameCard key={game.id} game={game} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Gamepad2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum jogo favoritado ainda.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Profile;
