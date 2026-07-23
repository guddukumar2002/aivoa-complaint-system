import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Card, Chip, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Select, Skeleton, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Tooltip, Typography, TableContainer, } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { fetchComplaints, deleteComplaintWithToast, setPage, setFilters } from "./complaintsSlice";
import AppLayout from "@/shared/components/AppLayout";
import StatusChip from "@/shared/components/StatusChip";
import SeverityChip from "@/shared/components/SeverityChip";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import { CATEGORY_COLORS } from "@/shared/constants";
export default function ComplaintsPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { items, total, page, pageSize, loading, filters } = useAppSelector((s) => s.complaints);
    const [search, setSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const load = (p = page) => dispatch(fetchComplaints({ page: p, ...filters }));
    useEffect(() => { load(1); }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps
    const filtered = useMemo(() => {
        return search
            ? items.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
            : items;
    }, [items, search]);
    const handleDeleteClick = (e, id) => {
        e.stopPropagation();
        setDeleteTargetId(id);
        setConfirmOpen(true);
    };
    const handleConfirmDelete = () => {
        if (deleteTargetId) {
            dispatch(deleteComplaintWithToast(deleteTargetId));
        }
        setConfirmOpen(false);
        setDeleteTargetId(null);
    };
    const handleCancelDelete = () => {
        setConfirmOpen(false);
        setDeleteTargetId(null);
    };
    const handleExportCSV = () => {
        const headers = ["ID", "Title", "Category", "Status", "Priority", "Created At"];
        const rows = filtered.map((c) => [
            c.id,
            `"${c.title.replace(/"/g, '""')}"`,
            c.category,
            c.status,
            c.priority,
            c.created_at || "",
        ]);
        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `complaints_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (_jsxs(AppLayout, { title: "Complaints", children: [_jsxs(Box, { sx: { p: { xs: 2, sm: 3 } }, children: [_jsxs(Box, { display: "flex", alignItems: "center", gap: 1.5, mb: 2.5, flexWrap: "wrap", children: [_jsx(TextField, { placeholder: "Search complaints\u2026", size: "small", value: search, onChange: (e) => setSearch(e.target.value), sx: { width: 280 }, InputProps: {
                                    startAdornment: _jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, { sx: { fontSize: 18, color: "text.disabled" } }) }),
                                } }), _jsx(Tooltip, { title: "Filters", arrow: true, children: _jsx(IconButton, { size: "small", onClick: () => setShowFilters((v) => !v), "aria-label": "Toggle filters list", sx: { border: "1px solid", borderColor: "divider" }, children: _jsx(FilterListIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "Refresh", arrow: true, children: _jsx(IconButton, { size: "small", onClick: () => load(1), "aria-label": "Refresh complaints list", sx: { border: "1px solid", borderColor: "divider" }, children: _jsx(RefreshIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "Export CSV", arrow: true, children: _jsx(IconButton, { size: "small", onClick: handleExportCSV, "aria-label": "Export complaints as CSV", sx: { border: "1px solid", borderColor: "divider" }, disabled: filtered.length === 0, children: _jsx(DownloadIcon, { fontSize: "small" }) }) }), _jsx(Box, { sx: { ml: "auto" }, children: _jsx(Button, { variant: "contained", size: "small", startIcon: _jsx(AddIcon, {}), onClick: () => navigate("/complaints/new"), children: "New Complaint" }) })] }), showFilters && (_jsxs(Box, { display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap", children: [[
                                { label: "Status", key: "status", options: ["open", "in_progress", "resolved", "closed"] },
                                { label: "Priority", key: "priority", options: ["low", "medium", "high", "critical"] },
                                { label: "Category", key: "category", options: ["billing", "technical", "service", "product", "other"] },
                            ].map(({ label, key, options }) => (_jsxs(FormControl, { size: "small", sx: { minWidth: 150 }, children: [_jsx(InputLabel, { children: label }), _jsxs(Select, { label: label, value: filters[key] ?? "", onChange: (e) => dispatch(setFilters({ ...filters, [key]: e.target.value || undefined })), children: [_jsx(MenuItem, { value: "", children: _jsx("em", { children: "All" }) }), options.map((o) => (_jsx(MenuItem, { value: o, sx: { textTransform: "capitalize" }, children: o.replace(/_/g, " ") }, o)))] })] }, key))), _jsx(Button, { size: "small", variant: "text", onClick: () => dispatch(setFilters({})), children: "Clear filters" })] })), _jsxs(Card, { children: [_jsx(TableContainer, { children: _jsxs(Table, { "aria-label": "Complaints table", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Title" }), _jsx(TableCell, { children: "Category" }), _jsx(TableCell, { children: "Status" }), _jsx(TableCell, { children: "Priority" }), _jsx(TableCell, { children: "Created" }), _jsx(TableCell, { align: "right", children: "Actions" })] }) }), _jsx(TableBody, { children: loading ? ([...Array(8)].map((_, i) => (_jsx(TableRow, { children: [...Array(6)].map((_, j) => (_jsx(TableCell, { children: _jsx(Skeleton, { height: 24 }) }, j))) }, i)))) : filtered.length === 0 ? (_jsx(TableRow, { children: _jsxs(TableCell, { colSpan: 6, align: "center", sx: { py: 6 }, children: [_jsx(Typography, { color: "text.secondary", children: "No complaints found" }), _jsx(Button, { size: "small", sx: { mt: 1 }, onClick: () => navigate("/complaints/new"), children: "Create the first one" })] }) })) : (filtered.map((c) => (_jsxs(TableRow, { hover: true, sx: { cursor: "pointer" }, onClick: () => navigate(`/complaints/${c.id}`), children: [_jsxs(TableCell, { children: [_jsx(Typography, { variant: "body2", fontWeight: 500, noWrap: true, sx: { maxWidth: 300 }, children: c.title }), _jsxs(Typography, { variant: "caption", color: "text.secondary", noWrap: true, sx: { maxWidth: 300, display: "block" }, children: [c.description.slice(0, 80), "\u2026"] })] }), _jsx(TableCell, { children: _jsx(Chip, { label: c.category, size: "small", sx: {
                                                                height: 20, fontSize: "0.7rem", fontWeight: 500,
                                                                bgcolor: `${CATEGORY_COLORS[c.category]}18`,
                                                                color: CATEGORY_COLORS[c.category],
                                                                textTransform: "capitalize",
                                                            } }) }), _jsx(TableCell, { children: _jsx(StatusChip, { status: c.status }) }), _jsx(TableCell, { children: _jsx(SeverityChip, { level: c.priority }) }), _jsx(TableCell, { children: _jsx(Typography, { variant: "caption", color: "text.secondary", children: new Date(c.created_at).toLocaleDateString() }) }), _jsx(TableCell, { align: "right", children: _jsxs(Box, { display: "flex", justifyContent: "flex-end", gap: 0.5, children: [_jsx(Tooltip, { title: "View details", arrow: true, children: _jsx(IconButton, { size: "small", onClick: (e) => { e.stopPropagation(); navigate(`/complaints/${c.id}`); }, "aria-label": `View details of complaint ${c.title}`, children: _jsx(OpenInNewIcon, { sx: { fontSize: 16 } }) }) }), _jsx(Tooltip, { title: "Delete", arrow: true, children: _jsx(IconButton, { size: "small", color: "error", onClick: (e) => handleDeleteClick(e, c.id), "aria-label": `Delete complaint ${c.title}`, children: _jsx(DeleteOutlineIcon, { sx: { fontSize: 16 } }) }) })] }) })] }, c.id)))) })] }) }), _jsx(TablePagination, { component: "div", count: total, page: page - 1, rowsPerPage: pageSize, rowsPerPageOptions: [10, 20, 50], onPageChange: (_, p) => { dispatch(setPage(p + 1)); load(p + 1); }, onRowsPerPageChange: () => { }, sx: { borderTop: "1px solid", borderColor: "divider" } })] })] }), _jsx(ConfirmDialog, { open: confirmOpen, title: "Delete Complaint", message: "Are you sure you want to delete this complaint? This action cannot be undone.", confirmLabel: "Delete", destructive: true, onConfirm: handleConfirmDelete, onCancel: handleCancelDelete })] }));
}
