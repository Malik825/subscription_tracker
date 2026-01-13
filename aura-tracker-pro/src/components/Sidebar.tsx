import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useLogoutMutation } from "@/api/authApi";
import {
  LayoutDashboard,
  CreditCard,
  PieChart,
  Calendar,
  Settings,
  Bell,
  LogOut,
  Zap,
  Sparkles,
  Users,
  Crown,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: CreditCard, label: "Subscriptions", path: "/subscriptions" },
  { icon: PieChart, label: "Analytics", path: "/analytics" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: Users, label: "Family Sharing", path: "/family-sharing", isPro: true },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const aiItems = [
  {
    icon: Sparkles,
    label: "AI Assistant",
    path: "/ai-assistant",
    badge: "New",
    isNew: true,
    isPro: true
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onUpgradeClick?: () => void;
}

export function Sidebar({ collapsed, onUpgradeClick }: SidebarProps) {
  const location = useLocation();
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle smooth transition state
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [collapsed]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/auth");
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-100 flex h-screen flex-col transition-all duration-500 ease-out",
        "bg-sidebar-background border-r border-sidebar-border",
        "shadow-2xl",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Animated border gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      {/* Subtle scanline effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] dark:opacity-[0.08]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-scan" />
      </div>

      {/* Logo Section */}
      <div className={cn(
        "relative flex h-20 items-center border-b border-sidebar-border transition-all duration-500",
        collapsed ? "justify-center px-0" : "gap-3 px-6"
      )}>
        <div className={cn(
          "relative flex items-center justify-center rounded-xl transition-all duration-500",
          "bg-gradient-to-br from-primary to-accent shadow-lg glow-primary shrink-0",
          collapsed ? "h-10 w-10" : "h-11 w-11"
        )}>
          <Zap className={cn(
            "relative z-10 text-primary-foreground transition-all duration-500",
            collapsed ? "h-5 w-5" : "h-6 w-6"
          )} />
        </div>
        
        {!collapsed && (
          <span className={cn(
            "text-2xl font-bold text-sidebar-foreground transition-all duration-500",
            isTransitioning ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
          )}>
            SubTrack
          </span>
        )}
      </div>

      {/* Navigation Container with Custom Scrollbar */}
      <nav className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-6",
        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40"
      )}>
        {/* AI Features Group */}
        <div className="relative">
          {!collapsed && (
            <div className={cn(
              "relative mb-3 transition-all duration-500",
              isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            )}>
              <div className="flex items-center gap-2 px-3 py-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  Neural
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            {aiItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "group relative flex items-center rounded-lg transition-all duration-300",
                    "transform hover:scale-[1.02] active:scale-[0.98]",
                    collapsed ? "justify-center h-12 px-0" : "gap-3 h-12 px-4",
                    isActive
                      ? "bg-gradient-to-r from-primary/10 to-accent/10 text-primary glow-border"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-r-full glow-primary" />
                  )}
                  
                  {/* Icon container */}
                  <div className={cn(
                    "relative flex items-center justify-center transition-all duration-300",
                    collapsed ? "h-6 w-6" : "h-6 w-6",
                    isActive && "animate-pulse"
                  )}>
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
                    )}
                    <item.icon className="relative z-10 h-5 w-5" />
                  </div>
                  
                  {!collapsed && (
                    <div className={cn(
                      "flex items-center flex-1 gap-2 transition-all duration-500",
                      isTransitioning ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
                    )}>
                      <span className="text-sm font-medium truncate">{item.label}</span>
                      <div className="flex items-center gap-1 ml-auto">
                        {item.badge && (
                          <span className="rounded-full bg-gradient-to-r from-primary to-accent px-2 py-0.5 text-[10px] font-bold text-primary-foreground glow-primary animate-pulse">
                            {item.badge}
                          </span>
                        )}
                        {item.isPro && user?.plan === "free" && (
                          <Badge variant="secondary" className="bg-gradient-to-r from-warning via-warning to-destructive text-white border-0 text-[10px] px-1.5 py-0 shadow-lg shadow-warning/30">
                            <Crown className="h-2.5 w-2.5 mr-0.5" />
                            Pro
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {collapsed && item.badge && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse glow-primary" />
                  )}

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none" />
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="relative h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />
          <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-primary/50 rounded-full blur-sm" />
        </div>

        {/* Main Navigation Group */}
        <div className="relative">
          {!collapsed && (
            <div className={cn(
              "relative mb-3 transition-all duration-500",
              isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            )}>
              <div className="flex items-center gap-2 px-3 py-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  Core Systems
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "group relative flex items-center rounded-lg transition-all duration-300",
                    "transform hover:scale-[1.02] active:scale-[0.98]",
                    collapsed ? "justify-center h-12 px-0" : "gap-3 h-12 px-4",
                    isActive
                      ? "bg-primary/10 text-primary glow-border"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                  style={{ 
                    transitionDelay: isTransitioning ? '0ms' : `${index * 30}ms`,
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-r-full glow-primary" />
                  )}
                  
                  <div className={cn(
                    "relative flex items-center justify-center transition-all duration-300",
                    collapsed ? "h-6 w-6" : "h-6 w-6",
                    isActive && "animate-pulse"
                  )}>
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
                    )}
                    <item.icon className="relative z-10 h-5 w-5" />
                  </div>
                  
                  {!collapsed && (
                    <div className={cn(
                      "flex items-center flex-1 gap-2 transition-all duration-500",
                      isTransitioning ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
                    )}>
                      <span className="text-sm font-medium truncate">{item.label}</span>
                      {item.isPro && user?.plan === "free" && (
                        <Badge variant="secondary" className="ml-auto bg-gradient-to-r from-warning via-warning to-destructive text-white border-0 text-[10px] px-1.5 py-0 shadow-lg shadow-warning/30">
                          <Crown className="h-2.5 w-2.5 mr-0.5" />
                          Pro
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none" />
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className={cn(
        "relative border-t border-sidebar-border p-4 space-y-4",
        "bg-gradient-to-r from-primary/5 to-accent/5",
        collapsed && "items-center"
      )}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        {!collapsed && user?.plan === "free" && (
          <div className={cn(
            "relative rounded-xl p-4 overflow-hidden transition-all duration-500",
            "glass border-primary/20 glow-border",
            isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          )}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer-slow" />
            
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-warning" />
                <p className="text-sm font-bold text-sidebar-foreground">Upgrade to Pro</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Unlock advanced analytics and premium features
              </p>
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0 glow-primary transition-all duration-300 hover:scale-[1.02]"
                onClick={onUpgradeClick}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Upgrade Now
              </Button>
            </div>
          </div>
        )}
        
        <div className={cn(
          "flex items-center gap-2 transition-all duration-500",
          collapsed ? "flex-col" : "justify-between",
          isTransitioning && !collapsed && "opacity-0"
        )}>
          <div className="relative">
            <ThemeToggle />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout} 
            title="Logout"
            className={cn(
              "relative text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              "transition-all duration-300 group"
            )}
          >
            <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-destructive/20 rounded-lg opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
          </Button>
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/10 to-transparent pointer-events-none" />
    </aside>
  );
}