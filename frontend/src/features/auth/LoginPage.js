import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box, Button, CircularProgress, Paper, TextField, Typography, Alert, InputAdornment, IconButton, } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { login, clearAuthError, registerUser } from "./authSlice";
import { showToast } from "@/app/toastSlice";
export default function LoginPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error, token } = useAppSelector((s) => s.auth);
    const [showPwd, setShowPwd] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    useEffect(() => {
        if (token)
            navigate("/", { replace: true });
        return () => { dispatch(clearAuthError()); };
    }, [token, navigate, dispatch]);
    const onSubmit = (values) => {
        if (isRegister) {
            dispatch(registerUser({
                email: values.email,
                full_name: values.full_name || "",
                password: values.password,
            }))
                .unwrap()
                .then(() => {
                dispatch(showToast({
                    message: "Registration successful! Please login.",
                    severity: "success",
                }));
                setIsRegister(false);
                reset();
            });
        }
        else {
            dispatch(login({ email: values.email, password: values.password }));
        }
    };
    return (_jsxs(Box, { sx: {
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
            p: 2,
        }, children: [_jsx(Box, { sx: { position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }, children: [...Array(3)].map((_, i) => (_jsx(Box, { sx: {
                        position: "absolute",
                        width: 400 + i * 200, height: 400 + i * 200,
                        borderRadius: "50%",
                        border: "1px solid rgba(37,99,235,0.1)",
                        top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                    } }, i))) }), _jsxs(Paper, { elevation: 0, sx: {
                    width: "100%", maxWidth: 420, p: 4, borderRadius: 3,
                    border: "1px solid", borderColor: "divider",
                    position: "relative", zIndex: 1,
                }, children: [_jsxs(Box, { display: "flex", flexDirection: "column", alignItems: "center", mb: 4, children: [_jsx(Box, { sx: {
                                    width: 52, height: 52, borderRadius: 2.5, mb: 2,
                                    background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }, children: _jsx(AutoFixHighIcon, { sx: { color: "#fff", fontSize: 26 } }) }), _jsx(Typography, { variant: "h4", fontWeight: 700, textAlign: "center", children: isRegister ? "Create Account" : "Welcome back" }), _jsx(Typography, { variant: "body2", color: "text.secondary", textAlign: "center", mt: 0.5, children: isRegister ? "Sign up to AIVOA Complaint System" : "Sign in to AIVOA Complaint System" })] }), error && (_jsx(Alert, { severity: "error", sx: { mb: 2.5 }, onClose: () => dispatch(clearAuthError()), children: error })), _jsxs(Box, { component: "form", onSubmit: handleSubmit(onSubmit), noValidate: true, children: [isRegister && (_jsx(TextField, { ...register("full_name", { required: "Full name is required" }), label: "Full name", type: "text", fullWidth: true, autoFocus: true, error: !!errors.full_name, helperText: errors.full_name?.message, sx: { mb: 2 }, InputProps: {
                                    startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(PersonOutlineIcon, { sx: { fontSize: 18, color: "text.disabled" } }) })),
                                } })), _jsx(TextField, { ...register("email", { required: "Email is required", pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" } }), label: "Email address", type: "email", fullWidth: true, autoComplete: "email", autoFocus: !isRegister, error: !!errors.email, helperText: errors.email?.message, sx: { mb: 2 }, InputProps: {
                                    startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(EmailOutlinedIcon, { sx: { fontSize: 18, color: "text.disabled" } }) })),
                                } }), _jsx(TextField, { ...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } }), label: "Password", type: showPwd ? "text" : "password", fullWidth: true, autoComplete: "current-password", error: !!errors.password, helperText: errors.password?.message, sx: { mb: 3 }, InputProps: {
                                    startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(LockOutlinedIcon, { sx: { fontSize: 18, color: "text.disabled" } }) })),
                                    endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { size: "small", onClick: () => setShowPwd((v) => !v), edge: "end", children: showPwd ? _jsx(VisibilityOffIcon, { fontSize: "small" }) : _jsx(VisibilityIcon, { fontSize: "small" }) }) })),
                                } }), _jsx(Button, { type: "submit", variant: "contained", fullWidth: true, size: "large", disabled: loading, startIcon: loading ? _jsx(CircularProgress, { size: 16, color: "inherit" }) : undefined, sx: { mb: 2 }, children: loading ? (isRegister ? "Signing up…" : "Signing in…") : (isRegister ? "Sign Up" : "Sign In") }), _jsx(Box, { textAlign: "center", mt: 1, children: _jsx(Button, { onClick: () => {
                                        setIsRegister(!isRegister);
                                        dispatch(clearAuthError());
                                        reset();
                                    }, sx: { textTransform: "none", color: "primary.main" }, children: isRegister ? "Already have an account? Sign In" : "Don't have an account? Sign Up" }) })] })] })] }));
}
