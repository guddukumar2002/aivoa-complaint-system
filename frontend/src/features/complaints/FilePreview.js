import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Box, Card, CardContent, IconButton, LinearProgress, Tooltip, Typography, alpha, useTheme, } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import EmailIcon from "@mui/icons-material/Email";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
function formatBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function FileIcon({ mime }) {
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
export default function FilePreview({ file, uploadId, progress, done, error, onCancel, onRemove }) {
    const theme = useTheme();
    const [previewUrl, setPreviewUrl] = useState(null);
    const [textPreview, setTextPreview] = useState(null);
    useEffect(() => {
        if (file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        if (file.type === "text/plain" || file.type === "message/rfc822") {
            const reader = new FileReader();
            reader.onload = (e) => setTextPreview((e.target?.result).slice(0, 400));
            reader.readAsText(file);
        }
        if (file.type === "application/pdf") {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);
    const inProgress = !done && !error;
    const borderColor = error
        ? theme.palette.error.main
        : done
            ? theme.palette.success.main
            : theme.palette.divider;
    return (_jsx(Card, { variant: "outlined", sx: {
            borderColor,
            transition: "border-color 0.2s",
            bgcolor: error
                ? alpha(theme.palette.error.main, 0.04)
                : done
                    ? alpha(theme.palette.success.main, 0.04)
                    : "background.paper",
        }, children: _jsxs(CardContent, { sx: { p: "12px !important" }, children: [_jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [_jsx(FileIcon, { mime: file.type }), _jsxs(Box, { flex: 1, minWidth: 0, children: [_jsx(Typography, { variant: "body2", fontWeight: 500, noWrap: true, title: file.name, children: file.name }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: formatBytes(file.size) })] }), done && _jsx(CheckCircleIcon, { sx: { color: "success.main", fontSize: 18 } }), error && (_jsx(Tooltip, { title: error, arrow: true, children: _jsx(ErrorIcon, { sx: { color: "error.main", fontSize: 18 } }) })), _jsx(IconButton, { size: "small", onClick: () => (inProgress ? onCancel(uploadId) : onRemove(uploadId)), sx: { ml: 0.5 }, children: _jsx(CloseIcon, { fontSize: "small" }) })] }), inProgress && (_jsx(LinearProgress, { variant: progress === 0 ? "indeterminate" : "determinate", value: progress, sx: { mt: 1, borderRadius: 1, height: 4 } })), error && (_jsx(Typography, { variant: "caption", color: "error", display: "block", mt: 0.5, children: error })), previewUrl && file.type.startsWith("image/") && (_jsx(Box, { component: "img", src: previewUrl, alt: file.name, sx: {
                        mt: 1, width: "100%", maxHeight: 160,
                        objectFit: "contain", borderRadius: 1,
                        bgcolor: alpha(theme.palette.action.hover, 0.04),
                    } })), previewUrl && file.type === "application/pdf" && (_jsx(Box, { component: "iframe", src: previewUrl, title: file.name, sx: { mt: 1, width: "100%", height: 200, border: "none", borderRadius: 1 } })), textPreview && (_jsxs(Box, { sx: {
                        mt: 1, p: 1, borderRadius: 1,
                        bgcolor: alpha(theme.palette.action.hover, 0.06),
                        fontFamily: "monospace", fontSize: "0.7rem",
                        whiteSpace: "pre-wrap", wordBreak: "break-all",
                        maxHeight: 120, overflow: "auto",
                        color: "text.secondary",
                    }, children: [textPreview, file.size > 400 && "…"] }))] }) }));
}
