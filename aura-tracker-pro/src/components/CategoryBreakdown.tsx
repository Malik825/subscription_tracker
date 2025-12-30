import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface CategoryBreakdownProps {
  className?: string;
  data: { name: string; value: number; color: string }[];
}

export function CategoryBreakdown({ className, data }: CategoryBreakdownProps) {
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
