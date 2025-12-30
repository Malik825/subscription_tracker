import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";

// Define Subscription type
export interface Subscription {
    _id: string;
    name: string;
    price: number;
    currency: string;
    frequency: "Monthly" | "Yearly" | "Weekly" | "Daily";
    category: "Entertainment" | "Food" | "Travel" | "Shopping" | "Subscription" | "Others";
    status: "Active" | "Cancelled" | "Expired" | "Suspended";
    startDate: string;
    renewalDate: string;
    website?: string;
    workflowStatus?: "idle" | "running" | "completed" | "failed";
}

export interface SubscriptionStats {
    overview: {
        total: number;
        active: number;
        inactive: number;
    };
    spending: {
        totalMonthly: number;
        totalYearly: number;
        byCategory: Record<string, { monthly: number; yearly: number }>;
        byCurrency: Record<string, { monthly: number; yearly: number }>;
    };
    upcomingRenewals: {
        id: string;
        name: string;
        renewalDate: string;
        daysUntil: number;
        price: number;
        currency: string;
    }[];
    workflow: {
        running: number;
        completed: number;
        failed: number;
        cancelled: number;
    };
}

export const useSubscriptions = () => {
    const { user } = useAuth();

    return useInfiniteQuery({
        queryKey: ["subscriptions", user?._id],
        queryFn: async ({ pageParam = 1 }) => {
            if (!user?._id) return { data: [], pagination: { totalPages: 0, currentPage: 1 } };
            const response = await api.get(`/subscriptions/user/${user._id}?page=${pageParam}&limit=10`);
            return response.data;
        },
        getNextPageParam: (lastPage) => {
            const { currentPage, totalPages } = lastPage.pagination;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        initialPageParam: 1,
        enabled: !!user?._id,
    });
};

export const useSeedSubscriptions = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async () => {
            const response = await api.post("/subscriptions/seed");
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscriptions", user?._id] });
            queryClient.invalidateQueries({ queryKey: ["subscription-stats", user?._id] });
        },
    });
};

export const useSubscriptionStats = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["subscription-stats", user?._id],
        queryFn: async () => {
            if (!user?._id) return null;
            const response = await api.get("/subscriptions/stats");
            return response.data.data as SubscriptionStats;
        },
        enabled: !!user?._id,
    });
};

export const useCreateSubscription = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post("/subscriptions", data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscriptions", user?._id] });
            queryClient.invalidateQueries({ queryKey: ["subscription-stats", user?._id] });
        },
    });
};

export const useUpdateSubscription = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await api.patch(`/subscriptions/${id}`, data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscriptions", user?._id] });
            queryClient.invalidateQueries({ queryKey: ["subscription-stats", user?._id] });
        },
    });
};

export const useDeleteSubscription = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await api.delete(`/subscriptions/${id}`);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscriptions", user?._id] });
            queryClient.invalidateQueries({ queryKey: ["subscription-stats", user?._id] });
        },
    });
};
