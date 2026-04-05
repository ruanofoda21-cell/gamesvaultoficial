import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, Circle, MessageSquare, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Navigate, Link } from "react-router-dom";

const Suggestions = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["suggestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suggestions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: user?.email === "kkzin107@gamevault.local",
  });

  const toggleRead = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { error } = await supabase
        .from("suggestions")
        .update({ read: !read })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suggestions"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suggestions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      toast.success("Sugestão removida!");
    },
  });

  if (authLoading) return null;
  if (!user || user.email !== "kkzin107@gamevault.local") return <Navigate to="/" />;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="font-display text-2xl font-bold tracking-wider gradient-text">
            SUGESTÕES DOS USUÁRIOS
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="neon-card rounded-lg h-24 animate-pulse" />
            ))}
          </div>
        ) : suggestions && suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className={`neon-card rounded-lg p-4 flex flex-col sm:flex-row sm:items-start gap-4 ${
                  s.read ? "opacity-60" : ""
                }`}
              >
                <div className="flex-1 space-y-1">
                  <p className="font-display text-sm font-bold tracking-wider text-foreground">
                    {s.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{s.message}</p>
                  <p className="text-xs text-muted-foreground/50">
                    {new Date(s.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleRead.mutate({ id: s.id, read: s.read })}
                    title={s.read ? "Marcar como não lida" : "Marcar como lida"}
                  >
                    {s.read ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(s.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
            <MessageSquare className="h-16 w-16 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground font-display tracking-wider">
              NENHUMA SUGESTÃO RECEBIDA
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Suggestions;
