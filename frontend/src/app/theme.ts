import { createTheme, alpha, type PaletteMode } from "@mui/material/styles";

const PRIMARY = "#2563EB";
const SECONDARY = "#7C3AED";
const SUCCESS = "#059669";
const WARNING = "#D97706";
const ERROR = "#DC2626";

export function buildTheme(mode: PaletteMode) {
  const light = mode === "light";

  const BG = light ? "#F8FAFC" : "#0F172A";
  const SURFACE = light ? "#FFFFFF" : "#1E293B";
  const BORDER = light ? "#E2E8F0" : "#334155";
  const TEXT_PRIMARY = light ? "#0F172A" : "#F1F5F9";
  const TEXT_SECONDARY = light ? "#64748B" : "#94A3B8";
  const TEXT_DISABLED = light ? "#94A3B8" : "#475569";

  return createTheme({
    palette: {
      mode,
      primary: { main: PRIMARY, light: "#3B82F6", dark: "#1D4ED8", contrastText: "#fff" },
      secondary: { main: SECONDARY, light: "#8B5CF6", dark: "#6D28D9", contrastText: "#fff" },
      success: { main: SUCCESS, light: "#10B981", dark: "#047857", contrastText: "#fff" },
      warning: { main: WARNING, light: "#F59E0B", dark: "#B45309", contrastText: "#fff" },
      error: { main: ERROR, light: "#EF4444", dark: "#B91C1C", contrastText: "#fff" },
      background: { default: BG, paper: SURFACE },
      divider: BORDER,
      text: { primary: TEXT_PRIMARY, secondary: TEXT_SECONDARY, disabled: TEXT_DISABLED },
      grey: {
        50: "#F8FAFC", 100: "#F1F5F9", 200: "#E2E8F0", 300: "#CBD5E1",
        400: "#94A3B8", 500: "#64748B", 600: "#475569", 700: "#334155",
        800: "#1E293B", 900: "#0F172A",
      },
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      h1: { fontWeight: 800, fontSize: "2.25rem", lineHeight: 1.2, letterSpacing: "-0.02em" },
      h2: { fontWeight: 700, fontSize: "1.875rem", lineHeight: 1.25, letterSpacing: "-0.015em" },
      h3: { fontWeight: 700, fontSize: "1.5rem", lineHeight: 1.3, letterSpacing: "-0.01em" },
      h4: { fontWeight: 600, fontSize: "1.25rem", lineHeight: 1.4 },
      h5: { fontWeight: 600, fontSize: "1.125rem", lineHeight: 1.4 },
      h6: { fontWeight: 600, fontSize: "1rem", lineHeight: 1.5 },
      subtitle1: { fontWeight: 500, fontSize: "0.9375rem", lineHeight: 1.5 },
      subtitle2: { fontWeight: 500, fontSize: "0.875rem", lineHeight: 1.5 },
      body1: { fontSize: "0.9375rem", lineHeight: 1.6 },
      body2: { fontSize: "0.875rem", lineHeight: 1.6 },
      caption: { fontSize: "0.75rem", lineHeight: 1.5 },
      overline: { fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" },
      button: { fontWeight: 600, fontSize: "0.875rem", textTransform: "none", letterSpacing: "0.01em" },
    },
    shape: { borderRadius: 10 },
    shadows: [
      "none",
      "0 1px 2px 0 rgba(0,0,0,0.05)",
      "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
      "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
      "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
      "0 25px 50px -12px rgba(0,0,0,0.25)",
      ...Array(19).fill("none"),
    ] as import("@mui/material/styles").Shadows,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "*": { boxSizing: "border-box" },
          body: {
            backgroundColor: BG,
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            transition: "background-color 0.2s ease",
          },
          "::-webkit-scrollbar": { width: 6, height: 6 },
          "::-webkit-scrollbar-track": { background: "transparent" },
          "::-webkit-scrollbar-thumb": { background: light ? "#CBD5E1" : "#334155", borderRadius: 3 },
          "::-webkit-scrollbar-thumb:hover": { background: light ? "#94A3B8" : "#475569" },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8, padding: "8px 18px", boxShadow: "none",
            transition: "all 0.15s ease",
            "&:hover": { boxShadow: "none", transform: "translateY(-1px)" },
            "&:active": { transform: "translateY(0)" },
          },
          contained: {
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #1D4ED8 100%)`,
            "&:hover": { background: `linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)` },
          },
          outlined: {
            borderColor: BORDER,
            "&:hover": { borderColor: PRIMARY, background: alpha(PRIMARY, 0.04) },
          },
          sizeSmall: { padding: "5px 12px", fontSize: "0.8125rem" },
          sizeLarge: { padding: "11px 24px", fontSize: "0.9375rem" },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none", transition: "box-shadow 0.2s ease" },
          outlined: { borderColor: BORDER },
          elevation1: { boxShadow: light ? "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)" : "0 1px 3px 0 rgba(0,0,0,0.4)" },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            boxShadow: light ? "0 1px 3px 0 rgba(0,0,0,0.07)" : "0 1px 3px 0 rgba(0,0,0,0.3)",
            transition: "box-shadow 0.2s ease, transform 0.15s ease",
            "&:hover": { boxShadow: light ? "0 4px 12px rgba(0,0,0,0.1)" : "0 4px 12px rgba(0,0,0,0.4)" },
          },
        },
      },
      MuiTextField: {
        defaultProps: { size: "small" },
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
              "& fieldset": { borderColor: BORDER },
              "&:hover fieldset": { borderColor: light ? "#94A3B8" : "#64748B" },
              "&.Mui-focused fieldset": { borderColor: PRIMARY, borderWidth: 1.5 },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            "& fieldset": { borderColor: BORDER },
            "&:hover fieldset": { borderColor: light ? "#94A3B8" : "#64748B" },
            "&.Mui-focused fieldset": { borderColor: PRIMARY, borderWidth: 1.5 },
          },
        },
      },
      MuiSelect: { styleOverrides: { outlined: { borderRadius: 8 } } },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500, fontSize: "0.75rem", height: 24, borderRadius: 6 },
          sizeSmall: { height: 20, fontSize: "0.6875rem" },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableCell-head": {
              backgroundColor: light ? "#F8FAFC" : "#1E293B",
              fontWeight: 600, fontSize: "0.75rem",
              textTransform: "uppercase", letterSpacing: "0.06em",
              color: TEXT_SECONDARY, borderBottom: `1px solid ${BORDER}`,
              padding: "10px 16px",
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottom: `1px solid ${BORDER}`, padding: "12px 16px", fontSize: "0.875rem" },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: "background-color 0.1s ease",
            "&:hover": { backgroundColor: alpha(PRIMARY, 0.04) },
            "&:last-child td": { borderBottom: 0 },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 8, fontSize: "0.875rem" },
          standardSuccess: { backgroundColor: alpha(SUCCESS, 0.1), color: light ? "#065F46" : "#6EE7B7" },
          standardError: { backgroundColor: alpha(ERROR, 0.1), color: light ? "#991B1B" : "#FCA5A5" },
          standardWarning: { backgroundColor: alpha(WARNING, 0.1), color: light ? "#92400E" : "#FCD34D" },
          standardInfo: { backgroundColor: alpha(PRIMARY, 0.1), color: light ? "#1E40AF" : "#93C5FD" },
          filledSuccess: { backgroundColor: SUCCESS },
          filledError: { backgroundColor: ERROR },
          filledWarning: { backgroundColor: WARNING },
          filledInfo: { backgroundColor: PRIMARY },
        },
      },
      MuiLinearProgress: { styleOverrides: { root: { borderRadius: 4, height: 6 } } },
      MuiDivider: { styleOverrides: { root: { borderColor: BORDER } } },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { backgroundColor: light ? "#1E293B" : "#0F172A", fontSize: "0.75rem", borderRadius: 6, padding: "5px 10px" },
          arrow: { color: light ? "#1E293B" : "#0F172A" },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: "all 0.15s ease",
            "&:hover": { backgroundColor: alpha(PRIMARY, 0.08), transform: "scale(1.05)" },
          },
        },
      },
      MuiBadge: { styleOverrides: { badge: { fontWeight: 600, fontSize: "0.6875rem" } } },
      MuiTab: {
        styleOverrides: {
          root: { fontWeight: 500, textTransform: "none", fontSize: "0.875rem", minHeight: 44 },
        },
      },
      MuiTabs: { styleOverrides: { indicator: { height: 2, borderRadius: 2 } } },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            "&::after": {
              background: light
                ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)"
                : "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            border: `1px solid ${BORDER}`,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { borderRight: `1px solid ${BORDER}` },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
    },
  });
}

// Default export for backward compat
export default buildTheme("light");
