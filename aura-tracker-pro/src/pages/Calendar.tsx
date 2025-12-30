import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";

export default function CalendarPage() {
    const { data: subscriptions, isLoading } = useSubscriptions();
    const [date, setDate] = useState<Date | undefined>(new Date());

    const parsedSubscriptions = (subscriptions || []).map(sub => ({
        ...sub,
        parsedDate: new Date(sub.renewalDate)
    }));

    // Filter subscriptions for filter selected date or upcoming
    const selectedDateSubs = date
        ? parsedSubscriptions.filter(sub =>
            sub.parsedDate.getDate() === date.getDate() &&
            sub.parsedDate.getMonth() === date.getMonth() &&
            sub.parsedDate.getFullYear() === date.getFullYear()
        )
        : [];

    const upcomingSubs = parsedSubscriptions
        .filter(sub => sub.parsedDate >= new Date())
        .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())
        .slice(0, 3);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen aura-bg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen aura-bg">
            <div className="p-8">
                <div className="space-y-6 animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold gradient-text">Calendar</h1>
                            <p className="text-muted-foreground mt-1">
                                Visualize your upcoming payments
                            </p>
                        </div>
                        <Button variant="glow" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Event
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Calendar Section */}
                        <div className="lg:col-span-2 glass p-6 rounded-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">
                                    {date ? date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : "Select Month"}
                                </h2>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border-none w-full max-w-full"
                                    classNames={{
                                        month: "w-full space-y-4",
                                        table: "w-full border-collapse space-y-1",
                                        head_row: "flex",
                                        row: "flex w-full mt-2",
                                        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent w-full",
                                        day: "h-24 w-full p-2 font-normal aria-selected:opacity-100 items-start justify-start flex flex-col gap-1 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10",
                                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                        day_today: "bg-accent text-accent-foreground",
                                    }}
                                    components={{
                                        DayContent: (props) => {
                                            const daySubs = parsedSubscriptions.filter(sub =>
                                                sub.parsedDate.getDate() === props.date.getDate() &&
                                                sub.parsedDate.getMonth() === props.date.getMonth() &&
                                                sub.parsedDate.getFullYear() === props.date.getFullYear()
                                            );
                                            return (
                                                <div className="w-full h-full flex flex-col items-start gap-1">
                                                    <span className="text-sm font-medium">{props.date.getDate()}</span>
                                                    <div className="flex flex-col gap-1 w-full scale-90 origin-top-left">
                                                        {daySubs.map(sub => (
                                                            <div key={sub._id} className="text-[10px] w-full bg-primary/20 text-primary-foreground px-1 py-0.5 rounded truncate">
                                                                ${sub.price} - {sub.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Sidebar: Details & Upcoming */}
                        <div className="space-y-6">
                            {/* Selected Date Details */}
                            <div className="glass p-6 rounded-2xl animate-slide-in-right">
                                <h3 className="text-lg font-semibold mb-4">
                                    {date ? date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : "Select a date"}
                                </h3>
                                <div className="space-y-4">
                                    {selectedDateSubs.length > 0 ? (
                                        selectedDateSubs.map(sub => (
                                            <div key={sub._id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                                <div>
                                                    <p className="font-semibold">{sub.name}</p>
                                                    <p className="text-xs text-muted-foreground">{sub.category}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-primary">${sub.price}</p>
                                                    <Badge variant="outline" className="text-[10px] h-5">Auto-pay</Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>No payments scheduled for this date</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Upcoming Summary */}
                            <div className="glass p-6 rounded-2xl animate-slide-in-right" style={{ animationDelay: "100ms" }}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Upcoming</h3>
                                    <Button variant="link" className="text-xs h-auto p-0 text-muted-foreground">View All</Button>
                                </div>
                                <div className="space-y-3">
                                    {upcomingSubs.map(sub => (
                                        <div key={sub._id} className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{sub.name}</p>
                                                <p className="text-xs text-muted-foreground">{sub.parsedDate.toLocaleDateString()}</p>
                                            </div>
                                            <span className="text-sm font-bold">${sub.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
