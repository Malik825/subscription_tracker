import { cn } from "@/lib/utils";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { logoutUser } from "@/features/auth/authSlice";
import {
  LayoutDashboard,
  CreditCard,
  PieChart,
  Calendar,
  Settings,
  Bell,
  LogOut,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: CreditCard, label: "Subscriptions", path: "/subscriptions" },
  { icon: PieChart, label: "Analytics", path: "/analytics" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface SidebarProps {
  collapsed?: boolean;
  onUpgradeClick?: () => void;
}

export function Sidebar({ collapsed, onUpgradeClick }: SidebarProps) {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/auth");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-border transition-all duration-300",
        collapsed ? "justify-center px-0" : "gap-3 px-6"
      )}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary glow-primary shrink-0">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold gradient-text truncate animate-fade-in">SubTrack</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-200 opacity-0 animate-slide-in-left",
                collapsed ? "justify-center px-0" : "gap-3 px-3",
                isActive
                  ? "bg-primary/10 text-primary glow-border"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <span className="truncate animate-fade-in">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className={cn(
        "border-t border-border p-3 space-y-4 transition-all duration-300",
        collapsed && "items-center"
      )}>
        {!collapsed && user?.plan === "free" && (
          <div className="glass rounded-xl p-4 animate-fade-in">
            <p className="text-sm font-medium">Upgrade to Pro</p>
            <p className="text-xs text-muted-foreground mt-1">
              Advanced analytics and more
            </p>
            <Button
              size="sm"
              className="w-full mt-3"
              variant="glow"
              onClick={onUpgradeClick}
            >
              Upgrade
            </Button>
          </div>
        )}
        <div className={cn(
          "flex items-center",
          collapsed ? "flex-col gap-4" : "justify-between"
        )}>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
