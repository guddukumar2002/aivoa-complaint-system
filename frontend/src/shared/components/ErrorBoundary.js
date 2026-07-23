import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from "react";
import { Box, Button, Typography } from "@mui/material";
import BugReportIcon from "@mui/icons-material/BugReport";
export default class ErrorBoundary extends Component {
    state = { error: null };
    static getDerivedStateFromError(error) {
        return { error };
    }
    componentDidCatch(error, info) {
        console.error("[ErrorBoundary]", error, info.componentStack);
    }
    render() {
        if (!this.state.error)
            return this.props.children;
        return (_jsxs(Box, { sx: {
                minHeight: "100vh", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                bgcolor: "background.default", gap: 2, p: 3, textAlign: "center",
            }, children: [_jsx(BugReportIcon, { sx: { fontSize: 64, color: "error.main" } }), _jsx(Typography, { variant: "h5", fontWeight: 700, children: "Something went wrong" }), _jsx(Typography, { variant: "body2", color: "text.secondary", maxWidth: 480, children: this.state.error.message }), _jsx(Button, { variant: "contained", onClick: () => { this.setState({ error: null }); window.location.href = "/"; }, children: "Reload App" })] }));
    }
}
