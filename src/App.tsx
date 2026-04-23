import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { WidgetVisibilityProvider } from "@/contexts/WidgetVisibilityContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdmin } from "@/hooks/useAdmin";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { LoadingProvider } from "@/contexts/LoadingContext";
import LoadingOverlay from "@/components/LoadingOverlay";
import AppLoadingScreen from "@/components/AppLoadingScreen";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import SharedRecipe from "./pages/SharedRecipe";
import Auth from "./pages/Auth";
import Legal from "./pages/Legal";
import Landing from "./pages/Landing";
import Paywall from "./pages/Paywall";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const useMinDelay = (ms: number) => {
  const [elapsed, setElapsed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setElapsed(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return elapsed;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { subscribed, loading: subLoading } = useSubscription();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const minElapsed = useMinDelay(1500);

  if (loading || subLoading || adminLoading || !minElapsed) {
    return <AppLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  if (!subscribed && !isAdmin) {
    return <Paywall />;
  }

  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const minElapsed = useMinDelay(1500);

  if (loading || !minElapsed) {
    return <AppLoadingScreen />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const LandingRoute = () => {
  const { user, loading } = useAuth();
  const minElapsed = useMinDelay(1500);

  if (loading || !minElapsed) {
    return <AppLoadingScreen />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Landing />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/landing" element={<LandingRoute />} />
    <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
    <Route path="/prawne/:slug" element={<Legal />} />
    <Route path="/przepis/:id" element={<SharedRecipe />} />
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <WidgetVisibilityProvider>
              <LoadingProvider>
                <LoadingOverlay />
                <PWAInstallPrompt />
                <AppRoutes />
              </LoadingProvider>
            </WidgetVisibilityProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
