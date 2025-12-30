import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Subscription } from "@/hooks/useSubscriptions";
import { cn } from "@/lib/utils";

interface SubscriptionTableProps {
    subscriptions: Subscription[];
    onEdit: (sub: Subscription) => void;
    onDelete: (id: string) => void;
    selectedIds: string[];
    onSelect: (id: string) => void;
    onSelectAll: () => void;
}

export function SubscriptionTable({
    subscriptions,
    onEdit,
    onDelete,
    selectedIds,
    onSelect,
    onSelectAll,
}: SubscriptionTableProps) {
    const allSelected = subscriptions.length > 0 && selectedIds.length === subscriptions.length;

    return (
        <div className="rounded-xl border border-border glass overflow-hidden shadow-lg shadow-primary/5">
            <Table>
                <TableHeader className="bg-muted/50 border-b border-border">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 px-6">
                            <Checkbox
                                checked={allSelected}
                                onCheckedChange={onSelectAll}
                                aria-label="Select all"
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                        </TableHead>
                        <TableHead className="font-semibold text-foreground/80">Service</TableHead>
                        <TableHead className="font-semibold text-foreground/80">Category</TableHead>
                        <TableHead className="font-semibold text-foreground/80">Billing Cycle</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-right">Price</TableHead>
                        <TableHead className="font-semibold text-foreground/80">Status</TableHead>
                        <TableHead className="font-semibold text-foreground/80">Renewal Date</TableHead>
                        <TableHead className="text-right font-semibold text-foreground/80 px-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {subscriptions.map((sub, index) => (
                        <TableRow
                            key={sub._id}
                            className={cn(
                                "group transition-colors animate-fade-in border-b border-border last:border-0",
                                selectedIds.includes(sub._id) ? "bg-primary/5" : "hover:bg-muted/30"
                            )}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <TableCell className="px-6">
                                <Checkbox
                                    checked={selectedIds.includes(sub._id)}
                                    onCheckedChange={() => onSelect(sub._id)}
                                    aria-label={`Select ${sub.name}`}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                            </TableCell>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                        {sub.name.charAt(0)}
                                    </div>
                                    <span>{sub.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="font-normal">
                                    {sub.category}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{sub.frequency}</TableCell>
                            <TableCell className="text-right font-semibold text-primary">
                                ${sub.price.toFixed(2)}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={sub.status.toLowerCase() === "active" ? "default" : "secondary"}
                                    className={cn(
                                        "capitalize",
                                        sub.status.toLowerCase() === "active" ? "bg-primary/20 text-primary border-primary/20 hover:bg-primary/30" : ""
                                    )}
                                >
                                    {sub.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {sub.renewalDate ? format(new Date(sub.renewalDate), "MMM d, yyyy") : "N/A"}
                            </TableCell>
                            <TableCell className="text-right px-6">
                                <div className="flex justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                                        onClick={() => {
                                            const url = sub.website || `https://google.com/search?q=${sub.name}+subscription+manage`;
                                            window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
                                        }}
                                        title="Visit site"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                                        onClick={() => onEdit(sub)}
                                        title="Edit"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                                        onClick={() => onDelete(sub._id)}
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
