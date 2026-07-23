import { createSelector } from "@reduxjs/toolkit";
const selectDashboardState = (state) => state.dashboard;
export const selectDashboardStats = createSelector(selectDashboardState, (d) => d.stats);
export const selectRecentComplaints = createSelector(selectDashboardState, (d) => d.recent);
export const selectLastUpdated = createSelector(selectDashboardState, (d) => d.lastUpdated);
export const selectOpenCount = createSelector(selectDashboardStats, (stats) => stats?.open ?? 0);
export const selectCriticalCount = createSelector(selectDashboardStats, (stats) => stats?.critical ?? 0);
export const selectResolutionRate = createSelector(selectDashboardStats, (stats) => {
    if (!stats || stats.total === 0)
        return 0;
    return Math.round(((stats.resolved + stats.closed) / stats.total) * 100);
});
