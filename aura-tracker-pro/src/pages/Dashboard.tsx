import { DashboardHeader } from "@/components/DashboardHeader";
import { StatCard } from "@/components/StatCard";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { SpendingChart } from "@/components/SpendingChart";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { UpcomingRenewals } from "@/components/UpcomingRenewals";
import { CreditCard, TrendingUp, Calendar, AlertTriangle } from "lucide-react";

const subscriptions = [
  {
    name: "Netflix",
    price: 15.99,
    billingCycle: "monthly" as const,
    nextBilling: "Dec 15, 2024",
    category: "Entertainment",
    color: "#E50914",
  },
  {
    name: "Spotify",
    price: 9.99,
    billingCycle: "monthly" as const,
    nextBilling: "Dec 18, 2024",
    category: "Music",
    color: "#1DB954",
  },
  {
    name: "GitHub Pro",
    price: 4.00,
    billingCycle: "monthly" as const,
    nextBilling: "Dec 22, 2024",
    category: "Development",
    color: "#6e5494",
  },
  {
    name: "Figma",
    price: 12.00,
    billingCycle: "monthly" as const,
    nextBilling: "Dec 28, 2024",
    category: "Design",
    color: "#A259FF",
  },
  {
    name: "Notion",
    price: 10.00,
    billingCycle: "monthly" as const,
    nextBilling: "Jan 3, 2025",
    category: "Productivity",
    color: "#000000",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen aura-bg">
      <div className="p-8">
        <DashboardHeader
          title="Dashboard"
          subtitle="Track and manage all your subscriptions"
        />

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Monthly"
            value="$289.94"
            change={{ value: 12.5, type: "increase" }}
            icon={CreditCard}
            delay={100}
          />
          <StatCard
            title="Active Subscriptions"
            value="24"
            change={{ value: 3, type: "increase" }}
            icon={TrendingUp}
            delay={200}
          />
          <StatCard
            title="This Month's Renewals"
            value="8"
            description="$156.45 total"
            icon={Calendar}
            delay={300}
          />
          <StatCard
            title="Potential Savings"
            value="$45.00"
            description="2 unused subscriptions"
            icon={AlertTriangle}
            delay={400}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <SpendingChart className="lg:col-span-2" />
          <CategoryBreakdown />
        </div>

        {/* Subscriptions and Renewals */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between opacity-0 animate-fade-in animation-delay-300">
              <h3 className="text-lg font-semibold">Recent Subscriptions</h3>
              <a
                href="/subscriptions"
                className="text-sm text-primary hover:underline"
              >
                View all
              </a>
            </div>
            {subscriptions.map((sub, index) => (
              <SubscriptionCard
                key={sub.name}
                {...sub}
                delay={400 + index * 100}
              />
            ))}
          </div>
          <UpcomingRenewals />
        </div>
      </div>
    </div>
  );
}
