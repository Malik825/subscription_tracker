import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { UpgradeModal } from "@/components/UpgradeModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useCheckAuthQuery } from "@/api/authApi";

/**
 * DashboardLayout Component
 * 
 * Handles:
 * 1. Auth checking (only runs for dashboard routes)
 * 2. Protected route logic (redirects if not authenticated)
 * 3. Layout rendering (sidebar, mobile nav, etc.)
 */
export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  const { data, isLoading, error } = useCheckAuthQuery();
  const user = data?.data?.user;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && (!user || error)) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar - Hidden on mobile (below md) */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen z-40">
        <Sidebar
          collapsed={collapsed}
          onUpgradeClick={() => setIsUpgradeModalOpen(true)}
        />
      </aside>

      {/* Desktop Toggle Button - Hidden on mobile */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "hidden md:flex fixed top-4 z-50 h-8 w-8 rounded-full border border-border bg-background shadow-md transition-all duration-300 hover:bg-accent",
          collapsed ? "left-[84px]" : "left-[244px]"
        )}
        onClick={() => setCollapsed(!collapsed)}
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
          // Mobile: no margin (full width)
          "ml-0",
          // Tablet and up: add left margin for sidebar
          "md:ml-20",
          // Desktop: larger margin when sidebar is expanded
          !collapsed && "lg:ml-64",
          // Bottom padding for mobile nav
          "pb-20 md:pb-0"
        )}
      >
        <div className="w-full h-full">
          <Outlet context={{ onUpgradeClick: () => setIsUpgradeModalOpen(true) }} />
        </div>
      </main>

      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}