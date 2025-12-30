import { cn } from "@/lib/utils";
import { AlertCircle, Calendar } from "lucide-react";

interface Renewal {
  name: string;
  date: string;
  amount: number;
  daysUntil: number;
  logo?: string;
  color?: string;
}

const renewals: Renewal[] = [
  { name: "Netflix", date: "Dec 15", amount: 15.99, daysUntil: 2, color: "#E50914" },
  { name: "Spotify", date: "Dec 18", amount: 9.99, daysUntil: 5, color: "#1DB954" },
  { name: "GitHub", date: "Dec 22", amount: 4.00, daysUntil: 9, color: "#6e5494" },
  { name: "Figma", date: "Dec 28", amount: 12.00, daysUntil: 15, color: "#A259FF" },
];

interface UpcomingRenewalsProps {
  className?: string;
}

export function UpcomingRenewals({ className }: UpcomingRenewalsProps) {
  return (
    <div
      className={cn(
        "glass rounded-xl p-6 opacity-0 animate-fade-in-up animation-delay-500",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Upcoming Renewals</h3>
          <p className="text-sm text-muted-foreground">
            Next 30 days
          </p>
        </div>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-4">
        {renewals.map((renewal, index) => (
          <div
            key={renewal.name}
            className={cn(
              "flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-secondary/50",
              renewal.daysUntil <= 3 && "bg-warning/5 hover:bg-warning/10"
            )}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold"
              style={{
                backgroundColor: `${renewal.color}20`,
                color: renewal.color,
              }}
            >
              {renewal.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{renewal.name}</p>
                {renewal.daysUntil <= 3 && (
                  <AlertCircle className="h-4 w-4 text-warning" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{renewal.date}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${renewal.amount.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {renewal.daysUntil === 0
                  ? "Today"
                  : renewal.daysUntil === 1
                  ? "Tomorrow"
                  : `${renewal.daysUntil} days`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
