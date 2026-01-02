import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useForgotPasswordMutation } from "@/api/authApi";
import { z } from "zod";

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
    const navigate = useNavigate();
    const { toast } = useToast();
   const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordInput) => {
    try {
        await forgotPassword(data.email).unwrap();
        
        toast({
            title: "OTP Sent!",
            description: "Please check your email for the 6-digit reset code.",
        });
        navigate("/reset-password", { state: { email: data.email } });
    } catch (error) {
        const errorMessage = error && typeof error === 'object' && 'data' in error && 
                             error.data && typeof error.data === 'object' && 'message' in error.data
                             ? String(error.data.message)
                             : "Could not send reset OTP.";
        
        toast({
            variant: "destructive",
            title: "Request Failed",
            description: errorMessage,
        });
    }
};

    return (
        <div className="min-h-screen flex aura-bg">
            {/* Branding - matching Auth.tsx */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-primary/10 via-background to-background relative overflow-hidden">
                <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse-glow" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-glow-secondary/20 rounded-full blur-[120px] animate-pulse-glow animation-delay-200" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary glow-primary">
                            <Zap className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <span className="text-3xl font-bold gradient-text">SubTrack</span>
                    </div>
                    <div className="max-w-md">
                        <h1 className="text-4xl font-bold leading-tight mb-6">
                            Forgot your <span className="gradient-text">password?</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Don't worry! It happens to the best of us. Just enter your email and we'll send you a code to reset it.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form side */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary glow-primary">
                            <Zap className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">SubTrack</span>
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Account Recovery</h2>
                        <p className="text-muted-foreground mt-2">
                            Enter your email to receive a password reset code
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register("email")}
                                    className={cn("pl-10", errors.email && "border-destructive focus-visible:ring-destructive")}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            variant="glow"
                            size="lg"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                    Sending code...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    Send Reset Code
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            )}
                        </Button>

                        <div className="text-center">
                            <Link
                                to="/auth"
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
