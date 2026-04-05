import { Gamepad2, Plus, LogIn, LogOut, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SuggestionDialog from "@/components/SuggestionDialog";

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3 group">
          <Gamepad2 className="h-8 w-8 text-primary transition-all group-hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)]" />
          <h1 className="text-xl font-display font-bold tracking-wider gradient-text">
            GAME VAULT
          </h1>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              {user.email === "kkzin107@gamevault.local" && (
                <>
                  <Link to="/sugestoes">
                    <Button variant="outline" size="sm" className="gap-2 font-display text-xs tracking-wider border-primary/30 hover:border-primary hover:bg-primary/10">
                      <MessageSquare className="h-4 w-4" />
                      SUGESTÕES
                    </Button>
                  </Link>
                  <Link to="/novo">
                    <Button size="sm" className="gap-2 font-display text-xs tracking-wider">
                      <Plus className="h-4 w-4" />
                      POSTAR JOGO
                    </Button>
                  </Link>
                </>
              )}
              <SuggestionDialog />
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
