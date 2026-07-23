import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Typography, Skeleton } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
const EVENT_COLORS = {
    created: "#2563EB",
    updated: "#7C3AED",
    status_changed: "#D97706",
    resolved: "#059669",
    closed: "#64748B",
    comment: "#0891B2",
};
export default function Timeline({ events, loading }) {
    if (loading) {
        return (_jsx(Box, { children: [...Array(4)].map((_, i) => (_jsxs(Box, { display: "flex", gap: 2, mb: 2.5, children: [_jsx(Skeleton, { variant: "circular", width: 10, height: 10, sx: { mt: 0.5, flexShrink: 0 } }), _jsxs(Box, { flex: 1, children: [_jsx(Skeleton, { width: "60%", height: 18 }), _jsx(Skeleton, { width: "40%", height: 14, sx: { mt: 0.5 } })] })] }, i))) }));
    }
    if (!events.length) {
        return (_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { py: 2 }, children: "No timeline events yet." }));
    }
    return (_jsxs(Box, { sx: { position: "relative" }, children: [_jsx(Box, { sx: {
                    position: "absolute", left: 4, top: 8, bottom: 8,
                    width: 1, bgcolor: "divider",
                } }), events.map((ev, idx) => {
                const color = EVENT_COLORS[ev.event_type] ?? "#64748B";
                return (_jsxs(Box, { display: "flex", gap: 2, mb: 2.5, sx: { position: "relative" }, children: [_jsx(FiberManualRecordIcon, { sx: { fontSize: 10, color, mt: 0.6, flexShrink: 0, zIndex: 1, bgcolor: "background.paper" } }), _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", fontWeight: 500, color: "text.primary", children: ev.description }), _jsxs(Typography, { variant: "caption", color: "text.secondary", children: [new Date(ev.created_at).toLocaleString(), ev.created_by && ` · ${ev.created_by}`] })] })] }, ev.id ?? idx));
            })] }));
}
