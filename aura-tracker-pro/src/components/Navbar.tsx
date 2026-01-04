import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { Zap, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLogoutMutation } from "@/api/authApi";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "Please try again",
      });
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.username) return user.username.substring(0, 2).toUpperCase();
    if (user.email) return user.email.substring(0, 2).toUpperCase();
    return "U";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 shrink-0 min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-primary shrink-0">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <span className="text-base sm:text-xl font-bold text-foreground truncate">
              SubTrack
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="shrink-0">
              <ThemeToggle />
            </div>

            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  {user.plan === "free" && (
                    <Link to="/dashboard">
                      <Button variant="outline" size="sm" className="h-9">
                        Upgrade to Pro
                      </Button>
                    </Link>
                  )}

                  <NotificationBell iconSize="md" />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="relative h-9 w-9 rounded-full hover:bg-accent"
                      >
                        <Avatar className="h-9 w-9 border-2 border-border">
                          <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-semibold">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.username}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground mt-1">
                            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              {user.plan.toUpperCase()}
                            </span>
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex sm:hidden items-center gap-1.5">
                  <NotificationBell iconSize="sm" />
                  
                  <Link to="/dashboard" className="shrink-0">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 h-9 px-3 text-sm">
                      Dashboard
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
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

                <Link to="/auth" className="sm:hidden shrink-0">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 h-9 px-3 text-sm">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}