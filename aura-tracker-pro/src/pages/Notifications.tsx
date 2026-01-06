import { useState, useEffect, useRef } from "react";
import { Bell, BellOff, Check, Clock, CreditCard, AlertTriangle, Trash2, Settings, Mail, Smartphone, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  type Notification,
} from "@/api/notificationsApi";
import { toggleSound, playSound, updateUnreadCount, setSoundEnabled } from "@/features/auth/notificationSoundSlice";
import { useAppDispatch, useAppSelector } from "@/redux";
import { useGetUserPreferencesQuery, useUpdateUserPreferenceMutation } from "@/api/userPreferenceApi";
import { useMobileVoiceFeedback } from "@/hooks/useMobileVoiceFeedback";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "renewal":
      return CreditCard;
    case "warning":
    case "trial_ending":
      return AlertTriangle;
    case "success":
      return Check;
    case "reminder":
      return Clock;
    default:
      return Bell;
  }
};

export default function Notifications() {
  const dispatch = useAppDispatch();
  const soundEnabled = useAppSelector((state) => state.notificationSound.soundEnabled);
  const { vibrate, isMobile, notifyMobile } = useMobileVoiceFeedback();

  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const hasAnnouncedPage = useRef(false);

  // Fetch user preferences
  const { data: preferencesData, isLoading: preferencesLoading } = useGetUserPreferencesQuery();
  const [updatePreference] = useUpdateUserPreferenceMutation();

  // Sync Redux state with backend preferences on load (useEffect to avoid render-phase updates)
  useEffect(() => {
    if (preferencesData?.data?.soundNotifications !== undefined) {
      dispatch(setSoundEnabled(preferencesData.data.soundNotifications));
    }
  }, [preferencesData, dispatch]);

  // Build settings array from preferences
  const settings = preferencesData?.data
    ? [
        {
          id: "soundNotifications",
          label: "Sound Notifications",
          description: "Play sound when new notifications arrive",
          enabled: preferencesData.data.soundNotifications,
        },
        {
          id: "renewalReminders",
          label: "Renewal Reminders",
          description: "Get notified before subscriptions renew",
          enabled: preferencesData.data.renewalReminders,
        },
        {
          id: "paymentAlerts",
          label: "Payment Alerts",
          description: "Notifications for successful and failed payments",
          enabled: preferencesData.data.paymentAlerts,
        },
        {
          id: "spendingInsights",
          label: "Spending Insights",
          description: "Weekly spending summaries and unusual activity",
          enabled: preferencesData.data.spendingInsights,
        },
        {
          id: "priceChanges",
          label: "Price Change Alerts",
          description: "Get notified when subscription prices change",
          enabled: preferencesData.data.priceChanges,
        },
        {
          id: "newFeatures",
          label: "Product Updates",
          description: "New features and improvements",
          enabled: preferencesData.data.newFeatures,
        },
      ]
    : [];

  const { data: notificationsData, isLoading } = useGetNotificationsQuery(
    {
      read: activeTab === "unread" ? false : undefined,
    },
    {
      pollingInterval: 30000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: unreadCountData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = notificationsData?.data.notifications || [];
  const unreadCount = unreadCountData?.data?.unreadCount || 0;

  // Update unread count in Redux (moved to useEffect)
  useEffect(() => {
    dispatch(updateUnreadCount(unreadCount));
  }, [unreadCount, dispatch]);

  // Voice announcement for page load (once)
  useEffect(() => {
    if (!isLoading && !hasAnnouncedPage.current) {
      const message = unreadCount > 0 
        ? `Notifications page. You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}.`
        : "Notifications page. No unread notifications.";
      notifyMobile(message, { withSound: false, withHaptic: false });
      hasAnnouncedPage.current = true;
    }
  }, [isLoading, unreadCount, notifyMobile]);

  const handleMarkAsRead = async (id: string) => {
    if (isMobile) vibrate('tap');
    try {
      await markAsRead(id).unwrap();
      await notifyMobile("Marked as read", { withHaptic: true, hapticPattern: 'select' });
      toast({
        title: "Marked as read",
        description: "Notification has been marked as read",
      });
    } catch (error) {
      console.error("Failed to mark as read:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark notification as read",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (isMobile) vibrate('tap');
    try {
      await markAllAsRead().unwrap();
      await notifyMobile("All notifications marked as read", { 
        withSound: true, 
        withHaptic: true,
        hapticPattern: 'success'
      });
      toast({
        title: "All marked as read",
        description: "All notifications have been marked as read",
      });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark all notifications as read",
      });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (isMobile) vibrate('heavy');
    try {
      await deleteNotification(id).unwrap();
      await notifyMobile("Notification deleted", { 
        withSound: true, 
        withHaptic: true,
        hapticPattern: 'success'
      });
      toast({
        title: "Notification deleted",
        description: "The notification has been successfully deleted",
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete notification",
      });
    }
  };

  const toggleSetting = async (id: string) => {
    if (isMobile) vibrate('select');
    
    if (id === "soundNotifications") {
      const newValue = !soundEnabled;
      dispatch(toggleSound());
      try {
        await updatePreference({ key: "soundNotifications", value: newValue });
        await notifyMobile(
          newValue ? "Sound notifications enabled" : "Sound notifications disabled",
          { withHaptic: true, hapticPattern: 'toggleOn' }
        );
      } catch (error) {
        console.error("Failed to update sound preference:", error);
        dispatch(toggleSound()); // Revert on error
      }
    } else {
      const currentSetting = settings.find((s) => s.id === id);
      if (currentSetting) {
        try {
          await updatePreference({
            key: id as any,
            value: !currentSetting.enabled,
          });
          await notifyMobile(
            `${currentSetting.label} ${!currentSetting.enabled ? 'enabled' : 'disabled'}`,
            { withHaptic: true, hapticPattern: 'select' }
          );
        } catch (error) {
          console.error("Failed to update preference:", error);
        }
      }
    }
  };

  const handleTestSound = () => {
    if (isMobile) vibrate('tap');
    dispatch(playSound());
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "warning":
      case "trial_ending":
        return "border-l-yellow-500 bg-yellow-500/5";
      case "success":
        return "border-l-green-500 bg-green-500/5";
      case "renewal":
        return "border-l-primary bg-primary/5";
      case "payment_failed":
        return "border-l-red-500 bg-red-500/5";
      default:
        return "border-l-muted-foreground";
    }
  };

  const renderNotificationsList = (notifs: Notification[]) => {
    if (isLoading) {
      return (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      );
    }

    if (notifs.length === 0) {
      return (
        <div className="glass rounded-2xl p-12 text-center">
          {activeTab === "unread" ? (
            <>
              <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold">All caught up!</h3>
              <p className="text-muted-foreground">No unread notifications</p>
            </>
          ) : (
            <>
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No notifications</h3>
              <p className="text-muted-foreground">You're all caught up!</p>
            </>
          )}
        </div>
      );
    }

    return notifs.map((notification, index) => {
      const Icon = getNotificationIcon(notification.type);
      
      return (
        <div
          key={notification._id}
          className={cn(
            "glass rounded-xl p-4 border-l-4 transition-all duration-300 hover:glow-border opacity-0 animate-slide-in-left",
            getNotificationStyle(notification.type),
            !notification.read && "ring-1 ring-primary/20"
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                notification.type === "warning" || notification.type === "trial_ending"
                  ? "bg-yellow-500/20 text-yellow-500"
                  : notification.type === "success"
                  ? "bg-green-500/20 text-green-500"
                  : notification.type === "payment_failed"
                  ? "bg-red-500/20 text-red-500"
                  : "bg-primary/20 text-primary"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className={cn("font-semibold", !notification.read && "text-foreground")}>
                    {notification.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </div>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs text-muted-foreground">
                  {notification.timeAgo || new Date(notification.createdAt).toLocaleString()}
                </span>
                <div className="flex gap-2">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      Mark as read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => handleDeleteNotification(notification._id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen aura-bg">
      <div className="p-8">
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Notifications</h1>
              <p className="text-muted-foreground mt-1">Stay updated on your subscriptions</p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead} className="gap-2">
                <Check className="h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="glass">
              <TabsTrigger value="all" className="gap-2" onClick={() => isMobile && vibrate('tap')}>
                <Bell className="h-4 w-4" />
                All
                {unreadCount > 0 && (
                  <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="gap-2" onClick={() => isMobile && vibrate('tap')}>
                <BellOff className="h-4 w-4" />
                Unread
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2" onClick={() => isMobile && vibrate('tap')}>
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {renderNotificationsList(notifications)}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              {renderNotificationsList(notifications.filter((n) => !n.read))}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {preferencesLoading ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <p className="text-muted-foreground">Loading preferences...</p>
                </div>
              ) : (
                <>
                  <div className="glass rounded-2xl p-6 animate-fade-in">
                    <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>
                    <div className="space-y-6">
                      {settings.map((setting) => (
                        <div key={setting.id} className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <label className="font-medium">{setting.label}</label>
                            <p className="text-sm text-muted-foreground">{setting.description}</p>
                          </div>
                          <Switch checked={setting.enabled} onCheckedChange={() => toggleSetting(setting.id)} />
                        </div>
                      ))}
                    </div>
                  </div>

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
                        <Switch 
                          checked={preferencesData?.data?.emailNotifications}
                          onCheckedChange={() => toggleSetting("emailNotifications")}
                        />
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
                        <Switch 
                          checked={preferencesData?.data?.pushNotifications}
                          onCheckedChange={() => toggleSetting("pushNotifications")}
                        />
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
                        <Switch 
                          checked={preferencesData?.data?.inAppNotifications}
                          onCheckedChange={() => toggleSetting("inAppNotifications")}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
                    <h3 className="text-lg font-semibold mb-4">Test Notification Sound</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Preview how notification sounds will play when you receive alerts
                    </p>
                    <Button 
                      onClick={handleTestSound} 
                      variant="outline" 
                      className="gap-2"
                      disabled={!soundEnabled}
                    >
                      <Volume2 className="h-4 w-4" />
                      Play Test Sound
                    </Button>
                    {!soundEnabled && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Enable sound notifications above to test
                      </p>
                    )}
                  </div>

                  <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
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
                          onClick={() => isMobile && vibrate('tap')}
                        >
                          {option} before
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}