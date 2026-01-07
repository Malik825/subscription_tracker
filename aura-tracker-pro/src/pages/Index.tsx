import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import {
  Zap,
  TrendingUp,
  Bell,
  PieChart,
  Shield,
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
    <div className="min-h-screen bg-background">
      {/* Main wrapper for 80% width on mobile, 95% on larger screens */}
      <div className="w-[80%] lg:w-[95%] mx-auto">
        
        {/* Navigation */}
        <Navbar />

        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <section className="py-12 md:py-20">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
              Everything you need to{" "}
              <span className="text-primary">save money</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to give you complete control over your
              subscriptions
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="border border-border rounded-xl p-5 md:p-6 hover:border-primary/50 transition-colors bg-card"
              >
                <div className="rounded-xl bg-primary/10 p-2.5 md:p-3 w-fit mb-3 md:mb-4">
                  <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-12 md:py-24 mb-20 md:mb-0">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 tracking-tight">
              Simple, transparent{" "}
              <span className="text-primary">pricing</span>
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. Scale your subscription management without hidden fees.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-2xl p-6 md:p-10 border",
                  plan.popular 
                    ? "border-primary bg-primary/5 md:scale-105 shadow-lg shadow-primary/10" 
                    : "border-border bg-card hover:border-primary/50 transition-colors"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 px-4 md:px-6 py-1 md:py-1.5 bg-primary text-primary-foreground text-xs md:text-sm font-bold rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="mb-8 md:mb-10 text-center">
                  <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-primary mb-3 md:mb-4 block">
                    {plan.name}
                  </span>
                  <div className="flex items-baseline justify-center gap-1 md:gap-1.5 mb-3 md:mb-4">
                    <span className="text-4xl md:text-5xl font-extrabold tracking-tight">{plan.price}</span>
                    {plan.period && (
                      <span className="text-sm md:text-base text-muted-foreground font-medium">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="h-px w-full bg-border mb-6 md:mb-10" />

                <ul className="space-y-3 md:space-y-5 mb-8 md:mb-12">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 md:gap-4">
                      <div className="mt-0.5 md:mt-1 rounded-full bg-primary/20 p-1 shrink-0">
                        <Check className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary" />
                      </div>
                      <span className="text-sm md:text-[15px] font-medium text-foreground/80 leading-snug">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth" className="w-full">
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    className={cn(
                      "w-full rounded-xl h-11 md:h-12 text-sm md:text-base font-semibold",
                      plan.popular && "bg-primary hover:bg-primary/90"
                    )}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20 mb-20 md:mb-0">
          <div className="border border-border rounded-2xl md:rounded-3xl p-8 md:p-12 text-center bg-card">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
              Ready to take control?
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8 max-w-xl mx-auto">
              Join thousands of users who are already saving money with
              SubTrack. Start your free trial today.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 h-11 md:h-12 px-6 md:px-8 text-sm md:text-base">
                Start Free Trial
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 md:py-12 mb-20 md:mb-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-foreground" />
              </div>
              <span className="text-sm md:text-base font-semibold">SubTrack</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              © 2024 SubTrack. All rights reserved.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}