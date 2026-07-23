import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";

const selectLoadingState = (state: RootState) => state.loading;

export const selectIsKeyLoading = (key: string) =>
  createSelector(
    selectLoadingState,
    (loading) => (loading.keys[key] ?? 0) > 0
  );

export const selectAnyLoading = createSelector(
  selectLoadingState,
  (loading) => Object.keys(loading.keys).length > 0
);
