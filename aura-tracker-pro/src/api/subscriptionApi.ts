import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Subscription {
  _id: string;
  name: string;
  price: number;
  currency: string;
  frequency: string;
  billingCycle: string;
  category: string;
  startDate: string;
  renewalDate: string;
  status: string;
  website?: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStats {
  overview: {
    total: number;
    active: number;
    suspended: number;
    cancelled: number;
    expired: number;
  };
  spending: {
    totalMonthly: number;
    totalYearly: number;
    byCategory: Record<string, number>;
  };
  upcomingRenewals: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface CreateSubscriptionData {
  name: string;
  price: number;
  currency: string;
  frequency: string;
  category: string;
  startDate: string | Date;
  status: string;
  website?: string;
  renewalDate?: string | Date;
}

export interface UpdateSubscriptionData {
  name?: string;
  price?: number;
  currency?: string;
  frequency?: string;
  category?: string;
  startDate?: string | Date;
  status?: string;
  website?: string;
  renewalDate?: string | Date;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "/api",
    credentials: "include",
  }),
  tagTypes: ["Subscriptions", "Subscription", "SubscriptionStats"],
  endpoints: (builder) => ({
    // Get all subscriptions with pagination
    getSubscriptions: builder.query<
      PaginatedResponse<Subscription>,
      { page?: number; limit?: number; category?: string; status?: string }
    >({
      query: ({ page = 1, limit = 20, category, status }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(category && { category }),
          ...(status && { status }),
        });
        return `/subscriptions?${params}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Subscription" as const,
                id: _id,
              })),
              { type: "Subscriptions" as const, id: "LIST" },
            ]
          : [{ type: "Subscriptions" as const, id: "LIST" }],
    }),

    // Get subscription by ID
    getSubscriptionById: builder.query<ApiResponse<Subscription>, string>({
      query: (id) => `/subscriptions/${id}`,
      providesTags: (result, error, id) => [{ type: "Subscription", id }],
    }),

    // Get subscription statistics
    getSubscriptionStats: builder.query<ApiResponse<SubscriptionStats>, void>({
      query: () => "/subscriptions/stats",
      providesTags: ["SubscriptionStats"],
    }),

    // Create subscription
    createSubscription: builder.mutation<
      ApiResponse<Subscription>,
      CreateSubscriptionData
    >({
      query: (data) => ({
        url: "/subscriptions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "Subscriptions", id: "LIST" },
        "SubscriptionStats",
      ],
    }),

    // Update subscription
    updateSubscription: builder.mutation<
      ApiResponse<Subscription>,
      { id: string; data: UpdateSubscriptionData }
    >({
      query: ({ id, data }) => ({
        url: `/subscriptions/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Subscription", id },
        { type: "Subscriptions", id: "LIST" },
        "SubscriptionStats",
      ],
    }),

    // Delete subscription
    deleteSubscription: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/subscriptions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Subscriptions", id: "LIST" },
        "SubscriptionStats",
      ],
    }),

    // Bulk delete subscriptions
    bulkDeleteSubscriptions: builder.mutation<ApiResponse<void>, string[]>({
      query: (ids) => ({
        url: "/subscriptions/bulk-delete",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: [
        { type: "Subscriptions", id: "LIST" },
        "SubscriptionStats",
      ],
    }),

    // Export subscriptions
    exportSubscriptions: builder.mutation<
      Blob,
      { format: "csv" | "json"; ids?: string[] }
    >({
      query: ({ format, ids }) => ({
        url: "/subscriptions/export",
        method: "POST",
        body: { format, ids },
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetSubscriptionsQuery,
  useGetSubscriptionByIdQuery,
  useGetSubscriptionStatsQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useBulkDeleteSubscriptionsMutation,
  useExportSubscriptionsMutation,
} = subscriptionApi;
