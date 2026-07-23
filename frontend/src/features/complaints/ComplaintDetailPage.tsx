import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Button, Card, CardContent, CardHeader, Chip, Divider,
  FormControl, Grid, IconButton, InputLabel, MenuItem, Select,
  Skeleton, Tab, Tabs, Tooltip, Typography, Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { fetchComplaint, updateComplaintWithToast } from "./complaintsSlice";
import AppLayout from "@/shared/components/AppLayout";
import StatusChip from "@/shared/components/StatusChip";
import SeverityChip from "@/shared/components/SeverityChip";
import Timeline from "./Timeline";
import UploadPanel from "./UploadPanel";
import AIAnalysisPanel from "./AIAnalysisPanel";
import { useRunPipelineMutation } from "./aiApi";
import type { ComplaintStatus, ComplaintPriority, TimelineEvent, PipelineOutput } from "@/shared/types";
import api from "@/shared/utils/api";
import { CATEGORY_COLORS } from "@/shared/constants";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box mb={1.5}>
      <Typography variant="overline" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" color={value ? "text.primary" : "text.disabled"}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selected: complaint, loading } = useAppSelector((s) => s.complaints);
  const [tab, setTab] = useState(0);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [tlLoading, setTlLoading] = useState(false);
  const [aiData, setAiData] = useState<PipelineOutput | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [statusVal, setStatusVal] = useState<string>("");
  const [runPipeline, { isLoading: pipelineLoading }] = useRunPipelineMutation();

  useEffect(() => {
    if (id) dispatch(fetchComplaint(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (complaint) setStatusVal(complaint.status);
  }, [complaint]);

  useEffect(() => {
    if (!id || tab !== 1) return;
    setTlLoading(true);
    api.get(`/complaints/${id}/timeline`)
      .then((r) => setTimeline(r.data))
      .catch(() => setTimeline([]))
      .finally(() => setTlLoading(false));
  }, [id, tab]);

  useEffect(() => {
    if (!id || tab !== 2) return;
    api.get(`/complaints/${id}/ai-analysis`)
      .then((r) => setAiData((r.data?.raw_output as PipelineOutput) ?? null))
      .catch(() => setAiData(null));
  }, [id, tab]);

  const handleRunPipeline = async () => {
    if (!complaint || !id) return;
    setAiError(null);
    try {
      const result = await runPipeline({
        complaint_id: id,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
      }).unwrap();
      setAiData(result as PipelineOutput);
    } catch {
      setAiError("Pipeline failed. Please try again.");
    }
  };

  const handleStatusSave = () => {
    if (!complaint) return;
    dispatch(updateComplaintWithToast({ id: complaint.id, status: statusVal as ComplaintStatus }));
    setEditing(false);
  };

  if (loading && !complaint) {
    return (
      <AppLayout>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Header Skeleton */}
          <Box display="flex" alignItems="center" gap={1.5} mb={3}>
            <Skeleton variant="circular" width={32} height={32} />
            <Box flex={1}>
              <Skeleton variant="text" width="60%" height={32} />
              <Box display="flex" gap={1} mt={0.5}>
                <Skeleton variant="text" width={80} />
                <Skeleton variant="text" width={60} />
                <Skeleton variant="text" width={60} />
              </Box>
            </Box>
            <Skeleton variant="rectangular" width={70} height={32} sx={{ borderRadius: 1 }} />
          </Box>

          <Grid container spacing={2.5}>
            <Grid item xs={12} lg={8}>
              <Card>
                <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, py: 1 }}>
                  <Skeleton variant="rectangular" height={36} width={300} />
                </Box>
                <CardContent>
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="100%" height={100} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Skeleton variant="text" width="30%" />
                  <Skeleton variant="rectangular" height={36} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="60%" sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="70%" sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </AppLayout>
    );
  }

  if (!complaint) {
    return (
      <AppLayout>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Alert severity="error">Complaint not found.</Alert>
          <Button sx={{ mt: 2 }} onClick={() => navigate("/complaints")}>Back to list</Button>
        </Box>
      </AppLayout>
    );
  }



  return (
    <AppLayout>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Back + title */}
        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
          <IconButton
            size="small"
            onClick={() => navigate("/complaints")}
            aria-label="Go back to complaints list"
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box flex={1}>
            <Typography variant="h5" fontWeight={700}>{complaint.title}</Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Typography variant="caption" color="text.secondary">#{complaint.id.slice(0, 8)}</Typography>
              <StatusChip status={complaint.status as ComplaintStatus} />
              <SeverityChip level={complaint.priority as ComplaintPriority} />
              <Chip
                label={complaint.category}
                size="small"
                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 500, bgcolor: `${CATEGORY_COLORS[complaint.category]}18`, color: CATEGORY_COLORS[complaint.category], textTransform: "capitalize" }}
              />
            </Box>
          </Box>
          <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => navigate(`/complaints/${id}/edit`)}>
            Edit
          </Button>
        </Box>

        <Grid container spacing={2.5}>
          {/* Main */}
          <Grid item xs={12} lg={8}>
            <Card>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                <Tab label="Details" />
                <Tab label="Timeline" />
                <Tab label="AI Analysis" icon={<AutoFixHighIcon sx={{ fontSize: 14 }} />} iconPosition="end" />
                <Tab label="Documents" icon={<AttachFileIcon sx={{ fontSize: 14 }} />} iconPosition="end" />
              </Tabs>

              <CardContent sx={{ p: 3 }}>
                {tab === 0 && (
                  <Box>
                    <Typography variant="overline" color="text.secondary">Description</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, mb: 3, lineHeight: 1.8 }}>
                      {complaint.description}
                    </Typography>
                    {complaint.resolution_notes && (
                      <>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="overline" color="text.secondary">Resolution Notes</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.8 }}>
                          {complaint.resolution_notes}
                        </Typography>
                      </>
                    )}
                  </Box>
                )}

                {tab === 1 && <Timeline events={timeline} loading={tlLoading} />}

                {tab === 3 && <UploadPanel complaintId={complaint.id} />}

                {tab === 2 && (
                  <Box>
                    {aiError && <Alert severity="error" sx={{ mb: 2 }}>{aiError}</Alert>}
                    <AIAnalysisPanel
                      data={aiData}
                      loading={pipelineLoading}
                      error={aiError}
                      onRunPipeline={handleRunPipeline}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ mb: 2 }}>
              <CardHeader title={<Typography variant="subtitle1" fontWeight={600}>Status</Typography>} sx={{ pb: 1 }} />
              <CardContent sx={{ pt: 0 }}>
                {editing ? (
                  <Box display="flex" gap={1} alignItems="center">
                    <FormControl size="small" fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select value={statusVal} label="Status" onChange={(e) => setStatusVal(e.target.value)}>
                        {["open", "in_progress", "resolved", "closed"].map((s) => (
                          <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s.replace(/_/g, " ")}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Tooltip title="Save" arrow>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={handleStatusSave}
                        aria-label="Save status change"
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <StatusChip status={complaint.status as ComplaintStatus} />
                    <Button size="small" variant="text" onClick={() => setEditing(true)}>Change</Button>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader title={<Typography variant="subtitle1" fontWeight={600}>Details</Typography>} sx={{ pb: 1 }} />
              <CardContent sx={{ pt: 0 }}>
                <InfoRow label="Priority" value={complaint.priority} />
                <InfoRow label="Category" value={complaint.category} />
                <InfoRow label="Assigned To" value={complaint.assigned_agent_id ?? "Unassigned"} />
                <Divider sx={{ my: 1.5 }} />
                <InfoRow label="Created" value={new Date(complaint.created_at).toLocaleString()} />
                <InfoRow label="Last Updated" value={new Date(complaint.updated_at).toLocaleString()} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
}
