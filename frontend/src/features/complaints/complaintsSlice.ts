import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/shared/utils/api";
import { showToast } from "@/app/toastSlice";
import type { Complaint, ComplaintListResponse } from "@/shared/types";

interface ComplaintsState {
  items: Complaint[];
  total: number;
  page: number;
  pageSize: number;
  selected: Complaint | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  filters: { status?: string; priority?: string; category?: string };
}

const initialState: ComplaintsState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
  selected: null,
  loading: false,
  submitting: false,
  error: null,
  filters: {},
};

export const fetchComplaints = createAsyncThunk(
  "complaints/fetchAll",
  async (
    params: { page?: number; status?: string; priority?: string; category?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get<ComplaintListResponse>("/complaints", { params });
      return data;
    } catch {
      return rejectWithValue("Failed to load complaints");
    }
  }
);

export const fetchComplaint = createAsyncThunk(
  "complaints/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get<Complaint>(`/complaints/${id}`);
      return data;
    } catch {
      return rejectWithValue("Complaint not found");
    }
  }
);

export const createComplaint = createAsyncThunk(
  "complaints/create",
  async (
    payload: { title: string; description: string; category: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post<Complaint>("/complaints", payload);
      return data;
    } catch {
      return rejectWithValue("Failed to create complaint");
    }
  }
);

export const updateComplaint = createAsyncThunk(
  "complaints/update",
  async ({ id, ...payload }: Partial<Complaint> & { id: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.put<Complaint>(`/complaints/${id}`, payload);
      return data;
    } catch {
      return rejectWithValue("Failed to update complaint");
    }
  }
);

export const deleteComplaint = createAsyncThunk(
  "complaints/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/complaints/${id}`);
      return id;
    } catch {
      return rejectWithValue("Failed to delete complaint");
    }
  }
);

const complaintsSlice = createSlice({
  name: "complaints",
  initialState,
  reducers: {
    setSelected: (state, { payload }: PayloadAction<Complaint | null>) => {
      state.selected = payload;
    },
    setFilters: (state, { payload }: PayloadAction<ComplaintsState["filters"]>) => {
      state.filters = payload;
      state.page = 1;
    },
    setPage: (state, { payload }: PayloadAction<number>) => { state.page = payload; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchComplaints.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload.items;
        state.total = payload.total;
        state.page = payload.page;
        state.pageSize = payload.page_size;
      })
      .addCase(fetchComplaints.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(fetchComplaint.fulfilled, (state, { payload }) => { state.selected = payload; })
      .addCase(createComplaint.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(createComplaint.fulfilled, (state, { payload }) => {
        state.submitting = false;
        state.items.unshift(payload);
        state.total += 1;
      })
      .addCase(createComplaint.rejected, (state, { payload }) => {
        state.submitting = false;
        state.error = payload as string;
      })
      .addCase(updateComplaint.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((c) => c.id === payload.id);
        if (idx !== -1) state.items[idx] = payload;
        if (state.selected?.id === payload.id) state.selected = payload;
      })
      .addCase(deleteComplaint.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((c) => c.id !== payload);
        state.total -= 1;
        if (state.selected?.id === payload) state.selected = null;
      });
  },
});

export const { setSelected, setFilters, setPage, clearError } = complaintsSlice.actions;
export default complaintsSlice.reducer;

// ── Toast-dispatching thunk wrappers ──────────────────────────────────────────

export const createComplaintWithToast = (payload: { title: string; description: string; category: string }) =>
  async (dispatch: any) => {
    const result = await dispatch(createComplaint(payload));
    if (createComplaint.fulfilled.match(result)) {
      dispatch(showToast({ message: "Complaint created successfully", severity: "success" }));
    } else {
      dispatch(showToast({ message: (result.payload as string) ?? "Failed to create complaint", severity: "error" }));
    }
    return result;
  };

export const updateComplaintWithToast = (payload: Partial<Complaint> & { id: string }) =>
  async (dispatch: any) => {
    const result = await dispatch(updateComplaint(payload));
    if (updateComplaint.fulfilled.match(result)) {
      dispatch(showToast({ message: "Complaint updated", severity: "success" }));
    } else {
      dispatch(showToast({ message: "Failed to update complaint", severity: "error" }));
    }
    return result;
  };

export const deleteComplaintWithToast = (id: string) =>
  async (dispatch: any) => {
    const result = await dispatch(deleteComplaint(id));
    if (deleteComplaint.fulfilled.match(result)) {
      dispatch(showToast({ message: "Complaint deleted", severity: "success" }));
    } else {
      dispatch(showToast({ message: "Failed to delete complaint", severity: "error" }));
    }
    return result;
  };
