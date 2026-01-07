import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG } from "@/api/api.config.ts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5500/api/v1";

export type NotificationType =
  | "renewal"
  | "warning"
  | "success"
  | "reminder"
  | "payment_failed"
  | "price_change"
  | "trial_ending"
  | "info";

export interface Notification {
  _id: string;
  user: string;
  subscription?: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  metadata?: {
    amount?: number;
    subscriptionName?: string;
    renewalDate?: string;
    oldPrice?: number;
    newPrice?: number;
    daysUntilRenewal?: number;
  };
  priority: "low" | "medium" | "high";
  delivered: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  timeAgo?: string;
}

export interface NotificationsResponseData {
  notifications: Notification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
  unreadCount: number;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: NotificationsResponseData;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  recentCount: number;
  byType: Array<{
    _id: string;
    count: number;
    unreadCount: number;
  }>;
}

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/notifications`,
    credentials: "include",
  }),
  tagTypes: ["Notifications", "UnreadCount", "Stats"],
  // ✅ ADDED: Keep cached data for longer
  keepUnusedDataFor: API_CONFIG.CACHE_DURATIONS.NOTIFICATIONS,
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationsResponseData,
      { read?: boolean; type?: string; limit?: number; page?: number }
    >({
      query: (params) => ({ url: "", params }),
      transformResponse: (response: NotificationsResponse) => response.data,
      providesTags: ["Notifications"],
    }),
    getNotificationById: builder.query<Notification, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Notification;
      }) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Notifications", id }],
    }),
    getUnreadCount: builder.query<{ unreadCount: number }, void>({
      query: () => "/unread/count",
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { unreadCount: number };
      }) => response.data,
      providesTags: ["UnreadCount"],
    }),
    getNotificationStats: builder.query<NotificationStats, void>({
      query: () => "/stats",
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: NotificationStats;
      }) => response.data,
      providesTags: ["Stats"],
    }),
    createNotification: builder.mutation<Notification, Partial<Notification>>({
      query: (body) => ({ url: "", method: "POST", body }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Notification;
      }) => response.data,
      invalidatesTags: ["Notifications", "UnreadCount", "Stats"],
    }),
    markAsRead: builder.mutation<Notification, string>({
      query: (id) => ({ url: `/${id}/read`, method: "PATCH" }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Notification;
      }) => response.data,
      invalidatesTags: ["Notifications", "UnreadCount", "Stats"],
    }),
    markAsUnread: builder.mutation<Notification, string>({
      query: (id) => ({ url: `/${id}/unread`, method: "PATCH" }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Notification;
      }) => response.data,
      invalidatesTags: ["Notifications", "UnreadCount", "Stats"],
    }),
    markAllAsRead: builder.mutation<{ modifiedCount: number }, void>({
      query: () => ({ url: "/read-all", method: "PATCH" }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { modifiedCount: number };
      }) => response.data,
      invalidatesTags: ["Notifications", "UnreadCount", "Stats"],
    }),
    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: ["Notifications", "UnreadCount", "Stats"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationByIdQuery,
  useGetUnreadCountQuery,
  useGetNotificationStatsQuery,
  useCreateNotificationMutation,
  useMarkAsReadMutation,
  useMarkAsUnreadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi;
