import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Card, CardContent, CardHeader, Chip, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Skeleton, Tab, Tabs, Tooltip, Typography, Alert, } from "@mui/material";
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
import api from "@/shared/utils/api";
import { CATEGORY_COLORS } from "@/shared/constants";
function InfoRow({ label, value }) {
    return (_jsxs(Box, { mb: 1.5, children: [_jsx(Typography, { variant: "overline", color: "text.secondary", display: "block", children: label }), _jsx(Typography, { variant: "body2", color: value ? "text.primary" : "text.disabled", children: value || "—" })] }));
}
export default function ComplaintDetailPage() {
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { selected: complaint, loading } = useAppSelector((s) => s.complaints);
    const [tab, setTab] = useState(0);
    const [timeline, setTimeline] = useState([]);
    const [tlLoading, setTlLoading] = useState(false);
    const [aiData, setAiData] = useState(null);
    const [aiError, setAiError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [statusVal, setStatusVal] = useState("");
    const [runPipeline, { isLoading: pipelineLoading }] = useRunPipelineMutation();
    useEffect(() => {
        if (id)
            dispatch(fetchComplaint(id));
    }, [id, dispatch]);
    useEffect(() => {
        if (complaint)
            setStatusVal(complaint.status);
    }, [complaint]);
    useEffect(() => {
        if (!id || tab !== 1)
            return;
        setTlLoading(true);
        api.get(`/complaints/${id}/timeline`)
            .then((r) => setTimeline(r.data))
            .catch(() => setTimeline([]))
            .finally(() => setTlLoading(false));
    }, [id, tab]);
    useEffect(() => {
        if (!id || tab !== 2)
            return;
        api.get(`/complaints/${id}/ai-analysis`)
            .then((r) => setAiData(r.data?.raw_output ?? null))
            .catch(() => setAiData(null));
    }, [id, tab]);
    const handleRunPipeline = async () => {
        if (!complaint || !id)
            return;
        setAiError(null);
        try {
            const result = await runPipeline({
                complaint_id: id,
                title: complaint.title,
                description: complaint.description,
                category: complaint.category,
            }).unwrap();
            setAiData(result);
        }
        catch {
            setAiError("Pipeline failed. Please try again.");
        }
    };
    const handleStatusSave = () => {
        if (!complaint)
            return;
        dispatch(updateComplaintWithToast({ id: complaint.id, status: statusVal }));
        setEditing(false);
    };
    if (loading && !complaint) {
        return (_jsx(AppLayout, { children: _jsxs(Box, { sx: { p: { xs: 2, sm: 3 } }, children: [_jsxs(Box, { display: "flex", alignItems: "center", gap: 1.5, mb: 3, children: [_jsx(Skeleton, { variant: "circular", width: 32, height: 32 }), _jsxs(Box, { flex: 1, children: [_jsx(Skeleton, { variant: "text", width: "60%", height: 32 }), _jsxs(Box, { display: "flex", gap: 1, mt: 0.5, children: [_jsx(Skeleton, { variant: "text", width: 80 }), _jsx(Skeleton, { variant: "text", width: 60 }), _jsx(Skeleton, { variant: "text", width: 60 })] })] }), _jsx(Skeleton, { variant: "rectangular", width: 70, height: 32, sx: { borderRadius: 1 } })] }), _jsxs(Grid, { container: true, spacing: 2.5, children: [_jsx(Grid, { item: true, xs: 12, lg: 8, children: _jsxs(Card, { children: [_jsx(Box, { sx: { borderBottom: 1, borderColor: "divider", px: 2, py: 1 }, children: _jsx(Skeleton, { variant: "rectangular", height: 36, width: 300 }) }), _jsxs(CardContent, { children: [_jsx(Skeleton, { variant: "text", width: "40%" }), _jsx(Skeleton, { variant: "text", width: "100%", height: 100, sx: { mt: 1 } })] })] }) }), _jsxs(Grid, { item: true, xs: 12, lg: 4, children: [_jsx(Card, { sx: { mb: 2 }, children: _jsxs(CardContent, { children: [_jsx(Skeleton, { variant: "text", width: "30%" }), _jsx(Skeleton, { variant: "rectangular", height: 36, sx: { mt: 1 } })] }) }), _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Skeleton, { variant: "text", width: "40%" }), _jsx(Skeleton, { variant: "text", width: "80%", sx: { mt: 1 } }), _jsx(Skeleton, { variant: "text", width: "60%", sx: { mt: 1 } }), _jsx(Skeleton, { variant: "text", width: "70%", sx: { mt: 1 } })] }) })] })] })] }) }));
    }
    if (!complaint) {
        return (_jsx(AppLayout, { children: _jsxs(Box, { sx: { p: { xs: 2, sm: 3 } }, children: [_jsx(Alert, { severity: "error", children: "Complaint not found." }), _jsx(Button, { sx: { mt: 2 }, onClick: () => navigate("/complaints"), children: "Back to list" })] }) }));
    }
    return (_jsx(AppLayout, { children: _jsxs(Box, { sx: { p: { xs: 2, sm: 3 } }, children: [_jsxs(Box, { display: "flex", alignItems: "center", gap: 1.5, mb: 3, children: [_jsx(IconButton, { size: "small", onClick: () => navigate("/complaints"), "aria-label": "Go back to complaints list", sx: { border: "1px solid", borderColor: "divider" }, children: _jsx(ArrowBackIcon, { fontSize: "small" }) }), _jsxs(Box, { flex: 1, children: [_jsx(Typography, { variant: "h5", fontWeight: 700, children: complaint.title }), _jsxs(Box, { display: "flex", alignItems: "center", gap: 1, mt: 0.5, children: [_jsxs(Typography, { variant: "caption", color: "text.secondary", children: ["#", complaint.id.slice(0, 8)] }), _jsx(StatusChip, { status: complaint.status }), _jsx(SeverityChip, { level: complaint.priority }), _jsx(Chip, { label: complaint.category, size: "small", sx: { height: 20, fontSize: "0.7rem", fontWeight: 500, bgcolor: `${CATEGORY_COLORS[complaint.category]}18`, color: CATEGORY_COLORS[complaint.category], textTransform: "capitalize" } })] })] }), _jsx(Button, { variant: "outlined", size: "small", startIcon: _jsx(EditIcon, {}), onClick: () => navigate(`/complaints/${id}/edit`), children: "Edit" })] }), _jsxs(Grid, { container: true, spacing: 2.5, children: [_jsx(Grid, { item: true, xs: 12, lg: 8, children: _jsxs(Card, { children: [_jsxs(Tabs, { value: tab, onChange: (_, v) => setTab(v), sx: { px: 2, borderBottom: "1px solid", borderColor: "divider" }, children: [_jsx(Tab, { label: "Details" }), _jsx(Tab, { label: "Timeline" }), _jsx(Tab, { label: "AI Analysis", icon: _jsx(AutoFixHighIcon, { sx: { fontSize: 14 } }), iconPosition: "end" }), _jsx(Tab, { label: "Documents", icon: _jsx(AttachFileIcon, { sx: { fontSize: 14 } }), iconPosition: "end" })] }), _jsxs(CardContent, { sx: { p: 3 }, children: [tab === 0 && (_jsxs(Box, { children: [_jsx(Typography, { variant: "overline", color: "text.secondary", children: "Description" }), _jsx(Typography, { variant: "body2", sx: { mt: 0.5, mb: 3, lineHeight: 1.8 }, children: complaint.description }), complaint.resolution_notes && (_jsxs(_Fragment, { children: [_jsx(Divider, { sx: { mb: 2 } }), _jsx(Typography, { variant: "overline", color: "text.secondary", children: "Resolution Notes" }), _jsx(Typography, { variant: "body2", sx: { mt: 0.5, lineHeight: 1.8 }, children: complaint.resolution_notes })] }))] })), tab === 1 && _jsx(Timeline, { events: timeline, loading: tlLoading }), tab === 3 && _jsx(UploadPanel, { complaintId: complaint.id }), tab === 2 && (_jsxs(Box, { children: [aiError && _jsx(Alert, { severity: "error", sx: { mb: 2 }, children: aiError }), _jsx(AIAnalysisPanel, { data: aiData, loading: pipelineLoading, error: aiError, onRunPipeline: handleRunPipeline })] }))] })] }) }), _jsxs(Grid, { item: true, xs: 12, lg: 4, children: [_jsxs(Card, { sx: { mb: 2 }, children: [_jsx(CardHeader, { title: _jsx(Typography, { variant: "subtitle1", fontWeight: 600, children: "Status" }), sx: { pb: 1 } }), _jsx(CardContent, { sx: { pt: 0 }, children: editing ? (_jsxs(Box, { display: "flex", gap: 1, alignItems: "center", children: [_jsxs(FormControl, { size: "small", fullWidth: true, children: [_jsx(InputLabel, { children: "Status" }), _jsx(Select, { value: statusVal, label: "Status", onChange: (e) => setStatusVal(e.target.value), children: ["open", "in_progress", "resolved", "closed"].map((s) => (_jsx(MenuItem, { value: s, sx: { textTransform: "capitalize" }, children: s.replace(/_/g, " ") }, s))) })] }), _jsx(Tooltip, { title: "Save", arrow: true, children: _jsx(IconButton, { size: "small", color: "primary", onClick: handleStatusSave, "aria-label": "Save status change", children: _jsx(CheckCircleIcon, { fontSize: "small" }) }) })] })) : (_jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [_jsx(StatusChip, { status: complaint.status }), _jsx(Button, { size: "small", variant: "text", onClick: () => setEditing(true), children: "Change" })] })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { title: _jsx(Typography, { variant: "subtitle1", fontWeight: 600, children: "Details" }), sx: { pb: 1 } }), _jsxs(CardContent, { sx: { pt: 0 }, children: [_jsx(InfoRow, { label: "Priority", value: complaint.priority }), _jsx(InfoRow, { label: "Category", value: complaint.category }), _jsx(InfoRow, { label: "Assigned To", value: complaint.assigned_agent_id ?? "Unassigned" }), _jsx(Divider, { sx: { my: 1.5 } }), _jsx(InfoRow, { label: "Created", value: new Date(complaint.created_at).toLocaleString() }), _jsx(InfoRow, { label: "Last Updated", value: new Date(complaint.updated_at).toLocaleString() })] })] })] })] })] }) }));
}
