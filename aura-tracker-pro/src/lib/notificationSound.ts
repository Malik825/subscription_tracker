type AudioContextConstructor = typeof AudioContext;

interface WindowWithWebkit extends Window {
  webkitAudioContext?: AudioContextConstructor;
}

const getAudioContext = (): AudioContext | null => {
  const SelectedContext =
    window.AudioContext || (window as WindowWithWebkit).webkitAudioContext;
  return SelectedContext ? new SelectedContext() : null;
};

const createTone = (
  context: AudioContext,
  freq: number,
  startOffset: number,
  duration: number
): void => {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.frequency.value = freq;
  oscillator.type = "sine";

  const startTime = context.currentTime + startOffset;

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
};

export const playNotificationBeep = (): boolean => {
  try {
    const context = getAudioContext();
    if (!context) return false;
    createTone(context, 800, 0, 0.2);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const playNotificationTwoTone = (): boolean => {
  try {
    const context = getAudioContext();
    if (!context) return false;
    createTone(context, 800, 0, 0.15);
    createTone(context, 1000, 0.1, 0.15);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const playNotificationSound = (): boolean => {
  try {
    const audio = new Audio("/sounds/notification.mp3");
    audio.volume = 0.5;
    audio.play().catch((err) => console.error(err));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const playNotification = (useCustomSound = false): void => {
  if (useCustomSound) {
    playNotificationSound();
  } else {
    playNotificationTwoTone();
  }
};

export const getSoundEnabled = (): boolean => {
  const stored = localStorage.getItem("notificationSoundEnabled");
  return stored !== "false";
};

export const setSoundEnabled = (enabled: boolean): void => {
  localStorage.setItem("notificationSoundEnabled", enabled.toString());
};
