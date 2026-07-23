import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Box, IconButton, Typography, Avatar, Badge,
  Menu, MenuItem, Divider, InputBase, Tooltip, ListItemIcon, Button,
} from "@mui/material";
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

interface Props {
  sidebarWidth: number;
  title?: string;
  isMobile?: boolean;
  onMobileMenuToggle?: () => void;
}

export default function Header({ sidebarWidth, title, isMobile, onMobileMenuToggle }: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const { mode, toggle } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notiAnchorEl, setNotiAnchorEl] = useState<null | HTMLElement>(null);
  const [notiCount, setNotiCount] = useState(3);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        left: isMobile ? 0 : sidebarWidth,
        width: isMobile ? "100%" : `calc(100% - ${sidebarWidth}px)`,
        transition: "left 0.25s cubic-bezier(0.4,0,0.2,1), width 0.25s cubic-bezier(0.4,0,0.2,1)",
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ minHeight: "64px !important", px: { xs: 2, sm: 3 }, gap: 1.5 }}>
        {isMobile && (
          <IconButton
            size="small"
            onClick={onMobileMenuToggle}
            aria-label="Open navigation menu"
            sx={{ mr: 0.5 }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        )}

        {title && (
          <Typography
            variant="h6"
            fontWeight={600}
            color="text.primary"
            sx={{ mr: 2, display: { xs: "none", sm: "block" } }}
          >
            {title}
          </Typography>
        )}

        {/* Search */}
        <Box
          role="search"
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center", gap: 1,
            backgroundColor: (t) => alpha(t.palette.grey[500], 0.08),
            borderRadius: 2, px: 1.5, py: 0.75, flex: 1, maxWidth: 400,
            border: "1px solid transparent",
            "&:focus-within": { borderColor: "primary.main", backgroundColor: "background.paper" },
            transition: "all 0.2s",
          }}
        >
          <SearchIcon sx={{ color: "text.disabled", fontSize: 18 }} aria-hidden />
          <InputBase
            placeholder="Search complaints…"
            inputProps={{ "aria-label": "Search complaints" }}
            sx={{ fontSize: "0.875rem", flex: 1, "& input": { p: 0 } }}
          />
        </Box>

        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.5 }}>
          {/* New Complaint */}
          <Tooltip title="New Complaint" arrow>
            <IconButton
              size="small"
              onClick={() => navigate("/complaints/new")}
              aria-label="Create new complaint"
              sx={{
                bgcolor: "primary.main", color: "#fff", width: 34, height: 34,
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Dark mode toggle */}
          <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"} arrow>
            <IconButton
              size="small"
              onClick={toggle}
              aria-label="Toggle dark mode"
              sx={{ width: 36, height: 36 }}
            >
              {mode === "dark"
                ? <LightModeOutlinedIcon fontSize="small" />
                : <DarkModeOutlinedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications" arrow>
            <IconButton
              size="small"
              onClick={(e) => setNotiAnchorEl(e.currentTarget)}
              aria-label="Notifications"
              sx={{ width: 36, height: 36 }}
            >
              <Badge
                badgeContent={notiCount}
                color="error"
                sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", minWidth: 16, height: 16 } }}
              >
                <NotificationsNoneIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Avatar */}
          <Tooltip title="Account" arrow>
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              aria-label="Open account menu"
              aria-haspopup="true"
              sx={{ ml: 0.5 }}
            >
              <Avatar
                sx={{ width: 32, height: 32, fontSize: "0.8125rem", fontWeight: 600, bgcolor: "primary.main" }}
              >
                {user?.full_name?.[0]?.toUpperCase() ?? "U"}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Notifications Popover Menu */}
        <Menu
          anchorEl={notiAnchorEl}
          open={Boolean(notiAnchorEl)}
          onClose={() => setNotiAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: { mt: 1, minWidth: 280, maxWidth: 320, borderRadius: 2, border: "1px solid", borderColor: "divider" }
          }}
        >
          <Box sx={{ px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2" fontWeight={600}>Notifications</Typography>
            {notiCount > 0 && (
              <Button
                size="small"
                onClick={() => setNotiCount(0)}
                sx={{ fontSize: "0.75rem", p: 0, textTransform: "none" }}
              >
                Clear all
              </Button>
            )}
          </Box>
          <Divider />
          {notiCount > 0 ? (
            <Box>
              <MenuItem onClick={() => { setNotiAnchorEl(null); navigate("/complaints"); }} sx={{ whiteSpace: "normal", py: 1, px: 2 }}>
                <Box>
                  <Typography variant="body2" fontWeight={500} fontSize="0.8rem">AI Analysis Completed</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Full analysis generated for Lipitral 20mg adverse event.
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={() => { setNotiAnchorEl(null); navigate("/complaints"); }} sx={{ whiteSpace: "normal", py: 1, px: 2 }}>
                <Box>
                  <Typography variant="body2" fontWeight={500} fontSize="0.8rem" color="error.main">Critical Risk Logged</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    A critical risk classification was registered by AI.
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={() => { setNotiAnchorEl(null); navigate("/complaints"); }} sx={{ whiteSpace: "normal", py: 1, px: 2 }}>
                <Box>
                  <Typography variant="body2" fontWeight={500} fontSize="0.8rem">CAPA Recommended</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Recommended recall window set to 60 days.
                  </Typography>
                </Box>
              </MenuItem>
            </Box>
          ) : (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">No new notifications</Typography>
            </Box>
          )}
        </Menu>

        {/* Account Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2, border: "1px solid", borderColor: "divider" } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>{user?.full_name ?? "User"}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => setAnchorEl(null)} sx={{ gap: 1.5, py: 1 }}>
            <ListItemIcon><PersonOutlineIcon fontSize="small" /></ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)} sx={{ gap: 1.5, py: 1 }}>
            <ListItemIcon><SettingsOutlinedIcon fontSize="small" /></ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1, color: "error.main" }}>
            <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
