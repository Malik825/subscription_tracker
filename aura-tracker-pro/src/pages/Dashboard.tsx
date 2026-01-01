import { DashboardHeader } from "@/components/DashboardHeader";
import { StatCard } from "@/components/StatCard";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { SpendingChart } from "@/components/SpendingChart";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { UpcomingRenewals } from "@/components/UpcomingRenewals";
import { CreditCard, TrendingUp, Calendar, AlertTriangle, Database } from "lucide-react";
import { useSubscriptions, useSeedSubscriptions, useSubscriptionStats } from "@/hooks/useSubscriptions";
import { useAuth } from "@/hooks/useAuth";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { data: subscriptions, isLoading: isLoadingSubs } = useSubscriptions();
  const { data: stats, isLoading: isLoadingStats } = useSubscriptionStats();
  const { mutate: seed, isPending: isSeeding } = useSeedSubscriptions();
  const { user } = useAuth();
  const { onUpgradeClick } = useOutletContext<{ onUpgradeClick: () => void }>();

  console.log("Dashboard - User:", user);
  console.log("Dashboard - Subscriptions:", subscriptions);
  console.log("Dashboard - Stats:", stats);

  // Transform data for charts
  const spendingData = stats?.spending.byCategory
    ? Object.entries(stats.spending.byCategory).map(([name, val]: [string, { monthly: number; yearly: number }]) => ({
      name,
      value: val.monthly,
      color: getColorForCategory(name)
    }))
    : [];

  const monthlySpendingData = [
    { month: "Jan", amount: 245 },
    { month: "Feb", amount: 268 },
    { month: "Mar", amount: 284 },
    { month: "Apr", amount: 276 },
    { month: "May", amount: 298 },
    { month: "Jun", amount: 312 },
    { month: "Jul", amount: 325 },
    { month: "Aug", amount: 318 },
    { month: "Sep", amount: 342 },
    { month: "Oct", amount: 358 },
    { month: "Nov", amount: 365 },
    { month: "Dec", amount: stats?.spending.totalMonthly || 389 },
  ];

  const allSubscriptions = subscriptions?.pages.flatMap((page) => page.data) || [];
  const recentSubscriptions = allSubscriptions.slice(0, 5);

  // Transform renewals for display
  const upcomingRenewals = stats?.upcomingRenewals.map((r) => ({
    ...r,
    amount: r.price,
    date: r.renewalDate ? format(new Date(r.renewalDate), "MMM d") : "N/A",
    color: getColorForCategory("Subscription")
  })) || [];


  if (isLoadingSubs || isLoadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main wrapper for 90% width on mobile */}
      <div className="w-[90%] md:w-full mx-auto p-4 md:p-8 max-w-full overflow-x-hidden">
        {/* Header with Seed Button */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="w-full">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
              <p className="text-muted-foreground text-xs md:text-sm">Track and manage all your subscriptions</p>
            </div>
            {!isLoadingSubs && allSubscriptions.length === 0 && (
              <Button onClick={() => seed()} disabled={isSeeding} variant="outline" className="gap-2 w-full sm:w-auto shrink-0">
                {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                Seed Data
              </Button>
            )}
          </div>
          
          <DashboardHeader
            title=""
            onUpgradeClick={onUpgradeClick}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
          <StatCard
            title="Total Monthly"
            value={`$${(stats?.spending?.totalMonthly || 0).toFixed(2)}`}
            change={{ value: 0, type: "increase" }}
            icon={CreditCard}
            delay={100}
          />
          <StatCard
            title="Active Subscriptions"
            value={(stats?.overview?.active || 0).toString()}
            change={{ value: 0, type: "increase" }}
            icon={TrendingUp}
            delay={200}
          />
          <StatCard
            title="This Month's Renewals"
            value={(stats?.upcomingRenewals?.length || 0).toString()}
            description="Upcoming in 30 days"
            icon={Calendar}
            delay={300}
          />
          <StatCard
            title="Potential Savings"
            value={`$${(stats?.spending?.totalYearly || 0).toFixed(2)}`}
            description="Total Yearly Cost"
            icon={AlertTriangle}
            delay={400}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3 mb-6 md:mb-8">
          <div className="lg:col-span-2 min-w-0">
            <SpendingChart data={monthlySpendingData} />
          </div>
          <div className="min-w-0">
            <CategoryBreakdown data={spendingData} />
          </div>
        </div>

        {/* Subscriptions and Renewals */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 min-w-0">
            <div className="flex items-center justify-between opacity-0 animate-fade-in animation-delay-300">
              <h3 className="text-lg font-semibold">Recent Subscriptions</h3>
              <a
                href="/subscriptions"
                className="text-sm text-primary hover:underline"
              >
                View all
              </a>
            </div>
            {recentSubscriptions.map((sub, index: number) => (
              <SubscriptionCard
                key={sub._id}
                name={sub.name}
                price={sub.price}
                billingCycle={sub.frequency.toLowerCase() as "monthly" | "yearly" | "weekly"}
                nextBilling={sub.renewalDate ? format(new Date(sub.renewalDate), "MMM d, yyyy") : "N/A"}
                category={sub.category}
                color={getColorForCategory(sub.category)}
                delay={400 + index * 100}
              />
            ))}
            {recentSubscriptions.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                No subscriptions found. Click "Seed Data" to get started.
              </div>
            )}
          </div>
          <div className="min-w-0">
            <UpcomingRenewals renewals={upcomingRenewals} />
          </div>
        </div>
      </div>
    </div>
  );
}

function getColorForCategory(category: string): string {
  const map: Record<string, string> = {
    Entertainment: "#E50914",
    Music: "#1DB954",
    Development: "#6e5494",
    Design: "#A259FF",
    Productivity: "#000000",
    Shopping: "#FF9900",
    Food: "#4CAF50",
    Travel: "#2196F3",
    Others: "#9E9E9E",
    Subscription: "#607D8B"
  };
  return map[category] || map.Others;
}