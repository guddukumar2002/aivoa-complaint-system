import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useState } from "react";
import { Alert, Box, Divider, Grid, Snackbar, Typography, } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { removeUpload } from "./uploadSlice";
import { useFileUpload } from "@/shared/hooks/useFileUpload";
import FileDropZone from "./FileDropZone";
import FilePreview from "./FilePreview";
import DocumentList from "./DocumentList";
export default function UploadPanel({ complaintId }) {
    const dispatch = useAppDispatch();
    const uploads = useAppSelector((s) => s.upload.uploads);
    const { uploadFile, cancelUpload } = useFileUpload(complaintId);
    const [queue, setQueue] = useState([]);
    const [validationErrors, setValidationErrors] = useState([]);
    const [snackError, setSnackError] = useState(null);
    const handleFiles = useCallback((files) => {
        const newEntries = files.map((file) => ({
            uploadId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            file,
        }));
        setQueue((prev) => [...prev, ...newEntries]);
        newEntries.forEach(({ file, uploadId }) => {
            uploadFile(file, uploadId).catch((err) => {
                setSnackError(err.message);
            });
        });
    }, [uploadFile]);
    const handleErrors = useCallback((errors) => {
        setValidationErrors(errors);
    }, []);
    const handleCancel = (uploadId) => {
        cancelUpload(uploadId);
        setQueue((prev) => prev.filter((q) => q.uploadId !== uploadId));
        dispatch(removeUpload(uploadId));
    };
    const handleRemove = (uploadId) => {
        setQueue((prev) => prev.filter((q) => q.uploadId !== uploadId));
        dispatch(removeUpload(uploadId));
    };
    const activeQueue = queue.filter((q) => uploads[q.uploadId]);
    return (_jsxs(Box, { children: [validationErrors.length > 0 && (_jsxs(Alert, { severity: "warning", onClose: () => setValidationErrors([]), sx: { mb: 2 }, children: [_jsxs(Typography, { variant: "body2", fontWeight: 500, mb: 0.5, children: [validationErrors.length, " file", validationErrors.length > 1 ? "s" : "", " rejected:"] }), validationErrors.map((e, i) => (_jsxs(Typography, { variant: "caption", display: "block", children: [_jsx("strong", { children: e.file }), " \u2014 ", e.reason] }, i)))] })), _jsx(FileDropZone, { onFiles: handleFiles, onErrors: handleErrors }), activeQueue.length > 0 && (_jsxs(Box, { mt: 2, children: [_jsxs(Typography, { variant: "overline", color: "text.secondary", display: "block", mb: 1, children: ["Uploading (", activeQueue.length, ")"] }), _jsx(Grid, { container: true, spacing: 1.5, children: activeQueue.map(({ uploadId, file }) => {
                            const entry = uploads[uploadId];
                            if (!entry)
                                return null;
                            return (_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FilePreview, { file: file, uploadId: uploadId, progress: entry.progress, done: entry.done, error: entry.error, onCancel: handleCancel, onRemove: handleRemove }) }, uploadId));
                        }) })] })), _jsx(Divider, { sx: { my: 2.5 } }), _jsx(Typography, { variant: "overline", color: "text.secondary", display: "block", mb: 1, children: "Uploaded Documents" }), _jsx(DocumentList, { complaintId: complaintId }), _jsx(Snackbar, { open: !!snackError, autoHideDuration: 5000, onClose: () => setSnackError(null), anchorOrigin: { vertical: "bottom", horizontal: "center" }, children: _jsx(Alert, { severity: "error", onClose: () => setSnackError(null), sx: { width: "100%" }, children: snackError }) })] }));
}
