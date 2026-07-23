import { Box, Typography, Skeleton } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import type { TimelineEvent } from "@/shared/types";

const EVENT_COLORS: Record<string, string> = {
  created: "#2563EB",
  updated: "#7C3AED",
  status_changed: "#D97706",
  resolved: "#059669",
  closed: "#64748B",
  comment: "#0891B2",
};

interface Props {
  events: TimelineEvent[];
  loading?: boolean;
}

export default function Timeline({ events, loading }: Props) {
  if (loading) {
    return (
      <Box>
        {[...Array(4)].map((_, i) => (
          <Box key={i} display="flex" gap={2} mb={2.5}>
            <Skeleton variant="circular" width={10} height={10} sx={{ mt: 0.5, flexShrink: 0 }} />
            <Box flex={1}>
              <Skeleton width="60%" height={18} />
              <Skeleton width="40%" height={14} sx={{ mt: 0.5 }} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (!events.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        No timeline events yet.
      </Typography>
    );
  }

  return (
    <Box sx={{ position: "relative" }}>
      {/* Vertical line */}
      <Box
        sx={{
          position: "absolute", left: 4, top: 8, bottom: 8,
          width: 1, bgcolor: "divider",
        }}
      />
      {events.map((ev, idx) => {
        const color = EVENT_COLORS[ev.event_type] ?? "#64748B";
        return (
          <Box key={ev.id ?? idx} display="flex" gap={2} mb={2.5} sx={{ position: "relative" }}>
            <FiberManualRecordIcon
              sx={{ fontSize: 10, color, mt: 0.6, flexShrink: 0, zIndex: 1, bgcolor: "background.paper" }}
            />
            <Box>
              <Typography variant="body2" fontWeight={500} color="text.primary">
                {ev.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(ev.created_at).toLocaleString()}
                {ev.created_by && ` · ${ev.created_by}`}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
