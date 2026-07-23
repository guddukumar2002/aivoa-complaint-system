import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Box, IconButton, Typography, Avatar, Badge, Menu, MenuItem, Divider, InputBase, Tooltip, ListItemIcon, Button, } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { alpha } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { logout } from "@/features/auth/authSlice";
import { useThemeMode } from "./ThemeContext";
export default function Header({ sidebarWidth, title, isMobile, onMobileMenuToggle }) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const user = useAppSelector((s) => s.auth.user);
    const { mode, toggle } = useThemeMode();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notiAnchorEl, setNotiAnchorEl] = useState(null);
    const [notiCount, setNotiCount] = useState(3);
    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };
    return (_jsx(AppBar, { position: "fixed", elevation: 0, sx: {
            left: isMobile ? 0 : sidebarWidth,
            width: isMobile ? "100%" : `calc(100% - ${sidebarWidth}px)`,
            transition: "left 0.25s cubic-bezier(0.4,0,0.2,1), width 0.25s cubic-bezier(0.4,0,0.2,1)",
            backgroundColor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
            color: "text.primary",
        }, children: _jsxs(Toolbar, { sx: { minHeight: "64px !important", px: { xs: 2, sm: 3 }, gap: 1.5 }, children: [isMobile && (_jsx(IconButton, { size: "small", onClick: onMobileMenuToggle, "aria-label": "Open navigation menu", sx: { mr: 0.5 }, children: _jsx(MenuIcon, { fontSize: "small" }) })), title && (_jsx(Typography, { variant: "h6", fontWeight: 600, color: "text.primary", sx: { mr: 2, display: { xs: "none", sm: "block" } }, children: title })), _jsxs(Box, { role: "search", sx: {
                        display: { xs: "none", sm: "flex" },
                        alignItems: "center", gap: 1,
                        backgroundColor: (t) => alpha(t.palette.grey[500], 0.08),
                        borderRadius: 2, px: 1.5, py: 0.75, flex: 1, maxWidth: 400,
                        border: "1px solid transparent",
                        "&:focus-within": { borderColor: "primary.main", backgroundColor: "background.paper" },
                        transition: "all 0.2s",
                    }, children: [_jsx(SearchIcon, { sx: { color: "text.disabled", fontSize: 18 }, "aria-hidden": true }), _jsx(InputBase, { placeholder: "Search complaints\u2026", inputProps: { "aria-label": "Search complaints" }, sx: { fontSize: "0.875rem", flex: 1, "& input": { p: 0 } } })] }), _jsxs(Box, { sx: { ml: "auto", display: "flex", alignItems: "center", gap: 0.5 }, children: [_jsx(Tooltip, { title: "New Complaint", arrow: true, children: _jsx(IconButton, { size: "small", onClick: () => navigate("/complaints/new"), "aria-label": "Create new complaint", sx: {
                                    bgcolor: "primary.main", color: "#fff", width: 34, height: 34,
                                    "&:hover": { bgcolor: "primary.dark" },
                                }, children: _jsx(AddIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: mode === "dark" ? "Switch to light mode" : "Switch to dark mode", arrow: true, children: _jsx(IconButton, { size: "small", onClick: toggle, "aria-label": "Toggle dark mode", sx: { width: 36, height: 36 }, children: mode === "dark"
                                    ? _jsx(LightModeOutlinedIcon, { fontSize: "small" })
                                    : _jsx(DarkModeOutlinedIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "Notifications", arrow: true, children: _jsx(IconButton, { size: "small", onClick: (e) => setNotiAnchorEl(e.currentTarget), "aria-label": "Notifications", sx: { width: 36, height: 36 }, children: _jsx(Badge, { badgeContent: notiCount, color: "error", sx: { "& .MuiBadge-badge": { fontSize: "0.6rem", minWidth: 16, height: 16 } }, children: _jsx(NotificationsNoneIcon, { fontSize: "small" }) }) }) }), _jsx(Tooltip, { title: "Account", arrow: true, children: _jsx(IconButton, { size: "small", onClick: (e) => setAnchorEl(e.currentTarget), "aria-label": "Open account menu", "aria-haspopup": "true", sx: { ml: 0.5 }, children: _jsx(Avatar, { sx: { width: 32, height: 32, fontSize: "0.8125rem", fontWeight: 600, bgcolor: "primary.main" }, children: user?.full_name?.[0]?.toUpperCase() ?? "U" }) }) })] }), _jsxs(Menu, { anchorEl: notiAnchorEl, open: Boolean(notiAnchorEl), onClose: () => setNotiAnchorEl(null), transformOrigin: { horizontal: "right", vertical: "top" }, anchorOrigin: { horizontal: "right", vertical: "bottom" }, PaperProps: {
                        sx: { mt: 1, minWidth: 280, maxWidth: 320, borderRadius: 2, border: "1px solid", borderColor: "divider" }
                    }, children: [_jsxs(Box, { sx: { px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsx(Typography, { variant: "subtitle2", fontWeight: 600, children: "Notifications" }), notiCount > 0 && (_jsx(Button, { size: "small", onClick: () => setNotiCount(0), sx: { fontSize: "0.75rem", p: 0, textTransform: "none" }, children: "Clear all" }))] }), _jsx(Divider, {}), notiCount > 0 ? (_jsxs(Box, { children: [_jsx(MenuItem, { onClick: () => { setNotiAnchorEl(null); navigate("/complaints"); }, sx: { whiteSpace: "normal", py: 1, px: 2 }, children: _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", fontWeight: 500, fontSize: "0.8rem", children: "AI Analysis Completed" }), _jsx(Typography, { variant: "caption", color: "text.secondary", display: "block", children: "Full analysis generated for Lipitral 20mg adverse event." })] }) }), _jsx(MenuItem, { onClick: () => { setNotiAnchorEl(null); navigate("/complaints"); }, sx: { whiteSpace: "normal", py: 1, px: 2 }, children: _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", fontWeight: 500, fontSize: "0.8rem", color: "error.main", children: "Critical Risk Logged" }), _jsx(Typography, { variant: "caption", color: "text.secondary", display: "block", children: "A critical risk classification was registered by AI." })] }) }), _jsx(MenuItem, { onClick: () => { setNotiAnchorEl(null); navigate("/complaints"); }, sx: { whiteSpace: "normal", py: 1, px: 2 }, children: _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", fontWeight: 500, fontSize: "0.8rem", children: "CAPA Recommended" }), _jsx(Typography, { variant: "caption", color: "text.secondary", display: "block", children: "Recommended recall window set to 60 days." })] }) })] })) : (_jsx(Box, { sx: { py: 3, textAlign: "center" }, children: _jsx(Typography, { variant: "body2", color: "text.secondary", children: "No new notifications" }) }))] }), _jsxs(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: () => setAnchorEl(null), transformOrigin: { horizontal: "right", vertical: "top" }, anchorOrigin: { horizontal: "right", vertical: "bottom" }, PaperProps: { sx: { mt: 1, minWidth: 200, borderRadius: 2, border: "1px solid", borderColor: "divider" } }, children: [_jsxs(Box, { sx: { px: 2, py: 1.5 }, children: [_jsx(Typography, { variant: "subtitle2", fontWeight: 600, children: user?.full_name ?? "User" }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: user?.email })] }), _jsx(Divider, {}), _jsxs(MenuItem, { onClick: () => setAnchorEl(null), sx: { gap: 1.5, py: 1 }, children: [_jsx(ListItemIcon, { children: _jsx(PersonOutlineIcon, { fontSize: "small" }) }), "Profile"] }), _jsxs(MenuItem, { onClick: () => setAnchorEl(null), sx: { gap: 1.5, py: 1 }, children: [_jsx(ListItemIcon, { children: _jsx(SettingsOutlinedIcon, { fontSize: "small" }) }), "Settings"] }), _jsx(Divider, {}), _jsxs(MenuItem, { onClick: handleLogout, sx: { gap: 1.5, py: 1, color: "error.main" }, children: [_jsx(ListItemIcon, { children: _jsx(LogoutIcon, { fontSize: "small", color: "error" }) }), "Sign out"] })] })] }) }));
}
