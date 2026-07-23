import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ComplaintFilters, ComplaintStatus, ComplaintPriority, ComplaintCategory } from "@/shared/types";

interface ComplaintUIState {
  selectedId: string | null;
  filters: ComplaintFilters;
  page: number;
  pageSize: number;
  // Tracks in-flight optimistic deletes so the UI can grey them out
  deletingIds: string[];
  // Tracks in-flight optimistic status updates
  updatingIds: string[];
}

const initialState: ComplaintUIState = {
  selectedId: null,
  filters: {},
  page: 1,
  pageSize: 20,
  deletingIds: [],
  updatingIds: [],
};

const complaintSlice = createSlice({
  name: "complaint",
  initialState,
  reducers: {
    selectComplaint: (state, { payload }: PayloadAction<string | null>) => {
      state.selectedId = payload;
    },
    setFilters: (state, { payload }: PayloadAction<ComplaintFilters>) => {
      state.filters = payload;
      state.page = 1;
    },
    setStatusFilter: (state, { payload }: PayloadAction<ComplaintStatus | undefined>) => {
      state.filters = { ...state.filters, status: payload };
      state.page = 1;
    },
    setPriorityFilter: (state, { payload }: PayloadAction<ComplaintPriority | undefined>) => {
      state.filters = { ...state.filters, priority: payload };
      state.page = 1;
    },
    setCategoryFilter: (state, { payload }: PayloadAction<ComplaintCategory | undefined>) => {
      state.filters = { ...state.filters, category: payload };
      state.page = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.page = 1;
    },
    setPage: (state, { payload }: PayloadAction<number>) => {
      state.page = payload;
    },
    setPageSize: (state, { payload }: PayloadAction<number>) => {
      state.pageSize = payload;
      state.page = 1;
    },
    markDeleting: (state, { payload }: PayloadAction<string>) => {
      if (!state.deletingIds.includes(payload)) state.deletingIds.push(payload);
    },
    unmarkDeleting: (state, { payload }: PayloadAction<string>) => {
      state.deletingIds = state.deletingIds.filter((id) => id !== payload);
    },
    markUpdating: (state, { payload }: PayloadAction<string>) => {
      if (!state.updatingIds.includes(payload)) state.updatingIds.push(payload);
    },
    unmarkUpdating: (state, { payload }: PayloadAction<string>) => {
      state.updatingIds = state.updatingIds.filter((id) => id !== payload);
    },
  },
});

export const {
  selectComplaint,
  setFilters,
  setStatusFilter,
  setPriorityFilter,
  setCategoryFilter,
  clearFilters,
  setPage,
  setPageSize,
  markDeleting,
  unmarkDeleting,
  markUpdating,
  unmarkUpdating,
} = complaintSlice.actions;

export default complaintSlice.reducer;
