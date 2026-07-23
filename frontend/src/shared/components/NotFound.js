import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
export default function NotFound() {
    const navigate = useNavigate();
    return (_jsxs(Box, { sx: {
            minHeight: "100vh", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            bgcolor: "background.default", gap: 2, p: 3, textAlign: "center",
        }, children: [_jsx(SentimentDissatisfiedIcon, { sx: { fontSize: 72, color: "text.disabled" } }), _jsx(Typography, { variant: "h1", fontWeight: 800, color: "text.primary", children: "404" }), _jsx(Typography, { variant: "h5", color: "text.secondary", children: "Page not found" }), _jsx(Typography, { variant: "body2", color: "text.disabled", maxWidth: 360, children: "The page you're looking for doesn't exist or has been moved." }), _jsxs(Box, { display: "flex", gap: 1.5, mt: 1, children: [_jsx(Button, { variant: "contained", onClick: () => navigate("/"), children: "Go to Dashboard" }), _jsx(Button, { variant: "outlined", onClick: () => navigate(-1), children: "Go Back" })] })] }));
}
