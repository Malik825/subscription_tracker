import { useState, useEffect, useRef } from "react";
import { Outlet, Navigate } from "react-router-dom";
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
 * * Handles:
 * 1. Auth checking (global session observer)
 * 2. Protected route logic
 * 3. Global Voice Announcements for status changes
 */
export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  // Voice Feedback Hook
  const { announce } = useVoiceFeedback();
  
  // Auth Query
  const { data, isLoading, error } = useCheckAuthQuery();
  const user = data?.data?.user;

  // Refs to prevent duplicate announcements
  const hasAnnouncedWelcome = useRef(false);
  const prevPlan = useRef<string | undefined>(undefined);

  /**
   * Effect: Welcome Announcement
   * Triggers once when the user successfully loads into the layout.
   */
  useEffect(() => {
    if (user && !hasAnnouncedWelcome.current) {
      announce(`Welcome back, ${user.username}.`);
      hasAnnouncedWelcome.current = true;
      // Initialize plan ref so we don't announce "plan changed" on first load
      prevPlan.current = user.plan;
    }
  }, [user, announce]);

  /**
   * Effect: Global Plan Observer
   * Triggers if the user's plan changes (e.g., after successful Stripe/Paystack upgrade)
   */
  useEffect(() => {
    if (user && prevPlan.current && prevPlan.current !== user.plan) {
      announce(`Great news! Your account has been upgraded to the ${user.plan} plan.`);
      prevPlan.current = user.plan;
    }
  }, [user?.plan, announce]);

  /**
   * Effect: Session Security Observer
   * Triggers if the background auth check fails (session expiration)
   */
  useEffect(() => {
    if (error) {
      announce("Your session has expired. Redirecting to login for your security.");
    }
  }, [error, announce]);

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
          onUpgradeClick={() => setIsUpgradeModalOpen(true)}
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
          <Outlet context={{ onUpgradeClick: () => setIsUpgradeModalOpen(true) }} />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>

      {/* Global Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}