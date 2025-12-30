import { useState } from "react";
import { Bell, BellOff, Check, Clock, CreditCard, AlertTriangle, Trash2, Settings, Mail, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const notifications = [
  {
    id: 1,
    type: "renewal",
    title: "Netflix renewal tomorrow",
    message: "Your Netflix subscription will renew for $15.99 on Feb 15, 2024",
    time: "1 hour ago",
    read: false,
    icon: CreditCard,
  },
  {
    id: 2,
    type: "warning",
    title: "Unusual spending detected",
    message: "Your subscription spending increased by 15% this month",
    time: "3 hours ago",
    read: false,
    icon: AlertTriangle,
  },
  {
    id: 3,
    type: "reminder",
    title: "Spotify billing in 3 days",
    message: "Spotify will charge $9.99 on Feb 10, 2024",
    time: "5 hours ago",
    read: true,
    icon: Clock,
  },
  {
    id: 4,
    type: "success",
    title: "Payment successful",
    message: "Adobe CC payment of $54.99 was processed successfully",
    time: "1 day ago",
    read: true,
    icon: Check,
  },
  {
    id: 5,
    type: "renewal",
    title: "GitHub Pro renewal",
    message: "Your GitHub Pro subscription will renew for $4.00 on Feb 18, 2024",
    time: "2 days ago",
    read: true,
    icon: CreditCard,
  },
  {
    id: 6,
    type: "warning",
    title: "Free trial ending soon",
    message: "Your Canva Pro trial ends in 5 days. Cancel to avoid charges.",
    time: "3 days ago",
    read: true,
    icon: AlertTriangle,
  },
];

const notificationSettings = [
  { id: "renewal_reminders", label: "Renewal Reminders", description: "Get notified before subscriptions renew", enabled: true },
  { id: "payment_alerts", label: "Payment Alerts", description: "Notifications for successful and failed payments", enabled: true },
  { id: "spending_insights", label: "Spending Insights", description: "Weekly spending summaries and unusual activity", enabled: true },
  { id: "price_changes", label: "Price Change Alerts", description: "Get notified when subscription prices change", enabled: false },
  { id: "new_features", label: "Product Updates", description: "New features and improvements", enabled: false },
];

export default function Notifications() {
  const [notifs, setNotifs] = useState(notifications);
  const [settings, setSettings] = useState(notificationSettings);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "warning":
        return "border-l-yellow-500 bg-yellow-500/5";
      case "success":
        return "border-l-green-500 bg-green-500/5";
      case "renewal":
        return "border-l-primary bg-primary/5";
      default:
        return "border-l-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen aura-bg">
      <div className="p-8">
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Notifications</h1>
              <p className="text-muted-foreground mt-1">
                Stay updated on your subscriptions
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead} className="gap-2">
                <Check className="h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="glass">
              <TabsTrigger value="all" className="gap-2">
                <Bell className="h-4 w-4" />
                All
                {unreadCount > 0 && (
                  <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="gap-2">
                <BellOff className="h-4 w-4" />
                Unread
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {notifs.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No notifications</h3>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </div>
              ) : (
                notifs.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "glass rounded-xl p-4 border-l-4 transition-all duration-300 hover:glow-border opacity-0 animate-slide-in-left",
                      getNotificationStyle(notification.type),
                      !notification.read && "ring-1 ring-primary/20"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        notification.type === "warning" ? "bg-yellow-500/20 text-yellow-500" :
                          notification.type === "success" ? "bg-green-500/20 text-green-500" :
                            "bg-primary/20 text-primary"
                      )}>
                        <notification.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className={cn("font-semibold", !notification.read && "text-foreground")}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                          <div className="flex gap-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Mark as read
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-destructive hover:text-destructive"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              {notifs.filter((n) => !n.read).length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold">All caught up!</h3>
                  <p className="text-muted-foreground">No unread notifications</p>
                </div>
              ) : (
                notifs
                  .filter((n) => !n.read)
                  .map((notification, index) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "glass rounded-xl p-4 border-l-4 transition-all duration-300 hover:glow-border opacity-0 animate-slide-in-left",
                        getNotificationStyle(notification.type),
                        "ring-1 ring-primary/20"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full",
                          notification.type === "warning" ? "bg-yellow-500/20 text-yellow-500" :
                            notification.type === "success" ? "bg-green-500/20 text-green-500" :
                              "bg-primary/20 text-primary"
                        )}>
                          <notification.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Notification Preferences */}
              <div className="glass rounded-2xl p-6 animate-fade-in">
                <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>
                <div className="space-y-6">
                  {settings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="font-medium">{setting.label}</label>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <Switch
                        checked={setting.enabled}
                        onCheckedChange={() => toggleSetting(setting.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Methods */}
              <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
                <h3 className="text-lg font-semibold mb-6">Delivery Methods</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                        <Smartphone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive push notifications on mobile</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                        <Bell className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">In-App Notifications</p>
                        <p className="text-sm text-muted-foreground">Show notifications within the app</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              {/* Reminder Timing */}
              <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
                <h3 className="text-lg font-semibold mb-4">Renewal Reminder Timing</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose when you'd like to be reminded before a subscription renews
                </p>
                <div className="flex flex-wrap gap-2">
                  {["1 day", "3 days", "1 week", "2 weeks"].map((option) => (
                    <Button
                      key={option}
                      variant={option === "3 days" ? "default" : "outline"}
                      size="sm"
                    >
                      {option} before
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
