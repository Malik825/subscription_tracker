import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "@/features/auth/authSlice";
import notificationSoundReducer from "@/features/auth/notificationSoundSlice";
import { authApi } from "@/api/authApi";
import { notificationsApi } from "@/api/notificationsApi";
import { settingsApi } from "@/api/settingsApi";
import { userPreferencesApi } from "@/api/userPreferenceApi";
import { sharingApi } from "@/api/sharingApi";
import { paymentTrackingApi } from "@/api/paymentTrackingApi";
import { subscriptionApi } from "@/api/subscriptionApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notificationSound: notificationSoundReducer,
    [authApi.reducerPath]: authApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [userPreferencesApi.reducerPath]: userPreferencesApi.reducer,
    [sharingApi.reducerPath]: sharingApi.reducer,
    [paymentTrackingApi.reducerPath]: paymentTrackingApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(notificationsApi.middleware)
      .concat(settingsApi.middleware)
      .concat(userPreferencesApi.middleware)
      .concat(sharingApi.middleware)
      .concat(paymentTrackingApi.middleware)
      .concat(subscriptionApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
