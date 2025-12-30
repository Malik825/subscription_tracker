import { TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
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

const monthlyData = [
  { month: "Jan", spending: 145, subscriptions: 8 },
  { month: "Feb", spending: 152, subscriptions: 9 },
  { month: "Mar", spending: 148, subscriptions: 9 },
  { month: "Apr", spending: 165, subscriptions: 10 },
  { month: "May", spending: 158, subscriptions: 10 },
  { month: "Jun", spending: 172, subscriptions: 11 },
  { month: "Jul", spending: 168, subscriptions: 11 },
  { month: "Aug", spending: 175, subscriptions: 12 },
  { month: "Sep", spending: 182, subscriptions: 12 },
  { month: "Oct", spending: 178, subscriptions: 11 },
  { month: "Nov", spending: 185, subscriptions: 11 },
  { month: "Dec", spending: 187, subscriptions: 10 },
];

const categoryData = [
  { name: "Entertainment", value: 45.98, color: "hsl(var(--primary))" },
  { name: "Productivity", value: 64.99, color: "hsl(var(--chart-2))" },
  { name: "Development", value: 49.00, color: "hsl(var(--chart-3))" },
  { name: "Cloud", value: 45.00, color: "hsl(var(--chart-4))" },
  { name: "Communication", value: 23.74, color: "hsl(var(--chart-5))" },
];

const weeklyTrend = [
  { day: "Mon", amount: 12.5 },
  { day: "Tue", amount: 8.2 },
  { day: "Wed", amount: 15.8 },
  { day: "Thu", amount: 22.1 },
  { day: "Fri", amount: 18.5 },
  { day: "Sat", amount: 5.2 },
  { day: "Sun", amount: 9.8 },
];

const topServices = [
  { name: "Adobe CC", amount: 54.99, change: 0 },
  { name: "AWS", amount: 45.00, change: 12 },
  { name: "Netflix", amount: 15.99, change: -5 },
  { name: "Zoom", amount: 14.99, change: 0 },
  { name: "Figma", amount: 12.00, change: 20 },
];

export default function Analytics() {
  const totalSpending = 187.71;
  const previousSpending = 178.45;
  const spendingChange = ((totalSpending - previousSpending) / previousSpending * 100).toFixed(1);

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
              value={`$${totalSpending}`}
              change={{ value: parseFloat(spendingChange), type: "increase" }}
              icon={DollarSign}
              delay={0}
            />
            <StatCard
              title="Yearly Projection"
              value={`$${(totalSpending * 12).toFixed(0)}`}
              change={{ value: 8.2, type: "increase" }}
              icon={TrendingUp}
              delay={100}
            />
            <StatCard
              title="Avg per Service"
              value="$18.77"
              change={{ value: 2.1, type: "decrease" }}
              icon={Calendar}
              delay={200}
            />
            <StatCard
              title="Savings Potential"
              value="$45.00"
              description="3 unused subscriptions"
              icon={TrendingDown}
              delay={300}
            />
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Spending Trend */}
            <div className="lg:col-span-2 glass rounded-2xl p-6 animate-slide-in-left" style={{ animationDelay: "100ms" }}>
              <h3 className="text-lg font-semibold mb-4">Spending Trend</h3>
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

            {/* Category Distribution */}
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
                    <span className="font-medium">${cat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Count vs Spending */}
            <div className="glass rounded-2xl p-6 animate-slide-in-left" style={{ animationDelay: "300ms" }}>
              <h3 className="text-lg font-semibold mb-4">Subscriptions vs Spending</h3>
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

            {/* Weekly Billing */}
            <div className="glass rounded-2xl p-6 animate-slide-in-right" style={{ animationDelay: "400ms" }}>
              <h3 className="text-lg font-semibold mb-4">Weekly Billing Pattern</h3>
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

          {/* Top Services Table */}
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
                    <span className="font-bold text-primary">${service.amount}</span>
                    {service.change !== 0 && (
                      <div className={`flex items-center gap-1 text-sm ${service.change > 0 ? "text-destructive" : "text-green-500"}`}>
                        {service.change > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {Math.abs(service.change)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
