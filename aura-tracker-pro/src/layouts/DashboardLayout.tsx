import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { checkAuth } from "@/features/auth/authSlice";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { UpgradeModal } from "@/components/UpgradeModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";

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
  
  // Redux auth state
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  // Check auth ONLY when entering dashboard routes
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Show loading spinner while checking auth
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

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Render protected layout (user is authenticated)
  return (
    <div className="flex min-h-screen w-full relative">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={collapsed}
          onUpgradeClick={() => setIsUpgradeModalOpen(true)}
        />
      </div>

      {/* Desktop Toggle Button - Hidden on mobile */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "hidden md:flex fixed top-4 z-50 h-8 w-8 rounded-full border border-border bg-background shadow-md transition-all duration-300",
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

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300 w-full",
          // Desktop margins for sidebar
          "md:ml-20 lg:ml-64",
          collapsed && "md:ml-20",
          !collapsed && "lg:ml-64",
          // Mobile padding for bottom nav only
          "pb-20 md:pb-0"
        )}
      >
        <Outlet context={{ onUpgradeClick: () => setIsUpgradeModalOpen(true) }} />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}