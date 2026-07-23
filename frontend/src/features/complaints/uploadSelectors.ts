import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { uploadApi } from "./uploadApi";

const selectUploadState = (state: RootState) => state.upload;

export const selectAllUploads = createSelector(
  selectUploadState,
  (u) => Object.values(u.uploads)
);

export const selectUploadById = (uploadId: string) =>
  createSelector(selectUploadState, (u) => u.uploads[uploadId] ?? null);

export const selectHasActiveUploads = createSelector(
  selectAllUploads,
  (uploads) => uploads.some((u) => !u.done && !u.error)
);

export const selectUploadErrors = createSelector(
  selectAllUploads,
  (uploads) => uploads.filter((u) => u.error !== null).map((u) => u.error!)
);

// RTK Query cache selector
export const selectDocumentsForComplaint = (complaintId: string) =>
  createSelector(
    uploadApi.endpoints.getDocuments.select(complaintId),
    (result) => result.data ?? []
  );
