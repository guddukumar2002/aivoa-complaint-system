import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography, Card, CardContent, CardHeader, Table, TableBody, TableCell, TableHead, TableRow, Skeleton, Chip, LinearProgress, Button, Divider, TableContainer, } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { fetchDashboard } from "./dashboardSlice";
import AppLayout from "@/shared/components/AppLayout";
import StatCard from "@/shared/components/StatCard";
import StatusChip from "@/shared/components/StatusChip";
import SeverityChip from "@/shared/components/SeverityChip";
import { CATEGORY_COLORS } from "@/shared/constants";
export default function DashboardPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { stats, recent, loading } = useAppSelector((s) => s.dashboard);
    useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);
    const categoryBreakdown = useMemo(() => {
        return recent.reduce((acc, c) => {
            acc[c.category] = (acc[c.category] ?? 0) + 1;
            return acc;
        }, {});
    }, [recent]);
    return (_jsx(AppLayout, { title: "Dashboard", children: _jsxs(Box, { sx: { p: { xs: 2, sm: 3 } }, children: [_jsx(Grid, { container: true, spacing: 2.5, mb: 3, children: [
                        { title: "Total Complaints", value: stats?.total ?? 0, icon: AssignmentIcon, color: "#2563EB", bg: "#DBEAFE" },
                        { title: "Open", value: stats?.open ?? 0, icon: ErrorOutlineIcon, color: "#D97706", bg: "#FEF3C7" },
                        { title: "In Progress", value: stats?.in_progress ?? 0, icon: HourglassEmptyIcon, color: "#7C3AED", bg: "#EDE9FE" },
                        { title: "Resolved", value: stats?.resolved ?? 0, icon: CheckCircleOutlineIcon, color: "#059669", bg: "#D1FAE5" },
                        { title: "Critical", value: stats?.critical ?? 0, icon: WarningAmberIcon, color: "#DC2626", bg: "#FEE2E2", subtitle: `+${stats?.high ?? 0} high priority` },
                    ].map((s) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, lg: 2.4, children: _jsx(StatCard, { ...s, loading: loading }) }, s.title))) }), _jsxs(Grid, { container: true, spacing: 2.5, children: [_jsx(Grid, { item: true, xs: 12, lg: 8, children: _jsxs(Card, { sx: { transition: "transform 0.2s, box-shadow 0.2s", "&:hover": { transform: "translateY(-2px)", boxShadow: 3 } }, children: [_jsx(CardHeader, { title: _jsx(Typography, { variant: "h6", fontWeight: 600, children: "Recent Complaints" }), action: _jsx(Button, { size: "small", endIcon: _jsx(ArrowForwardIcon, {}), onClick: () => navigate("/complaints"), children: "View all" }), sx: { pb: 0, px: 2.5, pt: 2 } }), _jsx(CardContent, { sx: { p: 0, "&:last-child": { pb: 0 } }, children: loading ? (_jsx(Box, { p: 2.5, children: [...Array(5)].map((_, i) => _jsx(Skeleton, { height: 48, sx: { mb: 0.5 } }, i)) })) : (_jsx(TableContainer, { children: _jsxs(Table, { size: "small", "aria-label": "Recent complaints table", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Title" }), _jsx(TableCell, { children: "Category" }), _jsx(TableCell, { children: "Status" }), _jsx(TableCell, { children: "Priority" }), _jsx(TableCell, { children: "Date" })] }) }), _jsx(TableBody, { children: recent.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, align: "center", sx: { py: 4, color: "text.secondary" }, children: "No complaints yet" }) })) : (recent.map((c) => (_jsxs(TableRow, { hover: true, sx: { cursor: "pointer" }, onClick: () => navigate(`/complaints/${c.id}`), children: [_jsx(TableCell, { children: _jsx(Typography, { variant: "body2", fontWeight: 500, noWrap: true, sx: { maxWidth: 220 }, children: c.title }) }), _jsx(TableCell, { children: _jsx(Chip, { label: c.category, size: "small", sx: {
                                                                            height: 20, fontSize: "0.7rem", fontWeight: 500,
                                                                            bgcolor: `${CATEGORY_COLORS[c.category]}18`,
                                                                            color: CATEGORY_COLORS[c.category],
                                                                            textTransform: "capitalize",
                                                                        } }) }), _jsx(TableCell, { children: _jsx(StatusChip, { status: c.status }) }), _jsx(TableCell, { children: _jsx(SeverityChip, { level: c.priority }) }), _jsx(TableCell, { children: _jsx(Typography, { variant: "caption", color: "text.secondary", children: new Date(c.created_at).toLocaleDateString() }) })] }, c.id)))) })] }) })) })] }) }), _jsx(Grid, { item: true, xs: 12, lg: 4, children: _jsxs(Card, { sx: { height: "100%", transition: "transform 0.2s, box-shadow 0.2s", "&:hover": { transform: "translateY(-2px)", boxShadow: 3 } }, children: [_jsx(CardHeader, { title: _jsx(Typography, { variant: "h6", fontWeight: 600, children: "By Category" }), sx: { pb: 0, px: 2.5, pt: 2 } }), _jsxs(CardContent, { sx: { px: 2.5 }, children: [loading ? ([...Array(5)].map((_, i) => _jsx(Skeleton, { height: 40, sx: { mb: 1 } }, i))) : Object.keys(CATEGORY_COLORS).map((cat) => {
                                                const count = categoryBreakdown[cat] ?? 0;
                                                const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                                                return (_jsxs(Box, { mb: 2, children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 0.5, children: [_jsx(Typography, { variant: "body2", fontWeight: 500, sx: { textTransform: "capitalize" }, children: cat }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: [count, " (", pct, "%)"] })] }), _jsx(LinearProgress, { variant: "determinate", value: pct, sx: {
                                                                bgcolor: `${CATEGORY_COLORS[cat]}18`,
                                                                "& .MuiLinearProgress-bar": { bgcolor: CATEGORY_COLORS[cat] },
                                                            } })] }, cat));
                                            }), _jsx(Divider, { sx: { my: 2 } }), _jsxs(Box, { display: "flex", justifyContent: "space-between", children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Total" }), _jsx(Typography, { variant: "body2", fontWeight: 600, children: stats?.total ?? 0 })] })] })] }) })] })] }) }));
}
