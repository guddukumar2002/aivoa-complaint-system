import { useState, type ReactNode } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface Props {
  children: ReactNode;
  title?: string;
}

const SIDEBAR_OPEN = 240;
const SIDEBAR_CLOSED = 64;

export default function AppLayout({ children, title }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = isMobile ? 0 : sidebarOpen ? SIDEBAR_OPEN : SIDEBAR_CLOSED;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar
        open={isMobile ? mobileOpen : sidebarOpen}
        onToggle={() => isMobile ? setMobileOpen((v) => !v) : setSidebarOpen((v) => !v)}
        isMobile={isMobile}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: isMobile ? 0 : `${sidebarWidth}px`,
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <Header
          sidebarWidth={sidebarWidth}
          title={title}
          isMobile={isMobile}
          onMobileMenuToggle={() => setMobileOpen((v) => !v)}
        />
        <Box
          sx={{
            flex: 1,
            pt: "64px",
            overflow: "auto",
            animation: "fadeIn 0.2s ease",
            "@keyframes fadeIn": {
              from: { opacity: 0, transform: "translateY(6px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
