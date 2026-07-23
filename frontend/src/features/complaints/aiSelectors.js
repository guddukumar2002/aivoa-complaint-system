import { createSelector } from "@reduxjs/toolkit";
import { aiApi } from "./aiApi";
const selectAIState = (state) => state.ai;
export const selectPipelineRunning = createSelector(selectAIState, (ai) => ai.pipelineRunning);
export const selectPipelineResult = createSelector(selectAIState, (ai) => ai.pipelineResult);
export const selectPipelineError = createSelector(selectAIState, (ai) => ai.pipelineError);
export const selectCopilotData = createSelector(selectAIState, (ai) => ai.copilotData);
export const selectCopilotLoading = createSelector(selectAIState, (ai) => ai.copilotLoading);
export const selectCopilotError = createSelector(selectAIState, (ai) => ai.copilotError);
export const selectCopilotRetries = createSelector(selectAIState, (ai) => ai.copilotRetries);
export const selectAIFilledFields = createSelector(selectAIState, (ai) => ai.aiFilledFields);
// RTK Query cache selector
export const selectAIAnalysisForComplaint = (complaintId) => createSelector(aiApi.endpoints.getAIAnalysis.select(complaintId), (result) => result.data ?? null);
export const selectAIAnalysisLoading = (complaintId) => createSelector(aiApi.endpoints.getAIAnalysis.select(complaintId), (result) => result.status === "pending");
