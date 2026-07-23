import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/shared/utils/api";
const initialState = {
    data: null,
    loading: false,
    error: null,
    retryCount: 0,
};
export const extractFromText = createAsyncThunk("copilot/extractFromText", async (text, { rejectWithValue }) => {
    try {
        const form = new FormData();
        form.append("text", text);
        const { data } = await api.post("/ai/copilot/text", form);
        return data;
    }
    catch (err) {
        const msg = err?.response?.data
            ?.detail ?? "Failed to extract complaint data. Please try again.";
        return rejectWithValue(msg);
    }
});
export const extractFromFile = createAsyncThunk("copilot/extractFromFile", async (file, { rejectWithValue }) => {
    try {
        const form = new FormData();
        form.append("file", file);
        const { data } = await api.post("/ai/copilot/upload", form);
        return data;
    }
    catch (err) {
        const msg = err?.response?.data
            ?.detail ?? "Failed to process file. Please try again.";
        return rejectWithValue(msg);
    }
});
const copilotSlice = createSlice({
    name: "copilot",
    initialState,
    reducers: {
        clearCopilot: () => initialState,
    },
    extraReducers: (builder) => {
        const pending = (state) => {
            state.loading = true;
            state.error = null;
        };
        const fulfilled = (state, action) => {
            state.loading = false;
            state.data = action.payload;
            state.retryCount = 0;
        };
        const rejected = (state, action) => {
            state.loading = false;
            state.error = action.payload ?? "Unknown error";
            state.retryCount += 1;
        };
        builder
            .addCase(extractFromText.pending, pending)
            .addCase(extractFromText.fulfilled, fulfilled)
            .addCase(extractFromText.rejected, rejected)
            .addCase(extractFromFile.pending, pending)
            .addCase(extractFromFile.fulfilled, fulfilled)
            .addCase(extractFromFile.rejected, rejected);
    },
});
export const { clearCopilot } = copilotSlice.actions;
export default copilotSlice.reducer;
