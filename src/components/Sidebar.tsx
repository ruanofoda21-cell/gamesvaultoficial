import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Trophy, MessagesSquare, Settings, User, LogIn, LogOut, Plus, MessageSquare, Download, Gamepad2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import gameVaultWindowsAsset from "@/assets/gamevault-windows.zip.asset.json";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/ranking", label: "Ranking", icon: Trophy },
  { to: "/chat", label: "Chat", icon: MessagesSquare },
];

const Sidebar = () => {
  const { user, signOut } = useAuth();
  const { favorites } = useFavorites();
  const location = useLocation();
  const [filter, setFilter] = useState("");
  const isAdmin = user?.email === "kkzin107@gamevault.local";

  const { data: games } = useQuery({
    queryKey: ["sidebar-games"],
    queryFn: async () => {
      const { data } = await supabase.from("games").select("id,title,image_url").order("title");
      return data || [];
    },
  });

  const library = useMemo(() => {
    const favIds = new Set(favorites || []);
    const favGames = (games || []).filter((g) => favIds.has(g.id));
    return favGames.filter((g) => g.title.toLowerCase().includes(filter.toLowerCase()));
  }, [games, favorites, filter]);

  const displayName = user?.email?.split("@")[0] || "Convidado";

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Profile header */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to={user ? "/perfil" : "/login"} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
            <Gamepad2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-sidebar-foreground truncate group-hover:text-foreground transition-colors">
              {displayName}
            </div>
            <div className="text-[11px] text-muted-foreground">Game Vault</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="p-2 space-y-0.5">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
        {isAdmin && (
          <>
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                location.pathname === "/admin"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Admin</span>
            </Link>
            <Link
              to="/sugestoes"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                location.pathname === "/sugestoes"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Sugestões</span>
            </Link>
            <Link
              to="/novo"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                location.pathname === "/novo"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              <Plus className="h-4 w-4" />
              <span>Postar jogo</span>
            </Link>
          </>
        )}
      </nav>

      {/* Library */}
      <div className="px-4 pt-4 pb-2">
        <div className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-2">
          Minha biblioteca
        </div>
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrar biblioteca"
          className="h-8 text-xs bg-input border-sidebar-border"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {library.length === 0 && (
          <div className="px-3 py-4 text-xs text-muted-foreground">
            {user ? "Favorite jogos para vê-los aqui" : "Entre para criar sua biblioteca"}
          </div>
        )}
        {library.map((g) => (
          <Link
            key={g.id}
            to={`/jogo/${g.id}`}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors"
          >
            <img
              src={g.image_url || "/placeholder.svg"}
              alt=""
              className="h-6 w-6 rounded object-cover shrink-0"
            />
            <span className="truncate">{g.title.replace(/🟩TORRENT🟩/g, "").replace(/🟩/g, "").trim()}</span>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <a
          href={`https://gamesvaultoficial.lovable.app${gameVaultWindowsAsset.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-sidebar-foreground bg-sidebar-accent/40 hover:bg-sidebar-accent transition-colors"
        >
          <Download className="h-4 w-4 text-primary" />
          <span>Baixar app desktop</span>
        </a>
        {user ? (
          <div className="flex items-center gap-1">
            <Link to="/perfil" className="flex-1">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
                <User className="h-3.5 w-3.5" /> Perfil
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={signOut}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Link to="/login">
            <Button size="sm" className="w-full gap-2 h-8 text-xs">
              <LogIn className="h-3.5 w-3.5" /> Entrar
            </Button>
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
