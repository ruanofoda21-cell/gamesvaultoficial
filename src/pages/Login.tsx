import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Gamepad2 } from "lucide-react";

const FAKE_DOMAIN = "@gamevault.local";

const Login = () => {
  const navigate = useNavigate();
  const [nick, setNick] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const toEmail = (username: string) =>
    username.toLowerCase().trim() + FAKE_DOMAIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nick.trim()) {
      toast.error("Preencha o nick!");
      return;
    }
    setLoading(true);
    const email = toEmail(nick);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Conta criada com sucesso!");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Logado com sucesso!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <Gamepad2 className="h-12 w-12 text-primary mx-auto neon-text" />
          <h1 className="font-display text-2xl font-bold tracking-wider gradient-text">
            {isSignUp ? "CRIAR CONTA" : "ENTRAR"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Crie sua conta para acessar o site" : "Faça login com seu nick"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nick">Nick</Label>
            <Input
              id="nick"
              type="text"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              required
              className="bg-card border-border focus:border-primary"
              placeholder="Seu nick"
              maxLength={30}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-card border-border focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full font-display tracking-wider" disabled={loading}>
            {loading ? "CARREGANDO..." : isSignUp ? "CRIAR CONTA" : "ENTRAR"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? "Já tem conta?" : "Não tem conta?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:underline font-medium"
          >
            {isSignUp ? "Entrar" : "Criar conta"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;