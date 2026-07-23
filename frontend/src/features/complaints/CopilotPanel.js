import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
import { Alert, Box, Button, CircularProgress, Collapse, Divider, Grid, IconButton, Paper, TextField, Tooltip, Typography, } from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { alpha } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { extractFromText, extractFromFile, clearCopilot } from "./copilotSlice";
export default function CopilotPanel({ onApply }) {
    const dispatch = useAppDispatch();
    const { loading, error, data, retryCount } = useAppSelector((s) => s.copilot);
    const [text, setText] = useState("");
    const [lastAction, setLastAction] = useState(null);
    const fileRef = useRef(null);
    const appliedRef = useRef(false);
    // Auto-apply whenever new data arrives from AI
    useEffect(() => {
        if (data && !appliedRef.current) {
            const mapped = {};
            Object.entries(data).forEach(([k, v]) => { if (v != null)
                mapped[k] = String(v); });
            const confidence = data.confidence;
            onApply({ data: mapped, confidence });
            appliedRef.current = true;
        }
        if (!data)
            appliedRef.current = false;
    }, [data, onApply]);
    const handleTextExtract = () => {
        setLastAction({ type: "text", text });
        dispatch(extractFromText(text));
    };
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setLastAction({ type: "file", file });
        dispatch(extractFromFile(file));
        e.target.value = "";
    };
    const handleRetry = () => {
        if (!lastAction)
            return;
        lastAction.type === "text"
            ? dispatch(extractFromText(lastAction.text))
            : dispatch(extractFromFile(lastAction.file));
    };
    const handleReapply = () => {
        if (!data)
            return;
        const mapped = {};
        Object.entries(data).forEach(([k, v]) => { if (v != null)
            mapped[k] = String(v); });
        const confidence = data.confidence;
        onApply({ data: mapped, confidence });
    };
    const fieldCount = data ? Object.values(data).filter(Boolean).length : 0;
    return (_jsxs(Paper, { variant: "outlined", sx: {
            mb: 3, borderRadius: 2, overflow: "hidden",
            borderColor: loading ? "primary.main" : data ? "success.main" : "divider",
            transition: "border-color 0.3s",
        }, children: [_jsxs(Box, { sx: {
                    px: 2.5, py: 1.5, display: "flex", alignItems: "center", gap: 1.5,
                    background: (t) => loading
                        ? alpha(t.palette.primary.main, 0.06)
                        : data
                            ? alpha(t.palette.success.main, 0.06)
                            : alpha(t.palette.grey[500], 0.04),
                    borderBottom: "1px solid", borderColor: "divider",
                }, children: [_jsx(Box, { sx: {
                            width: 32, height: 32, borderRadius: 1.5, flexShrink: 0,
                            background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }, children: _jsx(AutoFixHighIcon, { sx: { color: "#fff", fontSize: 16 } }) }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", fontWeight: 600, color: "text.primary", children: "AI Copilot" }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: loading
                                    ? "Analyzing complaint text…"
                                    : data
                                        ? `${fieldCount} fields extracted & auto-applied to form`
                                        : "Paste complaint text or upload a PDF to auto-fill the form" })] }), loading && _jsx(CircularProgress, { size: 16, sx: { ml: "auto" } }), data && (_jsx(Tooltip, { title: "Clear extraction", arrow: true, children: _jsx(IconButton, { size: "small", sx: { ml: "auto" }, onClick: () => dispatch(clearCopilot()), children: _jsx(CloseIcon, { fontSize: "small" }) }) }))] }), _jsxs(Box, { sx: { p: 2.5 }, children: [_jsxs(Collapse, { in: !data, children: [_jsx(TextField, { multiline: true, minRows: 4, maxRows: 10, fullWidth: true, placeholder: "Paste the full complaint text here. The AI will extract customer name, product details, batch/lot numbers, dates, severity, root cause, CAPA, and more\u2026", value: text, onChange: (e) => setText(e.target.value), disabled: loading, sx: { mb: 1.5 }, InputProps: { sx: { fontSize: "0.875rem", lineHeight: 1.7 } } }), _jsxs(Box, { display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", children: [_jsx(Button, { variant: "contained", size: "small", startIcon: loading ? _jsx(CircularProgress, { size: 14, color: "inherit" }) : _jsx(AutoFixHighIcon, {}), onClick: handleTextExtract, disabled: loading || text.trim().length < 10, children: loading ? "Analyzing…" : "Extract from Text" }), _jsx(Button, { variant: "outlined", size: "small", startIcon: _jsx(UploadFileIcon, {}), onClick: () => fileRef.current?.click(), disabled: loading, children: "Upload PDF / TXT" }), _jsx("input", { ref: fileRef, type: "file", accept: "application/pdf,text/plain", hidden: true, onChange: handleFileChange }), text.trim().length > 0 && (_jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { ml: "auto" }, children: [text.length, " characters"] }))] })] }), error && (_jsxs(Alert, { severity: "error", sx: { mt: data ? 0 : 1.5 }, action: retryCount < 3 ? (_jsx(Button, { color: "inherit", size: "small", startIcon: _jsx(RefreshIcon, {}), onClick: handleRetry, disabled: loading, children: "Retry" })) : undefined, children: [_jsx(Typography, { variant: "body2", children: error }), retryCount >= 3 && (_jsx(Typography, { variant: "caption", display: "block", mt: 0.5, children: "Multiple retries failed. Please check your input or try again later." }))] })), data && (_jsxs(Box, { children: [_jsxs(Box, { display: "flex", alignItems: "center", gap: 1, mb: 2, children: [_jsx(CheckCircleOutlineIcon, { sx: { color: "success.main", fontSize: 18 } }), _jsxs(Typography, { variant: "body2", fontWeight: 600, color: "success.dark", children: ["Auto-applied \u2014 ", fieldCount, " of 14 fields populated"] })] }), data.summary && (_jsxs(Box, { sx: {
                                    p: 1.5, mb: 2, borderRadius: 1.5,
                                    bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                                    border: "1px solid", borderColor: (t) => alpha(t.palette.primary.main, 0.15),
                                }, children: [_jsx(Typography, { variant: "caption", color: "primary.main", fontWeight: 600, display: "block", mb: 0.5, children: "AI SUMMARY" }), _jsx(Typography, { variant: "body2", color: "text.secondary", lineHeight: 1.7, children: data.summary })] })), _jsx(Grid, { container: true, spacing: 1, mb: 2, children: [
                                    { label: "Customer", value: data.customer_name },
                                    { label: "Product", value: data.product_name },
                                    { label: "Batch", value: data.batch_number },
                                    { label: "Severity", value: data.severity },
                                    { label: "Risk", value: data.risk_level },
                                    { label: "Category", value: data.complaint_category },
                                ].map(({ label, value }) => value && (_jsx(Grid, { item: true, children: _jsxs(Box, { sx: {
                                            px: 1.25, py: 0.5, borderRadius: 1,
                                            bgcolor: "grey.100", border: "1px solid", borderColor: "divider",
                                        }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", display: "block", lineHeight: 1.2, children: label }), _jsx(Typography, { variant: "caption", fontWeight: 600, color: "text.primary", sx: { textTransform: "capitalize" }, children: value })] }) }, label))) }), _jsx(Divider, { sx: { mb: 2 } }), _jsxs(Box, { display: "flex", gap: 1, children: [_jsx(Button, { variant: "outlined", size: "small", startIcon: _jsx(AutoFixHighIcon, {}), onClick: handleReapply, children: "Re-apply to Form" }), _jsx(Button, { variant: "text", size: "small", onClick: () => { dispatch(clearCopilot()); setText(""); }, children: "Try Again" })] })] }))] })] }));
}
