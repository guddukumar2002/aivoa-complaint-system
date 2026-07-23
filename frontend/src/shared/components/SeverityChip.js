import { jsx as _jsx } from "react/jsx-runtime";
import { Chip } from "@mui/material";
const CONFIG = {
    low: { color: "#065F46", bg: "#D1FAE5" },
    medium: { color: "#92400E", bg: "#FEF3C7" },
    high: { color: "#9A3412", bg: "#FFEDD5" },
    critical: { color: "#991B1B", bg: "#FEE2E2" },
};
export default function SeverityChip({ level, label }) {
    const cfg = CONFIG[level?.toLowerCase()] ?? CONFIG.medium;
    return (_jsx(Chip, { label: label ?? level, size: "small", sx: { color: cfg.color, backgroundColor: cfg.bg, fontWeight: 600, fontSize: "0.7rem", height: 22, borderRadius: "6px", textTransform: "capitalize" } }));
}
