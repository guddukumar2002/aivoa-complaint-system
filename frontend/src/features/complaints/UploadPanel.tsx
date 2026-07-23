import { useCallback, useState } from "react";
import {
  Alert, Box, Divider, Grid, Snackbar, Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { removeUpload } from "./uploadSlice";
import { useFileUpload, type ValidationError } from "@/shared/hooks/useFileUpload";
import FileDropZone from "./FileDropZone";
import FilePreview from "./FilePreview";
import DocumentList from "./DocumentList";

interface Props {
  complaintId: string;
}

interface QueuedFile {
  uploadId: string;
  file: File;
}

export default function UploadPanel({ complaintId }: Props) {
  const dispatch = useAppDispatch();
  const uploads = useAppSelector((s) => s.upload.uploads);
  const { uploadFile, cancelUpload } = useFileUpload(complaintId);

  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [snackError, setSnackError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (files: File[]) => {
      const newEntries: QueuedFile[] = files.map((file) => ({
        uploadId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
      }));

      setQueue((prev) => [...prev, ...newEntries]);

      newEntries.forEach(({ file, uploadId }) => {
        uploadFile(file, uploadId).catch((err: Error) => {
          setSnackError(err.message);
        });
      });
    },
    [uploadFile]
  );

  const handleErrors = useCallback((errors: ValidationError[]) => {
    setValidationErrors(errors);
  }, []);

  const handleCancel = (uploadId: string) => {
    cancelUpload(uploadId);
    setQueue((prev) => prev.filter((q) => q.uploadId !== uploadId));
    dispatch(removeUpload(uploadId));
  };

  const handleRemove = (uploadId: string) => {
    setQueue((prev) => prev.filter((q) => q.uploadId !== uploadId));
    dispatch(removeUpload(uploadId));
  };

  const activeQueue = queue.filter((q) => uploads[q.uploadId]);

  return (
    <Box>
      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <Alert
          severity="warning"
          onClose={() => setValidationErrors([])}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2" fontWeight={500} mb={0.5}>
            {validationErrors.length} file{validationErrors.length > 1 ? "s" : ""} rejected:
          </Typography>
          {validationErrors.map((e, i) => (
            <Typography key={i} variant="caption" display="block">
              <strong>{e.file}</strong> — {e.reason}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Drop zone */}
      <FileDropZone onFiles={handleFiles} onErrors={handleErrors} />

      {/* In-progress / completed uploads */}
      {activeQueue.length > 0 && (
        <Box mt={2}>
          <Typography variant="overline" color="text.secondary" display="block" mb={1}>
            Uploading ({activeQueue.length})
          </Typography>
          <Grid container spacing={1.5}>
            {activeQueue.map(({ uploadId, file }) => {
              const entry = uploads[uploadId];
              if (!entry) return null;
              return (
                <Grid item xs={12} sm={6} key={uploadId}>
                  <FilePreview
                    file={file}
                    uploadId={uploadId}
                    progress={entry.progress}
                    done={entry.done}
                    error={entry.error}
                    onCancel={handleCancel}
                    onRemove={handleRemove}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Uploaded documents */}
      <Divider sx={{ my: 2.5 }} />
      <Typography variant="overline" color="text.secondary" display="block" mb={1}>
        Uploaded Documents
      </Typography>
      <DocumentList complaintId={complaintId} />

      {/* Network error snackbar */}
      <Snackbar
        open={!!snackError}
        autoHideDuration={5000}
        onClose={() => setSnackError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setSnackError(null)} sx={{ width: "100%" }}>
          {snackError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
