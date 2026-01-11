import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Payment {
  _id: string;
  sharingGroup: {
    _id: string;
    name: string;
  };
  subscription: {
    _id: string;
    name: string;
    price: number;
  };
  payer: {
    _id: string;
    username: string;
    email: string;
  };
  amount: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  dueDate: string;
  paidDate?: string;
  paymentMethod?:
    | "cash"
    | "card"
    | "bank_transfer"
    | "paypal"
    | "venmo"
    | "other";
  notes?: string;
  remindersSent: number;
  lastReminderDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  totalExpected: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  payments: Payment[];
}

export interface UserPaymentSummary {
  totalOwed: number;
  totalPaid: number;
  overdueCount: number;
  pendingCount: number;
}

export interface CreatePaymentData {
  sharingGroupId: string;
  subscriptionId: string;
  payerId: string;
  amount: number;
  dueDate: string;
  notes?: string;
}

export interface UpdatePaymentStatusData {
  status: "pending" | "paid" | "overdue" | "cancelled";
  notes?: string;
}

export interface MarkAsPaidData {
  paymentMethod?:
    | "cash"
    | "card"
    | "bank_transfer"
    | "paypal"
    | "venmo"
    | "other";
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface UserPaymentsResponse {
  payments: Payment[];
  summary: UserPaymentSummary;
}

export const paymentTrackingApi = createApi({
  reducerPath: "paymentTrackingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "/api",
    credentials: "include",
  }),
  tagTypes: ["Payments", "Payment", "GroupPayments", "UserPayments"],
  endpoints: (builder) => ({
    createPaymentRecord: builder.mutation<
      ApiResponse<Payment>,
      CreatePaymentData
    >({
      query: (data) => ({
        url: "/payment-tracking",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payments", "GroupPayments", "UserPayments"],
    }),

    getUserPayments: builder.query<
      ApiResponse<UserPaymentsResponse>,
      { status?: string }
    >({
      query: ({ status }) => ({
        url: "/payment-tracking/user",
        params: status ? { status } : {},
      }),
      providesTags: ["UserPayments"],
    }),

    getGroupPayments: builder.query<
      ApiResponse<Payment[]>,
      { groupId: string; status?: string; startDate?: string; endDate?: string }
    >({
      query: ({ groupId, status, startDate, endDate }) => ({
        url: `/payment-tracking/group/${groupId}`,
        params: {
          ...(status && { status }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        },
      }),
      providesTags: (result, error, { groupId }) => [
        { type: "GroupPayments", id: groupId },
      ],
    }),

    getPaymentSummary: builder.query<ApiResponse<PaymentSummary>, string>({
      query: (groupId) => `/payment-tracking/group/${groupId}/summary`,
      providesTags: (result, error, groupId) => [
        { type: "GroupPayments", id: groupId },
      ],
    }),

    markPaymentAsPaid: builder.mutation<
      ApiResponse<Payment>,
      { id: string; data: MarkAsPaidData }
    >({
      query: ({ id, data }) => ({
        url: `/payment-tracking/${id}/mark-paid`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Payments", "GroupPayments", "UserPayments"],
    }),

    updatePaymentStatus: builder.mutation<
      ApiResponse<Payment>,
      { id: string; data: UpdatePaymentStatusData }
    >({
      query: ({ id, data }) => ({
        url: `/payment-tracking/${id}/status`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Payments", "GroupPayments", "UserPayments"],
    }),

    sendPaymentReminder: builder.mutation<ApiResponse<Payment>, string>({
      query: (id) => ({
        url: `/payment-tracking/${id}/remind`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Payment", id }],
    }),

    deletePaymentRecord: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/payment-tracking/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Payments", "GroupPayments", "UserPayments"],
    }),

    checkOverduePayments: builder.mutation<
      ApiResponse<{ modifiedCount: number }>,
      void
    >({
      query: () => ({
        url: "/payment-tracking/check-overdue",
        method: "POST",
      }),
      invalidatesTags: ["Payments", "GroupPayments", "UserPayments"],
    }),
  }),
});

export const {
  useCreatePaymentRecordMutation,
  useGetUserPaymentsQuery,
  useGetGroupPaymentsQuery,
  useGetPaymentSummaryQuery,
  useMarkPaymentAsPaidMutation,
  useUpdatePaymentStatusMutation,
  useSendPaymentReminderMutation,
  useDeletePaymentRecordMutation,
  useCheckOverduePaymentsMutation,
} = paymentTrackingApi;
