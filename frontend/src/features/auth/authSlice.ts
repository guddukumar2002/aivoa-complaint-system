import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@/shared/utils/api";
import type { AuthState, User, ApiErrorResponse } from "@/shared/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as ApiErrorResponse | undefined;
    return body?.error?.message ?? err.message ?? fallback;
  }
  return fallback;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("access_token"),
  loading: false,
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const login = createAsyncThunk(
  "auth/login",
  async (creds: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const form = new URLSearchParams({
        username: creds.email,
        password: creds.password,
      });
      const { data } = await api.post<{ access_token: string }>(
        "/auth/login",
        form,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      localStorage.setItem("access_token", data.access_token);
      const { data: user } = await api.get<User>("/auth/me");
      return { token: data.access_token, user };
    } catch (err) {
      return rejectWithValue(extractMessage(err, "Invalid email or password"));
    }
  }
);

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<User>("/auth/me");
      return data;
    } catch (err) {
      return rejectWithValue(extractMessage(err, "Session expired"));
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    payload: { email: string; full_name: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post<User>("/auth/register", payload);
      return data;
    } catch (err) {
      return rejectWithValue(extractMessage(err, "Registration failed"));
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("access_token");
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    // Called by baseApi on 401
    setToken: (state, { payload }: PayloadAction<string | null>) => {
      state.token = payload;
      if (!payload) {
        state.user = null;
        localStorage.removeItem("access_token");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.token = payload.token;
        state.user = payload.user;
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      // fetchMe
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem("access_token");
      })
      // register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      });
  },
});

export const { logout, clearAuthError, setToken } = authSlice.actions;
export default authSlice.reducer;
