import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { UpgradeModal } from "@/components/UpgradeModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

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

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}