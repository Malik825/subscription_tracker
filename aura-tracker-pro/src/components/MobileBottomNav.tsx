import { Link, useLocation } from "react-router-dom";
import { Home, LayoutDashboard, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/analytics", icon: TrendingUp },
];

export function MobileBottomNav() {
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
      <div className="relative grid grid-cols-3 gap-1 px-2 py-2">
        {/* Liquid indicator background */}
        <div
          className={cn(
            "absolute top-2 h-[calc(100%-16px)] rounded-2xl bg-primary/10 transition-all duration-500 ease-out",
            location.pathname === "/" && "left-2 w-[calc(33.333%-8px)]",
            location.pathname === "/dashboard" && "left-[calc(33.333%+2px)] w-[calc(33.333%-8px)]",
            location.pathname === "/analytics" && "left-[calc(66.666%+2px)] w-[calc(33.333%-8px)]"
          )}
          style={{
            transform: isActive("/") 
              ? "scale(1)" 
              : isActive("/dashboard") 
              ? "scale(1)" 
              : isActive("/analytics")
              ? "scale(1)"
              : "scale(0.95)"
          }}
        />
        
        {mobileNavItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="relative flex flex-col items-center justify-center gap-1 py-2 px-3 z-10"
          >
            <div
              className={cn(
                "transition-all duration-300",
                isActive(item.href)
                  ? "text-primary scale-110"
                  : "text-muted-foreground scale-100"
              )}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <span
              className={cn(
                "text-xs font-medium transition-all duration-300",
                isActive(item.href)
                  ? "text-primary opacity-100"
                  : "text-muted-foreground opacity-70"
              )}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}