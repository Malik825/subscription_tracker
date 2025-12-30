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

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: CreditCard, label: "Subscriptions", path: "/subscriptions" },
  { icon: PieChart, label: "Analytics", path: "/analytics" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/auth");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary glow-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold gradient-text">SubTrack</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 opacity-0 animate-slide-in-left",
                isActive
                  ? "bg-primary/10 text-primary glow-border"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-4 space-y-4">
        <div className="glass rounded-xl p-4">
          <p className="text-sm font-medium">Upgrade to Pro</p>
          <p className="text-xs text-muted-foreground mt-1">
            Unlock advanced analytics and unlimited tracking
          </p>
          <Button size="sm" className="w-full mt-3" variant="glow">
            Upgrade Now
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
