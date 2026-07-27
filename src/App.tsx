import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, BrowserRouter, Route, Routes } from "react-router-dom";

// Use HashRouter when running inside Electron (file:// protocol) so deep links work.
const Router = typeof window !== "undefined" && window.location.protocol === "file:" ? HashRouter : BrowserRouter;
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import NewGame from "./pages/NewGame.tsx";
import NotFound from "./pages/NotFound.tsx";
import GameDetail from "./pages/GameDetail.tsx";
import Suggestions from "./pages/Suggestions.tsx";
import Profile from "./pages/Profile.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import Ranking from "./pages/Ranking.tsx";
import Chat from "./pages/Chat.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
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
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
