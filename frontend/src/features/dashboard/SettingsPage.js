import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Card, CardContent, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Slider, Switch, FormControlLabel, TextField, Button, Divider, Alert, } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import MemoryIcon from "@mui/icons-material/Memory";
import TuneIcon from "@mui/icons-material/Tune";
import AppLayout from "@/shared/components/AppLayout";
import { showToast } from "@/app/toastSlice";
import { useAppDispatch } from "@/app/store";
export default function SettingsPage() {
    const dispatch = useAppDispatch();
    const [model, setModel] = useState("llama-3.3-70b-versatile");
    const [temp, setTemp] = useState(0.2);
    const [maxTokens, setMaxTokens] = useState(2048);
    const [autoAnalyze, setAutoAnalyze] = useState(true);
    const [apiUrl, setApiUrl] = useState("http://localhost:8000/api/v1");
    const [success, setSuccess] = useState(false);
    const handleSave = () => {
        // Persist to localStorage for demo persistence
        localStorage.setItem("settings_groq_model", model);
        localStorage.setItem("settings_temperature", String(temp));
        localStorage.setItem("settings_max_tokens", String(maxTokens));
        localStorage.setItem("settings_auto_analyze", String(autoAnalyze));
        localStorage.setItem("settings_api_url", apiUrl);
        setSuccess(true);
        dispatch(showToast({ message: "Settings saved successfully", severity: "success" }));
        setTimeout(() => setSuccess(false), 3000);
    };
    return (_jsx(AppLayout, { title: "Settings", children: _jsxs(Box, { sx: { p: { xs: 2, sm: 3 }, maxWidth: 960, mx: "auto" }, children: [_jsxs(Box, { display: "flex", alignItems: "center", gap: 1.5, mb: 3.5, children: [_jsx(SettingsIcon, { color: "primary" }), _jsx(Typography, { variant: "h5", fontWeight: 700, children: "System Settings" })] }), success && (_jsx(Alert, { severity: "success", sx: { mb: 3 }, children: "Configuration updated successfully." })), _jsxs(Grid, { container: true, spacing: 3.5, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { sx: { borderRadius: 2 }, children: _jsxs(CardContent, { sx: { p: 3 }, children: [_jsxs(Box, { display: "flex", alignItems: "center", gap: 1, mb: 2.5, children: [_jsx(MemoryIcon, { color: "primary", fontSize: "small" }), _jsx(Typography, { variant: "subtitle1", fontWeight: 600, children: "AI Model Parameters" })] }), _jsxs(FormControl, { fullWidth: true, size: "small", sx: { mb: 3.5 }, children: [_jsx(InputLabel, { children: "Active Groq Model" }), _jsxs(Select, { value: model, label: "Active Groq Model", onChange: (e) => setModel(e.target.value), children: [_jsx(MenuItem, { value: "llama-3.3-70b-versatile", children: "llama-3.3-70b-versatile (Recommended)" }), _jsx(MenuItem, { value: "gemma2-9b-it", disabled: true, children: "gemma2-9b-it (Decommissioned)" }), _jsx(MenuItem, { value: "llama3-8b-8192", children: "llama3-8b-8192 (Fast)" })] })] }), _jsxs(Box, { mb: 3.5, children: [_jsxs(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: ["Temperature: ", temp] }), _jsx(Slider, { value: temp, min: 0.0, max: 1.0, step: 0.05, onChange: (_, v) => setTemp(v), valueLabelDisplay: "auto" }), _jsx(Typography, { variant: "caption", color: "text.disabled", children: "Lower values are more factual; higher values are more creative." })] }), _jsxs(Box, { children: [_jsxs(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: ["Max Tokens: ", maxTokens] }), _jsx(Slider, { value: maxTokens, min: 256, max: 4096, step: 128, onChange: (_, v) => setMaxTokens(v), valueLabelDisplay: "auto" })] })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { sx: { borderRadius: 2, height: "100%" }, children: _jsxs(CardContent, { sx: { p: 3 }, children: [_jsxs(Box, { display: "flex", alignItems: "center", gap: 1, mb: 2.5, children: [_jsx(TuneIcon, { color: "primary", fontSize: "small" }), _jsx(Typography, { variant: "subtitle1", fontWeight: 600, children: "System Integration" })] }), _jsx(TextField, { fullWidth: true, size: "small", label: "Backend API Endpoint Base URL", value: apiUrl, onChange: (e) => setApiUrl(e.target.value), sx: { mb: 3.5 } }), _jsx(Divider, { sx: { my: 2 } }), _jsx(Box, { display: "flex", flexDirection: "column", gap: 1, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: autoAnalyze, onChange: (e) => setAutoAnalyze(e.target.checked), color: "primary" }), label: _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", fontWeight: 500, children: "Auto-Run AI Analysis Pipeline" }), _jsx(Typography, { variant: "caption", color: "text.secondary", display: "block", children: "Trigger the full LangGraph pipeline automatically upon complaint creation." })] }) }) })] }) }) })] }), _jsx(Box, { display: "flex", justifyContent: "flex-end", mt: 4, children: _jsx(Button, { variant: "contained", onClick: handleSave, size: "medium", children: "Save Configuration" }) })] }) }));
}
