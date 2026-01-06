import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number | ReactNode; // Support ReactNode for components like CurrencyDisplay
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
  };
  icon: LucideIcon;
  description?: string;
  className?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  description,
  className,
  delay = 0,
}: StatCardProps) {
  // Helper to render value - format numbers to 2 decimal places
  const renderValue = () => {
    if (typeof value === 'number') {
      return `$${value.toFixed(2)}`;
    }
    return value;
  };

  return (
    <div
      className={cn(
        "stat-card glass glass-hover p-6 opacity-0 animate-fade-in-up",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{renderValue()}</p>
          {change && (
            <div className="flex items-center gap-1 text-sm">
              <span
                className={cn(
                  "font-medium",
                  change.type === "increase" ? "text-success" :
                    change.type === "decrease" ? "text-destructive" :
                      "text-muted-foreground"
                )}
              >
                {change.type === "increase" ? "+" : change.type === "decrease" ? "-" : ""}
                {Math.abs(change.value)}%
              </span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="rounded-xl bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}