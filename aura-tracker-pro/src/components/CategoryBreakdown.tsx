import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface CategoryBreakdownProps {
  className?: string;
}

const data = [
  { name: "Entertainment", value: 89, color: "#8B5CF6" },
  { name: "Productivity", value: 65, color: "#3B82F6" },
  { name: "Development", value: 45, color: "#10B981" },
  { name: "Design", value: 35, color: "#EC4899" },
  { name: "Storage", value: 25, color: "#06B6D4" },
  { name: "Other", value: 30, color: "#6B7280" },
];

export function CategoryBreakdown({ className }: CategoryBreakdownProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div
      className={cn(
        "glass rounded-xl p-6 opacity-0 animate-fade-in-up animation-delay-400",
        className
      )}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Category Breakdown</h3>
        <p className="text-sm text-muted-foreground">
          Spending distribution by category
        </p>
      </div>
      <div className="flex items-center gap-6">
        <div className="h-[200px] w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                }}
                formatter={(value: number) => [`$${value}`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="flex-1 text-sm">{item.name}</span>
              <span className="text-sm font-medium">${item.value}</span>
              <span className="text-xs text-muted-foreground w-12 text-right">
                {((item.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
