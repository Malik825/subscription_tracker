import { useState } from "react";
import { Plus, Search, Filter, Grid, List, MoreHorizontal, Edit, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const subscriptions = [
  { id: 1, name: "Netflix", category: "Entertainment", price: 15.99, cycle: "monthly", nextBilling: "2024-02-15", status: "active", logo: "🎬" },
  { id: 2, name: "Spotify", category: "Music", price: 9.99, cycle: "monthly", nextBilling: "2024-02-10", status: "active", logo: "🎵" },
  { id: 3, name: "Adobe CC", category: "Productivity", price: 54.99, cycle: "monthly", nextBilling: "2024-02-20", status: "active", logo: "🎨" },
  { id: 4, name: "GitHub Pro", category: "Development", price: 4.00, cycle: "monthly", nextBilling: "2024-02-18", status: "active", logo: "💻" },
  { id: 5, name: "Figma", category: "Design", price: 12.00, cycle: "monthly", nextBilling: "2024-02-25", status: "active", logo: "✏️" },
  { id: 6, name: "AWS", category: "Cloud", price: 45.00, cycle: "monthly", nextBilling: "2024-02-01", status: "active", logo: "☁️" },
  { id: 7, name: "Slack", category: "Communication", price: 8.75, cycle: "monthly", nextBilling: "2024-02-12", status: "active", logo: "💬" },
  { id: 8, name: "Notion", category: "Productivity", price: 10.00, cycle: "monthly", nextBilling: "2024-02-28", status: "paused", logo: "📝" },
  { id: 9, name: "Dropbox", category: "Storage", price: 11.99, cycle: "monthly", nextBilling: "2024-03-05", status: "active", logo: "📦" },
  { id: 10, name: "Zoom", category: "Communication", price: 14.99, cycle: "monthly", nextBilling: "2024-02-22", status: "cancelled", logo: "📹" },
];

const categories = ["All", "Entertainment", "Music", "Productivity", "Development", "Design", "Cloud", "Communication", "Storage"];

export default function Subscriptions() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || sub.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalMonthly = filteredSubscriptions
    .filter(s => s.status === "active")
    .reduce((sum, sub) => sum + sub.price, 0);

  return (
    <div className="min-h-screen aura-bg">
      <div className="p-8">
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Subscriptions</h1>
              <p className="text-muted-foreground mt-1">
                Manage all your subscriptions in one place
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="glow" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Subscription
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-border">
                <DialogHeader>
                  <DialogTitle>Add New Subscription</DialogTitle>
                  <DialogDescription>
                    Track a new subscription by filling out the details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Service Name</Label>
                    <Input id="name" placeholder="Netflix, Spotify, etc." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input id="price" type="number" placeholder="9.99" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cycle">Billing Cycle</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cycle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map((cat) => (
                          <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" variant="glow" onClick={() => setIsAddDialogOpen(false)}>
                    Add Subscription
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4 animate-slide-in-left" style={{ animationDelay: "0ms" }}>
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              <p className="text-2xl font-bold">{subscriptions.filter(s => s.status === "active").length}</p>
            </div>
            <div className="glass rounded-xl p-4 animate-slide-in-left" style={{ animationDelay: "100ms" }}>
              <p className="text-sm text-muted-foreground">Monthly Spending</p>
              <p className="text-2xl font-bold text-primary">${totalMonthly.toFixed(2)}</p>
            </div>
            <div className="glass rounded-xl p-4 animate-slide-in-left" style={{ animationDelay: "200ms" }}>
              <p className="text-sm text-muted-foreground">Yearly Projection</p>
              <p className="text-2xl font-bold">${(totalMonthly * 12).toFixed(2)}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscriptions..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px]">
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
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Subscriptions Grid/List */}
          <div className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          )}>
            {filteredSubscriptions.map((sub, index) => (
              <div
                key={sub.id}
                className={cn(
                  "glass rounded-xl p-4 transition-all duration-300 hover:glow-border opacity-0 animate-fade-in",
                  viewMode === "list" && "flex items-center justify-between"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn("flex items-center gap-4", viewMode === "list" && "flex-1")}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                    {sub.logo}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{sub.name}</h3>
                      <Badge
                        variant={sub.status === "active" ? "default" : sub.status === "paused" ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{sub.category}</p>
                  </div>
                </div>

                <div className={cn(
                  "flex items-center justify-between",
                  viewMode === "grid" ? "mt-4 pt-4 border-t border-border" : "gap-6"
                )}>
                  <div>
                    <p className="text-lg font-bold text-primary">${sub.price}</p>
                    <p className="text-xs text-muted-foreground">/{sub.cycle}</p>
                  </div>
                  <div className={cn(viewMode === "list" && "text-right")}>
                    <p className="text-sm">Next billing</p>
                    <p className="text-sm text-muted-foreground">{sub.nextBilling}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="h-4 w-4 mr-2" /> Visit Site
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Cancel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No subscriptions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
