import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG } from "./api.config";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5500/api/v1";

// Define the user preferences data structure
export interface UserPreferencesData {
  soundNotifications: boolean;
  renewalReminders: boolean;
  paymentAlerts: boolean;
  spendingInsights: boolean;
  priceChanges: boolean;
  newFeatures: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
}

// API response wrapper
interface UserPreferencesResponse {
  success: boolean;
  message: string;
  data: UserPreferencesData;
}

// Update preference payload
export interface UpdatePreferencePayload {
  key: keyof UserPreferencesData;
  value: boolean;
}

export const userPreferencesApi = createApi({
  reducerPath: "userPreferencesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/user-preferences`,
    credentials: "include",
  }),
  tagTypes: ["UserPreferences"],
  // ✅ Keep cached data for 5 minutes
  keepUnusedDataFor: API_CONFIG.CACHE_DURATIONS.USER_PREFERENCES,
  endpoints: (builder) => ({
    // ✅ FIXED: Query now accepts void (no arguments required)
    getUserPreferences: builder.query<UserPreferencesResponse, void>({
      query: () => "",
      providesTags: ["UserPreferences"],
      // No polling - preferences rarely change
    }),

    updateUserPreference: builder.mutation<
      UserPreferencesResponse,
      UpdatePreferencePayload
    >({
      query: (data) => ({
        url: "",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["UserPreferences"],
    }),
  }),
});

export const { useGetUserPreferencesQuery, useUpdateUserPreferenceMutation } =
  userPreferencesApi;
