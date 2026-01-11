import { useState, useEffect } from "react";
import { Calculator, Plus, Minus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { SharingGroup } from "@/api/sharingApi";

interface Member {
  id: string;
  name: string;
  email: string;
  customAmount?: number;
  percentage?: number;
}

type SplitType = "equal" | "custom" | "percentage";

interface CostSplitCalculatorProps {
  group?: SharingGroup;
  subscriptionPrice?: number;
  onApplySplit?: (splitData: {
    splitType: SplitType;
    customSplits?: Array<{
      user: string;
      amount?: number;
      percentage?: number;
    }>;
  }) => void;
  isLoading?: boolean;
}

export function CostSplitCalculator({ 
  group, 
  subscriptionPrice, 
  onApplySplit,
  isLoading = false 
}: CostSplitCalculatorProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState<string>("15.99");
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [members, setMembers] = useState<Member[]>([
    { id: "1", name: "You", email: "you@example.com" },
    { id: "2", name: "Person 2", email: "person2@example.com" },
    { id: "3", name: "Person 3", email: "person3@example.com" },
  ]);

  // Initialize from group data if available
  useEffect(() => {
    if (group && isOpen) {
      setMembers(
        group.members.map((member) => ({
          id: member.user._id,
          name: member.user.username,
          email: member.user.email,
        }))
      );
    }
  }, [group, isOpen]);

  // Set subscription price if provided
  useEffect(() => {
    if (subscriptionPrice && isOpen) {
      setTotalAmount(subscriptionPrice.toString());
    }
  }, [subscriptionPrice, isOpen]);

  const total = parseFloat(totalAmount) || 0;

  const addMember = () => {
    setMembers([
      ...members,
      { 
        id: Date.now().toString(), 
        name: `Person ${members.length + 1}`,
        email: `person${members.length + 1}@example.com`
      }
    ]);
  };

  const removeMember = (id: string) => {
    if (members.length > 2) {
      setMembers(members.filter((m) => m.id !== id));
    }
  };

  const updateCustomAmount = (id: string, amount: string) => {
    setMembers(
      members.map((m) =>
        m.id === id ? { ...m, customAmount: parseFloat(amount) || 0 } : m
      )
    );
  };

  const updatePercentage = (id: string, percentage: string) => {
    setMembers(
      members.map((m) =>
        m.id === id ? { ...m, percentage: parseFloat(percentage) || 0 } : m
      )
    );
  };

  const calculateSplit = () => {
    if (splitType === "equal") {
      return members.map((m) => ({ ...m, amount: total / members.length }));
    } else if (splitType === "custom") {
      return members.map((m) => ({ ...m, amount: m.customAmount || 0 }));
    } else if (splitType === "percentage") {
      return members.map((m) => ({
        ...m,
        amount: total * ((m.percentage || 0) / 100),
      }));
    }
    return members.map((m) => ({ ...m, amount: total / members.length }));
  };

  const splits = calculateSplit();
  const totalAssigned = splits.reduce((sum, s) => sum + (s.amount || 0), 0);
  const remaining = total - totalAssigned;

  const totalPercentage = members.reduce((sum, m) => sum + (m.percentage || 0), 0);

  const handleApplySplit = () => {
    // Validation
    if (splitType === "custom" && Math.abs(remaining) > 0.01) {
      toast({
        title: "Invalid Split",
        description: "Custom amounts must add up to the total amount",
        variant: "destructive",
      });
      return;
    }

    if (splitType === "percentage" && Math.abs(totalPercentage - 100) > 0.01) {
      toast({
        title: "Invalid Split",
        description: "Percentages must add up to 100%",
        variant: "destructive",
      });
      return;
    }

    // Prepare split data for backend
    const splitData = {
      splitType,
      ...(splitType !== "equal" && {
        customSplits: members.map((m) => ({
          user: m.id,
          ...(splitType === "custom" && { amount: m.customAmount || 0 }),
          ...(splitType === "percentage" && { percentage: m.percentage || 0 }),
        })),
      }),
    };

    if (onApplySplit) {
      onApplySplit(splitData);
    } else {
      toast({
        title: "Split Calculated",
        description: `${splitType === "equal" ? "Equal" : splitType === "custom" ? "Custom" : "Percentage"} split calculated successfully`,
      });
    }

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calculator className="h-4 w-4" />
          Split Calculator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cost Split Calculator</DialogTitle>
          <DialogDescription>
            Calculate how to split subscription costs among members
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Total Amount */}
          <div className="space-y-2">
            <Label>Total Subscription Cost</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="pl-7"
                placeholder="0.00"
                disabled={!!subscriptionPrice}
              />
            </div>
          </div>

          {/* Split Type */}
          <div className="space-y-2">
            <Label>Split Method</Label>
            <RadioGroup
              value={splitType}
              onValueChange={(v) => setSplitType(v as SplitType)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="equal" id="equal" />
                <Label htmlFor="equal" className="font-normal cursor-pointer">
                  Equal Split - Everyone pays the same amount
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="font-normal cursor-pointer">
                  Custom Split - Set individual amounts
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage" className="font-normal cursor-pointer">
                  Percentage Split - Set percentage for each member
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Members ({members.length})</Label>
              {!group && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addMember}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Member
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {splits.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>

                  {splitType === "custom" ? (
                    <div className="w-32">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-6 h-8 text-sm"
                          value={member.customAmount || ""}
                          onChange={(e) =>
                            updateCustomAmount(member.id, e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ) : splitType === "percentage" ? (
                    <div className="w-32">
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="0"
                          className="pr-6 h-8 text-sm"
                          value={member.percentage || ""}
                          onChange={(e) =>
                            updatePercentage(member.id, e.target.value)
                          }
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          %
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Badge variant="secondary" className="font-mono">
                      ${member.amount?.toFixed(2)}
                    </Badge>
                  )}

                  {members.length > 2 && !group && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeMember(member.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-primary/10 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Assigned</span>
              <span className="font-semibold">${totalAssigned.toFixed(2)}</span>
            </div>
            {splitType === "custom" && (
              <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                <span className="text-muted-foreground">Remaining</span>
                <span
                  className={`font-semibold ${
                    remaining !== 0 ? "text-yellow-500" : "text-green-500"
                  }`}
                >
                  ${Math.abs(remaining).toFixed(2)}
                  {remaining !== 0 && (
                    <span className="text-xs ml-1">
                      ({remaining > 0 ? "unassigned" : "over"})
                    </span>
                  )}
                </span>
              </div>
            )}
            {splitType === "percentage" && (
              <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                <span className="text-muted-foreground">Total Percentage</span>
                <span
                  className={`font-semibold ${
                    totalPercentage !== 100 ? "text-yellow-500" : "text-green-500"
                  }`}
                >
                  {totalPercentage.toFixed(1)}%
                  {totalPercentage !== 100 && (
                    <span className="text-xs ml-1">(must be 100%)</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApplySplit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {onApplySplit ? "Apply Split" : "Calculate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}