import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Loader2, DollarSign } from "lucide-react";
import { useAddSubscriptionToGroupMutation } from "@/api/sharingApi";
import { useGetSubscriptionsQuery } from "@/api/subscriptionApi";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface AddSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
  memberCount: number;
}

export function AddSubscriptionDialog({
  open,
  onOpenChange,
  groupId,
  groupName,
  memberCount,
}: AddSubscriptionDialogProps) {
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});

  const { toast } = useToast();
  const { data: subscriptionsData } = useGetSubscriptionsQuery();
  const [addSubscription, { isLoading }] = useAddSubscriptionToGroupMutation();

  const subscriptions = subscriptionsData?.data || [];
  const selectedSub = subscriptions.find((s) => s._id === selectedSubscriptionId);

  const handleSubmit = async () => {
    if (!selectedSubscriptionId) {
      toast({
        title: "Error",
        description: "Please select a subscription",
        variant: "destructive",
      });
      return;
    }

    try {
      const customSplits =
        splitType === "custom"
          ? Object.entries(customAmounts).map(([userId, amount]) => ({
              user: userId,
              amount: parseFloat(amount) || 0,
            }))
          : [];

      await addSubscription({
        id: groupId,
        data: {
          subscriptionId: selectedSubscriptionId,
          splitType,
          customSplits,
        },
      }).unwrap();

      toast({
        title: "Success!",
        description: "Subscription added to group successfully",
      });

      setSelectedSubscriptionId("");
      setSplitType("equal");
      setCustomAmounts({});
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast({
        title: "Error",
        description: err.data?.message || "Failed to add subscription",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Subscription to {groupName}</DialogTitle>
          <DialogDescription>
            Select a subscription to share with your group members
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Select Subscription */}
          <div className="space-y-2">
            <Label>Select Subscription</Label>
            <Select value={selectedSubscriptionId} onValueChange={setSelectedSubscriptionId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a subscription" />
              </SelectTrigger>
              <SelectContent>
                {subscriptions.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No subscriptions available. Create one first.
                  </div>
                ) : (
                  subscriptions.map((sub) => (
                    <SelectItem key={sub._id} value={sub._id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{sub.name}</span>
                        <span className="text-muted-foreground ml-4">
                          {sub.currency} {sub.price}/{sub.billingCycle}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {selectedSub && (
              <div className="mt-2 p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedSub.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSub.category} • Next renewal: {new Date(selectedSub.renewalDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary">
                  {selectedSub.currency} {selectedSub.price}
                </Badge>
              </div>
            )}
          </div>

          {/* Split Type */}
          {selectedSub && (
            <div className="space-y-3">
              <Label>How to split the cost?</Label>
              <RadioGroup value={splitType} onValueChange={(v) => setSplitType(v as "equal" | "custom")}>
                <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="equal" id="equal" />
                  <div className="flex-1">
                    <Label htmlFor="equal" className="font-medium cursor-pointer">
                      Equal Split
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Everyone pays the same amount: {selectedSub.currency}{" "}
                      {(parseFloat(selectedSub.price) / memberCount).toFixed(2)} per person
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="custom" id="custom" />
                  <div className="flex-1">
                    <Label htmlFor="custom" className="font-medium cursor-pointer">
                      Custom Split
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Set individual amounts for each member
                    </p>
                  </div>
                </div>
              </RadioGroup>

              {/* Custom Split Inputs */}
              {splitType === "custom" && (
                <div className="mt-4 space-y-3 p-4 rounded-lg bg-muted/30">
                  <Label>Set amounts for each member</Label>
                  <p className="text-sm text-muted-foreground">
                    Total: {selectedSub.currency} {selectedSub.price}
                  </p>
                  {/* Note: In a real implementation, you'd loop through group members here */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Label className="text-sm">Member 1</Label>
                      </div>
                      <div className="w-32 relative">
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-7"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          {selectedSub && (
            <div className="rounded-lg bg-primary/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Summary</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Cost</span>
                  <span className="font-semibold">
                    {selectedSub.currency} {selectedSub.price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-semibold">{memberCount}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Per Person (Equal)</span>
                  <span className="font-semibold text-primary">
                    {selectedSub.currency} {(parseFloat(selectedSub.price) / memberCount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !selectedSubscriptionId}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add to Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}