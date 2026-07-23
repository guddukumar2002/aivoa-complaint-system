import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    pipelineRunning: false,
    pipelineError: null,
    pipelineResult: null,
    copilotData: null,
    copilotLoading: false,
    copilotError: null,
    copilotRetries: 0,
    aiFilledFields: [],
};
const aiSlice = createSlice({
    name: "ai",
    initialState,
    reducers: {
        pipelineStarted: (state) => {
            state.pipelineRunning = true;
            state.pipelineError = null;
        },
        pipelineSucceeded: (state, { payload }) => {
            state.pipelineRunning = false;
            state.pipelineResult = payload;
        },
        pipelineFailed: (state, { payload }) => {
            state.pipelineRunning = false;
            state.pipelineError = payload;
        },
        clearPipeline: (state) => {
            state.pipelineRunning = false;
            state.pipelineError = null;
            state.pipelineResult = null;
        },
        setAIFilledFields: (state, { payload }) => {
            state.aiFilledFields = payload;
        },
        clearAIFilledFields: (state) => {
            state.aiFilledFields = [];
        },
        copilotStarted: (state) => {
            state.copilotLoading = true;
            state.copilotError = null;
        },
        copilotSucceeded: (state, { payload }) => {
            state.copilotLoading = false;
            state.copilotData = payload;
            state.copilotRetries = 0;
        },
        copilotFailed: (state, { payload }) => {
            state.copilotLoading = false;
            state.copilotError = payload;
            state.copilotRetries += 1;
        },
        clearCopilot: (state) => {
            state.copilotData = null;
            state.copilotError = null;
            state.copilotRetries = 0;
        },
    },
});
export const { pipelineStarted, pipelineSucceeded, pipelineFailed, clearPipeline, setAIFilledFields, clearAIFilledFields, copilotStarted, copilotSucceeded, copilotFailed, clearCopilot, } = aiSlice.actions;
export default aiSlice.reducer;
