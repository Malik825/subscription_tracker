import { useState } from "react";
import { Calculator, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Member {
  id: string;
  name: string;
  customAmount?: number;
}

type SplitType = "equal" | "custom" | "percentage";

export function CostSplitCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState<string>("15.99");
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [members, setMembers] = useState<Member[]>([
    { id: "1", name: "You" },
    { id: "2", name: "Person 2" },
    { id: "3", name: "Person 3" },
  ]);

  const total = parseFloat(totalAmount) || 0;

  const addMember = () => {
    setMembers([...members, { id: Date.now().toString(), name: `Person ${members.length + 1}` }]);
  };

  const removeMember = (id: string) => {
    if (members.length > 2) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const updateCustomAmount = (id: string, amount: string) => {
    setMembers(members.map(m => 
      m.id === id ? { ...m, customAmount: parseFloat(amount) || 0 } : m
    ));
  };

  const calculateSplit = () => {
    if (splitType === "equal") {
      return members.map(m => ({ ...m, amount: total / members.length }));
    } else if (splitType === "custom") {
      return members.map(m => ({ ...m, amount: m.customAmount || 0 }));
    }
    return members.map(m => ({ ...m, amount: total / members.length }));
  };

  const splits = calculateSplit();
  const totalAssigned = splits.reduce((sum, s) => sum + (s.amount || 0), 0);
  const remaining = total - totalAssigned;

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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Split Type */}
          <div className="space-y-2">
            <Label>Split Method</Label>
            <RadioGroup value={splitType} onValueChange={(v) => setSplitType(v as SplitType)}>
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
            </RadioGroup>
          </div>

          {/* Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Members ({members.length})</Label>
              <Button variant="outline" size="sm" onClick={addMember} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {splits.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{member.name}</p>
                  </div>
                  
                  {splitType === "custom" ? (
                    <div className="w-32">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-6 h-8 text-sm"
                          value={member.customAmount || ""}
                          onChange={(e) => updateCustomAmount(member.id, e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <Badge variant="secondary" className="font-mono">
                      ${member.amount?.toFixed(2)}
                    </Badge>
                  )}

                  {members.length > 2 && (
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
                <span className={`font-semibold ${remaining !== 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                  ${Math.abs(remaining).toFixed(2)}
                  {remaining !== 0 && <span className="text-xs ml-1">
                    ({remaining > 0 ? 'unassigned' : 'over'})
                  </span>}
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}