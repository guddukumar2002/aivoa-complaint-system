import { createSlice } from "@reduxjs/toolkit";
const initialState = { uploads: {} };
const uploadSlice = createSlice({
    name: "upload",
    initialState,
    reducers: {
        startUpload: (state, { payload }) => {
            state.uploads[payload.uploadId] = {
                fileName: payload.fileName,
                progress: 0,
                error: null,
                done: false,
            };
        },
        setProgress: (state, { payload }) => {
            const entry = state.uploads[payload.uploadId];
            if (entry)
                entry.progress = payload.progress;
        },
        finishUpload: (state, { payload }) => {
            const entry = state.uploads[payload];
            if (entry) {
                entry.progress = 100;
                entry.done = true;
            }
        },
        failUpload: (state, { payload }) => {
            const entry = state.uploads[payload.uploadId];
            if (entry)
                entry.error = payload.error;
        },
        removeUpload: (state, { payload }) => {
            delete state.uploads[payload];
        },
        clearUploads: () => initialState,
    },
});
export const { startUpload, setProgress, finishUpload, failUpload, removeUpload, clearUploads, } = uploadSlice.actions;
export default uploadSlice.reducer;
