import { useState } from "react";
import { Star } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  gameId: string;
}

const StarRating = ({ gameId }: StarRatingProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [hovered, setHovered] = useState(0);

  const { data: ratings } = useQuery({
    queryKey: ["ratings", gameId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select("rating, user_id")
        .eq("game_id", gameId);
      if (error) throw error;
      return data;
    },
  });

  const userRating = ratings?.find((r) => r.user_id === user?.id)?.rating ?? 0;
  const avgRating = ratings && ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  const mutation = useMutation({
    mutationFn: async (rating: number) => {
      if (!user) throw new Error("Faça login para avaliar");
      const { error } = await supabase
        .from("ratings")
        .upsert(
          { user_id: user.id, game_id: gameId, rating },
          { onConflict: "user_id,game_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ratings", gameId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const displayRating = hovered || userRating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!user}
            onClick={() => mutation.mutate(star)}
            onMouseEnter={() => user && setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={cn(
              "transition-colors p-0.5",
              user ? "cursor-pointer hover:scale-110" : "cursor-default opacity-60"
            )}
            title={user ? `Avaliar ${star} estrela${star > 1 ? "s" : ""}` : "Faça login para avaliar"}
          >
            <Star
              className={cn(
                "h-4 w-4 transition-colors",
                star <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/40"
              )}
            />
          </button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {avgRating > 0 ? avgRating.toFixed(1) : "—"}
        {ratings && ratings.length > 0 && (
          <span className="ml-1">({ratings.length})</span>
        )}
      </span>
    </div>
  );
};

export default StarRating;
