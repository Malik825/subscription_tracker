import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5500/api/v1";

export interface Notification {
  _id: string;
  user: string;
  subscription?: string;
  type:
    | "renewal"
    | "warning"
    | "success"
    | "reminder"
    | "payment_failed"
    | "price_change"
    | "trial_ending"
    | "info";
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
  notifications: Notification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
  unreadCount: number;
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
  endpoints: (builder) => ({
    // Get all notifications
    getNotifications: builder.query<
      NotificationsResponse,
      { read?: boolean; type?: string; limit?: number; page?: number }
    >({
      query: (params) => ({
        url: "",
        params,
      }),
      providesTags: ["Notifications"],
    }),

    // Get single notification
    getNotificationById: builder.query<{ data: Notification }, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Notifications", id }],
    }),

    // Get unread count
    getUnreadCount: builder.query<{ data: { unreadCount: number } }, void>({
      query: () => "/unread/count",
      providesTags: ["UnreadCount"],
    }),

    // Get notification stats
    getNotificationStats: builder.query<{ data: NotificationStats }, void>({
      query: () => "/stats",
      providesTags: ["Stats"],
    }),

    // Create notification
    createNotification: builder.mutation<
      { data: Notification },
      {
        type: Notification["type"];
        title: string;
        message: string;
        priority?: Notification["priority"];
        metadata?: Notification["metadata"];
      }
    >({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notifications", "UnreadCount", "Stats"],
    }),

    // Mark as read
    markAsRead: builder.mutation<{ data: Notification }, string>({
      query: (id) => ({
        url: `/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications", "UnreadCount", "Stats"],
    }),

    // Mark as unread
    markAsUnread: builder.mutation<{ data: Notification }, string>({
      query: (id) => ({
        url: `/${id}/unread`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications", "UnreadCount", "Stats"],
    }),

    // Mark all as read
    markAllAsRead: builder.mutation<{ data: { modifiedCount: number } }, void>({
      query: () => ({
        url: "/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications", "UnreadCount", "Stats"],
    }),

    // Bulk mark as read
    bulkMarkAsRead: builder.mutation<
      { data: { modifiedCount: number } },
      string[]
    >({
      query: (notificationIds) => ({
        url: "/bulk/read",
        method: "PATCH",
        body: { notificationIds },
      }),
      invalidatesTags: ["Notifications", "UnreadCount", "Stats"],
    }),

    // Delete notification
    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications", "UnreadCount", "Stats"],
    }),

    // Delete all read
    deleteAllRead: builder.mutation<{ data: { deletedCount: number } }, void>({
      query: () => ({
        url: "/read",
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications", "UnreadCount", "Stats"],
    }),

    // Delete all notifications
    deleteAllNotifications: builder.mutation<
      { data: { deletedCount: number } },
      void
    >({
      query: () => ({
        url: "/all",
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications", "UnreadCount", "Stats"],
    }),

    // Bulk delete
    bulkDeleteNotifications: builder.mutation<
      { data: { deletedCount: number } },
      string[]
    >({
      query: (notificationIds) => ({
        url: "/bulk",
        method: "DELETE",
        body: { notificationIds },
      }),
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
  useBulkMarkAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllReadMutation,
  useDeleteAllNotificationsMutation,
  useBulkDeleteNotificationsMutation,
} = notificationsApi;
