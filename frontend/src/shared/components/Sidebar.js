import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Tooltip, IconButton, Avatar, Collapse, } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAppSelector } from "@/app/store";
import { alpha } from "@mui/material/styles";
const DRAWER_OPEN = 240;
const DRAWER_CLOSED = 64;
const NAV = [
    { label: "Dashboard", icon: DashboardIcon, path: "/" },
    {
        label: "Complaints", icon: ReportProblemIcon, path: "/complaints",
        children: [
            { label: "All Complaints", icon: ReportProblemIcon, path: "/complaints" },
            { label: "New Complaint", icon: AddCircleOutlineIcon, path: "/complaints/new" },
        ],
    },
    { label: "AI Copilot", icon: AutoFixHighIcon, path: "/complaints/new" },
    { label: "Analytics", icon: BarChartIcon, path: "/analytics" },
    { label: "Settings", icon: SettingsIcon, path: "/settings" },
];
function SidebarContent({ open, onToggle, isMobile, onMobileClose }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const user = useAppSelector((s) => s.auth.user);
    const [expanded, setExpanded] = useState("Complaints");
    const isActive = (path) => path === "/" ? pathname === "/" : pathname.startsWith(path);
    const handleNav = (path) => {
        navigate(path);
        if (isMobile)
            onMobileClose?.();
    };
    return (_jsxs(Box, { sx: {
            height: "100%", display: "flex", flexDirection: "column",
            background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
            color: "#F1F5F9",
            width: isMobile ? DRAWER_OPEN : open ? DRAWER_OPEN : DRAWER_CLOSED,
            transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
            overflowX: "hidden",
        }, children: [_jsxs(Box, { sx: {
                    height: 64, display: "flex", alignItems: "center",
                    px: open || isMobile ? 2.5 : 1.5, gap: 1.5, flexShrink: 0,
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                }, children: [_jsx(Box, { sx: {
                            width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                            background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }, children: _jsx(AutoFixHighIcon, { sx: { color: "#fff", fontSize: 20 } }) }), (open || isMobile) && (_jsxs(Box, { sx: { overflow: "hidden" }, children: [_jsx(Typography, { variant: "h6", fontWeight: 700, color: "#F1F5F9", lineHeight: 1.2, noWrap: true, children: "AIVOA" }), _jsx(Typography, { variant: "caption", sx: { color: "rgba(241,245,249,0.5)", fontSize: "0.65rem" }, children: "Complaint System" })] })), !isMobile && (_jsx(Box, { sx: { ml: "auto" }, children: _jsx(IconButton, { size: "small", onClick: onToggle, "aria-label": open ? "Collapse sidebar" : "Expand sidebar", sx: { color: "rgba(241,245,249,0.6)", "&:hover": { color: "#F1F5F9", bgcolor: "rgba(255,255,255,0.08)" } }, children: open ? _jsx(ChevronLeftIcon, { fontSize: "small" }) : _jsx(ChevronRightIcon, { fontSize: "small" }) }) }))] }), _jsx(Box, { component: "nav", "aria-label": "Main navigation", sx: { flex: 1, overflowY: "auto", overflowX: "hidden", py: 1.5 }, children: _jsx(List, { dense: true, disablePadding: true, children: NAV.map((item) => {
                        const active = isActive(item.path);
                        const hasChildren = !!item.children;
                        const isExpanded = expanded === item.label;
                        const showLabel = open || isMobile;
                        return (_jsxs(Box, { children: [_jsx(Tooltip, { title: !showLabel ? item.label : "", placement: "right", arrow: true, children: _jsxs(ListItemButton, { onClick: () => {
                                            if (hasChildren) {
                                                setExpanded(isExpanded ? null : item.label);
                                            }
                                            else {
                                                handleNav(item.path);
                                            }
                                        }, "aria-current": active ? "page" : undefined, sx: {
                                            mx: 1, mb: 0.25, borderRadius: 2, minHeight: 42,
                                            px: showLabel ? 1.5 : 1,
                                            backgroundColor: active ? alpha("#2563EB", 0.25) : "transparent",
                                            transition: "background-color 0.15s ease",
                                            "&:hover": { backgroundColor: active ? alpha("#2563EB", 0.3) : "rgba(255,255,255,0.06)" },
                                        }, children: [_jsx(ListItemIcon, { sx: { minWidth: showLabel ? 36 : "auto", color: active ? "#60A5FA" : "rgba(241,245,249,0.6)" }, children: _jsx(item.icon, { fontSize: "small" }) }), showLabel && (_jsxs(_Fragment, { children: [_jsx(ListItemText, { primary: item.label, primaryTypographyProps: {
                                                            fontSize: "0.875rem",
                                                            fontWeight: active ? 600 : 400,
                                                            color: active ? "#F1F5F9" : "rgba(241,245,249,0.75)",
                                                            noWrap: true,
                                                        } }), hasChildren && (isExpanded
                                                        ? _jsx(ExpandLessIcon, { sx: { fontSize: 16, color: "rgba(241,245,249,0.5)" } })
                                                        : _jsx(ExpandMoreIcon, { sx: { fontSize: 16, color: "rgba(241,245,249,0.5)" } }))] }))] }) }), hasChildren && showLabel && (_jsx(Collapse, { in: isExpanded, timeout: "auto", children: _jsx(List, { dense: true, disablePadding: true, sx: { pl: 1 }, children: item.children.map((child) => {
                                            const childActive = pathname === child.path;
                                            return (_jsxs(ListItemButton, { onClick: () => handleNav(child.path), "aria-current": childActive ? "page" : undefined, sx: {
                                                    mx: 1, mb: 0.25, borderRadius: 2, minHeight: 36, pl: 2.5,
                                                    backgroundColor: childActive ? alpha("#2563EB", 0.2) : "transparent",
                                                    transition: "background-color 0.15s ease",
                                                    "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
                                                }, children: [_jsx(ListItemIcon, { sx: { minWidth: 30, color: childActive ? "#60A5FA" : "rgba(241,245,249,0.5)" }, children: _jsx(child.icon, { sx: { fontSize: 16 } }) }), _jsx(ListItemText, { primary: child.label, primaryTypographyProps: {
                                                            fontSize: "0.8125rem",
                                                            fontWeight: childActive ? 600 : 400,
                                                            color: childActive ? "#F1F5F9" : "rgba(241,245,249,0.6)",
                                                            noWrap: true,
                                                        } })] }, child.path));
                                        }) }) }))] }, item.label));
                    }) }) }), _jsx(Divider, { sx: { borderColor: "rgba(255,255,255,0.08)" } }), _jsxs(Box, { sx: { p: open || isMobile ? 2 : 1, display: "flex", alignItems: "center", gap: 1.5 }, children: [_jsx(Avatar, { sx: { width: 34, height: 34, fontSize: "0.8125rem", fontWeight: 600, flexShrink: 0, bgcolor: "#2563EB" }, children: user?.full_name?.[0]?.toUpperCase() ?? "U" }), (open || isMobile) && (_jsxs(Box, { sx: { overflow: "hidden" }, children: [_jsx(Typography, { variant: "body2", fontWeight: 600, color: "#F1F5F9", noWrap: true, children: user?.full_name ?? "User" }), _jsx(Typography, { variant: "caption", sx: { color: "rgba(241,245,249,0.5)", textTransform: "capitalize" }, children: user?.role ?? "user" })] }))] })] }));
}
export default function Sidebar(props) {
    const { open, onToggle, isMobile, onMobileClose } = props;
    const width = isMobile ? DRAWER_OPEN : open ? DRAWER_OPEN : DRAWER_CLOSED;
    if (isMobile) {
        return (_jsx(Drawer, { variant: "temporary", open: open, onClose: onMobileClose, ModalProps: { keepMounted: true }, sx: {
                "& .MuiDrawer-paper": {
                    width: DRAWER_OPEN, boxSizing: "border-box",
                    border: "none",
                },
            }, children: _jsx(SidebarContent, { ...props }) }));
    }
    return (_jsx(Drawer, { variant: "permanent", sx: {
            width,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
                width,
                boxSizing: "border-box",
                overflowX: "hidden",
                transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
                border: "none",
            },
        }, children: _jsx(SidebarContent, { open: open, onToggle: onToggle }) }));
}
