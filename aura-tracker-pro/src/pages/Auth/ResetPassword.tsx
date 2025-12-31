import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Lock, KeyRound, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/features/auth/authSlice";
import { AppDispatch, RootState } from "@/store";
import { z } from "zod";

const resetPasswordSchema = z.object({
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading } = useSelector((state: RootState) => state.auth);

    // Get email from previous step (ForgotPassword.tsx)
    const email = location.state?.email || "";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            otp: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: ResetPasswordInput) => {
        if (!email) {
            toast({
                variant: "destructive",
                title: "Session Expired",
                description: "Please request a new reset code.",
            });
            navigate("/forgot-password");
            return;
        }

        const result = await dispatch(resetPassword({
            email,
            otp: data.otp,
            newPassword: data.newPassword
        }));

        if (resetPassword.fulfilled.match(result)) {
            toast({
                title: "Success!",
                description: "Your password has been reset. You can now log in.",
            });
            navigate("/auth");
        } else {
            toast({
                variant: "destructive",
                title: "Reset Failed",
                description: (result.payload as string) || "Invalid code or password requirements not met.",
            });
        }
    };

    return (
        <div className="min-h-screen flex aura-bg">
            {/* Branding side */}
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
                            Create a <span className="gradient-text">new password</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Almost there! Use the 6-digit code we sent to <span className="text-foreground font-semibold">{email || "your email"}</span> to update your password.
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
                        <h2 className="text-2xl font-bold">Secure Reset</h2>
                        <p className="text-muted-foreground mt-2">
                            Enter the OTP code and your new password
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="otp">6-Digit Code</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="otp"
                                    placeholder="123456"
                                    maxLength={6}
                                    {...register("otp")}
                                    className={cn("pl-10 tracking-[0.5em] font-mono text-lg", errors.otp && "border-destructive focus-visible:ring-destructive")}
                                />
                            </div>
                            {errors.otp && (
                                <p className="text-xs text-destructive">{errors.otp.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register("newPassword")}
                                    className={cn("pl-10", errors.newPassword && "border-destructive focus-visible:ring-destructive")}
                                />
                            </div>
                            {errors.newPassword && (
                                <p className="text-xs text-destructive">{errors.newPassword.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register("confirmPassword")}
                                    className={cn("pl-10", errors.confirmPassword && "border-destructive focus-visible:ring-destructive")}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
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
                                    Updating password...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    Reset Password
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            )}
                        </Button>

                        <div className="text-center">
                            <Link
                                to="/forgot-password"
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Resend code
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
