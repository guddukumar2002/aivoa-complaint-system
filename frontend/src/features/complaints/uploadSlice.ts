import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UploadEntry {
  fileName: string;
  progress: number; // 0–100
  error: string | null;
  done: boolean;
}

interface UploadState {
  uploads: Record<string, UploadEntry>; // keyed by a client-side upload id
}

const initialState: UploadState = { uploads: {} };

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    startUpload: (
      state,
      { payload }: PayloadAction<{ uploadId: string; fileName: string }>
    ) => {
      state.uploads[payload.uploadId] = {
        fileName: payload.fileName,
        progress: 0,
        error: null,
        done: false,
      };
    },
    setProgress: (
      state,
      { payload }: PayloadAction<{ uploadId: string; progress: number }>
    ) => {
      const entry = state.uploads[payload.uploadId];
      if (entry) entry.progress = payload.progress;
    },
    finishUpload: (state, { payload }: PayloadAction<string>) => {
      const entry = state.uploads[payload];
      if (entry) {
        entry.progress = 100;
        entry.done = true;
      }
    },
    failUpload: (
      state,
      { payload }: PayloadAction<{ uploadId: string; error: string }>
    ) => {
      const entry = state.uploads[payload.uploadId];
      if (entry) entry.error = payload.error;
    },
    removeUpload: (state, { payload }: PayloadAction<string>) => {
      delete state.uploads[payload];
    },
    clearUploads: () => initialState,
  },
});

export const {
  startUpload,
  setProgress,
  finishUpload,
  failUpload,
  removeUpload,
  clearUploads,
} = uploadSlice.actions;

export default uploadSlice.reducer;
