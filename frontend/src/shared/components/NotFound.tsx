import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        bgcolor: "background.default", gap: 2, p: 3, textAlign: "center",
      }}
    >
      <SentimentDissatisfiedIcon sx={{ fontSize: 72, color: "text.disabled" }} />
      <Typography variant="h1" fontWeight={800} color="text.primary">404</Typography>
      <Typography variant="h5" color="text.secondary">Page not found</Typography>
      <Typography variant="body2" color="text.disabled" maxWidth={360}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Box display="flex" gap={1.5} mt={1}>
        <Button variant="contained" onClick={() => navigate("/")}>Go to Dashboard</Button>
        <Button variant="outlined" onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    </Box>
  );
}
