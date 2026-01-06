import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
    };
    unreadCount: number;
  };
}

export interface NotificationStats {
  success: boolean;
  message: string;
  data: {
    total: number;
    unread: number;
    read: number;
    recentCount: number;
    byType: Array<{
      _id: string;
      count: number;
      unreadCount: number;
    }>;
  };
}

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/notifications`,
    credentials: "include",
  }),
  tagTypes: ["Notifications", "UnreadCount", "Stats"],
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationsResponse,
      { read?: boolean; type?: string; limit?: number; page?: number }
    >({
      query: (params) => ({ url: "", params }),
      transformResponse: (response: { data: NotificationsResponse }) =>
        response.data,
      providesTags: ["Notifications"],
      keepUnusedDataFor: 60,
    }),
    getNotificationById: builder.query<{ data: Notification }, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Notifications", id }],
    }),
    getUnreadCount: builder.query<{ data: { unreadCount: number } }, void>({
      query: () => "/unread/count",
      providesTags: ["UnreadCount"],
      keepUnusedDataFor: 60,
    }),
    getNotificationStats: builder.query<{ data: NotificationStats }, void>({
      query: () => "/stats",
      providesTags: ["Stats"],
    }),
    createNotification: builder.mutation<
      { data: Notification },
      Partial<Notification>
    >({
      query: (body) => ({ url: "", method: "POST", body }),
      invalidatesTags: ["Notifications", "UnreadCount", "Stats"],
    }),
    markAsRead: builder.mutation<{ data: Notification }, string>({
      query: (id) => ({ url: `/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["Notifications", "UnreadCount", "Stats"],
    }),
    markAsUnread: builder.mutation<{ data: Notification }, string>({
      query: (id) => ({ url: `/${id}/unread`, method: "PATCH" }),
      invalidatesTags: ["Notifications", "UnreadCount", "Stats"],
    }),
    markAllAsRead: builder.mutation<{ data: { modifiedCount: number } }, void>({
      query: () => ({ url: "/read-all", method: "PATCH" }),
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
