import { Bell, Plus, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/Sidebar";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onUpgradeClick?: () => void;
}

export function DashboardHeader({ title, subtitle, onUpgradeClick }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="flex flex-col gap-4 mb-6 md:mb-8 opacity-0 animate-fade-in">
        {/* Top Row */}
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Title with mobile menu */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Mobile Sidebar Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden shrink-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <Sidebar 
                  collapsed={false} 
                  onUpgradeClick={() => {
                    setMobileMenuOpen(false);
                    onUpgradeClick?.();
                  }}
                />
              </SheetContent>
            </Sheet>

            {/* Title */}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground mt-1 text-sm truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right side - Mobile Actions Only */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            {/* Notification Bell */}
            <Button variant="ghost" size="icon" className="relative shrink-0">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Add Subscription - Icon only on mobile */}
            <Button 
              variant="default" 
              size="icon" 
              className="bg-primary hover:bg-primary/90 shrink-0"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Bottom Row - Search + Actions (Desktop aligned, Mobile stacked) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search subscriptions..."
              className="w-full pl-9"
            />
          </div>

          {/* Desktop Actions - Aligned with search */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notification Bell */}
            <Button variant="ghost" size="icon" className="relative shrink-0">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Add Subscription - Full button on desktop */}
            <Button 
              variant="default" 
              className="bg-primary hover:bg-primary/90 shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Subscription
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}