import { speak } from "@/lib/voiceUtils";
import {
  getSoundEnabled,
  playNotificationTwoTone,
  playNotificationBeep,
  playNotification,
} from "@/lib/notificationSound";

// Helper function to get voice enabled state from localStorage
const getVoiceEnabled = (): boolean => {
  const saved = localStorage.getItem("voiceEnabled");
  return saved !== null ? JSON.parse(saved) : true; // Default to true
};

// Helper function to set voice enabled state
export const setVoiceEnabled = (enabled: boolean): void => {
  localStorage.setItem("voiceEnabled", JSON.stringify(enabled));
};

export const useVoiceFeedback = () => {
  const soundEnabled = getSoundEnabled();
  const voiceEnabled = getVoiceEnabled();

  // Announce with voice feedback only
  const announce = (message: string) => {
    if (!voiceEnabled) return;
    speak(message);
  };

  // Play notification sound only (respects soundEnabled setting)
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

  // Combined notification (voice + optional sound)
  const notify = (
    message: string,
    withSound = false,
    useCustomSound = false
  ) => {
    if (voiceEnabled) {
      speak(message);
    }

    if (withSound && soundEnabled) {
      playNotification(useCustomSound);
    }
  };

  return {
    announce, // Voice only
    playSound, // Sound only (with option for custom sound)
    playBeep, // Beep sound only
    playTwoTone, // Two-tone sound only
    notify, // Combined (voice + optional sound)
    voiceEnabled, // Expose voice state
    soundEnabled, // Expose sound state
  };
};
