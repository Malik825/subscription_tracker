import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import { LoginInput, RegisterInput } from "@/schemas/auth";

// Define User type based on backend response (approximate for now)
interface User {
    _id: string;
    username: string;
    email: string;
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
        } catch (error: any) {
            if (error.response && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

export const loginUser = createAsyncThunk(
    "auth/login",
    async (data: LoginInput, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/login", data);
            return response.data; // Expected { success: true, message: "...", data: { user } }
        } catch (error: any) {
            if (error.response && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await api.post("/auth/logout");
            return;
        } catch (error: any) {
            if (error.response && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

export const checkAuth = createAsyncThunk(
    "auth/check",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/auth/me");
            return response.data; // Expected { success: true, data: { user } }
        } catch (error: any) {
            if (error.response && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            } else {
                return rejectWithValue(error.message);
            }
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
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
