import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 max-w-7xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-primary shrink-0">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <span className="text-base sm:text-xl font-bold text-foreground truncate">SubTrack</span>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="shrink-0">
              <ThemeToggle />
            </div>
            
            {/* Desktop: Show both buttons */}
            <Link to="/auth" className="hidden sm:block shrink-0">
              <Button variant="ghost" size="sm" className="h-9">
                Sign In
              </Button>
            </Link>
            <Link to="/auth" className="hidden sm:block shrink-0">
              <Button size="sm" className="bg-primary hover:bg-primary/90 h-9">
                Get Started
              </Button>
            </Link>

            {/* Mobile: Single compact button */}
            <Link to="/auth" className="sm:hidden shrink-0">
              <Button size="sm" className="bg-primary hover:bg-primary/90 h-9 px-3 text-sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}