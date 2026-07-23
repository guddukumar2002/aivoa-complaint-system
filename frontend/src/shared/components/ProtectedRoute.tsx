import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { fetchMe } from "@/features/auth/authSlice";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { token, user, loading } = useAppSelector((s) => s.auth);
  const location = useLocation();

  useEffect(() => {
    if (token && !user) dispatch(fetchMe());
  }, [token, user, dispatch]);

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;

  if (token && !user && loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
