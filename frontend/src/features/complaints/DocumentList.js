import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Box, CircularProgress, IconButton, List, ListItem, ListItemIcon, ListItemText, Tooltip, Typography, alpha, useTheme, } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import EmailIcon from "@mui/icons-material/Email";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useGetDocumentsQuery, useDeleteDocumentMutation } from "./uploadApi";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
function DocIcon({ mime }) {
    if (mime === "application/pdf")
        return _jsx(PictureAsPdfIcon, { sx: { color: "#E53935" } });
    if (mime.startsWith("image/"))
        return _jsx(ImageIcon, { sx: { color: "#1E88E5" } });
    if (mime === "text/plain")
        return _jsx(TextSnippetIcon, { sx: { color: "#43A047" } });
    if (mime === "message/rfc822")
        return _jsx(EmailIcon, { sx: { color: "#FB8C00" } });
    return _jsx(InsertDriveFileIcon, { sx: { color: "text.secondary" } });
}
function formatBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
export default function DocumentList({ complaintId }) {
    const theme = useTheme();
    const { data: docs = [], isLoading } = useGetDocumentsQuery(complaintId);
    const [deleteDoc, { isLoading: deleting }] = useDeleteDocumentMutation();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const baseUrl = import.meta.env.VITE_API_BASE_URL ??
        "http://localhost:8000/api/v1";
    const handleDeleteClick = (doc) => {
        setDeleteTarget(doc);
        setConfirmOpen(true);
    };
    const handleConfirmDelete = () => {
        if (deleteTarget) {
            deleteDoc({ complaintId, documentId: deleteTarget.id });
        }
        setConfirmOpen(false);
        setDeleteTarget(null);
    };
    const handleCancelDelete = () => {
        setConfirmOpen(false);
        setDeleteTarget(null);
    };
    if (isLoading) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", py: 3, children: _jsx(CircularProgress, { size: 24 }) }));
    }
    if (!docs.length) {
        return (_jsx(Typography, { variant: "body2", color: "text.secondary", textAlign: "center", py: 2, children: "No documents uploaded yet." }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(List, { disablePadding: true, children: docs.map((doc) => (_jsxs(ListItem, { disableGutters: true, sx: {
                        borderRadius: 1,
                        mb: 0.5,
                        px: 1,
                        "&:hover": { bgcolor: alpha(theme.palette.action.hover, 0.06) },
                    }, secondaryAction: _jsxs(Box, { display: "flex", gap: 0.5, children: [_jsx(Tooltip, { title: "Download", arrow: true, children: _jsx(IconButton, { size: "small", component: "a", href: `${baseUrl}/complaints/${complaintId}/documents/${doc.id}/download`, target: "_blank", rel: "noopener noreferrer", "aria-label": `Download document ${doc.file_name}`, children: _jsx(DownloadIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "Delete", arrow: true, children: _jsx(IconButton, { size: "small", color: "error", onClick: () => handleDeleteClick(doc), disabled: deleting, "aria-label": `Delete document ${doc.file_name}`, children: _jsx(DeleteIcon, { fontSize: "small" }) }) })] }), children: [_jsx(ListItemIcon, { sx: { minWidth: 36 }, children: _jsx(DocIcon, { mime: doc.mime_type }) }), _jsx(ListItemText, { primary: _jsx(Typography, { variant: "body2", fontWeight: 500, noWrap: true, title: doc.file_name, children: doc.file_name }), secondary: _jsx(Typography, { variant: "caption", color: "text.secondary", children: formatBytes(doc.file_size) }) })] }, doc.id))) }), _jsx(ConfirmDialog, { open: confirmOpen, title: "Delete Document", message: `Are you sure you want to delete "${deleteTarget?.file_name || "this document"}"? This action cannot be undone.`, confirmLabel: "Delete", destructive: true, onConfirm: handleConfirmDelete, onCancel: handleCancelDelete })] }));
}
