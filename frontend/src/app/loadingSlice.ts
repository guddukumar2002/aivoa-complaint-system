import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoadingState {
  // Named loading keys → count of in-flight requests
  keys: Record<string, number>;
}

const initialState: LoadingState = { keys: {} };

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    startLoading: (state, { payload }: PayloadAction<string>) => {
      state.keys[payload] = (state.keys[payload] ?? 0) + 1;
    },
    stopLoading: (state, { payload }: PayloadAction<string>) => {
      const count = (state.keys[payload] ?? 1) - 1;
      if (count <= 0) delete state.keys[payload];
      else state.keys[payload] = count;
    },
    clearLoading: () => initialState,
  },
});

export const { startLoading, stopLoading, clearLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
