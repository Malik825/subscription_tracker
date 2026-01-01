import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { ThemeProvider } from "@/lib/theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { store } from "./store";
import App from "./App.tsx";
import "./index.css";

// Create Query Client once
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="aura-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <App />
        </TooltipProvider>
      </ThemeProvider>
    </Provider>
  </QueryClientProvider>
);