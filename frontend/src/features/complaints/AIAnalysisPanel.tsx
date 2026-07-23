import {
  Alert, Box, Button, Chip, CircularProgress, Collapse,
  Divider, Grid, LinearProgress, Tooltip, Typography,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useState } from "react";
import { alpha } from "@mui/material/styles";
import type { PipelineOutput } from "@/shared/types";

// ── Colour maps ────────────────────────────────────────────────────────────────

const RISK_COLOR: Record<string, string> = {
  low: "#059669", medium: "#D97706", high: "#DC2626", critical: "#7C3AED",
};
const SENTIMENT_COLOR: Record<string, string> = {
  positive: "#059669", neutral: "#64748B", negative: "#DC2626",
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeader({ title, reasoning }: { title: string; reasoning?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Box mb={1}>
      <Box display="flex" alignItems="center" gap={0.5}>
        <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1 }}>
          {title}
        </Typography>
        {reasoning && (
          <Tooltip title={open ? "Hide AI reasoning" : "Show AI reasoning"} arrow>
            <InfoOutlinedIcon
              sx={{ fontSize: 14, color: "text.disabled", cursor: "pointer", "&:hover": { color: "primary.main" } }}
              onClick={() => setOpen((v) => !v)}
            />
          </Tooltip>
        )}
      </Box>
      {reasoning && (
        <Collapse in={open}>
          <Box
            sx={{
              p: 1.25, borderRadius: 1, mt: 0.5,
              bgcolor: (t) => alpha(t.palette.info.main, 0.06),
              border: "1px solid", borderColor: (t) => alpha(t.palette.info.main, 0.2),
            }}
          >
            <Typography variant="caption" color="text.secondary" lineHeight={1.6}>
              💡 {reasoning}
            </Typography>
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const pct = Math.round(score * 100);
  const color = score >= 0.75 ? "success" : score >= 0.5 ? "warning" : "error";
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={0.5}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="caption" fontWeight={600}>{pct}%</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={color}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Box>
  );
}

function ActionList({ items, color }: { items: string[]; color: string }) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 2 }}>
      {items.map((a, i) => (
        <Typography key={i} component="li" variant="body2" sx={{ mb: 0.5, color }}>
          {a}
        </Typography>
      ))}
    </Box>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  data: PipelineOutput | null;
  loading: boolean;
  error: string | null;
  onRunPipeline: () => void;
}

export default function AIAnalysisPanel({ data, loading, error: _error, onRunPipeline }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!data?.suggested_response) return;
    navigator.clipboard.writeText(data.suggested_response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Box textAlign="center" py={6}>
        <CircularProgress size={36} />
        <Typography variant="body2" color="text.secondary" mt={2}>
          Running AI pipeline… this may take 10–20 seconds.
        </Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box textAlign="center" py={6}>
        <AutoFixHighIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
        <Typography variant="body1" fontWeight={600} gutterBottom>
          No AI analysis yet
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Run the full pipeline to get summary, risk classification, root cause, CAPA, and more.
        </Typography>
        <Button variant="contained" startIcon={<AutoFixHighIcon />} onClick={onRunPipeline}>
          Run AI Analysis
        </Button>
      </Box>
    );
  }

  const { explanations: ex, risk, root_cause_analysis: rca, capa, completeness } = data;

  return (
    <Box>
      {/* Pipeline status bar */}
      <Box
        display="flex" alignItems="center" gap={1} mb={2.5} p={1.5}
        sx={{ borderRadius: 1.5, bgcolor: data.pipeline_status === "rejected" ? "error.50" : "success.50", border: "1px solid", borderColor: data.pipeline_status === "rejected" ? "error.200" : "success.200" }}
      >
        {data.pipeline_status === "rejected"
          ? <WarningAmberIcon sx={{ color: "error.main", fontSize: 18 }} />
          : <CheckCircleIcon sx={{ color: "success.main", fontSize: 18 }} />}
        <Typography variant="body2" fontWeight={600} sx={{ textTransform: "capitalize" }}>
          {data.pipeline_status.replace(/_/g, " ")}
        </Typography>
        {data.errors.length > 0 && (
          <Chip label={`${data.errors.length} error(s)`} size="small" color="error" sx={{ ml: "auto" }} />
        )}
        <Button size="small" variant="text" sx={{ ml: data.errors.length ? 0 : "auto" }} onClick={onRunPipeline}>
          Re-run
        </Button>
      </Box>

      {/* Validation issues */}
      {data.validation_issues.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>Validation Issues</Typography>
          {data.validation_issues.map((v, i) => <Typography key={i} variant="body2">• {v}</Typography>)}
        </Alert>
      )}

      {/* Duplicate warning */}
      {data.is_duplicate && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Possible duplicate</strong> — similarity {Math.round(data.similarity_score * 100)}% with:{" "}
            <em>{data.duplicate_of}</em>
          </Typography>
          {ex?.duplicate_detection && (
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              💡 {ex.duplicate_detection}
            </Typography>
          )}
        </Alert>
      )}

      <Grid container spacing={2.5}>

        {/* ── 1. Summary ── */}
        {data.summary && (
          <Grid item xs={12}>
            <SectionHeader title="Summary" reasoning={ex?.summary} />
            <Typography variant="body2" lineHeight={1.8} color="text.primary">
              {data.summary}
            </Typography>
          </Grid>
        )}

        {data.summary && <Grid item xs={12}><Divider /></Grid>}

        {/* ── 2. Completeness ── */}
        <Grid item xs={12} sm={6}>
          <SectionHeader title="Completeness" reasoning={ex?.completeness} />
          <ScoreBar score={completeness?.score ?? 0} label="Record completeness" />
          {completeness?.missing_fields?.length > 0 && (
            <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
              {completeness.missing_fields.map((f) => (
                <Chip key={f} label={f} size="small" color="warning" variant="outlined" sx={{ fontSize: "0.7rem" }} />
              ))}
            </Box>
          )}
        </Grid>

        {/* ── 3. Risk Classification ── */}
        <Grid item xs={12} sm={6}>
          <SectionHeader title="Risk Classification" reasoning={ex?.risk_classification} />
          <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
            <Chip
              label={`Risk: ${risk.risk_level}`}
              size="small"
              sx={{ bgcolor: alpha(RISK_COLOR[risk.risk_level] ?? "#64748B", 0.12), color: RISK_COLOR[risk.risk_level] ?? "#64748B", fontWeight: 600, textTransform: "capitalize" }}
            />
            <Chip
              label={`Sentiment: ${risk.sentiment}`}
              size="small"
              sx={{ bgcolor: alpha(SENTIMENT_COLOR[risk.sentiment] ?? "#64748B", 0.12), color: SENTIMENT_COLOR[risk.sentiment] ?? "#64748B", fontWeight: 600, textTransform: "capitalize" }}
            />
            <Chip label={`Priority: ${risk.suggested_priority}`} size="small" variant="outlined" sx={{ textTransform: "capitalize" }} />
            <Chip label={`Category: ${risk.suggested_category}`} size="small" variant="outlined" sx={{ textTransform: "capitalize" }} />
          </Box>
          <ScoreBar score={risk.sentiment_score} label="Negative sentiment intensity" />
        </Grid>

        <Grid item xs={12}><Divider /></Grid>

        {/* ── 4. Root Cause ── */}
        {rca?.root_cause && (
          <Grid item xs={12} sm={6}>
            <SectionHeader title="Root Cause" reasoning={ex?.root_cause} />
            <Typography variant="body2" fontWeight={600} mb={0.75}>{rca.root_cause}</Typography>
            {rca.contributing_factors?.length > 0 && (
              <>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  Contributing factors
                </Typography>
                <ActionList items={rca.contributing_factors} color="text.secondary" />
              </>
            )}
          </Grid>
        )}

        {/* ── 5. CAPA ── */}
        {(capa?.corrective_actions?.length > 0 || capa?.preventive_actions?.length > 0) && (
          <Grid item xs={12} sm={6}>
            <SectionHeader title="CAPA Recommendations" reasoning={ex?.capa} />
            {capa.corrective_actions?.length > 0 && (
              <Box mb={1.5}>
                <Typography variant="caption" color="error.main" fontWeight={600} display="block" mb={0.5}>
                  Corrective Actions
                </Typography>
                <ActionList items={capa.corrective_actions} color="text.primary" />
              </Box>
            )}
            {capa.preventive_actions?.length > 0 && (
              <Box>
                <Typography variant="caption" color="success.dark" fontWeight={600} display="block" mb={0.5}>
                  Preventive Actions
                </Typography>
                <ActionList items={capa.preventive_actions} color="text.primary" />
              </Box>
            )}
            {capa.timeline_days != null && (
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                ⏱ Estimated resolution: {capa.timeline_days} days
              </Typography>
            )}
          </Grid>
        )}

        {/* ── 6. Suggested Response ── */}
        {data.suggested_response && (
          <>
            <Grid item xs={12}><Divider /></Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <SectionHeader title="Suggested Customer Response" />
                <Tooltip title={copied ? "Copied!" : "Copy to clipboard"} arrow>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                    onClick={handleCopy}
                    sx={{ mb: 1 }}
                  >
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </Tooltip>
              </Box>
              <Box
                sx={{
                  p: 2, borderRadius: 1.5,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                  border: "1px solid", borderColor: (t) => alpha(t.palette.primary.main, 0.15),
                }}
              >
                <Typography variant="body2" lineHeight={1.8} color="text.primary">
                  {data.suggested_response}
                </Typography>
              </Box>
            </Grid>
          </>
        )}

        {/* ── Extraction keywords/entities ── */}
        {(data.extraction?.keywords?.length > 0 || data.extraction?.entities?.length > 0) && (
          <>
            <Grid item xs={12}><Divider /></Grid>
            <Grid item xs={12}>
              <SectionHeader title="Extracted Signals" reasoning={ex?.extraction} />
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {data.extraction.keywords.map((k) => (
                  <Chip key={k} label={k} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />
                ))}
                {data.extraction.entities.map((e) => (
                  <Chip key={e} label={e} size="small" color="primary" variant="outlined" sx={{ fontSize: "0.7rem" }} />
                ))}
              </Box>
            </Grid>
          </>
        )}

        {/* Errors */}
        {data.errors.length > 0 && (
          <Grid item xs={12}>
            <Alert severity="error">
              {data.errors.map((e, i) => <Typography key={i} variant="caption" display="block">{e}</Typography>)}
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
