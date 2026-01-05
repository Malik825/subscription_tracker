// src/api/userPreferencesApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5500/api/v1";


export interface UserPreferences {
  soundNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  renewalReminders: boolean;
  paymentAlerts: boolean;
  spendingInsights: boolean;
  priceChanges: boolean;
  newFeatures: boolean;
}

interface UpdatePreferenceRequest {
  key: keyof UserPreferences;
  value: boolean;
}

export const userPreferencesApi = createApi({
  reducerPath: "userPreferencesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["UserPreferences"],
  endpoints: (builder) => ({
    getUserPreferences: builder.query<{ data: UserPreferences }, void>({
      query: () => "/users/preferences",
      providesTags: ["UserPreferences"],
    }),
    updateUserPreference: builder.mutation<
      { data: UserPreferences },
      UpdatePreferenceRequest
    >({
      query: (body) => ({
        url: "/users/preferences",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["UserPreferences"],
    }),
  }),
});

export const { useGetUserPreferencesQuery, useUpdateUserPreferenceMutation } =
  userPreferencesApi;
