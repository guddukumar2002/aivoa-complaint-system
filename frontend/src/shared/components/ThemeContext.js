import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useMemo, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { buildTheme } from "@/app/theme";
const ThemeCtx = createContext({ mode: "light", toggle: () => { } });
export function useThemeMode() {
    return useContext(ThemeCtx);
}
export function AppThemeProvider({ children }) {
    const [mode, setMode] = useState(() => localStorage.getItem("theme") ?? "light");
    const toggle = () => {
        setMode((m) => {
            const next = m === "light" ? "dark" : "light";
            localStorage.setItem("theme", next);
            return next;
        });
    };
    const theme = useMemo(() => buildTheme(mode), [mode]);
    return (_jsx(ThemeCtx.Provider, { value: { mode, toggle }, children: _jsxs(ThemeProvider, { theme: theme, children: [_jsx(CssBaseline, {}), children] }) }));
}
