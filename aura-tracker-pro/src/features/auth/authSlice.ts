import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "@/api/authApi";
interface User {
  _id: string;
  username: string;
  email: string;
  plan: "free" | "pro";
  fullName?: string; // Add this (optional if not always present)
}
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    // Listen to RTK Query mutations and update local state
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, action) => {
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
      }
    );
    builder.addMatcher(
      authApi.endpoints.register.matchFulfilled,
      (state, action) => {
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
      }
    );
    builder.addMatcher(
      authApi.endpoints.checkAuth.matchFulfilled,
      (state, action) => {
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
      }
    );
    builder.addMatcher(authApi.endpoints.checkAuth.matchRejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
    builder.addMatcher(
      authApi.endpoints.upgradeUser.matchFulfilled,
      (state, action) => {
        state.user = action.payload.data.user;
      }
    );
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
