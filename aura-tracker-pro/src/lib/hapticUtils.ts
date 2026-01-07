// Haptic Feedback Utilities for Mobile Devices

// Check if haptic feedback is supported
export const isHapticSupported = (): boolean => {
  return "vibrate" in navigator || "Vibration" in window;
};

// Get haptic enabled state from localStorage
export const getHapticEnabled = (): boolean => {
  const saved = localStorage.getItem("hapticEnabled");
  return saved !== "false"; // Default to true
};

// Set haptic enabled state
export const setHapticEnabled = (enabled: boolean): void => {
  localStorage.setItem("hapticEnabled", enabled.toString());
};

// Haptic feedback patterns
export const HapticPatterns = {
  // Basic patterns
  LIGHT: [10],
  MEDIUM: [20],
  HEAVY: [30],

  // UI feedback patterns
  SUCCESS: [10, 50, 10],
  ERROR: [50, 100, 50],
  WARNING: [20, 50, 20, 50, 20],

  // Interaction patterns
  TAP: [5],
  DOUBLE_TAP: [5, 50, 5],
  LONG_PRESS: [50],
  SWIPE: [10, 20, 10],

  // Notification patterns
  NOTIFICATION: [50, 100, 50, 100, 50],
  URGENT: [100, 50, 100, 50, 100],

  // Selection patterns
  SELECT: [10],
  TOGGLE_ON: [10, 20, 30],
  TOGGLE_OFF: [30, 20, 10],

  // Navigation patterns
  PAGE_CHANGE: [15, 30, 15],
  MODAL_OPEN: [20, 40],
  MODAL_CLOSE: [40, 20],
} as const;

// Main haptic feedback function
export const triggerHaptic = (pattern: number | number[]): void => {
  if (!getHapticEnabled() || !isHapticSupported()) {
    return;
  }

  try {
    if (typeof pattern === "number") {
      navigator.vibrate(pattern);
    } else {
      navigator.vibrate(pattern);
    }
  } catch (error) {
    console.warn("Haptic feedback failed:", error);
  }
};

// Convenience functions for common haptic patterns
export const haptic = {
  // Basic feedback
  light: () => triggerHaptic(HapticPatterns.LIGHT),
  medium: () => triggerHaptic(HapticPatterns.MEDIUM),
  heavy: () => triggerHaptic(HapticPatterns.HEAVY),

  // UI feedback
  success: () => triggerHaptic(HapticPatterns.SUCCESS),
  error: () => triggerHaptic(HapticPatterns.ERROR),
  warning: () => triggerHaptic(HapticPatterns.WARNING),

  // Interactions
  tap: () => triggerHaptic(HapticPatterns.TAP),
  doubleTap: () => triggerHaptic(HapticPatterns.DOUBLE_TAP),
  longPress: () => triggerHaptic(HapticPatterns.LONG_PRESS),
  swipe: () => triggerHaptic(HapticPatterns.SWIPE),

  // Notifications
  notification: () => triggerHaptic(HapticPatterns.NOTIFICATION),
  urgent: () => triggerHaptic(HapticPatterns.URGENT),

  // Selections
  select: () => triggerHaptic(HapticPatterns.SELECT),
  toggleOn: () => triggerHaptic(HapticPatterns.TOGGLE_ON),
  toggleOff: () => triggerHaptic(HapticPatterns.TOGGLE_OFF),

  // Navigation
  pageChange: () => triggerHaptic(HapticPatterns.PAGE_CHANGE),
  modalOpen: () => triggerHaptic(HapticPatterns.MODAL_OPEN),
  modalClose: () => triggerHaptic(HapticPatterns.MODAL_CLOSE),
};

// Check if device is mobile
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Check if device is iOS
export const isIOS = (): boolean => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

// Check if device is Android
export const isAndroid = (): boolean => {
  return /Android/i.test(navigator.userAgent);
};

// Get device type
export const getDeviceType = (): "ios" | "android" | "desktop" => {
  if (isIOS()) return "ios";
  if (isAndroid()) return "android";
  return "desktop";
};
