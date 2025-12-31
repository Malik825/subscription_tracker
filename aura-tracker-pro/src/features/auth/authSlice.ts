import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import { LoginInput, RegisterInput } from "@/schemas/auth";

// Define User type based on backend response (approximate for now)
interface User {
    _id: string;
    username: string;
    email: string;
    plan: "free" | "pro";
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
}

// Check localStorage for existing session
const initialState: AuthState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
};

export const registerUser = createAsyncThunk(
    "auth/register",
    async (data: RegisterInput, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/signup", data);
            return response.data; // Expected { success: true, message: "...", data: { user, token } }
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
                return rejectWithValue(axiosError.response?.data?.message || axiosError.message || 'Registration failed');
            }
            return rejectWithValue('Registration failed');
        }
    }
);

export const loginUser = createAsyncThunk(
    "auth/login",
    async (data: LoginInput, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/login", data);
            return response.data; // Expected { success: true, message: "...", data: { user } }
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
                return rejectWithValue(axiosError.response?.data?.message || axiosError.message || 'Login failed');
            }
            return rejectWithValue('Login failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await api.post("/auth/logout");
            return;
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
                return rejectWithValue(axiosError.response?.data?.message || axiosError.message || 'Logout failed');
            }
            return rejectWithValue('Logout failed');
        }
    }
);

export const checkAuth = createAsyncThunk(
    "auth/check",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/auth/me");
            return response.data; // Expected { success: true, data: { user } }
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
                return rejectWithValue(axiosError.response?.data?.message || axiosError.message || 'Auth check failed');
            }
            return rejectWithValue('Auth check failed');
        }
    }
);

export const upgradeUser = createAsyncThunk(
    "auth/upgrade",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.put("/users/upgrade");
            return response.data; // Expected { success: true, data: { user } }
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
                return rejectWithValue(axiosError.response?.data?.message || axiosError.message || 'Upgrade failed');
            }
            return rejectWithValue('Upgrade failed');
        }
    }
);

export const createStripeCheckout = createAsyncThunk(
    "auth/stripeCheckout",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post("/payments/stripe/checkout");
            return response.data; // Expected { success: true, data: { checkoutUrl } }
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
                return rejectWithValue(axiosError.response?.data?.message || axiosError.message || 'Stripe checkout failed');
            }
            return rejectWithValue('Stripe checkout failed');
        }
    }
);

export const initializePaystack = createAsyncThunk(
    "auth/paystackInitialize",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post("/payments/paystack/initialize");
            return response.data; // Expected { success: true, data: { checkoutUrl } }
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
                return rejectWithValue(axiosError.response?.data?.message || axiosError.message || 'Paystack initialization failed');
            }
            return rejectWithValue('Paystack initialization failed');
        }
    }
);

export const forgotPassword = createAsyncThunk(
    "auth/forgotPassword",
    async (email: string, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/forgot-password", { email });
            return response.data;
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
                return rejectWithValue(axiosError.response?.data?.message || axiosError.message || 'Forgot password request failed');
            }
            return rejectWithValue('Forgot password request failed');
        }
    }
);

export const resetPassword = createAsyncThunk(
    "auth/resetPassword",
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/reset-password", data);
            return response.data;
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
                return rejectWithValue(axiosError.response?.data?.message || axiosError.message || 'Reset password failed');
            }
            return rejectWithValue('Reset password failed');
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Register
        builder.addCase(registerUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false;
            // Assuming backend response structure: { data: { user } }
            const { user } = action.payload.data;
            state.user = user;
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Login
        builder.addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            const { user } = action.payload.data;
            state.user = user;
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Logout
        builder.addCase(logoutUser.fulfilled, (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
        });
        builder.addCase(logoutUser.rejected, (state) => {
            // Even if backend fails, clear local state
            state.user = null;
            state.token = null;
        });

        // Check Auth
        builder.addCase(checkAuth.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(checkAuth.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = action.payload.data.user;
        });
        builder.addCase(checkAuth.rejected, (state) => {
            state.isLoading = false;
            state.user = null;
        });

        // Upgrade
        builder.addCase(upgradeUser.fulfilled, (state, action) => {
            state.user = action.payload.data;
        });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
