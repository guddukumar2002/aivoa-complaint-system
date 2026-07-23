import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { complaintsApi } from "./complaintsApi";
import type { ComplaintFilters } from "@/shared/types";

// ─── UI slice selectors ───────────────────────────────────────────────────────

const selectComplaintUI = (state: RootState) => state.complaint;

export const selectSelectedId = createSelector(
  selectComplaintUI,
  (ui) => ui.selectedId
);

export const selectComplaintFilters = createSelector(
  selectComplaintUI,
  (ui) => ui.filters
);

export const selectComplaintPage = createSelector(
  selectComplaintUI,
  (ui) => ui.page
);

export const selectComplaintPageSize = createSelector(
  selectComplaintUI,
  (ui) => ui.pageSize
);

export const selectDeletingIds = createSelector(
  selectComplaintUI,
  (ui) => ui.deletingIds
);

export const selectUpdatingIds = createSelector(
  selectComplaintUI,
  (ui) => ui.updatingIds
);

export const selectIsDeleting = (id: string) =>
  createSelector(selectDeletingIds, (ids) => ids.includes(id));

export const selectIsUpdating = (id: string) =>
  createSelector(selectUpdatingIds, (ids) => ids.includes(id));

// ─── RTK Query cache selectors ────────────────────────────────────────────────

export const selectComplaintsResult = (filters: ComplaintFilters) =>
  complaintsApi.endpoints.getComplaints.select(filters);

export const selectComplaintItems = (filters: ComplaintFilters) =>
  createSelector(
    selectComplaintsResult(filters),
    (result) => result.data?.items ?? []
  );

export const selectComplaintsTotal = (filters: ComplaintFilters) =>
  createSelector(
    selectComplaintsResult(filters),
    (result) => result.data?.total ?? 0
  );

export const selectComplaintById = (id: string) =>
  createSelector(
    complaintsApi.endpoints.getComplaint.select(id),
    (result) => result.data ?? null
  );

export const selectComplaintsLoading = (filters: ComplaintFilters) =>
  createSelector(
    selectComplaintsResult(filters),
    (result) => result.status === "pending"
  );

export const selectComplaintsError = (filters: ComplaintFilters) =>
  createSelector(
    selectComplaintsResult(filters),
    (result) => result.error ?? null
  );
