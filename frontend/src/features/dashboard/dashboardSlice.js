import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/shared/utils/api";
const initialState = {
    stats: null,
    recent: [],
    lastUpdated: null,
    loading: false,
    error: null,
};
export const fetchDashboard = createAsyncThunk("dashboard/fetch", async (_, { rejectWithValue }) => {
    try {
        // Fetch complaints from the API (limit to 100 to compute stats and recent list)
        const { data } = await api.get("/complaints", {
            params: { page_size: 100 },
        });
        return data;
    }
    catch {
        return rejectWithValue("Failed to fetch dashboard data");
    }
});
// Pure helper — called by the listener middleware when complaints cache updates
export function computeStats(complaints) {
    return {
        total: complaints.length,
        open: complaints.filter((c) => c.status === "open").length,
        in_progress: complaints.filter((c) => c.status === "in_progress").length,
        resolved: complaints.filter((c) => c.status === "resolved").length,
        closed: complaints.filter((c) => c.status === "closed").length,
        critical: complaints.filter((c) => c.priority === "critical").length,
        high: complaints.filter((c) => c.priority === "high").length,
    };
}
const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        updateDashboard: (state, { payload }) => {
            state.stats = { ...computeStats(payload.complaints), total: payload.total };
            state.recent = payload.complaints.slice(0, 8);
            state.lastUpdated = new Date().toISOString();
        },
        clearDashboard: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboard.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchDashboard.fulfilled, (state, { payload }) => {
            state.loading = false;
            state.stats = { ...computeStats(payload.items), total: payload.total };
            state.recent = payload.items.slice(0, 8);
            state.lastUpdated = new Date().toISOString();
        })
            .addCase(fetchDashboard.rejected, (state, { payload }) => {
            state.loading = false;
            state.error = payload;
        });
    },
});
export const { updateDashboard, clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
