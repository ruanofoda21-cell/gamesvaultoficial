import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("game_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map(f => f.game_id);
    },
    enabled: !!user,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (gameId: string) => {
      if (!user) throw new Error("Faça login");
      const isFav = favorites.includes(gameId);
      if (isFav) {
        const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("game_id", gameId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("favorites").insert({ user_id: user.id, game_id: gameId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const isFavorite = (gameId: string) => favorites.includes(gameId);

  return { favorites, toggleFavorite, isFavorite };
};
