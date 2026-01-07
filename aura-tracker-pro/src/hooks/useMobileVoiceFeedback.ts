import { speak } from "@/lib/voiceUtils";
import {
  getSoundEnabled,
  playNotification,
  playNotificationBeep,
  playNotificationTwoTone,
} from "@/lib/notificationSound";
import { haptic, getHapticEnabled, isMobileDevice } from "@/lib/hapticUtils";

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManager, ev: Event) => unknown) | null;
  onchargingtimechange: ((this: BatteryManager, ev: Event) => unknown) | null;
  ondischargingtimechange:
    | ((this: BatteryManager, ev: Event) => unknown)
    | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => unknown) | null;
}

interface NavigatorWithBattery extends Navigator {
  getBattery(): Promise<BatteryManager>;
}

const getVoiceEnabled = (): boolean => {
  const saved = localStorage.getItem("voiceEnabled");
  return saved !== null ? JSON.parse(saved) : true;
};

export const setVoiceEnabled = (enabled: boolean): void => {
  localStorage.setItem("voiceEnabled", JSON.stringify(enabled));
};

const getMobileVoiceSettings = () => {
  const brevity = localStorage.getItem("mobileVoiceBrevity");
  const autoReduce = localStorage.getItem("autoReduceVoice");

  return {
    useBrevity: brevity === "true",
    autoReduceOnBattery: autoReduce !== "false",
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

const isLowBattery = async (): Promise<boolean> => {
  if ("getBattery" in navigator) {
    try {
      const battery = await (navigator as NavigatorWithBattery).getBattery();
      return battery.level < 0.2 && !battery.charging;
    } catch {
      return false;
    }
  }
  return false;
};

const makeMessageBrief = (message: string): string => {
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

  const announce = async (message: string, forceFull = false) => {
    if (!voiceEnabled) return;

    let finalMessage = message;

    if (isMobile && !forceFull) {
      if (mobileSettings.autoReduceOnBattery) {
        const lowBattery = await isLowBattery();
        if (lowBattery) {
          return;
        }
      }

      if (mobileSettings.useBrevity) {
        finalMessage = makeMessageBrief(message);
      }
    }

    speak(finalMessage);
  };

  const playSound = (useCustomSound = false) => {
    if (!soundEnabled) return;
    playNotification(useCustomSound);
  };

  const playBeep = () => {
    if (!soundEnabled) return;
    playNotificationBeep();
  };

  const playTwoTone = () => {
    if (!soundEnabled) return;
    playNotificationTwoTone();
  };

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

    if (voiceEnabled) {
      await announce(message, forceFull);
    }

    if (withSound && soundEnabled) {
      playNotification(useCustomSound);
    }

    if (withHaptic && hapticEnabled && isMobile) {
      if (typeof hapticPattern === "string" && hapticPattern in haptic) {
        haptic[hapticPattern as keyof typeof haptic]();
      }
    }
  };

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

  const vibrate = (pattern: keyof typeof haptic = "tap") => {
    if (!hapticEnabled || !isMobile) return;
    if (typeof pattern === "string" && pattern in haptic) {
      haptic[pattern as keyof typeof haptic]();
    }
  };

  return {
    announce,
    playSound,
    playBeep,
    playTwoTone,
    notify,
    notifyMobile,
    vibrate,
    voiceEnabled,
    soundEnabled,
    hapticEnabled,
    isMobile,
  };
};
