import { createSlice } from "@reduxjs/toolkit";
const initialState = { keys: {} };
const loadingSlice = createSlice({
    name: "loading",
    initialState,
    reducers: {
        startLoading: (state, { payload }) => {
            state.keys[payload] = (state.keys[payload] ?? 0) + 1;
        },
        stopLoading: (state, { payload }) => {
            const count = (state.keys[payload] ?? 1) - 1;
            if (count <= 0)
                delete state.keys[payload];
            else
                state.keys[payload] = count;
        },
        clearLoading: () => initialState,
    },
});
export const { startLoading, stopLoading, clearLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
