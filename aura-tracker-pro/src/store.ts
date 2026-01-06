// src/redux/store.ts (or wherever your store is configured)
// Make sure to add the userPreferencesApi to your store

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "@/features/auth/authSlice";
import notificationSoundReducer from "@/features/auth/notificationSoundSlice";
import { authApi } from "@/api/authApi";
import { notificationsApi } from "./api/notificationsApi";
import { set } from "date-fns";
import { settingsApi } from "./api/settingsApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notificationSound: notificationSoundReducer,
    [authApi.reducerPath]: authApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(notificationsApi.middleware)
      .concat(settingsApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
