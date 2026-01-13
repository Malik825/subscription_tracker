import { useState, useEffect, useRef } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { UpgradeModal } from "@/components/UpgradeModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useCheckAuthQuery } from "@/api/authApi";
import { useVoiceFeedback } from "@/hooks/use-voice-feedback";

/**
 * DashboardLayout Component
 * Handles:
 * 1. Auth checking (global session observer)
 * 2. Protected route logic
 * 3. Global Voice Announcements for status changes
 */
export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  // Voice Feedback Hook
  const { announce, notify } = useVoiceFeedback();
  
  // Auth Query
  const { data, isLoading, error } = useCheckAuthQuery();
  const user = data?.data?.user;
  
  // Location for route announcements
  const location = useLocation();

  // Refs to prevent duplicate announcements
  const hasAnnouncedWelcome = useRef(false);
  const prevPlan = useRef<string | undefined>(undefined);
  const prevPath = useRef<string>("");

  /**
   * Effect: Welcome Announcement
   * Triggers once when the user successfully loads into the layout.
   */
  useEffect(() => {
    if (user && !hasAnnouncedWelcome.current) {
      const greeting = getGreeting();
      announce(`${greeting}, ${user.username}. Welcome to your dashboard.`);
      hasAnnouncedWelcome.current = true;
      prevPlan.current = user.plan;
    }
  }, [user, announce]);

  /**
   * Effect: Route Change Announcements
   * Announces page navigation (excluding first load)
   */
  useEffect(() => {
    if (prevPath.current && prevPath.current !== location.pathname) {
      const pageName = getPageName(location.pathname);
      if (pageName) {
        announce(`Navigated to ${pageName} page.`);
      }
    }
    prevPath.current = location.pathname;
  }, [location.pathname, announce]);

  /**
   * Effect: Global Plan Observer
   * Triggers if the user's plan changes (e.g., after successful Stripe/Paystack upgrade)
   */
  useEffect(() => {
    if (user && prevPlan.current && prevPlan.current !== user.plan) {
      notify(
        `Congratulations! Your account has been upgraded to the ${user.plan} plan. You now have access to all premium features.`,
        true // Play success sound
      );
      prevPlan.current = user.plan;
    }
  }, [user?.plan, notify]);

  /**
   * Effect: Session Security Observer
   * Triggers if the background auth check fails (session expiration)
   */
  useEffect(() => {
    if (error && !isLoading) {
      announce("Your session has expired. Redirecting to login for your security.");
    }
  }, [error, isLoading, announce]);

  // Get greeting based on time of day
  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  // Get readable page name from path
  function getPageName(path: string): string | null {
    const routes: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/subscriptions': 'Subscriptions',
      '/analytics': 'Analytics',
      '/settings': 'Settings',
      '/categories': 'Categories',
      '/notifications': 'Notifications',
      '/calendar': 'Calendar',
      '/family-sharing': 'Family Sharing',
      '/ai-assistant': 'AI Assistant',
    };
    return routes[path] || null;
  }

  // Handle upgrade modal with voice feedback
  const handleUpgradeClick = () => {
    setIsUpgradeModalOpen(true);
    announce("Opening upgrade options.");
  };

  const handleUpgradeModalClose = () => {
    setIsUpgradeModalOpen(false);
    announce("Upgrade dialog closed.");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  // Redirect if unauthorized
  if (!isLoading && (!user || error)) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen z-40">
        <Sidebar
          collapsed={collapsed}
          onUpgradeClick={handleUpgradeClick}
        />
      </aside>

      {/* Desktop Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "hidden md:flex fixed top-4 z-50 h-8 w-8 rounded-full border border-border bg-background shadow-md transition-all duration-300 hover:bg-accent",
          collapsed ? "left-[84px]" : "left-[244px]"
        )}
        onClick={() => {
          const newState = !collapsed;
          setCollapsed(newState);
          announce(newState ? "Sidebar collapsed" : "Sidebar expanded");
        }}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 w-full min-h-screen transition-all duration-300",
          "ml-0",
          "md:ml-20",
          !collapsed && "lg:ml-64",
          "pb-20 md:pb-0"
        )}
      >
        <div className="w-full h-full">
          <Outlet context={{ onUpgradeClick: handleUpgradeClick }} />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>

      {/* Global Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={handleUpgradeModalClose}
      />
    </div>
  );
}