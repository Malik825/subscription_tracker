import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Plus } from "lucide-react";
import DashboardMockup from "../assets/dashboard-mockup.png";
import { useAuth } from "@/hooks/useAuth";

export const Hero = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none" />

      <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Column: Content */}
        <div className="text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 opacity-0 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Now with AI-powered personalized insights
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 opacity-0 animate-fade-in-up animation-delay-100">
            Master Your <br />
            <span className="gradient-text">Subscriptions</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 opacity-0 animate-fade-in-up animation-delay-200">
            Stop losing money on forgotten trials. Track, manage, and optimize all your recurring payments in one beautiful, intelligent dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start opacity-0 animate-fade-in-up animation-delay-300">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button variant="glow" size="xl" className="w-full sm:w-auto">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/subscriptions">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Subscription
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="glow" size="xl" className="w-full sm:w-auto">
                    Start Free Trial
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto">
                    Explore Dashboard
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-0 animate-fade-in-up animation-delay-400">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                  {i === 4 ? "+2k" : ""}
                </div>
              ))}
            </div>
            <div>
              <p className="font-bold text-lg">10,000+</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Mockup */}
        <div className="relative opacity-0 animate-fade-in-up animation-delay-500 hidden lg:block perspective-1000 group">
          {/* Main Image Card */}
          <div className="relative z-10 glass border border-white/10 p-2 rounded-2xl shadow-2xl transform transition-all duration-700 ease-out hover:scale-[1.02] hover:-rotate-y-6 hover:rotate-x-6 rotate-y-[-10deg] rotate-x-[5deg]">
            <div className="relative rounded-xl overflow-hidden bg-background/50">
              <img
                src={DashboardMockup}
                alt="Dashboard Preview"
                className="w-full h-auto object-cover rounded-xl shadow-inner"
              />
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          </div>

          {/* Floating Elements - Animated on Group Hover */}
          <div className="absolute -top-6 -right-6 glass p-4 rounded-xl animate-float opacity-90 z-20 transition-all duration-500 group-hover:translate-x-4 group-hover:-translate-y-4 group-hover:rotate-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-green-500 text-xs font-bold">$</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saved</p>
                <p className="font-bold text-sm">$1,240.00</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-8 -left-8 glass p-4 rounded-xl animate-float animation-delay-2000 opacity-90 z-20 transition-all duration-500 group-hover:-translate-x-4 group-hover:translate-y-4 group-hover:-rotate-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-500 text-xs font-bold">!</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Alert</p>
                <p className="font-bold text-sm">Netflix Renewing</p>
              </div>
            </div>
          </div>

          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/20 blur-[100px] -z-10 group-hover:bg-primary/30 transition-colors duration-700" />
        </div>
      </div>
    </section>
  );
};
