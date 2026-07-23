import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/shared/utils/api";

export interface CopilotData {
  customer_name: string | null;
  product_name: string | null;
  batch_number: string | null;
  lot_number: string | null;
  manufacturing_date: string | null;
  expiry_date: string | null;
  complaint_category: string | null;
  complaint_description: string | null;
  severity: string | null;
  risk_level: string | null;
  root_cause: string | null;
  capa: string | null;
  summary: string | null;
  next_action: string | null;
}

interface CopilotState {
  data: CopilotData | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
}

const initialState: CopilotState = {
  data: null,
  loading: false,
  error: null,
  retryCount: 0,
};

export const extractFromText = createAsyncThunk(
  "copilot/extractFromText",
  async (text: string, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("text", text);
      const { data } = await api.post<CopilotData>("/ai/copilot/text", form);
      return data;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Failed to extract complaint data. Please try again.";
      return rejectWithValue(msg);
    }
  }
);

export const extractFromFile = createAsyncThunk(
  "copilot/extractFromFile",
  async (file: File, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post<CopilotData>("/ai/copilot/upload", form);
      return data;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Failed to process file. Please try again.";
      return rejectWithValue(msg);
    }
  }
);

const copilotSlice = createSlice({
  name: "copilot",
  initialState,
  reducers: {
    clearCopilot: () => initialState,
  },
  extraReducers: (builder) => {
    const pending = (state: CopilotState) => {
      state.loading = true;
      state.error = null;
    };
    const fulfilled = (state: CopilotState, action: { payload: CopilotData }) => {
      state.loading = false;
      state.data = action.payload;
      state.retryCount = 0;
    };
    const rejected = (state: CopilotState, action: { payload?: unknown }) => {
      state.loading = false;
      state.error = (action.payload as string) ?? "Unknown error";
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
