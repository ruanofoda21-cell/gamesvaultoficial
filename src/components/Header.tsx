import { Gamepad2, Plus, LogIn, LogOut, MessageSquare, User, BarChart3, Trophy, MessagesSquare, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SuggestionDialog from "@/components/SuggestionDialog";
import ThemeToggle from "@/components/ThemeToggle";
import gameVaultWindowsAsset from "@/assets/gamevault-windows.zip.asset.json";

const Header = () => {
  const { user, signOut } = useAuth();
  const isAdmin = user?.email === "kkzin107@gamevault.local";

  return (
    <header className="sticky top-0 z-50 border-b border-border glassmorphism">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3 group">
          <Gamepad2 className="h-8 w-8 text-primary transition-all group-hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)]" />
          <h1 className="text-xl font-display font-bold tracking-wider gradient-text">
            GAME VAULT
          </h1>
        </Link>

        <nav className="flex items-center gap-2">
          <a
            href={gameVaultWindowsAsset.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Baixar app para Windows (ZIP ~156 MB)"
          >
            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-display text-xs tracking-wider border-primary/40 hover:border-primary hover:bg-primary/10 neon-glow"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">BAIXAR APP</span>
            </Button>
          </a>
          <Link to="/ranking">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Trophy className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/chat">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <MessagesSquare className="h-4 w-4" />
            </Button>
          </Link>
          <ThemeToggle />
          {user ? (
            <>
              {isAdmin && (
                <>
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="gap-2 font-display text-xs tracking-wider border-primary/30 hover:border-primary hover:bg-primary/10">
                      <BarChart3 className="h-4 w-4" />
                      <span className="hidden sm:inline">ADMIN</span>
                    </Button>
                  </Link>
                  <Link to="/sugestoes">
                    <Button variant="outline" size="sm" className="gap-2 font-display text-xs tracking-wider border-primary/30 hover:border-primary hover:bg-primary/10">
                      <MessageSquare className="h-4 w-4" />
                      <span className="hidden sm:inline">SUGESTÕES</span>
                    </Button>
                  </Link>
                  <Link to="/novo">
                    <Button size="sm" className="gap-2 font-display text-xs tracking-wider">
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">POSTAR JOGO</span>
                    </Button>
                  </Link>
                </>
              )}
              <SuggestionDialog />
              <Link to="/perfil">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="gap-2 font-display text-xs tracking-wider border-primary/30 hover:border-primary hover:bg-primary/10">
                <LogIn className="h-4 w-4" />
                ENTRAR
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
