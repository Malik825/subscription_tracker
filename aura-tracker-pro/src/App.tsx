import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Subscriptions from "./pages/Subscriptions";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import DashboardLayout from "./layouts/DashboardLayout";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/Auth/VerifyEmail";

import { Provider } from "react-redux";
import { store } from "./store";

const queryClient = new QueryClient();

import { useDispatch } from "react-redux";
import { AppDispatch } from "./store";
import { checkAuth } from "./features/auth/authSlice";
import { useEffect } from "react";

const AuthLoader = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="aura-theme">
      <Provider store={store}>
        <AuthLoader>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthLoader>
      </Provider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
