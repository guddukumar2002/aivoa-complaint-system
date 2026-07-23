import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ToastSeverity = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  severity: ToastSeverity;
  duration?: number;
}

interface ToastState {
  queue: Toast[];
}

const initialState: ToastState = { queue: [] };

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast: (state, { payload }: PayloadAction<Omit<Toast, "id">>) => {
      state.queue.push({ ...payload, id: `${Date.now()}-${Math.random()}` });
    },
    dismissToast: (state, { payload }: PayloadAction<string>) => {
      state.queue = state.queue.filter((t) => t.id !== payload);
    },
  },
});

export const { showToast, dismissToast } = toastSlice.actions;
export default toastSlice.reducer;
