import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define types for better type safety
interface SettingsResponse {
  data: {
    profile?: {
      avatarUrl?: string;
      username?: string;
    };
    preferences?: {
      darkMode?: boolean;
      currency?: string;
    };
    notifications?: {
      emailDigest?: boolean;
      pushNotifications?: boolean;
      renewalReminders?: boolean;
      marketingEmails?: boolean;
    };
    billing?: {
      plan?: string;
      billingCycle?: string;
      status?: string;
    };
  };
}

interface ProfileUpdateData {
  username: string;
}

interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  data?: {
    username: string;
  };
}

interface PreferencesUpdateData {
  darkMode?: boolean;
  currency?: string;
}

interface PreferencesUpdateResponse {
  success: boolean;
  message: string;
  data?: PreferencesUpdateData;
}

interface NotificationsUpdateData {
  emailDigest?: boolean;
  pushNotifications?: boolean;
  renewalReminders?: boolean;
  marketingEmails?: boolean;
}

interface NotificationsUpdateResponse {
  success: boolean;
  message: string;
  data?: NotificationsUpdateData;
}

interface BillingUpdateData {
  plan?: string;
  billingCycle?: string;
}

interface BillingUpdateResponse {
  success: boolean;
  message: string;
  data?: BillingUpdateData;
}

interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

interface ResetSettingsResponse {
  success: boolean;
  message: string;
}

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5500/api",
    credentials: "include",
  }),
  tagTypes: ["Settings", "User"],
  endpoints: (builder) => ({
    // Get user settings - no arguments required
    getSettings: builder.query<SettingsResponse, void>({
      query: () => "/settings",
      providesTags: ["Settings"],
    }),

    // Update profile settings
    updateProfile: builder.mutation<ProfileUpdateResponse, ProfileUpdateData>({
      query: (data) => ({
        url: "/settings/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings", "User"],
    }),

    // Update preferences
    updatePreferences: builder.mutation<
      PreferencesUpdateResponse,
      PreferencesUpdateData
    >({
      query: (data) => ({
        url: "/settings/preferences",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),

    // Update notification settings
    updateNotifications: builder.mutation<
      NotificationsUpdateResponse,
      NotificationsUpdateData
    >({
      query: (data) => ({
        url: "/settings/notifications",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),

    // Update billing settings
    updateBilling: builder.mutation<BillingUpdateResponse, BillingUpdateData>({
      query: (data) => ({
        url: "/settings/billing",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),

    // Delete account
    deleteAccount: builder.mutation<DeleteAccountResponse, string>({
      query: (password) => ({
        url: "/settings/account",
        method: "DELETE",
        body: { password },
      }),
      invalidatesTags: ["Settings", "User"],
    }),

    // Reset settings to default
    resetSettings: builder.mutation<ResetSettingsResponse, void>({
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
