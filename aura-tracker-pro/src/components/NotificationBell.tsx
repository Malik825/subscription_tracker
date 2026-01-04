import { useState } from "react";
import { Bell, Check, Trash2, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  type Notification,
} from "@/api/notificationsApi";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  iconSize?: "sm" | "md";
}

export function NotificationBell({ iconSize = "md" }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: unreadCountData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { data: notificationsData } = useGetNotificationsQuery(
    { limit: 5, page: 1 },
    {
      pollingInterval: isOpen ? 10000 : 30000,
      skip: !isOpen,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const unreadCount = unreadCountData?.data?.unreadCount || 0;
  const notifications = notificationsData?.data?.notifications || [];

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAsRead(id).unwrap();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getNotificationStyle = (type: Notification["type"]) => {
    switch (type) {
      case "warning":
      case "trial_ending":
        return "bg-yellow-500/10 border-l-2 border-l-yellow-500";
      case "success":
        return "bg-green-500/10 border-l-2 border-l-green-500";
      case "renewal":
        return "bg-primary/10 border-l-2 border-l-primary";
      case "payment_failed":
        return "bg-red-500/10 border-l-2 border-l-red-500";
      default:
        return "bg-muted/50 border-l-2 border-l-muted-foreground";
    }
  };

  const iconClass = iconSize === "sm" ? "h-4 w-4" : "h-5 w-5";
  const buttonClass = iconSize === "sm" ? "h-9 w-9" : "h-10 w-10";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", buttonClass)}>
          <Bell className={iconClass} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-medium"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 sm:w-96">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <div className="px-4 py-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="w-full justify-start text-xs h-8"
            >
              <Check className="h-3 w-3 mr-2" />
              Mark all as read
            </Button>
          </div>
        )}

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="py-2">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification._id}
                  className={cn(
                    "flex items-start gap-3 p-4 cursor-pointer focus:bg-accent/50",
                    getNotificationStyle(notification.type),
                    !notification.read && "bg-primary/5"
                  )}
                  onSelect={() => {
                    if (!notification.read) {
                      markAsRead(notification._id);
                    }
                  }}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm leading-tight",
                          !notification.read && "font-semibold"
                        )}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-xs text-muted-foreground">
                        {notification.timeAgo ||
                          new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                      {notification.priority === "high" && (
                        <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />

        <div className="p-2">
          <Link to="/notifications" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" className="w-full justify-center text-xs h-9">
              View all notifications
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}