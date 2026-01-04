import { useCheckAuthQuery } from "@/api/authApi";

/**
 * Custom hook to access authentication state
 * Reads directly from authApi RTK Query cache
 * This replaces the old Redux authSlice approach
 */
export const useAuth = () => {
  const { data, isLoading, error, refetch } = useCheckAuthQuery(undefined, {
    // Automatically check auth on mount and when focus returns
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const user = data?.data?.user;
  const isAuthenticated = !!user && !error;

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    refetch,
  };
};
