import { Chip } from "@mui/material";
import type { ComplaintStatus } from "@/shared/types";

const CONFIG: Record<ComplaintStatus, { label: string; color: string; bg: string }> = {
  open:        { label: "Open",        color: "#1D4ED8", bg: "#DBEAFE" },
  in_progress: { label: "In Progress", color: "#92400E", bg: "#FEF3C7" },
  resolved:    { label: "Resolved",    color: "#065F46", bg: "#D1FAE5" },
  closed:      { label: "Closed",      color: "#374151", bg: "#F3F4F6" },
};

export default function StatusChip({ status }: { status: ComplaintStatus }) {
  const cfg = CONFIG[status] ?? CONFIG.open;
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{ color: cfg.color, backgroundColor: cfg.bg, fontWeight: 600, fontSize: "0.7rem", height: 22, borderRadius: "6px" }}
    />
  );
}
