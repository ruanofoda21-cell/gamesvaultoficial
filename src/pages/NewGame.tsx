import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Header from "@/components/Header";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NewGame = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    image_url: "",
    download_link: "",
    category: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("games").insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        image_url: form.image_url.trim() || null,
        download_link: form.download_link.trim(),
        category: form.category.trim() || "Outros",
      });

      if (error) throw error;
      toast.success("Jogo postado com sucesso!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <h2 className="font-display text-2xl font-bold tracking-wider gradient-text mb-6">
          POSTAR JOGO
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

          <Button type="submit" className="w-full font-display tracking-wider" disabled={loading}>
            {loading ? "POSTANDO..." : "PUBLICAR JOGO"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default NewGame;
