import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * User Type
 * Matches your backend response structure
 */
export interface User {
  _id: string;
  username: string;
  email: string;
  plan: "free" | "pro";
}

/**
 * Auth Store State & Actions
 */
interface AuthStore {
  // State
  user: User | null;

  // Actions
  setUser: (user: User | null) => void;
  clearUser: () => void;
  updateUserPlan: (plan: "free" | "pro") => void;
}

/**
 * Zustand Auth Store
 *
 * This store manages CLIENT-SIDE user state (not server state).
 * It persists to localStorage so user data survives page refreshes.
 *
 * Usage:
 * ```tsx
 * const { user, setUser, clearUser } = useAuthStore();
 * ```
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,

      // Set user (from login/register/checkAuth)
      setUser: (user) => set({ user }),

      // Clear user (from logout)
      clearUser: () => set({ user: null }),

      // Update user plan (from upgrade)
      updateUserPlan: (plan) =>
        set((state) => ({
          user: state.user ? { ...state.user, plan } : null,
        })),
    }),
    {
      name: "auth-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),

      // Optional: Only persist the user data
      partialize: (state) => ({ user: state.user }),
    }
  )
);

/**
 * Selectors (Optional but recommended for performance)
 *
 * These prevent unnecessary re-renders by selecting specific state slices
 */
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => !!state.user;
export const selectIsPro = (state: AuthStore) => state.user?.plan === "pro";

/**
 * Hook Usage Examples:
 *
 * // Get everything
 * const { user, setUser, clearUser } = useAuthStore();
 *
 * // Get only what you need (better performance)
 * const user = useAuthStore(selectUser);
 * const isAuthenticated = useAuthStore(selectIsAuthenticated);
 * const isPro = useAuthStore(selectIsPro);
 *
 * // Subscribe to changes
 * useEffect(() => {
 *   const unsubscribe = useAuthStore.subscribe(
 *     (state) => console.log('User changed:', state.user)
 *   );
 *   return unsubscribe;
 * }, []);
 */
