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
  return (
    <ErrorBoundary>
      <AppThemeProvider>
        <GlobalLoader />
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <ProtectedRoute>
                <ComplaintsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints/new"
            element={
              <ProtectedRoute>
                <ComplaintForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints/:id"
            element={
              <ProtectedRoute>
                <ComplaintDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints/:id/edit"
            element={
              <ProtectedRoute>
                <ComplaintForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppThemeProvider>
    </ErrorBoundary>
  );
}
