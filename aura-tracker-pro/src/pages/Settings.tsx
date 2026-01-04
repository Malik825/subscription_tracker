import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Settings as SettingsIcon,
    Bell,
    Shield,
    CreditCard,
    LogOut,
    Moon,
    Globe,
    HelpCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLogoutMutation } from "@/api/authApi";
import { useNavigate } from "react-router-dom";

export default function Settings() {
    const { user } = useAuth();
    const [logout] = useLogoutMutation();
    const navigate = useNavigate();

   const handleLogout = async () => {
    try {
        await logout().unwrap();
        navigate("/auth");
    } catch (error) {
        console.error("Logout failed:", error);
        navigate("/auth"); // Navigate anyway
    }
};

    return (
        <div className="min-h-screen aura-bg">
            <div className="p-8">
                <div className="space-y-6 animate-fade-in">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your account preferences and application settings
                        </p>
                    </div>

                    <Tabs defaultValue="profile" className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Navigation */}
                        <div className="w-full lg:w-64 flex-shrink-0">
                            <TabsList className="flex flex-col h-auto w-full bg-transparent gap-2 p-0">
                                <TabsTrigger
                                    value="profile"
                                    className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg transition-all"
                                >
                                    <User className="h-4 w-4" />
                                    Profile
                                </TabsTrigger>
                                <TabsTrigger
                                    value="account"
                                    className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg transition-all"
                                >
                                    <SettingsIcon className="h-4 w-4" />
                                    Account
                                </TabsTrigger>
                                <TabsTrigger
                                    value="notifications"
                                    className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg transition-all"
                                >
                                    <Bell className="h-4 w-4" />
                                    Notifications
                                </TabsTrigger>
                                <TabsTrigger
                                    value="billing"
                                    className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg transition-all"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    Billing
                                </TabsTrigger>
                                <Separator className="my-2 bg-white/10" />
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3 px-4 py-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </Button>
                            </TabsList>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 max-w-2xl">
                            {/* Profile Tab */}
                            <TabsContent value="profile" className="space-y-6 mt-0 animate-fade-in">
                                <div className="glass p-6 rounded-2xl space-y-8">
                                    <div>
                                        <h2 className="text-xl font-semibold mb-4">Public Profile</h2>
                                        <div className="flex items-center gap-6">
                                            <Avatar className="h-20 w-20 border-2 border-primary/20">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                                                <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-2">
                                                <Button variant="outline" size="sm">Change Avatar</Button>
                                                <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" defaultValue={user?.username} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input id="email" defaultValue={user?.email} disabled />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Account Tab */}
                            <TabsContent value="account" className="space-y-6 mt-0 animate-fade-in">
                                <div className="glass p-6 rounded-2xl space-y-6">
                                    <h2 className="text-xl font-semibold">Preferences</h2>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <Moon className="h-4 w-4 text-muted-foreground" />
                                                <Label>Dark Mode</Label>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Ensure that dark mode is always enabled</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <Separator className="bg-white/5" />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-muted-foreground" />
                                                <Label>Currency</Label>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Select your preferred display currency</p>
                                        </div>
                                        <Button variant="outline" size="sm">USD ($)</Button>
                                    </div>
                                </div>

                                <div className="glass p-6 rounded-2xl space-y-6 border-red-500/20">
                                    <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-red-400">Delete Account</Label>
                                                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                                            </div>
                                            <Button variant="destructive" size="sm">Delete Account</Button>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Notifications Tab */}
                            <TabsContent value="notifications" className="space-y-6 mt-0 animate-fade-in">
                                <div className="glass p-6 rounded-2xl space-y-6">
                                    <h2 className="text-xl font-semibold">Notification Settings</h2>
                                    <div className="space-y-4">
                                        {["Email Digest", "Push Notifications", "Renewal Reminders", "Marketing Emails"].map((item) => (
                                            <div key={item} className="flex items-center justify-between">
                                                <Label>{item}</Label>
                                                <Switch defaultChecked={item !== "Marketing Emails"} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Billing Tab */}
                            <TabsContent value="billing" className="space-y-6 mt-0 animate-fade-in">
                                <div className="glass p-6 rounded-2xl space-y-6">
                                    <h2 className="text-xl font-semibold">Current Plan</h2>
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                                        <div>
                                            <p className="font-bold text-lg text-primary">Pro Plan</p>
                                            <p className="text-sm text-muted-foreground">Billed monthly</p>
                                        </div>
                                        <Badge className="bg-primary text-primary-foreground">Active</Badge>
                                    </div>
                                    <Button variant="outline" className="w-full">Manage Subscription</Button>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
