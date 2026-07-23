import { createSlice } from "@reduxjs/toolkit";
const initialState = { queue: [] };
const toastSlice = createSlice({
    name: "toast",
    initialState,
    reducers: {
        showToast: (state, { payload }) => {
            state.queue.push({ ...payload, id: `${Date.now()}-${Math.random()}` });
        },
        dismissToast: (state, { payload }) => {
            state.queue = state.queue.filter((t) => t.id !== payload);
        },
    },
});
export const { showToast, dismissToast } = toastSlice.actions;
export default toastSlice.reducer;
