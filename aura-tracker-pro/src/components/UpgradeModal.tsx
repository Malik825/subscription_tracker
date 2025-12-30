import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { upgradeUser } from "@/features/auth/authSlice";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const features = [
        "Unlimited Subscriptions",
        "Advanced Analytics & Trends",
        "Export to CSV/PDF",
        "Multiple Notification Channels",
        "Priority Support",
        "Custom Categories"
    ];

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            await dispatch(upgradeUser()).unwrap();
            toast({
                title: "Success",
                description: "Welcome to Aura Tracker Pro!",
            });
            onClose();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error || "Failed to upgrade. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 rounded-[2rem] border-primary/20 glass-premium">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-glow-secondary to-primary" />

                <div className="p-8">
                    <DialogHeader className="mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-4 animate-glow">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <DialogTitle className="text-3xl font-bold tracking-tight">
                            Upgrade to <span className="gradient-text">Pro</span>
                        </DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground mt-2">
                            Unlock the full potential of Aura Tracker and manage your subscriptions like a professional.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mb-8">
                        {features.map((feature, index) => (
                            <div
                                key={feature}
                                className="flex items-center gap-3 opacity-0 animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                                    <Check className="h-3 w-3 text-primary" />
                                </div>
                                <span className="text-sm font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-3">
                        <Button
                            variant="glow"
                            size="xl"
                            className="w-full text-lg font-bold rounded-2xl h-14"
                            onClick={handleUpgrade}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Get Started — $9.99/mo"
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-muted-foreground hover:text-foreground"
                            disabled={isLoading}
                            onClick={onClose}
                        >
                            Maybe later
                        </Button>
                    </div>
                </div>

                <div className="bg-primary/5 py-4 px-8 border-t border-primary/10">
                    <p className="text-xs text-center text-muted-foreground">
                        Trusted by 10,000+ users worldwide. 14-day money back guarantee.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
