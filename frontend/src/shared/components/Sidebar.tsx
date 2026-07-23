import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Tooltip, IconButton, Avatar, Collapse,
} from "@mui/material";
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

interface Props {
  open: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({ open, onToggle, isMobile, onMobileClose }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const [expanded, setExpanded] = useState<string | null>("Complaints");

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) onMobileClose?.();
  };

  return (
    <Box
      sx={{
        height: "100%", display: "flex", flexDirection: "column",
        background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
        color: "#F1F5F9",
        width: isMobile ? DRAWER_OPEN : open ? DRAWER_OPEN : DRAWER_CLOSED,
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        overflowX: "hidden",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          height: 64, display: "flex", alignItems: "center",
          px: open || isMobile ? 2.5 : 1.5, gap: 1.5, flexShrink: 0,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Box
          sx={{
            width: 36, height: 36, borderRadius: 2, flexShrink: 0,
            background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <AutoFixHighIcon sx={{ color: "#fff", fontSize: 20 }} />
        </Box>
        {(open || isMobile) && (
          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="h6" fontWeight={700} color="#F1F5F9" lineHeight={1.2} noWrap>
              AIVOA
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(241,245,249,0.5)", fontSize: "0.65rem" }}>
              Complaint System
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <Box sx={{ ml: "auto" }}>
            <IconButton
              size="small"
              onClick={onToggle}
              aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
              sx={{ color: "rgba(241,245,249,0.6)", "&:hover": { color: "#F1F5F9", bgcolor: "rgba(255,255,255,0.08)" } }}
            >
              {open ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Nav */}
      <Box
        component="nav"
        aria-label="Main navigation"
        sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 1.5 }}
      >
        <List dense disablePadding>
          {NAV.map((item) => {
            const active = isActive(item.path);
            const hasChildren = !!item.children;
            const isExpanded = expanded === item.label;
            const showLabel = open || isMobile;

            return (
              <Box key={item.label}>
                <Tooltip title={!showLabel ? item.label : ""} placement="right" arrow>
                  <ListItemButton
                    onClick={() => {
                      if (hasChildren) {
                        setExpanded(isExpanded ? null : item.label);
                      } else {
                        handleNav(item.path);
                      }
                    }}
                    aria-current={active ? "page" : undefined}
                    sx={{
                      mx: 1, mb: 0.25, borderRadius: 2, minHeight: 42,
                      px: showLabel ? 1.5 : 1,
                      backgroundColor: active ? alpha("#2563EB", 0.25) : "transparent",
                      transition: "background-color 0.15s ease",
                      "&:hover": { backgroundColor: active ? alpha("#2563EB", 0.3) : "rgba(255,255,255,0.06)" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: showLabel ? 36 : "auto", color: active ? "#60A5FA" : "rgba(241,245,249,0.6)" }}>
                      <item.icon fontSize="small" />
                    </ListItemIcon>
                    {showLabel && (
                      <>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: "0.875rem",
                            fontWeight: active ? 600 : 400,
                            color: active ? "#F1F5F9" : "rgba(241,245,249,0.75)",
                            noWrap: true,
                          }}
                        />
                        {hasChildren && (
                          isExpanded
                            ? <ExpandLessIcon sx={{ fontSize: 16, color: "rgba(241,245,249,0.5)" }} />
                            : <ExpandMoreIcon sx={{ fontSize: 16, color: "rgba(241,245,249,0.5)" }} />
                        )}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>

                {hasChildren && showLabel && (
                  <Collapse in={isExpanded} timeout="auto">
                    <List dense disablePadding sx={{ pl: 1 }}>
                      {item.children!.map((child) => {
                        const childActive = pathname === child.path;
                        return (
                          <ListItemButton
                            key={child.path}
                            onClick={() => handleNav(child.path)}
                            aria-current={childActive ? "page" : undefined}
                            sx={{
                              mx: 1, mb: 0.25, borderRadius: 2, minHeight: 36, pl: 2.5,
                              backgroundColor: childActive ? alpha("#2563EB", 0.2) : "transparent",
                              transition: "background-color 0.15s ease",
                              "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 30, color: childActive ? "#60A5FA" : "rgba(241,245,249,0.5)" }}>
                              <child.icon sx={{ fontSize: 16 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={child.label}
                              primaryTypographyProps={{
                                fontSize: "0.8125rem",
                                fontWeight: childActive ? 600 : 400,
                                color: childActive ? "#F1F5F9" : "rgba(241,245,249,0.6)",
                                noWrap: true,
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </Box>

      {/* User */}
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
      <Box sx={{ p: open || isMobile ? 2 : 1, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ width: 34, height: 34, fontSize: "0.8125rem", fontWeight: 600, flexShrink: 0, bgcolor: "#2563EB" }}>
          {user?.full_name?.[0]?.toUpperCase() ?? "U"}
        </Avatar>
        {(open || isMobile) && (
          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="body2" fontWeight={600} color="#F1F5F9" noWrap>
              {user?.full_name ?? "User"}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(241,245,249,0.5)", textTransform: "capitalize" }}>
              {user?.role ?? "user"}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function Sidebar(props: Props) {
  const { open, onToggle, isMobile, onMobileClose } = props;
  const width = isMobile ? DRAWER_OPEN : open ? DRAWER_OPEN : DRAWER_CLOSED;

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: DRAWER_OPEN, boxSizing: "border-box",
            border: "none",
          },
        }}
      >
        <SidebarContent {...props} />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width,
          boxSizing: "border-box",
          overflowX: "hidden",
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          border: "none",
        },
      }}
    >
      <SidebarContent open={open} onToggle={onToggle} />
    </Drawer>
  );
}
