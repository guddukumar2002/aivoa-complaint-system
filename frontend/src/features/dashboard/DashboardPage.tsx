import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Grid, Typography, Card, CardContent, CardHeader,
  Table, TableBody, TableCell, TableHead, TableRow,
  Skeleton, Chip, LinearProgress, Button, Divider, TableContainer,
} from "@mui/material";
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
import type { ComplaintStatus, ComplaintPriority } from "@/shared/types";
import { CATEGORY_COLORS } from "@/shared/constants";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stats, recent, loading } = useAppSelector((s) => s.dashboard);

  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);

  const categoryBreakdown = useMemo(() => {
    return recent.reduce<Record<string, number>>((acc, c) => {
      acc[c.category] = (acc[c.category] ?? 0) + 1;
      return acc;
    }, {});
  }, [recent]);

  return (
    <AppLayout title="Dashboard">
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Stats */}
        <Grid container spacing={2.5} mb={3}>
          {[
            { title: "Total Complaints", value: stats?.total ?? 0, icon: AssignmentIcon, color: "#2563EB", bg: "#DBEAFE" },
            { title: "Open", value: stats?.open ?? 0, icon: ErrorOutlineIcon, color: "#D97706", bg: "#FEF3C7" },
            { title: "In Progress", value: stats?.in_progress ?? 0, icon: HourglassEmptyIcon, color: "#7C3AED", bg: "#EDE9FE" },
            { title: "Resolved", value: stats?.resolved ?? 0, icon: CheckCircleOutlineIcon, color: "#059669", bg: "#D1FAE5" },
            { title: "Critical", value: stats?.critical ?? 0, icon: WarningAmberIcon, color: "#DC2626", bg: "#FEE2E2", subtitle: `+${stats?.high ?? 0} high priority` },
          ].map((s) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={s.title}>
              <StatCard {...s} loading={loading} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2.5}>
          {/* Recent Complaints */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ transition: "transform 0.2s, box-shadow 0.2s", "&:hover": { transform: "translateY(-2px)", boxShadow: 3 } }}>
              <CardHeader
                title={<Typography variant="h6" fontWeight={600}>Recent Complaints</Typography>}
                action={
                  <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/complaints")}>
                    View all
                  </Button>
                }
                sx={{ pb: 0, px: 2.5, pt: 2 }}
              />
              <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                {loading ? (
                  <Box p={2.5}>
                    {[...Array(5)].map((_, i) => <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />)}
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small" aria-label="Recent complaints table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recent.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                              No complaints yet
                            </TableCell>
                          </TableRow>
                        ) : (
                          recent.map((c) => (
                            <TableRow
                              key={c.id}
                              hover
                              sx={{ cursor: "pointer" }}
                              onClick={() => navigate(`/complaints/${c.id}`)}
                            >
                              <TableCell>
                                <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 220 }}>
                                  {c.title}
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
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Category Breakdown */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: "100%", transition: "transform 0.2s, box-shadow 0.2s", "&:hover": { transform: "translateY(-2px)", boxShadow: 3 } }}>
              <CardHeader
                title={<Typography variant="h6" fontWeight={600}>By Category</Typography>}
                sx={{ pb: 0, px: 2.5, pt: 2 }}
              />
              <CardContent sx={{ px: 2.5 }}>
                {loading ? (
                  [...Array(5)].map((_, i) => <Skeleton key={i} height={40} sx={{ mb: 1 }} />)
                ) : Object.keys(CATEGORY_COLORS).map((cat) => {
                  const count = categoryBreakdown[cat] ?? 0;
                  const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <Box key={cat} mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" fontWeight={500} sx={{ textTransform: "capitalize" }}>
                          {cat}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {count} ({pct}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          bgcolor: `${CATEGORY_COLORS[cat]}18`,
                          "& .MuiLinearProgress-bar": { bgcolor: CATEGORY_COLORS[cat] },
                        }}
                      />
                    </Box>
                  );
                })}
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Total</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats?.total ?? 0}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
}
