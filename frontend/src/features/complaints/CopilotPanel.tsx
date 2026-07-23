import { useRef, useState, useEffect } from "react";
import {
  Alert, Box, Button, CircularProgress, Collapse, Divider,
  Grid, IconButton, Paper, TextField, Tooltip, Typography,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { alpha } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { extractFromText, extractFromFile, clearCopilot } from "./copilotSlice";

interface Props {
  onApply: (payload: { data: Record<string, string>; confidence?: Record<string, number> }) => void;
}

export default function CopilotPanel({ onApply }: Props) {
  const dispatch = useAppDispatch();
  const { loading, error, data, retryCount } = useAppSelector((s) => s.copilot);
  const [text, setText] = useState("");
  const [lastAction, setLastAction] = useState<
    { type: "text"; text: string } | { type: "file"; file: File } | null
  >(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const appliedRef = useRef(false);

  // Auto-apply whenever new data arrives from AI
  useEffect(() => {
    if (data && !appliedRef.current) {
      const mapped: Record<string, string> = {};
      Object.entries(data).forEach(([k, v]) => { if (v != null) mapped[k] = String(v); });
      const confidence = (data as any).confidence as Record<string, number> | undefined;
      onApply({ data: mapped, confidence });
      appliedRef.current = true;
    }
    if (!data) appliedRef.current = false;
  }, [data, onApply]);

  const handleTextExtract = () => {
    setLastAction({ type: "text", text });
    dispatch(extractFromText(text));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLastAction({ type: "file", file });
    dispatch(extractFromFile(file));
    e.target.value = "";
  };

  const handleRetry = () => {
    if (!lastAction) return;
    lastAction.type === "text"
      ? dispatch(extractFromText(lastAction.text))
      : dispatch(extractFromFile(lastAction.file));
  };

  const handleReapply = () => {
    if (!data) return;
    const mapped: Record<string, string> = {};
    Object.entries(data).forEach(([k, v]) => { if (v != null) mapped[k] = String(v); });
    const confidence = (data as any).confidence as Record<string, number> | undefined;
    onApply({ data: mapped, confidence });
  };

  const fieldCount = data ? Object.values(data).filter(Boolean).length : 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 3, borderRadius: 2, overflow: "hidden",
        borderColor: loading ? "primary.main" : data ? "success.main" : "divider",
        transition: "border-color 0.3s",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5, py: 1.5, display: "flex", alignItems: "center", gap: 1.5,
          background: (t) => loading
            ? alpha(t.palette.primary.main, 0.06)
            : data
            ? alpha(t.palette.success.main, 0.06)
            : alpha(t.palette.grey[500], 0.04),
          borderBottom: "1px solid", borderColor: "divider",
        }}
      >
        <Box
          sx={{
            width: 32, height: 32, borderRadius: 1.5, flexShrink: 0,
            background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <AutoFixHighIcon sx={{ color: "#fff", fontSize: 16 }} />
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary">
            AI Copilot
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {loading
              ? "Analyzing complaint text…"
              : data
              ? `${fieldCount} fields extracted & auto-applied to form`
              : "Paste complaint text or upload a PDF to auto-fill the form"}
          </Typography>
        </Box>
        {loading && <CircularProgress size={16} sx={{ ml: "auto" }} />}
        {data && (
          <Tooltip title="Clear extraction" arrow>
            <IconButton size="small" sx={{ ml: "auto" }} onClick={() => dispatch(clearCopilot())}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ p: 2.5 }}>
        {/* Input area — hidden after successful extraction */}
        <Collapse in={!data}>
          <TextField
            multiline
            minRows={4}
            maxRows={10}
            fullWidth
            placeholder="Paste the full complaint text here. The AI will extract customer name, product details, batch/lot numbers, dates, severity, root cause, CAPA, and more…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            sx={{ mb: 1.5 }}
            InputProps={{ sx: { fontSize: "0.875rem", lineHeight: 1.7 } }}
          />
          <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
            <Button
              variant="contained"
              size="small"
              startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <AutoFixHighIcon />}
              onClick={handleTextExtract}
              disabled={loading || text.trim().length < 10}
            >
              {loading ? "Analyzing…" : "Extract from Text"}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<UploadFileIcon />}
              onClick={() => fileRef.current?.click()}
              disabled={loading}
            >
              Upload PDF / TXT
            </Button>
            <input ref={fileRef} type="file" accept="application/pdf,text/plain" hidden onChange={handleFileChange} />
            {text.trim().length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                {text.length} characters
              </Typography>
            )}
          </Box>
        </Collapse>

        {/* Error */}
        {error && (
          <Alert
            severity="error"
            sx={{ mt: data ? 0 : 1.5 }}
            action={
              retryCount < 3 ? (
                <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={handleRetry} disabled={loading}>
                  Retry
                </Button>
              ) : undefined
            }
          >
            <Typography variant="body2">{error}</Typography>
            {retryCount >= 3 && (
              <Typography variant="caption" display="block" mt={0.5}>
                Multiple retries failed. Please check your input or try again later.
              </Typography>
            )}
          </Alert>
        )}

        {/* Success preview */}
        {data && (
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CheckCircleOutlineIcon sx={{ color: "success.main", fontSize: 18 }} />
              <Typography variant="body2" fontWeight={600} color="success.dark">
                Auto-applied — {fieldCount} of 14 fields populated
              </Typography>
            </Box>

            {data.summary && (
              <Box
                sx={{
                  p: 1.5, mb: 2, borderRadius: 1.5,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                  border: "1px solid", borderColor: (t) => alpha(t.palette.primary.main, 0.15),
                }}
              >
                <Typography variant="caption" color="primary.main" fontWeight={600} display="block" mb={0.5}>
                  AI SUMMARY
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                  {data.summary}
                </Typography>
              </Box>
            )}

            <Grid container spacing={1} mb={2}>
              {[
                { label: "Customer", value: data.customer_name },
                { label: "Product", value: data.product_name },
                { label: "Batch", value: data.batch_number },
                { label: "Severity", value: data.severity },
                { label: "Risk", value: data.risk_level },
                { label: "Category", value: data.complaint_category },
              ].map(({ label, value }) => value && (
                <Grid item key={label}>
                  <Box
                    sx={{
                      px: 1.25, py: 0.5, borderRadius: 1,
                      bgcolor: "grey.100", border: "1px solid", borderColor: "divider",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2}>
                      {label}
                    </Typography>
                    <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ textTransform: "capitalize" }}>
                      {value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ mb: 2 }} />

            <Box display="flex" gap={1}>
              <Button variant="outlined" size="small" startIcon={<AutoFixHighIcon />} onClick={handleReapply}>
                Re-apply to Form
              </Button>
              <Button variant="text" size="small" onClick={() => { dispatch(clearCopilot()); setText(""); }}>
                Try Again
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
