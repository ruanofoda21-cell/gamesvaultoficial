import { ArrowLeft, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Home",
  "/ranking": "Ranking",
  "/chat": "Chat",
  "/perfil": "Perfil",
  "/admin": "Admin",
  "/sugestoes": "Sugestões",
  "/novo": "Postar jogo",
  "/login": "Entrar",
};

interface TopBarProps {
  search?: string;
  onSearchChange?: (v: string) => void;
}

const TopBar = ({ search, onSearchChange }: TopBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const label =
    ROUTE_LABELS[location.pathname] ||
    (location.pathname.startsWith("/jogo/") ? "Detalhes do jogo" : location.pathname.startsWith("/editar/") ? "Editar jogo" : "Game Vault");

  return (
    <div className="sticky top-0 z-40 h-14 flex items-center gap-3 px-6 border-b border-border bg-background/80 backdrop-blur-md">
      <button
        onClick={() => navigate(-1)}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-colors"
        aria-label="Voltar"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <h1 className="text-sm font-semibold text-foreground">{label}</h1>
      <div className="flex-1" />
      {onSearchChange && (
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar jogos"
            className="pl-9 h-8 text-xs bg-input border-border"
          />
        </div>
      )}
      <ThemeToggle />
    </div>
  );
};

export default TopBar;
