import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { fetchMe } from "@/features/auth/authSlice";
export default function ProtectedRoute({ children }) {
    const dispatch = useAppDispatch();
    const { token, user, loading } = useAppSelector((s) => s.auth);
    const location = useLocation();
    useEffect(() => {
        if (token && !user)
            dispatch(fetchMe());
    }, [token, user, dispatch]);
    if (!token)
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    if (token && !user && loading) {
        return (_jsx(Box, { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", children: _jsx(CircularProgress, {}) }));
    }
    return _jsx(_Fragment, { children: children });
}
