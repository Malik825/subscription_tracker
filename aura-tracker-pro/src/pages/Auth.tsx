import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/schemas/auth";
import { loginUser, registerUser } from "@/features/auth/authSlice";
import { AppDispatch, RootState } from "@/store";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const {
    register: registerForm,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterInput>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: LoginInput | RegisterInput) => {
    // Determine which action to dispatch based on isLogin state
    const action = isLogin
      ? loginUser(data as LoginInput)
      : registerUser(data as RegisterInput);

    const result = await dispatch(action);

    if (loginUser.fulfilled.match(result)) {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate("/dashboard");
    } else if (registerUser.fulfilled.match(result)) {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account before logging in.",
      });
      setIsLogin(true); // Switch to login mode
      reset();
    } else {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: (result.payload as string) || "An unexpected error occurred.",
      });
    }
  };

  const toggleAuthMode = (loginMode: boolean) => {
    setIsLogin(loginMode);
    reset(); // Clear errors and values when switching modes
  };

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Back button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors glass px-4 py-2 rounded-full border-border/40"
      >
        <ArrowRight className="h-4 w-4 rotate-180" />
        Back to Home
      </Link>

      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 z-10">
        <div className="w-full max-w-[420px] space-y-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">SubTrack</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? "Enter your credentials to access your dashboard"
                : "Join 10,000+ users managing their spend"}
            </p>
          </div>

          <form
            onSubmit={handleFormSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-semibold opacity-80">Name</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      placeholder="Enter your name"
                      {...registerForm("username")}
                      className={cn(
                        "h-12 bg-secondary/50 border-transparent focus:bg-background transition-all px-4",
                        errors.username && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.username.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold opacity-80">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your mail"
                    {...registerForm("email")}
                    className={cn(
                      "h-12 bg-secondary/50 border-transparent focus:bg-background transition-all px-4",
                      errors.email && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-semibold opacity-80">Password</Label>
                  {isLogin && (
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-primary hover:underline transition-opacity hover:opacity-100 opacity-70"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...registerForm("password")}
                    className={cn(
                      "h-12 bg-secondary/50 border-transparent focus:bg-background transition-all px-4 pr-12",
                      errors.password && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive mt-1 font-medium">{errors.password.message}</p>
                )}
              </div>

              {!isLogin && (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                    required
                  />
                  <label htmlFor="terms" className="text-xs font-medium text-muted-foreground">
                    I agree to all the <span className="text-primary hover:underline cursor-pointer">Terms & Conditions</span>
                  </label>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20"
              variant="glow"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isLogin ? "Log in" : "Sign up"}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-4 text-muted-foreground font-medium uppercase tracking-widest">
                Or
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full h-11 transition-all hover:bg-secondary/80">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="w-full h-11 transition-all hover:bg-secondary/80">
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </Button>
          </div>

          <p className="text-center text-sm font-medium text-muted-foreground pb-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => toggleAuthMode(!isLogin)}
              className="text-primary font-bold hover:underline"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Branding & Graphic */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center p-12 bg-[#003B43] relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-white/5 rounded-lg rotate-12" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-2xl -rotate-12" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full" />

        {/* Mock UI Elements */}
        <div className="relative z-10 w-full max-w-[500px] flex flex-col items-center gap-12">
          <div className="w-full space-y-6">
            {/* Analytics Card */}
            <div className="glass-premium bg-white/95 rounded-[2rem] p-8 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[#003B43] font-bold text-xl">Analytics</h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-secondary rounded-full text-[10px] font-bold text-muted-foreground">Weekly</span>
                  <span className="px-3 py-1 bg-secondary rounded-full text-[10px] font-bold text-muted-foreground">Monthly</span>
                </div>
              </div>
              <div className="h-32 w-full flex items-end gap-2">
                {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#003B43]/10 rounded-t-lg relative group">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-[#003B43] rounded-t-lg transition-all duration-1000"
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#003B43] text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        ${h * 5}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            {/* Total Spend Circle */}
            <div className="flex justify-end pr-8">
              <div className="glass-premium bg-white rounded-3xl p-6 shadow-2xl w-40 h-40 flex flex-col items-center justify-center transform hover:-rotate-6 transition-transform duration-500">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      className="text-secondary"
                      strokeDasharray="100, 100"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#003B43]"
                      strokeDasharray="42, 100"
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">Total</span>
                    <span className="text-xl font-bold text-[#003B43]">42%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <h3 className="text-3xl font-bold text-white">Very simple way you can engage</h3>
            <p className="text-white/70 text-lg max-w-sm">
              Welcome to SubTrack! Efficiently track and manage your recurring spend with ease.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
