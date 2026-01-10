import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Critical components - load immediately
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardLayout from "./layouts/DashboardLayout";
import NotFound from "./pages/NotFound";

// Settings Integration - load immediately
import { Toaster } from "./components/ui/toaster";
import SettingsInitializer from "./components/SettingsInitializer";
import { CostSplitCalculator } from "./components/CostSplitCalculator";
import { PaymentTracking } from "./components/PaymentTracking";
import SharingGroupDetails from "./pages/SharingGroupDetails";

// Lazy load pages that aren't immediately needed
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Calendar = lazy(() => import("./pages/Calendar"));
const FamilySharing = lazy(() => import("./pages/FamilySharing"));
const Settings = lazy(() => import("./pages/Settings"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));

// Lazy load auth pages
const VerifyEmail = lazy(() => import("./pages/Auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <BrowserRouter>
    <SettingsInitializer>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes - Auth check happens in DashboardLayout */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/family-sharing" element={<FamilySharing />} />
            <Route path="/sharing-groups/:id" element={<SharingGroupDetails />} />
            <Route path="/calculator" element={<CostSplitCalculator />} />
            <Route path="/payment-tracking" element={<PaymentTracking />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster />
    </SettingsInitializer>
  </BrowserRouter>
);

export default App;