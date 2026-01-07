import { useState } from "react";
import { Edit, Trash2, ExternalLink, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMobileVoiceFeedback } from "@/hooks/useMobileVoiceFeedback";
import { useTouchGesture } from "@/hooks/use-touch-guesture";

interface MobileSubscriptionCardProps {
  subscription: {
    _id: string;
    name: string;
    price: number;
    frequency: string;
    category: string;
    status: string;
    renewalDate?: string;
    website?: string;
  };
  onEdit: (sub: any) => void;
  onDelete: (id: string) => void;
  color: string;
}

export function MobileSubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  color,
}: MobileSubscriptionCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const { vibrate, isMobile } = useMobileVoiceFeedback();

  const gestureHandlers = useTouchGesture({
    onSwipeLeft: () => {
      if (!isRevealed) {
        setIsRevealed(true);
        setSwipeOffset(-120);
        if (isMobile) vibrate('swipe');
      }
    },
    onSwipeRight: () => {
      if (isRevealed) {
        setIsRevealed(false);
        setSwipeOffset(0);
        if (isMobile) vibrate('swipe');
      }
    },
    onTap: () => {
      if (isRevealed) {
        setIsRevealed(false);
        setSwipeOffset(0);
      } else if (isMobile) {
        vibrate('tap');
      }
    },
  });

  const handleEdit = () => {
    if (isMobile) vibrate('select');
    setIsRevealed(false);
    setSwipeOffset(0);
    onEdit(subscription);
  };

  const handleDelete = () => {
    if (isMobile) vibrate('heavy');
    setIsRevealed(false);
    setSwipeOffset(0);
    onDelete(subscription._id);
  };

  const handleVisitWebsite = () => {
    if (isMobile) vibrate('tap');
    const url = subscription.website || `https://google.com/search?q=${subscription.name}+subscription+manage`;
    window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Action Buttons Behind Card */}
      <div className="absolute inset-0 flex items-center justify-end gap-2 px-4 bg-gradient-to-l from-destructive/20 to-transparent">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleEdit}
        >
          <Edit className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={handleDelete}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Swipeable Card */}
      <div
        {...gestureHandlers}
        className={cn(
          "relative border border-border rounded-xl p-4 bg-card transition-transform duration-300 ease-out touch-pan-y",
          "active:scale-[0.98]"
        )}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
      >
        {/* Mobile: Stack layout */}
        <div className="flex flex-col gap-4 md:hidden">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold shrink-0"
              style={{ color }}
            >
              {subscription.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{subscription.name}</h3>
                <Badge
                  variant={subscription.status.toLowerCase() === "active" ? "default" : "secondary"}
                  className="text-xs shrink-0"
                >
                  {subscription.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{subscription.category}</p>
            </div>
          </div>

          {/* Price and Date */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-lg font-bold text-primary">${subscription.price}</p>
              <p className="text-xs text-muted-foreground">per {subscription.frequency}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Next billing</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(subscription.renewalDate)}
              </p>
            </div>
          </div>

          {/* Swipe Hint */}
          {!isRevealed && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground animate-pulse">← Swipe for actions</p>
            </div>
          )}
        </div>

        {/* Desktop: Original layout */}
        <div className="hidden md:flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold shrink-0"
            style={{ color }}
          >
            {subscription.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{subscription.name}</h3>
              <Badge
                variant={subscription.status.toLowerCase() === "active" ? "default" : "secondary"}
                className="text-xs shrink-0"
              >
                {subscription.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">{subscription.category}</p>
          </div>

          <div className="flex items-center gap-8">
            <div>
              <p className="text-lg font-bold text-primary">${subscription.price}</p>
              <p className="text-xs text-muted-foreground">/{subscription.frequency}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Next billing</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(subscription.renewalDate)}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleVisitWebsite}>
                  <ExternalLink className="h-4 w-4 mr-2" /> Visit Site
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}