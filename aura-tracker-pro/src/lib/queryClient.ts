import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 * 
 * This configures default behavior for all queries and mutations:
 * - Stale time: How long data is considered fresh
 * - Cache time: How long unused data stays in cache
 * - Retry logic: How many times to retry failed requests
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 1 minute (won't refetch during this time)
      staleTime: 60 * 1000,
      
      // Keep unused data in cache for 5 minutes
      gcTime: 5 * 60 * 1000,
      
      // Retry failed requests once
      retry: 1,
      
      // Refetch on window focus for auth-related queries
      refetchOnWindowFocus: true,
      
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Don't retry mutations automatically (user actions should be explicit)
      retry: false,
      
      // Optional: Add global error handling here if needed
      // onError: (error) => {
      //   console.error('Mutation error:', error);
      // },
    },
  },
});

/**
 * Query Keys
 * 
 * Centralized query keys for better cache management and type safety
 * These are used to identify and invalidate cached data
 */
export const queryKeys = {
  auth: {
    user: ['auth', 'user'] as const,
    check: ['auth', 'check'] as const,
  },
  payments: {
    stripe: ['payments', 'stripe'] as const,
    paystack: ['payments', 'paystack'] as const,
  },
} as const;