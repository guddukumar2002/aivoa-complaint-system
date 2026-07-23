import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from "react-router-dom";
import { AppThemeProvider } from "@/shared/components/ThemeContext";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import ToastContainer from "@/shared/components/ToastContainer";
import GlobalLoader from "@/shared/components/GlobalLoader";
import NotFound from "@/shared/components/NotFound";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import LoginPage from "@/features/auth/LoginPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import AnalyticsPage from "@/features/dashboard/AnalyticsPage";
import ComplaintsPage from "@/features/complaints/ComplaintsPage";
import ComplaintDetailPage from "@/features/complaints/ComplaintDetailPage";
import ComplaintForm from "@/features/complaints/ComplaintForm";
import SettingsPage from "@/features/dashboard/SettingsPage";
export default function App() {
    return (_jsx(ErrorBoundary, { children: _jsxs(AppThemeProvider, { children: [_jsx(GlobalLoader, {}), _jsx(ToastContainer, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/complaints", element: _jsx(ProtectedRoute, { children: _jsx(ComplaintsPage, {}) }) }), _jsx(Route, { path: "/complaints/new", element: _jsx(ProtectedRoute, { children: _jsx(ComplaintForm, {}) }) }), _jsx(Route, { path: "/complaints/:id", element: _jsx(ProtectedRoute, { children: _jsx(ComplaintDetailPage, {}) }) }), _jsx(Route, { path: "/complaints/:id/edit", element: _jsx(ProtectedRoute, { children: _jsx(ComplaintForm, {}) }) }), _jsx(Route, { path: "/analytics", element: _jsx(ProtectedRoute, { children: _jsx(AnalyticsPage, {}) }) }), _jsx(Route, { path: "/settings", element: _jsx(ProtectedRoute, { children: _jsx(SettingsPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] })] }) }));
}
