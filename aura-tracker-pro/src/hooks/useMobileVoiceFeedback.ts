import { speak } from "@/lib/voiceUtils";
import {
  getSoundEnabled,
  playNotification,
  playNotificationBeep,
  playNotificationTwoTone,
} from "@/lib/notificationSound";
import { haptic, getHapticEnabled, isMobileDevice } from "@/lib/hapticUtils";

// Helper function to get voice enabled state from localStorage
const getVoiceEnabled = (): boolean => {
  const saved = localStorage.getItem("voiceEnabled");
  return saved !== null ? JSON.parse(saved) : true; // Default to true
};

// Helper function to set voice enabled state
export const setVoiceEnabled = (enabled: boolean): void => {
  localStorage.setItem("voiceEnabled", JSON.stringify(enabled));
};

// Mobile-specific settings
const getMobileVoiceSettings = () => {
  const brevity = localStorage.getItem("mobileVoiceBrevity");
  const autoReduce = localStorage.getItem("autoReduceVoice");

  return {
    useBrevity: brevity === "true",
    autoReduceOnBattery: autoReduce !== "false", // Default true
  };
};

export const setMobileVoiceSettings = (settings: {
  useBrevity?: boolean;
  autoReduceOnBattery?: boolean;
}) => {
  if (settings.useBrevity !== undefined) {
    localStorage.setItem("mobileVoiceBrevity", settings.useBrevity.toString());
  }
  if (settings.autoReduceOnBattery !== undefined) {
    localStorage.setItem(
      "autoReduceVoice",
      settings.autoReduceOnBattery.toString()
    );
  }
};

// Check battery status (if supported)
const isLowBattery = async (): Promise<boolean> => {
  if ("getBattery" in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      return battery.level < 0.2 && !battery.charging;
    } catch {
      return false;
    }
  }
  return false;
};

// Shorten message for mobile
const makeMessageBrief = (message: string): string => {
  // Remove verbose phrases
  return message
    .replace(/successfully\./gi, ".")
    .replace(/has been /gi, "")
    .replace(/you have /gi, "")
    .replace(/\. Status: Active/gi, "")
    .replace(/\. Category: \w+/gi, "")
    .trim();
};

export const useMobileVoiceFeedback = () => {
  const soundEnabled = getSoundEnabled();
  const voiceEnabled = getVoiceEnabled();
  const hapticEnabled = getHapticEnabled();
  const isMobile = isMobileDevice();
  const mobileSettings = getMobileVoiceSettings();

  // Announce with voice feedback only
  const announce = async (message: string, forceFull = false) => {
    if (!voiceEnabled) return;

    let finalMessage = message;

    // Apply mobile optimizations
    if (isMobile && !forceFull) {
      // Check battery if auto-reduce is enabled
      if (mobileSettings.autoReduceOnBattery) {
        const lowBattery = await isLowBattery();
        if (lowBattery) {
          return; // Skip voice on low battery
        }
      }

      // Use brief messages if enabled
      if (mobileSettings.useBrevity) {
        finalMessage = makeMessageBrief(message);
      }
    }

    speak(finalMessage);
  };

  // Play notification sound only
  const playSound = (useCustomSound = false) => {
    if (!soundEnabled) return;
    playNotification(useCustomSound);
  };

  // Play specific sound variations
  const playBeep = () => {
    if (!soundEnabled) return;
    playNotificationBeep();
  };

  const playTwoTone = () => {
    if (!soundEnabled) return;
    playNotificationTwoTone();
  };

  // Mobile-optimized notification (voice + sound + haptic)
  const notifyMobile = async (
    message: string,
    options: {
      withSound?: boolean;
      withHaptic?: boolean;
      hapticPattern?: keyof typeof haptic;
      useCustomSound?: boolean;
      forceFull?: boolean;
    } = {}
  ) => {
    const {
      withSound = false,
      withHaptic = true,
      hapticPattern = "success",
      useCustomSound = false,
      forceFull = false,
    } = options;

    // Voice feedback
    if (voiceEnabled) {
      await announce(message, forceFull);
    }

    // Sound feedback
    if (withSound && soundEnabled) {
      playNotification(useCustomSound);
    }

    // Haptic feedback (mobile only)
    if (withHaptic && hapticEnabled && isMobile) {
      if (typeof hapticPattern === "string" && hapticPattern in haptic) {
        haptic[hapticPattern as keyof typeof haptic]();
      }
    }
  };

  // Combined notification (voice + optional sound) - backward compatible
  const notify = async (
    message: string,
    withSound = false,
    useCustomSound = false
  ) => {
    await notifyMobile(message, {
      withSound,
      withHaptic: isMobile,
      useCustomSound,
    });
  };

  // Haptic-only feedback
  const vibrate = (pattern: keyof typeof haptic = "tap") => {
    if (!hapticEnabled || !isMobile) return;
    if (typeof pattern === "string" && pattern in haptic) {
      haptic[pattern as keyof typeof haptic]();
    }
  };

  return {
    announce, // Voice only
    playSound, // Sound only
    playBeep, // Beep sound only
    playTwoTone, // Two-tone sound only
    notify, // Combined (backward compatible)
    notifyMobile, // Mobile-optimized with haptic
    vibrate, // Haptic only
    voiceEnabled, // Expose voice state
    soundEnabled, // Expose sound state
    hapticEnabled, // Expose haptic state
    isMobile, // Device type
  };
};
