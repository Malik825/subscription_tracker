import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { UpgradeModal } from "@/components/UpgradeModal";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full relative">
      <Sidebar
        collapsed={collapsed}
        onUpgradeClick={() => setIsUpgradeModalOpen(true)}
      />

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "fixed top-4 z-50 h-8 w-8 rounded-full border border-border bg-background shadow-md transition-all duration-300",
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

      <main
        className={cn(
          "flex-1 transition-all duration-300",
          collapsed ? "ml-20" : "ml-64"
        )}
      >
        <Outlet />
      </main>

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}
