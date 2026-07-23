import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, Card, Chip, FormControl, IconButton, InputAdornment,
  InputLabel, MenuItem, Select, Skeleton, Table, TableBody, TableCell,
  TableHead, TablePagination, TableRow, TextField, Tooltip, Typography, TableContainer,
} from "@mui/material";
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
import type { ComplaintStatus, ComplaintPriority } from "@/shared/types";
import { CATEGORY_COLORS } from "@/shared/constants";

export default function ComplaintsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, total, page, pageSize, loading, filters } = useAppSelector((s) => s.complaints);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const load = (p = page) =>
    dispatch(fetchComplaints({ page: p, ...filters }));

  useEffect(() => { load(1); }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    return search
      ? items.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
      : items;
  }, [items, search]);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
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

  return (
    <AppLayout title="Complaints">
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Toolbar */}
        <Box display="flex" alignItems="center" gap={1.5} mb={2.5} flexWrap="wrap">
          <TextField
            placeholder="Search complaints…"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 280 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment>,
            }}
          />
          <Tooltip title="Filters" arrow>
            <IconButton
              size="small"
              onClick={() => setShowFilters((v) => !v)}
              aria-label="Toggle filters list"
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <FilterListIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh" arrow>
            <IconButton
              size="small"
              onClick={() => load(1)}
              aria-label="Refresh complaints list"
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export CSV" arrow>
            <IconButton
              size="small"
              onClick={handleExportCSV}
              aria-label="Export complaints as CSV"
              sx={{ border: "1px solid", borderColor: "divider" }}
              disabled={filtered.length === 0}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Box sx={{ ml: "auto" }}>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => navigate("/complaints/new")}>
              New Complaint
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        {showFilters && (
          <Box display="flex" gap={1.5} mb={2} flexWrap="wrap">
            {[
              { label: "Status", key: "status", options: ["open", "in_progress", "resolved", "closed"] },
              { label: "Priority", key: "priority", options: ["low", "medium", "high", "critical"] },
              { label: "Category", key: "category", options: ["billing", "technical", "service", "product", "other"] },
            ].map(({ label, key, options }) => (
              <FormControl key={key} size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{label}</InputLabel>
                <Select
                  label={label}
                  value={(filters as Record<string, string>)[key] ?? ""}
                  onChange={(e) => dispatch(setFilters({ ...filters, [key]: e.target.value || undefined }))}
                >
                  <MenuItem value=""><em>All</em></MenuItem>
                  {options.map((o) => (
                    <MenuItem key={o} value={o} sx={{ textTransform: "capitalize" }}>{o.replace(/_/g, " ")}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
            <Button size="small" variant="text" onClick={() => dispatch(setFilters({}))}>
              Clear filters
            </Button>
          </Box>
        )}

        {/* Table */}
        <Card>
          <TableContainer>
            <Table aria-label="Complaints table">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(6)].map((_, j) => (
                        <TableCell key={j}><Skeleton height={24} /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No complaints found</Typography>
                      <Button size="small" sx={{ mt: 1 }} onClick={() => navigate("/complaints/new")}>
                        Create the first one
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow
                      key={c.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/complaints/${c.id}`)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 300 }}>
                          {c.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300, display: "block" }}>
                          {c.description.slice(0, 80)}…
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={c.category}
                          size="small"
                          sx={{
                            height: 20, fontSize: "0.7rem", fontWeight: 500,
                            bgcolor: `${CATEGORY_COLORS[c.category]}18`,
                            color: CATEGORY_COLORS[c.category],
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>
                      <TableCell><StatusChip status={c.status as ComplaintStatus} /></TableCell>
                      <TableCell><SeverityChip level={c.priority as ComplaintPriority} /></TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(c.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end" gap={0.5}>
                          <Tooltip title="View details" arrow>
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); navigate(`/complaints/${c.id}`); }}
                              aria-label={`View details of complaint ${c.title}`}
                            >
                              <OpenInNewIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete" arrow>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => handleDeleteClick(e, c.id)}
                              aria-label={`Delete complaint ${c.title}`}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page - 1}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[10, 20, 50]}
            onPageChange={(_, p) => { dispatch(setPage(p + 1)); load(p + 1); }}
            onRowsPerPageChange={() => {}}
            sx={{ borderTop: "1px solid", borderColor: "divider" }}
          />
        </Card>
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Complaint"
        message="Are you sure you want to delete this complaint? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </AppLayout>
  );
}
