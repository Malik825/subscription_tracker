import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5500/api",
    credentials: "include",
  }),
  tagTypes: ["Settings"],
  endpoints: (builder) => ({
    // Get user settings
    getSettings: builder.query({
      query: () => "/settings",
      providesTags: ["Settings"],
    }),

    // Update profile settings
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/settings/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),

    // Update preferences
    updatePreferences: builder.mutation({
      query: (data) => ({
        url: "/settings/preferences",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),

    // Update notification settings
    updateNotifications: builder.mutation({
      query: (data) => ({
        url: "/settings/notifications",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),

    // Update billing settings
    updateBilling: builder.mutation({
      query: (data) => ({
        url: "/settings/billing",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),

    // Delete account
    deleteAccount: builder.mutation({
      query: (password) => ({
        url: "/settings/account",
        method: "DELETE",
        body: { password },
      }),
      invalidatesTags: ["Settings"],
    }),

    // Reset settings to default
    resetSettings: builder.mutation({
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
