import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Loader2, CreditCard, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateStripeCheckoutMutation, useInitializePaystackMutation } from "@/api/authApi";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    const { toast } = useToast();
    const [createStripeCheckout, { isLoading: isStripeLoading }] = useCreateStripeCheckoutMutation();
    const [initializePaystack, { isLoading: isPaystackLoading }] = useInitializePaystackMutation();

    const features = [
        "Unlimited Subscriptions",
        "Advanced Analytics & Trends",
        "Export to CSV/PDF",
        "Multiple Notification Channels",
        "Priority Support",
        "Custom Categories"
    ];

    const handleUpgrade = async (gateway: "stripe" | "paystack") => {
        try {
            const result = gateway === "stripe" 
                ? await createStripeCheckout().unwrap()
                : await initializePaystack().unwrap();

            if (result.success && result.data.checkoutUrl) {
                window.location.href = result.data.checkoutUrl;
            } else {
                throw new Error(`Failed to initiate ${gateway} checkout`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            toast({
                title: "Error",
                description: errorMessage || `Failed to initiate ${gateway} checkout. Please try again.`,
                variant: "destructive",
            });
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
                            className="w-full text-lg font-bold rounded-2xl h-14 gap-3"
                            onClick={() => handleUpgrade("stripe")}
                            disabled={isStripeLoading || isPaystackLoading}
                        >
                            {isStripeLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Globe className="h-5 w-5" />
                                    Pay with Card (Stripe)
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="xl"
                            className="w-full text-lg font-bold rounded-2xl h-14 gap-3 border-2 hover:bg-primary/5"
                            onClick={() => handleUpgrade("paystack")}
                            disabled={isStripeLoading || isPaystackLoading}
                        >
                            {isPaystackLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    Pay with Paystack
                                </>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-muted-foreground hover:text-foreground mt-2"
                            disabled={isStripeLoading || isPaystackLoading}
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