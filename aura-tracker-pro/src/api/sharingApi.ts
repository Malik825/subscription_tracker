import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface SharingGroupMember {
  user: {
    _id: string;
    username: string;
    email: string;
  };
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

export interface GroupInvitation {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  email: string;
  role: "admin" | "member";
  invitedBy: {
    _id: string;
    username: string;
    email: string;
  };
  invitedAt: string;
  status: "pending" | "accepted" | "declined" | "expired";
  expiresAt: string;
}

export interface UserInvitation {
  _id: string;
  group: {
    _id: string;
    name: string;
    description?: string;
    memberCount: number;
    subscriptionCount: number;
  };
  role: "admin" | "member";
  invitedBy: {
    _id: string;
    username: string;
    email: string;
  };
  invitedAt: string;
  expiresAt: string;
}

export interface SharedSubscription {
  subscription: {
    _id: string;
    name: string;
    price: number;
    currency: string;
  };
  splitType: "equal" | "custom" | "percentage";
  customSplits: Array<{
    user: string;
    amount?: number;
    percentage?: number;
  }>;
  addedAt: string;
}

export interface SharingGroup {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: SharingGroupMember[];
  invitations: GroupInvitation[];
  sharedSubscriptions: SharedSubscription[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalMonthly?: number;
  userShare?: number;
  memberCount?: number;
  subscriptionCount?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const sharingApi = createApi({
  reducerPath: "sharingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5500/api/v1",
    credentials: "include",
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ["SharingGroups", "SharingGroup", "Invitations"],
  endpoints: (builder) => ({
    // ========== INVITATION ENDPOINTS ==========
    // Get user's pending invitations
    getUserInvitations: builder.query<ApiResponse<UserInvitation[]>, void>({
      query: () => "/sharing-groups/invitations",
      providesTags: ["Invitations"],
    }),

    // Accept invitation
    acceptInvitation: builder.mutation<ApiResponse<SharingGroup>, string>({
      query: (groupId) => ({
        url: `/sharing-groups/invitations/${groupId}/accept`,
        method: "POST",
      }),
      invalidatesTags: ["Invitations", "SharingGroups"],
    }),

    // Decline invitation
    declineInvitation: builder.mutation<ApiResponse<void>, string>({
      query: (groupId) => ({
        url: `/sharing-groups/invitations/${groupId}/decline`,
        method: "POST",
      }),
      invalidatesTags: ["Invitations"],
    }),

    // Cancel invitation (by admin)
    cancelInvitation: builder.mutation<
      ApiResponse<void>,
      { groupId: string; invitationId: string }
    >({
      query: ({ groupId, invitationId }) => ({
        url: `/sharing-groups/${groupId}/invitations/${invitationId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { groupId }) => [
        { type: "SharingGroup", id: groupId },
        { type: "SharingGroups", id: "LIST" },
      ],
    }),

    // ========== GROUP ENDPOINTS ==========
    // Get all user's sharing groups
    getUserSharingGroups: builder.query<ApiResponse<SharingGroup[]>, void>({
      query: () => "/sharing-groups",
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "SharingGroup" as const,
                id: _id,
              })),
              { type: "SharingGroups" as const, id: "LIST" },
            ]
          : [{ type: "SharingGroups" as const, id: "LIST" }],
    }),

    // Get sharing group by ID
    getSharingGroupById: builder.query<ApiResponse<SharingGroup>, string>({
      query: (id) => `/sharing-groups/${id}`,
      providesTags: (result, error, id) => [{ type: "SharingGroup", id }],
    }),

    // Create sharing group
    createSharingGroup: builder.mutation<
      ApiResponse<SharingGroup>,
      { name: string; description?: string; members?: string[] }
    >({
      query: (data) => ({
        url: "/sharing-groups",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "SharingGroups", id: "LIST" }],
    }),

    // Update sharing group
    updateSharingGroup: builder.mutation<
      ApiResponse<SharingGroup>,
      { id: string; data: { name?: string; description?: string } }
    >({
      query: ({ id, data }) => ({
        url: `/sharing-groups/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SharingGroup", id },
        { type: "SharingGroups", id: "LIST" },
      ],
    }),

    // Delete sharing group
    deleteSharingGroup: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/sharing-groups/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "SharingGroups", id: "LIST" }],
    }),

    // Add member to group (sends invitation)
    addMember: builder.mutation<
      ApiResponse<SharingGroup>,
      { id: string; data: { email: string; role: "member" | "admin" } }
    >({
      query: ({ id, data }) => ({
        url: `/sharing-groups/${id}/members`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SharingGroup", id },
        { type: "SharingGroups", id: "LIST" },
      ],
    }),

    // Remove member from group
    removeMember: builder.mutation<
      ApiResponse<SharingGroup>,
      { id: string; memberId: string }
    >({
      query: ({ id, memberId }) => ({
        url: `/sharing-groups/${id}/members/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SharingGroup", id },
        { type: "SharingGroups", id: "LIST" },
      ],
    }),

    // Add subscription to group
    addSubscriptionToGroup: builder.mutation<
      ApiResponse<SharingGroup>,
      {
        id: string;
        data: {
          subscriptionId: string;
          splitType?: "equal" | "custom" | "percentage";
          customSplits?: Array<{
            user: string;
            amount?: number;
            percentage?: number;
          }>;
        };
      }
    >({
      query: ({ id, data }) => ({
        url: `/sharing-groups/${id}/subscriptions`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SharingGroup", id },
        { type: "SharingGroups", id: "LIST" },
      ],
    }),

    // Remove subscription from group
    removeSubscriptionFromGroup: builder.mutation<
      ApiResponse<SharingGroup>,
      { id: string; subscriptionId: string }
    >({
      query: ({ id, subscriptionId }) => ({
        url: `/sharing-groups/${id}/subscriptions/${subscriptionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SharingGroup", id },
        { type: "SharingGroups", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetUserSharingGroupsQuery,
  useGetSharingGroupByIdQuery,
  useCreateSharingGroupMutation,
  useUpdateSharingGroupMutation,
  useDeleteSharingGroupMutation,
  useAddMemberMutation,
  useRemoveMemberMutation,
  useAddSubscriptionToGroupMutation,
  useRemoveSubscriptionFromGroupMutation,
  // New invitation hooks
  useGetUserInvitationsQuery,
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
  useCancelInvitationMutation,
} = sharingApi;
