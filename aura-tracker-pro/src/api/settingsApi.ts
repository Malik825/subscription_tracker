import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG } from "./api.config";

interface SettingsResponse {
  success: boolean;
  data: {
    profile?: {
      avatarUrl?: string;
      username?: string;
    };
    preferences?: {
      darkMode?: boolean;
      currency?: string;
      language?: string;
    };
    notifications?: {
      emailDigest?: boolean;
      pushNotifications?: boolean;
      renewalReminders?: boolean;
      marketingEmails?: boolean;
      paymentAlerts?: boolean;
      spendingInsights?: boolean;
      priceChangeAlerts?: boolean;
      productUpdates?: boolean;
    };
    billing?: {
      plan?: string;
      billingCycle?: string;
      status?: string;
    };
  };
}

interface NotificationsSettings {
  emailDigest?: boolean;
  pushNotifications?: boolean;
  renewalReminders?: boolean;
  marketingEmails?: boolean;
  paymentAlerts?: boolean;
  spendingInsights?: boolean;
  priceChangeAlerts?: boolean;
  productUpdates?: boolean;
}

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5500/api/v1",
    credentials: "include",
  }),
  tagTypes: ["Settings", "User"],
  // ✅ ADDED: Keep cached data for 5 minutes
  keepUnusedDataFor: API_CONFIG.CACHE_DURATIONS.SETTINGS,
  endpoints: (builder) => ({
    getSettings: builder.query<SettingsResponse, void>({
      query: () => "/settings",
      providesTags: ["Settings"],
      // ✅ No polling - settings rarely change
      // Will only refetch when:
      // 1. Component mounts for the first time
      // 2. A mutation invalidates the "Settings" tag
      // 3. User manually triggers refetch
    }),

    updateProfile: builder.mutation<
      SettingsResponse,
      { username?: string; avatarUrl?: string }
    >({
      query: (data) => ({
        url: "/settings/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings", "User"],
    }),

    updatePreferences: builder.mutation<
      SettingsResponse,
      { darkMode?: boolean; currency?: string; language?: string }
    >({
      query: (data) => ({
        url: "/settings/preferences",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),

    updateNotifications: builder.mutation<
      SettingsResponse,
      NotificationsSettings
    >({
      query: (data) => ({
        url: "/settings/notifications",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),

    updateBilling: builder.mutation<
      SettingsResponse,
      { plan?: string; billingCycle?: string; status?: string }
    >({
      query: (data) => ({
        url: "/settings/billing",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),

    deleteAccount: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (password) => ({
        url: "/settings/account",
        method: "DELETE",
        body: { password },
      }),
      invalidatesTags: ["Settings", "User"],
    }),

    resetSettings: builder.mutation<SettingsResponse, void>({
      query: () => ({
        url: "/settings/reset",
        method: "POST",
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateProfileMutation,
  useUpdatePreferencesMutation,
  useUpdateNotificationsMutation,
  useUpdateBillingMutation,
  useDeleteAccountMutation,
  useResetSettingsMutation,
} = settingsApi;
