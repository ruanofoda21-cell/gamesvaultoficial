import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Index from "./pages/Index.tsx";
import IndexDesktop from "./pages/IndexDesktop.tsx";
import Login from "./pages/Login.tsx";
import NewGame from "./pages/NewGame.tsx";
import NotFound from "./pages/NotFound.tsx";
import GameDetail from "./pages/GameDetail.tsx";
import Suggestions from "./pages/Suggestions.tsx";
import Profile from "./pages/Profile.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import Ranking from "./pages/Ranking.tsx";
import Chat from "./pages/Chat.tsx";

const IS_DESKTOP = import.meta.env.VITE_TARGET === "electron";

// Use HashRouter when running inside Electron (file:// protocol) so deep links work.
const Router = typeof window !== "undefined" && window.location.protocol === "file:" ? HashRouter : BrowserRouter;

const queryClient = new QueryClient();

// Desktop wraps every route in the Hydra-style Layout (Sidebar + TopBar).
// Web keeps the original neon layout where each page renders its own <Header />.
const DesktopShell = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  if (pathname === "/login") return <>{children}</>;
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const routes = (
    <Routes>
      <Route path="/" element={IS_DESKTOP ? <IndexDesktop /> : <Index />} />
      <Route path="/jogo/:id" element={<GameDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/novo" element={<NewGame />} />
      <Route path="/editar/:id" element={<NewGame />} />
      <Route path="/sugestoes" element={<Suggestions />} />
      <Route path="/perfil" element={<Profile />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/ranking" element={<Ranking />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
  return IS_DESKTOP ? <DesktopShell>{routes}</DesktopShell> : routes;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <AppRoutes />
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
