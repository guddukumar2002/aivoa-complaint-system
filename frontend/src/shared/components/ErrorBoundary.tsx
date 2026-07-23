import { Component, type ReactNode, type ErrorInfo } from "react";
import { Box, Button, Typography } from "@mui/material";
import BugReportIcon from "@mui/icons-material/BugReport";

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Box
        sx={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          bgcolor: "background.default", gap: 2, p: 3, textAlign: "center",
        }}
      >
        <BugReportIcon sx={{ fontSize: 64, color: "error.main" }} />
        <Typography variant="h5" fontWeight={700}>Something went wrong</Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={480}>
          {this.state.error.message}
        </Typography>
        <Button
          variant="contained"
          onClick={() => { this.setState({ error: null }); window.location.href = "/"; }}
        >
          Reload App
        </Button>
      </Box>
    );
  }
}
