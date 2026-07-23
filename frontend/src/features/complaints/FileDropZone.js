import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useRef, useState } from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_BYTES, MAX_FILES_PER_UPLOAD, validateFiles, } from "@/shared/hooks/useFileUpload";
export default function FileDropZone({ onFiles, onErrors, disabled }) {
    const theme = useTheme();
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const process = useCallback((raw) => {
        if (!raw)
            return;
        const files = Array.from(raw).slice(0, MAX_FILES_PER_UPLOAD);
        const { valid, errors } = validateFiles(files);
        if (errors.length)
            onErrors(errors);
        if (valid.length)
            onFiles(valid);
    }, [onFiles, onErrors]);
    const onDragOver = (e) => {
        e.preventDefault();
        if (!disabled)
            setDragging(true);
    };
    const onDragLeave = () => setDragging(false);
    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled)
            process(e.dataTransfer.files);
    };
    const onInputChange = (e) => {
        process(e.target.files);
        e.target.value = "";
    };
    const borderColor = dragging
        ? theme.palette.primary.main
        : theme.palette.divider;
    return (_jsxs(Box, { onClick: () => !disabled && inputRef.current?.click(), onDragOver: onDragOver, onDragLeave: onDragLeave, onDrop: onDrop, sx: {
            border: `2px dashed ${borderColor}`,
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            cursor: disabled ? "not-allowed" : "pointer",
            bgcolor: dragging
                ? alpha(theme.palette.primary.main, 0.06)
                : alpha(theme.palette.action.hover, 0.02),
            transition: "border-color 0.2s, background-color 0.2s",
            "&:hover": disabled
                ? {}
                : { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.04) },
        }, children: [_jsx("input", { ref: inputRef, type: "file", multiple: true, accept: ACCEPTED_EXTENSIONS, style: { display: "none" }, onChange: onInputChange, disabled: disabled }), _jsx(CloudUploadIcon, { sx: { fontSize: 40, color: dragging ? "primary.main" : "text.disabled", mb: 1 } }), _jsx(Typography, { variant: "body1", fontWeight: 500, color: dragging ? "primary.main" : "text.primary", children: dragging ? "Drop files here" : "Drag & drop files or click to browse" }), _jsxs(Typography, { variant: "caption", color: "text.secondary", display: "block", mt: 0.5, children: ["PDF, Images (JPG/PNG/GIF/WebP), Plain Text, Email (.eml), Word \u2014 max", " ", MAX_FILE_SIZE_BYTES / (1024 * 1024), " MB each \u00B7 up to ", MAX_FILES_PER_UPLOAD, " files"] })] }));
}
