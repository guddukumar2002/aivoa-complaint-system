import { createSelector } from "@reduxjs/toolkit";
const selectLoadingState = (state) => state.loading;
export const selectIsKeyLoading = (key) => createSelector(selectLoadingState, (loading) => (loading.keys[key] ?? 0) > 0);
export const selectAnyLoading = createSelector(selectLoadingState, (loading) => Object.keys(loading.keys).length > 0);
