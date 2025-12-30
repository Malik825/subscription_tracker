import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

    return useQuery({
        queryKey: ["subscriptions", user?._id],
        queryFn: async () => {
            if (!user?._id) return [];
            console.log("Fetching subscriptions for user:", user._id);
            const response = await api.get(`/subscriptions/user/${user._id}`);
            console.log("Subscription response:", response.data);
            return response.data.data as Subscription[];
        },
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
