import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SuggestionDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error("Preencha todos os campos!");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("suggestions")
      .insert({ name: name.trim(), message: message.trim() });
    setLoading(false);
    if (error) {
      toast.error("Erro ao enviar sugestão.");
      return;
    }
    toast.success("Sugestão enviada com sucesso!");
    setName("");
    setMessage("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 font-display text-xs tracking-wider border-primary/30 hover:border-primary hover:bg-primary/10"
        >
          <MessageSquarePlus className="h-4 w-4" />
          SUGESTÃO
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider">ENVIAR SUGESTÃO</DialogTitle>
          <DialogDescription>
            Envie sua sugestão ou feedback para o administrador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="bg-card border-border"
          />
          <Textarea
            placeholder="Sua sugestão..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            className="bg-card border-border min-h-[120px]"
          />
          <Button type="submit" disabled={loading} className="w-full font-display tracking-wider">
            {loading ? "ENVIANDO..." : "ENVIAR"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SuggestionDialog;
