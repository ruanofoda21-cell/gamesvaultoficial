import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, Trash2, Hash, Globe } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSearchParams, Link } from "react-router-dom";

const Chat = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get("jogo");
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: currentGame } = useQuery({
    queryKey: ["chat-game", gameId],
    queryFn: async () => {
      if (!gameId) return null;
      const { data } = await supabase.from("games").select("id, title").eq("id", gameId).maybeSingle();
      return data;
    },
    enabled: !!gameId,
  });

  const { data: games } = useQuery({
    queryKey: ["chat-games-list"],
    queryFn: async () => {
      const { data } = await supabase.from("games").select("id, title").order("title");
      return data || [];
    },
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ["chat-messages", gameId],
    queryFn: async () => {
      let q = supabase.from("chat_messages").select("*").order("created_at", { ascending: true }).limit(200);
      if (gameId) q = q.eq("game_id", gameId);
      else q = q.is("game_id", null);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["chat-profiles", messages?.map(m => m.user_id).join(",")],
    queryFn: async () => {
      if (!messages || messages.length === 0) return {};
      const ids = [...new Set(messages.map(m => m.user_id))];
      const { data } = await supabase.from("profiles").select("user_id, display_name").in("user_id", ids);
      const map: Record<string, string> = {};
      data?.forEach(p => { map[p.user_id] = p.display_name || "Anônimo"; });
      return map;
    },
    enabled: !!messages && messages.length > 0,
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${gameId || "global"}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "chat_messages",
        ...(gameId ? { filter: `game_id=eq.${gameId}` } : {}),
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["chat-messages", gameId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [gameId, queryClient]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Faça login para enviar mensagens");
      const { error } = await supabase.from("chat_messages").insert({
        user_id: user.id,
        game_id: gameId || null,
        message: message.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => setMessage(""),
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMsg = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chat_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat-messages", gameId] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) sendMessage.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-4 flex-1 flex gap-4 max-h-[calc(100vh-80px)]">
        {/* Sidebar - channels */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 neon-card rounded-lg p-3 space-y-2 overflow-y-auto">
          <h3 className="font-display text-xs font-bold tracking-wider text-muted-foreground mb-1">CANAIS</h3>
          <Link
            to="/chat"
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${!gameId ? "bg-primary/20 text-primary" : "hover:bg-muted text-foreground"}`}
          >
            <Globe className="h-4 w-4" /> Chat Global
          </Link>
          {games?.map(g => (
            <Link
              key={g.id}
              to={`/chat?jogo=${g.id}`}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors truncate ${gameId === g.id ? "bg-primary/20 text-primary" : "hover:bg-muted text-foreground"}`}
            >
              <Hash className="h-3 w-3 shrink-0" />
              <span className="truncate">{g.title}</span>
            </Link>
          ))}
        </aside>

        {/* Chat area */}
        <div className="flex-1 flex flex-col neon-card rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="font-display text-sm font-bold tracking-wider text-foreground">
              {gameId ? (currentGame?.title || "Carregando...") : "CHAT GLOBAL"}
            </h2>

            {/* Mobile channel selector */}
            <select
              className="md:hidden ml-auto bg-card border border-border rounded px-2 py-1 text-xs text-foreground"
              value={gameId || ""}
              onChange={e => {
                const val = e.target.value;
                window.location.href = val ? `/chat?jogo=${val}` : "/chat";
              }}
            >
              <option value="">Global</option>
              {games?.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Carregando...</div>
            ) : messages && messages.length > 0 ? (
              messages.map(m => (
                <div key={m.id} className="flex items-start gap-3 group">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">
                      {(profiles?.[m.user_id] || "?")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-foreground">{profiles?.[m.user_id] || "Usuário"}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(m.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground break-words">{m.message}</p>
                  </div>
                  {user?.id === m.user_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => deleteMsg.mutate(m.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Nenhuma mensagem ainda. Seja o primeiro!
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {user ? (
            <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-border flex gap-2">
              <Input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="bg-card border-border"
                maxLength={500}
              />
              <Button type="submit" size="icon" disabled={!message.trim() || sendMessage.isPending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="px-4 py-3 border-t border-border text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">Faça login</Link> para enviar mensagens.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Chat;
