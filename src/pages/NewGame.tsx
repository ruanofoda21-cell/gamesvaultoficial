import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Header from "@/components/Header";
import GameBadge from "@/components/GameBadge";
import { ArrowLeft, X, Plus, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const AVAILABLE_BADGES = [
  "Torrent", "Online", "Multiplayer", "Singleplayer", "Coop",
  "Em Português", "Dublado", "Legendado", "Repack", "Portable",
  "Demo", "Beta", "Early Access", "Atualizado", "DLC", "Crack",
  "Steam", "Epic Games", "GOG",
];

const NewGame = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [customBadge, setCustomBadge] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    image_url: "",
    download_link: "",
    category: "",
    badges: [] as string[],
  });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data, error } = await supabase.from("games").select("*").eq("id", id!).single();
      if (error) {
        toast.error("Jogo não encontrado");
        navigate("/");
        return;
      }
      setForm({
        title: data.title || "",
        description: data.description || "",
        image_url: data.image_url || "",
        download_link: data.download_link || "",
        category: data.category || "",
        badges: (data as any).badges || [],
      });
      setFetching(false);
    })();
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        image_url: form.image_url.trim() || null,
        download_link: form.download_link.trim(),
        category: form.category.trim() || "Outros",
        badges: form.badges,
      };

      if (isEdit) {
        const { error } = await supabase.from("games").update(payload).eq("id", id!);
        if (error) throw error;
        toast.success("Jogo atualizado!");
      } else {
        const { error } = await supabase.from("games").insert(payload);
        if (error) throw error;
        toast.success("Jogo postado!");
      }
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["game", id] });
      navigate(isEdit ? `/jogo/${id}` : "/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleBadge = (b: string) => {
    setForm((prev) => ({
      ...prev,
      badges: prev.badges.includes(b)
        ? prev.badges.filter((x) => x !== b)
        : [...prev.badges, b],
    }));
  };

  const addCustom = () => {
    const v = customBadge.trim();
    if (!v) return;
    if (!form.badges.includes(v)) {
      setForm((prev) => ({ ...prev, badges: [...prev.badges, v] }));
    }
    setCustomBadge("");
  };

  if (fetching) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <h2 className="font-display text-2xl font-bold tracking-wider gradient-text mb-6">
          {isEdit ? "EDITAR JOGO" : "POSTAR JOGO"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} required className="bg-card border-border" placeholder="Nome do jogo" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} className="bg-card border-border min-h-[100px]" placeholder="Sobre o jogo, requisitos, etc." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL da Imagem</Label>
            <Input id="image_url" value={form.image_url} onChange={(e) => update("image_url", e.target.value)} className="bg-card border-border" placeholder="https://exemplo.com/imagem.jpg" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="download_link">Link de Download *</Label>
            <Input id="download_link" value={form.download_link} onChange={(e) => update("download_link", e.target.value)} required className="bg-card border-border" placeholder="https://exemplo.com/download" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input id="category" value={form.category} onChange={(e) => update("category", e.target.value)} className="bg-card border-border" placeholder="Ação, RPG, FPS..." />
          </div>

          {/* Badges */}
          <div className="space-y-3">
            <Label>Etiquetas (Badges)</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_BADGES.map((b) => {
                const active = form.badges.includes(b);
                return (
                  <button
                    type="button"
                    key={b}
                    onClick={() => toggleBadge(b)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-display font-bold tracking-wider border transition-all ${
                      active
                        ? "bg-primary text-primary-foreground border-primary scale-105"
                        : "bg-card text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {b.toUpperCase()}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Input
                value={customBadge}
                onChange={(e) => setCustomBadge(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
                className="bg-card border-border"
                placeholder="Etiqueta personalizada"
              />
              <Button type="button" variant="outline" onClick={addCustom} className="gap-1">
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </div>

            {form.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground w-full">Selecionadas:</span>
                {form.badges.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1">
                    <GameBadge label={b} />
                    <button
                      type="button"
                      onClick={() => toggleBadge(b)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full font-display tracking-wider" disabled={loading}>
            {loading ? (isEdit ? "SALVANDO..." : "POSTANDO...") : (isEdit ? "SALVAR ALTERAÇÕES" : "PUBLICAR JOGO")}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default NewGame;
