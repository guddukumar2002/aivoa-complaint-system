import { jsx as _jsx } from "react/jsx-runtime";
import { Chip } from "@mui/material";
const CONFIG = {
    open: { label: "Open", color: "#1D4ED8", bg: "#DBEAFE" },
    in_progress: { label: "In Progress", color: "#92400E", bg: "#FEF3C7" },
    resolved: { label: "Resolved", color: "#065F46", bg: "#D1FAE5" },
    closed: { label: "Closed", color: "#374151", bg: "#F3F4F6" },
};
export default function StatusChip({ status }) {
    const cfg = CONFIG[status] ?? CONFIG.open;
    return (_jsx(Chip, { label: cfg.label, size: "small", sx: { color: cfg.color, backgroundColor: cfg.bg, fontWeight: 600, fontSize: "0.7rem", height: 22, borderRadius: "6px" } }));
}
