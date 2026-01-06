
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
    User,
    Settings as SettingsIcon,
    Bell,
    Shield,
    CreditCard,
    LogOut,
    Moon,
    Globe,
    HelpCircle,
    Volume2,
    VolumeX,
    Play,
    Sparkles,
    Smartphone,
    Vibrate
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useLogoutMutation } from "@/api/authApi";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  getAvailableVoices, 
  getSelectedVoice, 
  setSelectedVoice,
  testVoice,
  getVoiceSettings,
  setVoiceSettings,
  getRecommendedVoices,
  getVoiceQuality
} from "@/lib/voiceUtils";
import { 
  isMobileDevice, 
  getHapticEnabled, 
  setHapticEnabled,
  haptic,
  isHapticSupported
} from "@/lib/hapticUtils";
import { setMobileVoiceSettings, useMobileVoiceFeedback } from "@/hooks/useMobileVoiceFeedback";

export default function Settings() {
    const { user } = useAuth();
    const [logout] = useLogoutMutation();
    const navigate = useNavigate();
    const { announce, vibrate, isMobile } = useMobileVoiceFeedback();
    const { toast } = useToast();

    // Load settings from localStorage
    const [voiceEnabled, setVoiceEnabled] = useState(() => {
        const saved = localStorage.getItem('voiceEnabled');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const [soundEnabled, setSoundEnabled] = useState(() => {
        const saved = localStorage.getItem('notificationSoundEnabled');
        return saved !== "false";
    });

    const [hapticEnabled, setHapticEnabledState] = useState(() => {
        return getHapticEnabled();
    });

    const [useBrevity, setUseBrevity] = useState(() => {
        const saved = localStorage.getItem('mobileVoiceBrevity');
        return saved === 'true';
    });

    const [autoReduceOnBattery, setAutoReduceOnBattery] = useState(() => {
        const saved = localStorage.getItem('autoReduceVoice');
        return saved !== 'false';
    });

    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceName, setSelectedVoiceName] = useState<string>(() => {
        return getSelectedVoice() || '';
    });

    const [voiceRate, setVoiceRate] = useState<number>(() => {
        return getVoiceSettings().rate;
    });

    const [voicePitch, setVoicePitch] = useState<number>(() => {
        return getVoiceSettings().pitch;
    });

    const [voiceVolume, setVoiceVolume] = useState<number>(() => {
        return getVoiceSettings().volume;
    });

    // Load available voices
    useEffect(() => {
        const loadVoices = () => {
            const voices = getRecommendedVoices();
            setAvailableVoices(voices);
            
            // Set default voice if none selected
            if (!selectedVoiceName && voices.length > 0) {
                const defaultVoice = voices[0];
                setSelectedVoiceName(defaultVoice.name);
                setSelectedVoice(defaultVoice.name);
            }
        };

        loadVoices();
        
        // Voices may load asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    // Save settings to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('voiceEnabled', JSON.stringify(voiceEnabled));
    }, [voiceEnabled]);

    useEffect(() => {
        localStorage.setItem('notificationSoundEnabled', soundEnabled.toString());
    }, [soundEnabled]);

    useEffect(() => {
        setHapticEnabled(hapticEnabled);
    }, [hapticEnabled]);

    useEffect(() => {
        setMobileVoiceSettings({ useBrevity, autoReduceOnBattery });
    }, [useBrevity, autoReduceOnBattery]);

    useEffect(() => {
        if (selectedVoiceName) {
            setSelectedVoice(selectedVoiceName);
        }
    }, [selectedVoiceName]);

    useEffect(() => {
        setVoiceSettings({ rate: voiceRate, pitch: voicePitch, volume: voiceVolume });
    }, [voiceRate, voicePitch, voiceVolume]);

    const handleVoiceToggle = (checked: boolean) => {
        setVoiceEnabled(checked);
        if (checked) {
            announce("Voice feedback enabled");
        }
        toast({
            title: checked ? "Voice Feedback Enabled" : "Voice Feedback Disabled",
            description: checked ? "You will now hear audio announcements" : "Audio announcements are now off"
        });
    };

    const handleSoundToggle = (checked: boolean) => {
        setSoundEnabled(checked);
        if (isMobile) vibrate('select');
        if (voiceEnabled) {
            announce(checked ? "Sound notifications enabled" : "Sound notifications disabled");
        }
        toast({
            title: checked ? "Sound Notifications Enabled" : "Sound Notifications Disabled",
            description: checked ? "You will now hear notification sounds" : "Notification sounds are now off"
        });
    };

    const handleHapticToggle = (checked: boolean) => {
        setHapticEnabledState(checked);
        if (checked && isMobile) {
            haptic.success();
        }
        if (voiceEnabled) {
            announce(checked ? "Haptic feedback enabled" : "Haptic feedback disabled");
        }
        toast({
            title: checked ? "Haptic Feedback Enabled" : "Haptic Feedback Disabled",
            description: checked ? "You will now feel vibrations on actions" : "Vibrations are now off"
        });
    };

    const handleBrevityToggle = (checked: boolean) => {
        setUseBrevity(checked);
        if (isMobile) vibrate('select');
        if (voiceEnabled) {
            announce(checked ? "Brief mode enabled. Voice messages will be shorter." : "Brief mode disabled. Voice messages will be full length.");
        }
        toast({
            title: checked ? "Brief Mode Enabled" : "Brief Mode Disabled",
            description: checked ? "Voice messages will be concise" : "Voice messages will be detailed"
        });
    };

    const handleBatteryToggle = (checked: boolean) => {
        setAutoReduceOnBattery(checked);
        if (isMobile) vibrate('select');
        if (voiceEnabled) {
            announce(checked ? "Battery saver enabled" : "Battery saver disabled");
        }
        toast({
            title: checked ? "Battery Saver Enabled" : "Battery Saver Disabled",
            description: checked ? "Voice will pause when battery is low" : "Voice will always play"
        });
    };

    const handleVoiceChange = (voiceName: string) => {
        setSelectedVoiceName(voiceName);
        toast({
            title: "Voice Changed",
            description: "Click the play button to preview the new voice"
        });
    };

    const handleTestVoice = () => {
        if (selectedVoiceName) {
            testVoice(
                selectedVoiceName,
                "Hello! This is how I sound. I will announce your subscription updates and actions."
            );
        }
    };

    const getVoiceDisplayName = (voice: SpeechSynthesisVoice) => {
        const quality = getVoiceQuality(voice);
        const qualityBadge = quality === 'high' ? ' ⭐' : quality === 'medium' ? ' •' : '';
        return `${voice.name}${qualityBadge}`;
    };

    const handleLogout = async () => {
        try {
            await logout().unwrap();
            navigate("/auth");
        } catch (error) {
            console.error("Logout failed:", error);
            navigate("/auth");
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
                                {/* Accessibility Settings */}
                                <div className="glass p-6 rounded-2xl space-y-6">
                                    <div>
                                        <h2 className="text-xl font-semibold mb-2">Accessibility</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Configure audio feedback and notification preferences
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    {voiceEnabled ? (
                                                        <Volume2 className="h-4 w-4 text-primary" />
                                                    ) : (
                                                        <VolumeX className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    <Label>Voice Feedback</Label>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Hear audio announcements for actions and updates
                                                </p>
                                            </div>
                                            <Switch 
                                                checked={voiceEnabled}
                                                onCheckedChange={handleVoiceToggle}
                                            />
                                        </div>
                                        
                                        {voiceEnabled && (
                                            <>
                                                <Separator className="bg-white/5" />
                                                
                                                {/* Voice Selection */}
                                                <div className="space-y-3">
                                                    <Label className="flex items-center gap-2">
                                                        <Sparkles className="h-4 w-4 text-primary" />
                                                        Select Voice
                                                    </Label>
                                                    <div className="flex gap-2">
                                                        <Select 
                                                            value={selectedVoiceName} 
                                                            onValueChange={handleVoiceChange}
                                                        >
                                                            <SelectTrigger className="flex-1">
                                                                <SelectValue placeholder="Choose a voice" />
                                                            </SelectTrigger>
                                                            <SelectContent className="max-h-[300px]">
                                                                {availableVoices.map((voice) => (
                                                                    <SelectItem key={voice.name} value={voice.name}>
                                                                        <div className="flex items-center gap-2">
                                                                            <span>{getVoiceDisplayName(voice)}</span>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                ({voice.lang})
                                                                            </span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={handleTestVoice}
                                                            disabled={!selectedVoiceName}
                                                        >
                                                            <Play className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        ⭐ = High quality • • = Good quality
                                                    </p>
                                                </div>

                                                <Separator className="bg-white/5" />

                                                {/* Voice Speed */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label>Speech Rate</Label>
                                                        <span className="text-sm text-muted-foreground">
                                                            {voiceRate.toFixed(1)}x
                                                        </span>
                                                    </div>
                                                    <Slider
                                                        value={[voiceRate]}
                                                        onValueChange={(value) => setVoiceRate(value[0])}
                                                        min={0.5}
                                                        max={2.0}
                                                        step={0.1}
                                                        className="w-full"
                                                    />
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>Slower</span>
                                                        <span>Faster</span>
                                                    </div>
                                                </div>

                                                <Separator className="bg-white/5" />

                                                {/* Voice Pitch */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label>Voice Pitch</Label>
                                                        <span className="text-sm text-muted-foreground">
                                                            {voicePitch.toFixed(1)}
                                                        </span>
                                                    </div>
                                                    <Slider
                                                        value={[voicePitch]}
                                                        onValueChange={(value) => setVoicePitch(value[0])}
                                                        min={0.5}
                                                        max={2.0}
                                                        step={0.1}
                                                        className="w-full"
                                                    />
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>Lower</span>
                                                        <span>Higher</span>
                                                    </div>
                                                </div>

                                                <Separator className="bg-white/5" />

                                                {/* Voice Volume */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label>Voice Volume</Label>
                                                        <span className="text-sm text-muted-foreground">
                                                            {Math.round(voiceVolume * 100)}%
                                                        </span>
                                                    </div>
                                                    <Slider
                                                        value={[voiceVolume]}
                                                        onValueChange={(value) => setVoiceVolume(value[0])}
                                                        min={0.1}
                                                        max={1.0}
                                                        step={0.1}
                                                        className="w-full"
                                                    />
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>Quiet</span>
                                                        <span>Loud</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        
                                        <Separator className="bg-white/5" />
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <Bell className="h-4 w-4 text-muted-foreground" />
                                                    <Label>Sound Notifications</Label>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Play sounds for important events and alerts
                                                </p>
                                            </div>
                                            <Switch 
                                                checked={soundEnabled}
                                                onCheckedChange={handleSoundToggle}
                                            />
                                        </div>

                                        {/* Mobile-specific settings */}
                                        {isMobile && isHapticSupported() && (
                                            <>
                                                <Separator className="bg-white/5" />
                                                
                                                <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                                                    <div className="flex items-center gap-2 text-primary">
                                                        <Smartphone className="h-4 w-4" />
                                                        <span className="text-sm font-semibold">Mobile Settings</span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-2">
                                                                <Vibrate className="h-4 w-4 text-muted-foreground" />
                                                                <Label>Haptic Feedback</Label>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Vibrate on taps, swipes, and actions
                                                            </p>
                                                        </div>
                                                        <Switch 
                                                            checked={hapticEnabled}
                                                            onCheckedChange={handleHapticToggle}
                                                        />
                                                    </div>

                                                    <Separator className="bg-white/5" />

                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <Label>Brief Voice Messages</Label>
                                                            <p className="text-sm text-muted-foreground">
                                                                Shorter announcements for faster feedback
                                                            </p>
                                                        </div>
                                                        <Switch 
                                                            checked={useBrevity}
                                                            onCheckedChange={handleBrevityToggle}
                                                        />
                                                    </div>

                                                    <Separator className="bg-white/5" />

                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <Label>Battery Saver</Label>
                                                            <p className="text-sm text-muted-foreground">
                                                                Reduce voice when battery is low
                                                            </p>
                                                        </div>
                                                        <Switch 
                                                            checked={autoReduceOnBattery}
                                                            onCheckedChange={handleBatteryToggle}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Standard Notification Settings */}
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
                                            <p className="font-bold text-lg text-primary">
                                                {user?.plan === "free" ? "Free Plan" : "Pro Plan"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {user?.plan === "free" ? "Limited features" : "Billed monthly"}
                                            </p>
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