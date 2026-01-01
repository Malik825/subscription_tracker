// components/ai/SubscriptionFormDialog.tsx

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionInput, subscriptionSchema } from "@/schemas/subscriptionSchema";

interface SubscriptionWithId extends SubscriptionInput {
  _id?: string;
}

interface SubscriptionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "update";
  initialData?: Partial<SubscriptionWithId>;
  isExtracted?: boolean;
  onSuccess: (message: string) => void;
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const currencies = [
  "USD", "EUR", "GBP", "CEDI", "JPY", "AUD", "CAD", "CHF", "CNY", "HKD",
  "IDR", "INR", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PKR", "PLN",
  "RUB", "SGD", "THB", "TRY", "ZAR"
];

const frequencies = ["Monthly", "Yearly", "Weekly", "Daily"];

const categories = [
  "Entertainment",
  "Food",
  "Travel",
  "Shopping",
  "Subscription",
  "Others",
];

const statuses = ["Active", "Suspended", "Cancelled", "Expired"];

export function SubscriptionFormDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  isExtracted = false,
  onSuccess,
}: SubscriptionFormDialogProps) {
  const { toast } = useToast();

  const form = useForm<SubscriptionInput>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: "",
      price: 0,
      currency: "USD",
      frequency: "Monthly",
      category: "Others",
      status: "Active",
      startDate: new Date().toISOString().split("T")[0],
      website: "",
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData && open) {
      const formattedData = {
        ...initialData,
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        renewalDate: initialData.renewalDate
          ? new Date(initialData.renewalDate).toISOString().split("T")[0]
          : undefined,
      };
      form.reset(formattedData);
    } else if (!initialData && open) {
      form.reset({
        name: "",
        price: 0,
        currency: "USD",
        frequency: "Monthly",
        category: "Others",
        status: "Active",
        startDate: new Date().toISOString().split("T")[0],
        website: "",
      });
    }
  }, [initialData, open, form]);

  const onSubmit = async (data: SubscriptionInput) => {
    try {
      if (mode === "create") {
        await api.post("/subscriptions", data);
        onSuccess("✅ Subscription added successfully!");
      } else {
        const id = (initialData as SubscriptionWithId)?._id;
        if (!id) throw new Error("No subscription ID provided");
        
        await api.put(`/subscriptions/${id}`, data);
        onSuccess("✅ Subscription updated successfully!");
      }
      
      onOpenChange(false);
      form.reset();
    } catch (err) {
      const error = err as ErrorResponse;
      
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${mode} subscription`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Subscription" : "Update Subscription"}
          </DialogTitle>
          <DialogDescription>
            {isExtracted ? (
              <span className="text-green-600 font-medium">
                ✨ AI extracted this data for you! Review and edit if needed, then click Add.
              </span>
            ) : mode === "create" ? (
              "Fill in the details for your new subscription."
            ) : (
              "Update the details of your subscription."
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Netflix, Spotify, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price and Currency Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="9.99"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Frequency and Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Frequency *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {frequencies.map((freq) => (
                          <SelectItem key={freq} value={freq}>
                            {freq}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Start Date and Renewal Date Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={field.value instanceof Date 
                          ? field.value.toISOString().split("T")[0] 
                          : field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="renewalDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Renewal Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={field.value instanceof Date 
                          ? field.value.toISOString().split("T")[0] 
                          : field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === "create" ? "Add Subscription" : "Update Subscription"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}