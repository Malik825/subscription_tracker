import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, Grid, List, MoreHorizontal, Edit, Trash2, ExternalLink, Calendar as CalendarIcon, Loader2, Download, Info, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSubscriptions, useSubscriptionStats, useCreateSubscription, useUpdateSubscription, useDeleteSubscription, Subscription } from "@/hooks/useSubscriptions";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subscriptionSchema, SubscriptionInput } from "@/schemas/subscriptionSchema";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionTable } from "@/components/SubscriptionTable";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useAuth } from "@/hooks/useAuth";
import { useVoiceFeedback } from "@/hooks/use-voice-feedback";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function Subscriptions() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useSubscriptions();
  const { data: stats } = useSubscriptionStats();

  const { user } = useAuth();
  const { announce } = useVoiceFeedback();
  
  // Set grid view on mobile, list on desktop
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    return window.innerWidth < 768 ? "grid" : "list";
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { toast } = useToast();
  const createSubscription = useCreateSubscription();
  const updateSubscription = useUpdateSubscription();
  const deleteSubscription = useDeleteSubscription();

  const form = useForm<SubscriptionInput>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: "",
      price: 0,
      currency: "USD",
      frequency: "Monthly",
      category: "Subscription",
      startDate: new Date(),
      status: "Active",
      website: "",
    },
  });

  // Update view mode on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode("grid");
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Announce page details when component mounts and stats are loaded
  useEffect(() => {
    if (stats && !isLoading) {
      const activeCount = stats.overview.active || 0;
      const monthlySpending = (stats.spending?.totalMonthly || 0).toFixed(2);
      const yearlyProjection = (stats.spending?.totalYearly || 0).toFixed(2);
      
      announce(
        `Subscriptions page loaded. You have ${activeCount} active subscription${activeCount !== 1 ? 's' : ''}. ` +
        `Monthly spending is ${monthlySpending}. Yearly projection is ${yearlyProjection}.`
      );
    }
  }, [stats, isLoading, announce]);

  const onSubmit = async (data: SubscriptionInput) => {
    try {
      if (editingSubscription) {
        await updateSubscription.mutateAsync({ id: editingSubscription._id, data });
        announce(
          `${data.name} subscription updated successfully. ` +
          `New price: ${data.price} per ${data.frequency.toLowerCase()}. ` +
          `Status: ${data.status}. Category: ${data.category}.`
        );
        toast({ title: "Success", description: "Subscription updated successfully" });
      } else {
        await createSubscription.mutateAsync(data);
        announce(
          `${data.name} subscription added successfully. ` +
          `Price: ${data.price} per ${data.frequency.toLowerCase()}. ` +
          `Status: ${data.status}. Category: ${data.category}.`
        );
        toast({ title: "Success", description: "Subscription added successfully" });
      }
      setIsAddDialogOpen(false);
      setEditingSubscription(null);
      form.reset();
    } catch (err) {
      const errorMessage = editingSubscription ? "Failed to update subscription" : "Failed to add subscription";
      announce(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (sub: Subscription) => {
    setEditingSubscription(sub);
    form.reset({
      name: sub.name,
      price: sub.price,
      currency: sub.currency as SubscriptionInput["currency"],
      frequency: sub.frequency as SubscriptionInput["frequency"],
      category: sub.category as SubscriptionInput["category"],
      startDate: new Date(sub.startDate),
      status: sub.status as SubscriptionInput["status"],
      website: sub.website || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const sub = allSubscriptions.find(s => s._id === id);
    if (confirm("Are you sure you want to delete this subscription?")) {
      try {
        await deleteSubscription.mutateAsync(id);
        announce(`${sub?.name || "Subscription"} deleted successfully.`);
        toast({ title: "Success", description: "Subscription deleted successfully" });
      } catch (err) {
        announce("Failed to delete subscription.");
        toast({ title: "Error", description: "Failed to delete subscription", variant: "destructive" });
      }
    }
  };

  const allSubscriptions = data?.pages.flatMap((page) => page.data) || [];

  const filteredSubscriptions = allSubscriptions.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || sub.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const categories = ["All", "Entertainment", "Food", "Travel", "Shopping", "Subscription", "Others"];

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredSubscriptions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSubscriptions.map((sub) => sub._id));
    }
  };

  const handleExport = () => {
    if (user?.plan === "free") {
      setIsUpgradeModalOpen(true);
    } else {
      const count = selectedIds.length || filteredSubscriptions.length;
      announce(`Exporting ${count} subscriptions to CSV.`);
      toast({
        title: "Export Started",
        description: `Exporting ${count} subscriptions to CSV...`,
      });
    }
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-8">
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="gap-2 h-10 px-4"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                  {user?.plan === "free" && <Badge variant="secondary" className="ml-1 px-1 h-4 text-[10px] bg-primary/10 text-primary">Pro</Badge>}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="hidden md:flex h-10 w-10 p-0">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewModeChange("grid")}>
                      <Grid className="h-4 w-4 mr-2" /> Grid View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewModeChange("list")}>
                      <List className="h-4 w-4 mr-2" /> Table View
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="default"
                  className="gap-2 h-10 px-4 bg-primary hover:bg-primary/90"
                  onClick={() => {
                    if (user?.plan === "free" && allSubscriptions.length >= 10) {
                      setIsUpgradeModalOpen(true);
                    } else {
                      setEditingSubscription(null);
                      form.reset({
                        name: "",
                        price: 0,
                        currency: "USD",
                        frequency: "Monthly",
                        category: "Subscription",
                        startDate: new Date(),
                        status: "Active",
                        website: "",
                      });
                      setIsAddDialogOpen(true);
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline font-semibold">Add</span>
                </Button>
              </div>
            </div>

            {/* Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) {
                setEditingSubscription(null);
              }
            }}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingSubscription ? "Edit Subscription" : "Add New Subscription"}</DialogTitle>
                  <DialogDescription>
                    {editingSubscription
                      ? "Keep your subscription details up to date."
                      : "Track a new subscription by filling out the details below."}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Netflix, Spotify, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://netflix.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="9.99" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Billing Cycle</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select cycle" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Monthly">Monthly</SelectItem>
                                <SelectItem value="Yearly">Yearly</SelectItem>
                                <SelectItem value="Weekly">Weekly</SelectItem>
                                <SelectItem value="Daily">Daily</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="USD" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {['USD', 'EUR', 'GBP', 'CEDI', 'JPY', 'AUD', 'CAD'].map((curr) => (
                                  <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Active" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Suspended">Suspended</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                <SelectItem value="Expired">Expired</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.slice(1).map((cat) => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="mb-1">Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal h-10",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(new Date(field.value), "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={new Date(field.value)}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter className="pt-4">
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={createSubscription.isPending || updateSubscription.isPending}>
                        {(createSubscription.isPending || updateSubscription.isPending) ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingSubscription ? "Updating..." : "Adding..."}
                          </>
                        ) : (
                          editingSubscription ? "Update Subscription" : "Add Subscription"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-border rounded-xl p-4 bg-card">
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              <p className="text-2xl font-bold">{stats?.overview.active || 0}</p>
            </div>
            <div className="border border-border rounded-xl p-4 bg-card">
              <p className="text-sm text-muted-foreground">Monthly Spending</p>
              <p className="text-2xl font-bold text-primary">${(stats?.spending?.totalMonthly || 0).toFixed(2)}</p>
            </div>
            <div className="border border-border rounded-xl p-4 bg-card">
              <p className="text-sm text-muted-foreground">Yearly Projection</p>
              <p className="text-2xl font-bold">${(stats?.spending?.totalYearly || 0).toFixed(2)}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
            <div className="flex flex-col sm:flex-row flex-1 gap-3">
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscriptions..."
                  className="pl-10 h-10"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full sm:w-[160px] h-10">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subscriptions Grid/Table */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubscriptions.map((sub, index) => (
                <div
                  key={sub._id}
                  className="border border-border rounded-xl p-4 bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold shrink-0"
                      style={{ color: getColorForCategory(sub.category) }}
                    >
                      {sub.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{sub.name}</h3>
                        <Badge
                          variant={sub.status.toLowerCase() === "active" ? "default" : "secondary"}
                          className="text-xs shrink-0"
                        >
                          {sub.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{sub.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-lg font-bold text-primary">${sub.price}</p>
                      <p className="text-xs text-muted-foreground">/{sub.frequency}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Next billing</p>
                      <p className="text-sm text-muted-foreground">{sub.renewalDate ? format(new Date(sub.renewalDate), "MMM d") : "N/A"}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(sub)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          const url = sub.website || `https://google.com/search?q=${sub.name}+subscription+manage`;
                          window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
                        }}>
                          <ExternalLink className="h-4 w-4 mr-2" /> Visit Site
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(sub._id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <SubscriptionTable
              subscriptions={filteredSubscriptions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
            />
          )}

          {filteredSubscriptions.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No subscriptions found</p>
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          <div ref={loadMoreRef} className="py-8 flex justify-center">
            {isFetchingNextPage && (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            )}
            {!hasNextPage && filteredSubscriptions.length > 0 && (
              <p className="text-sm text-muted-foreground">No more subscriptions to load</p>
            )}
          </div>

          <UpgradeModal
            isOpen={isUpgradeModalOpen}
            onClose={() => setIsUpgradeModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}

function getColorForCategory(category: string): string {
  const map: Record<string, string> = {
    Entertainment: "#E50914",
    Music: "#1DB954",
    Development: "#6e5494",
    Design: "#A259FF",
    Productivity: "#000000",
    Shopping: "#FF9900",
    Food: "#4CAF50",
    Travel: "#2196F3",
    Others: "#9E9E9E",
    Subscription: "#607D8B"
  };
  return map[category] || map.Others;
}