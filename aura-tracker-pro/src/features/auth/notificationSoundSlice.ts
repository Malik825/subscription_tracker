import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { playNotificationTwoTone } from "@/lib/notificationSound";

interface NotificationSoundState {
  soundEnabled: boolean;
  lastUnreadCount: number;
}

const initialState: NotificationSoundState = {
  soundEnabled: localStorage.getItem("notificationSoundEnabled") === "true",
  lastUnreadCount: 0,
};

const notificationSoundSlice = createSlice({
  name: "notificationSound",
  initialState,
  reducers: {
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
      localStorage.setItem(
        "notificationSoundEnabled",
        String(state.soundEnabled)
      );
    },
    setSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.soundEnabled = action.payload;
      localStorage.setItem("notificationSoundEnabled", String(action.payload));
    },
    playSound: (state) => {
      if (state.soundEnabled) {
        playNotificationTwoTone();
      }
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      const newCount = action.payload;

      // Play sound if count increased and sound is enabled
      // Only play if we had a previous count (not initial load)
      if (
        state.soundEnabled &&
        newCount > state.lastUnreadCount &&
        state.lastUnreadCount > 0
      ) {
        playNotificationTwoTone();
      }

      state.lastUnreadCount = newCount;
    },
  },
});

export const { toggleSound, setSoundEnabled, playSound, updateUnreadCount } =
  notificationSoundSlice.actions;
export default notificationSoundSlice.reducer;
