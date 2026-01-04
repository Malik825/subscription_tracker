import { useState } from "react";
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
    CreditCard,
    LogOut,
    Moon,
    Globe,
    Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLogoutMutation } from "@/api/authApi";
import {
    useGetSettingsQuery,
    useUpdateProfileMutation,
    useUpdatePreferencesMutation,
    useUpdateNotificationsMutation,
    useDeleteAccountMutation,
} from "@/api/settingsApi";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
    const { user } = useAuth();
    const [logout] = useLogoutMutation();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Fetch settings
    const { data: settingsData, isLoading: isLoadingSettings } = useGetSettingsQuery();
    const settings = settingsData?.data;

    // Mutations
    const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
    const [updatePreferences, { isLoading: isUpdatingPreferences }] = useUpdatePreferencesMutation();
    const [updateNotifications, { isLoading: isUpdatingNotifications }] = useUpdateNotificationsMutation();
    const [deleteAccount, { isLoading: isDeletingAccount }] = useDeleteAccountMutation();

    // Local state for form inputs
    const [fullName, setFullName] = useState("");
    const [deletePassword, setDeletePassword] = useState("");

    const handleLogout = async () => {
        try {
            await logout().unwrap();
            navigate("/auth");
        } catch (error) {
            console.error("Logout failed:", error);
            navigate("/auth");
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await updateProfile({ fullName }).unwrap();
            toast({
                title: "Success",
                description: "Profile updated successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error?.data?.message || "Failed to update profile",
                variant: "destructive",
            });
        }
    };

    const handleToggleDarkMode = async (checked) => {
        try {
            await updatePreferences({ darkMode: checked }).unwrap();
            toast({
                title: "Success",
                description: "Dark mode preference updated",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update dark mode",
                variant: "destructive",
            });
        }
    };

    const handleToggleNotification = async (field, checked) => {
        try {
            await updateNotifications({ [field]: checked }).unwrap();
            toast({
                title: "Success",
                description: "Notification preference updated",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update notification",
                variant: "destructive",
            });
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            toast({
                title: "Error",
                description: "Please enter your password",
                variant: "destructive",
            });
            return;
        }

        try {
            await deleteAccount(deletePassword).unwrap();
            toast({
                title: "Success",
                description: "Account deleted successfully",
            });
            navigate("/auth");
        } catch (error) {
            toast({
                title: "Error",
                description: error?.data?.message || "Failed to delete account",
                variant: "destructive",
            });
        }
    };

    if (isLoadingSettings) {
        return (
            <div className="min-h-screen aura-bg flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

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
                                                <AvatarImage src={settings?.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`} />
                                                <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
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
                                            <Input 
                                                id="name" 
                                                defaultValue={user?.fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input id="email" defaultValue={user?.email} disabled />
                                        </div>
                                        <Button 
                                            onClick={handleUpdateProfile}
                                            disabled={isUpdatingProfile || !fullName}
                                        >
                                            {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Changes
                                        </Button>
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
                                        <Switch 
                                            checked={settings?.preferences?.darkMode ?? true}
                                            onCheckedChange={handleToggleDarkMode}
                                            disabled={isUpdatingPreferences}
                                        />
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
                                        <Button variant="outline" size="sm">
                                            {settings?.preferences?.currency || "USD"} ($)
                                        </Button>
                                    </div>
                                </div>

                                <div className="glass p-6 rounded-2xl space-y-6 border-red-500/20">
                                    <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-red-400">Delete Account</Label>
                                            <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                                            <Input 
                                                type="password" 
                                                placeholder="Enter your password to confirm"
                                                value={deletePassword}
                                                onChange={(e) => setDeletePassword(e.target.value)}
                                            />
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={handleDeleteAccount}
                                                disabled={isDeletingAccount || !deletePassword}
                                            >
                                                {isDeletingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Delete Account
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Notifications Tab */}
                            <TabsContent value="notifications" className="space-y-6 mt-0 animate-fade-in">
                                <div className="glass p-6 rounded-2xl space-y-6">
                                    <h2 className="text-xl font-semibold">Notification Settings</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Email Digest</Label>
                                            <Switch 
                                                checked={settings?.notifications?.emailDigest ?? true}
                                                onCheckedChange={(checked) => handleToggleNotification("emailDigest", checked)}
                                                disabled={isUpdatingNotifications}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label>Push Notifications</Label>
                                            <Switch 
                                                checked={settings?.notifications?.pushNotifications ?? false}
                                                onCheckedChange={(checked) => handleToggleNotification("pushNotifications", checked)}
                                                disabled={isUpdatingNotifications}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label>Renewal Reminders</Label>
                                            <Switch 
                                                checked={settings?.notifications?.renewalReminders ?? true}
                                                onCheckedChange={(checked) => handleToggleNotification("renewalReminders", checked)}
                                                disabled={isUpdatingNotifications}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label>Marketing Emails</Label>
                                            <Switch 
                                                checked={settings?.notifications?.marketingEmails ?? false}
                                                onCheckedChange={(checked) => handleToggleNotification("marketingEmails", checked)}
                                                disabled={isUpdatingNotifications}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Billing Tab */}
                            <TabsContent value="billing" className="space-y-6 mt-0 animate-fade-in">
                                <div className="glass p-6 rounded-2xl space-y-6">
                                    <h2 className="text-xl font-semibold">Current Plan</h2>
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                                        <div>
                                            <p className="font-bold text-lg text-primary capitalize">
                                                {settings?.billing?.plan || "Free"} Plan
                                            </p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                Billed {settings?.billing?.billingCycle || "monthly"}
                                            </p>
                                        </div>
                                        <Badge className="bg-primary text-primary-foreground capitalize">
                                            {settings?.billing?.status || "Active"}
                                        </Badge>
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