import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
export default function StatCard({ title, value, icon: Icon, color, bg, loading, subtitle }) {
    return (_jsx(Card, { sx: { height: "100%", transition: "box-shadow 0.2s", "&:hover": { boxShadow: 4 } }, children: _jsx(CardContent, { sx: { p: 2.5, "&:last-child": { pb: 2.5 } }, children: _jsxs(Box, { display: "flex", alignItems: "flex-start", justifyContent: "space-between", children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "overline", color: "text.secondary", sx: { mb: 0.5, display: "block" }, children: title }), loading ? (_jsx(Skeleton, { width: 60, height: 40 })) : (_jsx(Typography, { variant: "h3", fontWeight: 700, color: "text.primary", lineHeight: 1, children: value })), subtitle && (_jsx(Typography, { variant: "caption", color: "text.secondary", sx: { mt: 0.5, display: "block" }, children: subtitle }))] }), _jsx(Box, { sx: {
                            width: 44, height: 44, borderRadius: 2.5,
                            backgroundColor: bg, display: "flex",
                            alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }, children: _jsx(Icon, { sx: { color, fontSize: 22 } }) })] }) }) }));
}
