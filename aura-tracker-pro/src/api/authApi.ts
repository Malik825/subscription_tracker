import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginInput, RegisterInput } from "@/schemas/auth";

interface User {
  _id: string;
  username: string;
  email: string;
  plan: "free" | "pro";
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token?: string;
  };
}

interface CheckoutResponse {
  success: boolean;
  data: {
    checkoutUrl: string;
  };
}

interface MessageResponse {
  success: boolean;
  message: string;
}

interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
      baseUrl: import.meta.env.VITE_API_URL || "/api/v1",
       credentials: "include",
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterInput>({
      query: (data) => ({
        url: "/auth/signup",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    login: builder.mutation<AuthResponse, LoginInput>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    checkAuth: builder.query<AuthResponse, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    upgradeUser: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: "/users/upgrade",
        method: "PUT",
      }),
      invalidatesTags: ["User"],
    }),

    createStripeCheckout: builder.mutation<CheckoutResponse, void>({
      query: () => ({
        url: "/payments/stripe/checkout",
        method: "POST",
      }),
    }),

    initializePaystack: builder.mutation<CheckoutResponse, void>({
      query: () => ({
        url: "/payments/paystack/initialize",
        method: "POST",
      }),
    }),

    forgotPassword: builder.mutation<MessageResponse, string>({
      query: (email) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),

    resetPassword: builder.mutation<MessageResponse, ResetPasswordData>({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useCheckAuthQuery,
  useLazyCheckAuthQuery,
  useUpgradeUserMutation,
  useCreateStripeCheckoutMutation,
  useInitializePaystackMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
