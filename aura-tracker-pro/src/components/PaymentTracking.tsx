import { useState } from "react";
import { DollarSign, CheckCircle, XCircle, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  member: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  dueDate: string;
  paidDate?: string;
}

const mockPayments: Payment[] = [
  {
    id: "1",
    member: "Sarah Johnson",
    amount: 18.66,
    status: "paid",
    dueDate: "2024-01-01",
    paidDate: "2024-01-01"
  },
  {
    id: "2",
    member: "Mike Johnson",
    amount: 18.66,
    status: "pending",
    dueDate: "2024-01-05"
  },
  {
    id: "3",
    member: "Alex Smith",
    amount: 12.99,
    status: "overdue",
    dueDate: "2023-12-28"
  },
];

export function PaymentTracking({ groupName = "Family Plan" }: { groupName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);

  const markAsPaid = (id: string) => {
    setPayments(payments.map(p => 
      p.id === id 
        ? { ...p, status: "paid" as const, paidDate: new Date().toISOString() }
        : p
    ));
  };

  const sendReminder = (id: string) => {
    // Would trigger email/notification
    console.log("Sending reminder for payment:", id);
  };

  const getStatusIcon = (status: Payment["status"]) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "overdue":
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: Payment["status"]) => {
    const variants = {
      paid: "default",
      pending: "secondary",
      overdue: "destructive"
    };
    return (
      <Badge variant={variants[status] as any} className="capitalize">
        {status}
      </Badge>
    );
  };

  const totalOwed = payments
    .filter(p => p.status !== "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const paidCount = payments.filter(p => p.status === "paid").length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <DollarSign className="h-4 w-4" />
          Payment Tracking
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment Tracking - {groupName}</DialogTitle>
          <DialogDescription>
            Track who has paid their share this month
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Paid</p>
              <p className="text-2xl font-bold text-green-500">
                {paidCount}/{payments.length}
              </p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-500">
                {payments.filter(p => p.status === "pending").length}
              </p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Owed</p>
              <p className="text-2xl font-bold">${totalOwed.toFixed(2)}</p>
            </div>
          </div>

          {/* Payment List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg transition-colors",
                  payment.status === "paid" 
                    ? "bg-green-500/5 border border-green-500/20"
                    : payment.status === "overdue"
                    ? "bg-red-500/5 border border-red-500/20"
                    : "bg-muted/50"
                )}
              >
                {/* Member Info */}
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{payment.member.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{payment.member}</p>
                    {getStatusIcon(payment.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {payment.status === "paid" 
                      ? `Paid on ${new Date(payment.paidDate!).toLocaleDateString()}`
                      : `Due: ${new Date(payment.dueDate).toLocaleDateString()}`
                    }
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="text-lg font-semibold">${payment.amount.toFixed(2)}</p>
                  {getStatusBadge(payment.status)}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {payment.status !== "paid" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendReminder(payment.id)}
                        className="gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Remind
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => markAsPaid(payment.id)}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Mark Paid
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          <div className="rounded-lg bg-primary/10 p-4 space-y-3">
            <h4 className="font-semibold">This Month's Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Expected</span>
                <span className="font-semibold">
                  ${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Received</span>
                <span className="font-semibold text-green-500">
                  ${payments
                    .filter(p => p.status === "paid")
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Outstanding</span>
                <span className="font-semibold text-yellow-500">
                  ${totalOwed.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}