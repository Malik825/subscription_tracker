import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Zap,
  TrendingUp,
  Bell,
  PieChart,
  Shield,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Hero } from "@/components/Hero";

const features = [
  {
    icon: TrendingUp,
    title: "Smart Analytics",
    description:
      "Get detailed insights into your spending patterns with beautiful charts and reports.",
  },
  {
    icon: Bell,
    title: "Renewal Alerts",
    description:
      "Never miss a payment with smart notifications before each renewal date.",
  },
  {
    icon: PieChart,
    title: "Category Tracking",
    description:
      "Organize subscriptions by category and see where your money goes.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your data is encrypted and never shared. We take privacy seriously.",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "Up to 5 subscriptions",
      "Basic analytics",
      "Email reminders",
      "Single device",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For power users",
    features: [
      "Unlimited subscriptions",
      "Advanced analytics",
      "Priority notifications",
      "Multi-device sync",
      "Export reports",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/month",
    description: "For teams and businesses",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Admin dashboard",
      "SSO authentication",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Index() {
  return (
    <div className="min-h-screen aura-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary glow-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">SubTrack</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button variant="glow">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="gradient-text">save money</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to give you complete control over your
              subscriptions
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={cn(
                  "stat-card glass glass-hover p-6 opacity-0 animate-fade-in-up"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="rounded-xl bg-primary/10 p-3 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10" />
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Simple, transparent{" "}
              <span className="gradient-text">pricing</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose the plan that fits your needs. Scale your subscription management without hidden fees.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={plan.name}
                className={cn(
                  "relative group transition-all duration-500",
                  "stat-card glass-premium rounded-[2.5rem] p-10 opacity-0 animate-fade-in-up",
                  plan.popular ? "scale-105 z-10 glow-border-primary ring-1 ring-primary/20 bg-background/40" : "hover:scale-[1.02] bg-background/20"
                )}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-primary text-primary-foreground text-sm font-bold rounded-full shadow-lg shadow-primary/20 uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div className="mb-10 text-center">
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4 block">
                    {plan.name}
                  </span>
                  <div className="flex items-baseline justify-center gap-1.5 mb-4">
                    <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground font-medium">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mb-10" />

                <ul className="space-y-5 mb-12">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-4 group/item">
                      <div className="mt-1 rounded-full bg-primary/20 p-1 group-hover/item:bg-primary/30 transition-colors">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-[15px] font-medium text-foreground/80 group-hover/item:text-foreground transition-colors leading-tight">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth" className="w-full">
                  <Button
                    variant={plan.popular ? "glow" : "outline"}
                    size="xl"
                    className={cn(
                      "w-full rounded-2xl h-14 text-base font-bold transition-all duration-300",
                      !plan.popular && "hover:bg-primary/10 hover:border-primary/30"
                    )}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-glow-secondary/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to take control?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of users who are already saving money with
                SubTrack. Start your free trial today.
              </p>
              <Link to="/auth">
                <Button variant="glow" size="xl">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">SubTrack</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 SubTrack. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
