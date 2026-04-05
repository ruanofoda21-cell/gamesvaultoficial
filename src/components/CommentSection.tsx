import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Trash2, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CommentSectionProps {
  gameId: string;
}

const CommentSection = ({ gameId }: CommentSectionProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", gameId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("game_id", gameId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["profiles-for-comments", gameId],
    queryFn: async () => {
      if (!comments || comments.length === 0) return {};
      const userIds = [...new Set(comments.map(c => c.user_id))];
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      const map: Record<string, string> = {};
      data?.forEach(p => { map[p.user_id] = p.display_name || "Anônimo"; });
      return map;
    },
    enabled: !!comments && comments.length > 0,
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Faça login para comentar");
      const { error } = await supabase.from("comments").insert({
        game_id: gameId,
        user_id: user.id,
        content: content.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", gameId] });
      toast.success("Comentário adicionado!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateComment = useMutation({
    mutationFn: async ({ id, newContent }: { id: string; newContent: string }) => {
      const { error } = await supabase.from("comments").update({ content: newContent }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["comments", gameId] });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", gameId] });
      toast.success("Comentário removido!");
    },
  });

  return (
    <section className="space-y-6">
      <h2 className="font-display text-lg font-bold tracking-wider text-foreground flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        COMENTÁRIOS {comments && comments.length > 0 && `(${comments.length})`}
      </h2>

      {user && (
        <div className="flex gap-3">
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Escreva um comentário..."
            className="bg-card border-border min-h-[80px] resize-none"
            maxLength={500}
          />
          <Button
            size="icon"
            onClick={() => addComment.mutate()}
            disabled={!content.trim() || addComment.isPending}
            className="shrink-0 self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="neon-card rounded-lg p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((c, index) => (
            <div
              key={c.id}
              className="neon-card rounded-lg p-4 space-y-2 opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {(profiles?.[c.user_id] || "?")[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {profiles?.[c.user_id] || "Usuário"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
                {user?.id === c.user_id && editingId !== c.id && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingId(c.id); setEditContent(c.content); }}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteComment.mutate(c.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              {editingId === c.id ? (
                <div className="flex gap-2">
                  <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="bg-card border-border min-h-[60px] resize-none text-sm" />
                  <div className="flex flex-col gap-1">
                    <Button size="icon" className="h-6 w-6" onClick={() => updateComment.mutate({ id: c.id, newContent: editContent })}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingId(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground pl-9">{c.content}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhum comentário ainda. {!user && "Faça login para comentar."}
        </p>
      )}
    </section>
  );
};

export default CommentSection;
