import { cn } from "@/lib/utils";
import { Calendar, MoreHorizontal, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SubscriptionCardProps {
  name: string;
  price: number;
  billingCycle: "monthly" | "yearly" | "weekly";
  nextBilling: string;
  category: string;
  logo?: string;
  color?: string;
  className?: string;
  delay?: number;
  isTrial?: boolean;
  trialType?: "3-day" | "7-day" | "none";
  trialEndDate?: string;
  status?: "Active" | "Trial" | "Expired" | "Suspended" | "Cancelled";
}

const categoryColors: Record<string, string> = {
  entertainment: "bg-purple-500/20 text-purple-400",
  productivity: "bg-blue-500/20 text-blue-400",
  development: "bg-green-500/20 text-green-400",
  design: "bg-pink-500/20 text-pink-400",
  music: "bg-orange-500/20 text-orange-400",
  storage: "bg-cyan-500/20 text-cyan-400",
  other: "bg-gray-500/20 text-gray-400",
};

const statusColors: Record<string, string> = {
  Active: "bg-green-500/20 text-green-400",
  Trial: "bg-yellow-500/20 text-yellow-400",
  Expired: "bg-red-500/20 text-red-400",
  Suspended: "bg-orange-500/20 text-orange-400",
  Cancelled: "bg-gray-500/20 text-gray-400",
};

export function SubscriptionCard({
  name,
  price,
  billingCycle,
  nextBilling,
  category,
  logo,
  color,
  className,
  delay = 0,
  isTrial = false,
  trialType = "none",
  trialEndDate,
  status = "Active",
}: SubscriptionCardProps) {
  const cycleLabel = {
    monthly: "/mo",
    yearly: "/yr",
    weekly: "/wk",
  };

  const trialLabel = {
    "3-day": "3-Day Trial",
    "7-day": "7-Day Trial",
    none: "",
  };

  return (
    <div
      className={cn(
        "glass glass-hover rounded-xl p-4 opacity-0 animate-fade-in",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold"
          style={{
            backgroundColor: color ? `${color}20` : "hsl(var(--primary) / 0.1)",
            color: color || "hsl(var(--primary))",
          }}
        >
          {logo ? (
            <img src={logo} alt={name} className="h-8 w-8 rounded" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                categoryColors[category.toLowerCase()] || categoryColors.other
              )}
            >
              {category}
            </span>
            
            {isTrial && trialType !== "none" && (
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
                  statusColors.Trial
                )}
              >
                <Clock className="h-3 w-3" />
                {trialLabel[trialType]}
              </span>
            )}
            
            {status !== "Active" && status !== "Trial" && (
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  statusColors[status]
                )}
              >
                {status}
              </span>
            )}
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {isTrial && trialEndDate ? `Trial ends: ${trialEndDate}` : nextBilling}
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold">
            {isTrial ? (
              <span className="text-sm text-muted-foreground">Free Trial</span>
            ) : (
              <>
                ${price.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">
                  {cycleLabel[billingCycle]}
                </span>
              </>
            )}
          </p>
          {isTrial && (
            <p className="text-xs text-muted-foreground mt-1">
              Then ${price.toFixed(2)}{cycleLabel[billingCycle]}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            {isTrial && (
              <DropdownMenuItem>Convert to Paid</DropdownMenuItem>
            )}
            <DropdownMenuItem>Pause</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}