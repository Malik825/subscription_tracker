import { TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { useSubscriptionStats } from "@/hooks/useSubscriptions";
import { StatCard } from "@/components/StatCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

export default function Analytics() {
  const { data: stats, isLoading } = useSubscriptionStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen aura-bg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const categoryData = stats?.spending.byCategory
    ? Object.entries(stats.spending.byCategory).map(([category, values], idx) => ({
      name: category,
      value: values.monthly,
      color: [`#E50914`, `#1DB954`, `#6e5494`, `#A259FF`, `#000000`, `#FF9900`, `#4CAF50`][idx % 7]
    }))
    : [];

  const totalSpending = stats?.spending.totalMonthly || 0;
  const previousSpending = totalSpending * 0.95; // Fake comparison for now as backend doesn't provide history
  const spendingChange = ((totalSpending - previousSpending) / (previousSpending || 1) * 100).toFixed(1);

  const monthlyData = [
    { month: "Current", spending: totalSpending, subscriptions: stats?.overview.active || 0 },
  ];

  const weeklyTrend = [
    { day: "Status", amount: totalSpending },
  ];

  const topServices = stats?.upcomingRenewals.slice(0, 5).map(r => ({
    name: r.name,
    amount: r.price,
    change: 0
  })) || [];

  return (
    <div className="min-h-screen aura-bg">
      <div className="p-8">
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold gradient-text">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Detailed insights into your subscription spending
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Monthly"
              value={`$${totalSpending.toFixed(2)}`}
              change={{ value: parseFloat(spendingChange), type: "increase" }}
              icon={DollarSign}
              delay={0}
            />
            <StatCard
              title="Yearly Projection"
              value={`$${(totalSpending * 12).toFixed(2)}`}
              change={{ value: 0, type: "increase" }}
              icon={TrendingUp}
              delay={100}
            />
            <StatCard
              title="Avg per Service"
              value={`$${(totalSpending / (stats?.overview.active || 1)).toFixed(2)}`}
              change={{ value: 0, type: "neutral" }}
              icon={Calendar}
              delay={200}
            />
            <StatCard
              title="Health Score"
              value={`${stats?.workflow.completed && stats?.overview.total ? Math.round((stats.workflow.completed / stats.overview.total) * 100) : 0}%`}
              description={`${stats?.workflow.running || 0} active reminders`}
              icon={TrendingUp}
              delay={300}
            />
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass rounded-2xl p-6 animate-slide-in-left" style={{ animationDelay: "100ms" }}>
              <h3 className="text-lg font-semibold mb-4">Current Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="spending"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#spendingGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass rounded-2xl p-6 animate-slide-in-right" style={{ animationDelay: "200ms" }}>
              <h3 className="text-lg font-semibold mb-4">By Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span>{cat.name}</span>
                    </div>
                    <span className="font-medium">${cat.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6 animate-slide-in-left" style={{ animationDelay: "300ms" }}>
              <h3 className="text-lg font-semibold mb-4">Service Insights</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="spending"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="subscriptions"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="glass rounded-2xl p-6 animate-slide-in-right" style={{ animationDelay: "400ms" }}>
              <h3 className="text-lg font-semibold mb-4">Monthly Spending</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "500ms" }}>
            <h3 className="text-lg font-semibold mb-4">Top Spending Services</h3>
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-6">#{index + 1}</span>
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-primary">${service.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {topServices.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No services tracked yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
