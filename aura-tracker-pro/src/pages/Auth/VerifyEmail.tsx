import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import api from "@/lib/axios";
import { checkAuth } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/redux";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const { toast } = useToast();
    const dispatch = useAppDispatch();

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            return;
        }

        const verify = async () => {
            try {
                const response = await api.post("/auth/verify-email", { token });
                
                // User is now auto-logged in via cookie
                // Refresh Redux state with verified user
                await dispatch(checkAuth());
                
                setStatus("success");
                toast({
                    title: "Success!",
                    description: response.data.message || "Email verified successfully! You are now logged in.",
                });
            } catch (error) {
                setStatus("error");
                toast({
                    title: "Verification Failed",
                    description: "This link may be invalid or expired.",
                    variant: "destructive",
                });
            }
        };

        verify();
    }, [token, dispatch, toast]);

    return (
        <div className="min-h-screen flex items-center justify-center aura-bg p-4">
            <div className="w-full max-w-md p-8 glass rounded-2xl animate-fade-in-up text-center space-y-6">

                {status === "loading" && (
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-16 w-16 text-primary animate-spin" />
                        <h1 className="text-2xl font-bold">Verifying your email...</h1>
                        <p className="text-muted-foreground">Please wait while we confirm your account.</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center space-y-4 animate-scale-in">
                        <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-green-500">Email Verified!</h1>
                        <p className="text-muted-foreground">Thank you for verifying your email. You are now logged in and can access your dashboard.</p>
                        <Button
                            className="w-full mt-4"
                            variant="glow"
                            onClick={() => navigate("/dashboard")}
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center space-y-4 animate-scale-in">
                        <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center">
                            <XCircle className="h-10 w-10 text-destructive" />
                        </div>
                        <h1 className="text-2xl font-bold text-destructive">Verification Failed</h1>
                        <p className="text-muted-foreground">This link may be invalid or expired. Please try registering again.</p>
                        <Button
                            className="w-full mt-4"
                            variant="outline"
                            onClick={() => navigate("/auth")}
                        >
                            Back to Sign Up
                        </Button>
                    </div>
                )}

            </div>
        </div>
    );
}