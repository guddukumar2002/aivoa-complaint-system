import { LinearProgress, Box } from "@mui/material";
import { useAppSelector } from "@/app/store";

export default function GlobalLoader() {
  const keys = useAppSelector((s) => s.loading.keys);
  const active = Object.keys(keys).length > 0;

  if (!active) return null;

  return (
    <Box
      sx={{
        position: "fixed", top: 0, left: 0, right: 0,
        zIndex: 9999, height: 3,
      }}
    >
      <LinearProgress
        sx={{
          height: 3, borderRadius: 0,
          "& .MuiLinearProgress-bar": {
            background: "linear-gradient(90deg, #2563EB, #7C3AED)",
          },
          bgcolor: "transparent",
        }}
      />
    </Box>
  );
}
