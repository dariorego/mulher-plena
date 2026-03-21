import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { FontSizeProvider } from "@/contexts/FontSizeContext";
import { SettingsProvider } from "@/contexts/SettingsContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Journeys from "./pages/Journeys";
import JourneyDetail from "./pages/JourneyDetail";
import StationDetail from "./pages/StationDetail";
import ActivityPage from "./pages/ActivityPage";
import Achievements from "./pages/Achievements";
import Evaluations from "./pages/Evaluations";
import SubmissionView from "./pages/SubmissionView";
import ManageContent from "./pages/ManageContent";
import ManageLandingPage from "./pages/ManageLandingPage";
import UsersPage from "./pages/UsersPage";
import ImageLibraryPage from "./pages/ImageLibraryPage";
import ActivityLogsPage from "./pages/ActivityLogsPage";
import LandingPage from "./pages/LandingPage";
import Settings from "./pages/Settings";
import CalendarPage from "./pages/CalendarPage";
import SupportPage from "./pages/SupportPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/registro" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/recuperar-senha" element={<ForgotPassword />} />
      <Route path="/redefinir-senha" element={<ResetPassword />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/jornadas" element={<ProtectedRoute><Journeys /></ProtectedRoute>} />
      <Route path="/jornadas/:id" element={<ProtectedRoute><JourneyDetail /></ProtectedRoute>} />
      <Route path="/estacao/:id" element={<ProtectedRoute><StationDetail /></ProtectedRoute>} />
      <Route path="/atividade/:id" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
      <Route path="/conquistas" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
      <Route path="/avaliacoes" element={<ProtectedRoute><Evaluations /></ProtectedRoute>} />
      <Route path="/submissao/:id" element={<ProtectedRoute><SubmissionView /></ProtectedRoute>} />
      <Route path="/gerenciar" element={<ProtectedRoute><ManageContent /></ProtectedRoute>} />
      <Route path="/gerenciar-landing" element={<ProtectedRoute><ManageLandingPage /></ProtectedRoute>} />
      <Route path="/usuarios" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
      <Route path="/imagens" element={<ProtectedRoute><ImageLibraryPage /></ProtectedRoute>} />
      <Route path="/logs" element={<ProtectedRoute><ActivityLogsPage /></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/calendario" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path="/suporte" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SettingsProvider>
        <DataProvider>
          <FontSizeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter basename="/plataforma">
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </FontSizeProvider>
        </DataProvider>
      </SettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;