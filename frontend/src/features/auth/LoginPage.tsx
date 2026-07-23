import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Box, Button, CircularProgress, Paper, TextField,
  Typography, Alert, InputAdornment, IconButton,
} from "@mui/material";
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

interface FormValues {
  email: string;
  password: string;
  full_name?: string;
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useAppSelector((s) => s.auth);
  const [showPwd, setShowPwd] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  useEffect(() => {
    if (token) navigate("/", { replace: true });
    return () => { dispatch(clearAuthError()); };
  }, [token, navigate, dispatch]);

  const onSubmit = (values: FormValues) => {
    if (isRegister) {
      dispatch(
        registerUser({
          email: values.email,
          full_name: values.full_name || "",
          password: values.password,
        })
      )
        .unwrap()
        .then(() => {
          dispatch(
            showToast({
              message: "Registration successful! Please login.",
              severity: "success",
            })
          );
          setIsRegister(false);
          reset();
        });
    } else {
      dispatch(login({ email: values.email, password: values.password }));
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
        p: 2,
      }}
    >
      {/* Background decoration */}
      <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(3)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: 400 + i * 200, height: 400 + i * 200,
              borderRadius: "50%",
              border: "1px solid rgba(37,99,235,0.1)",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </Box>

      <Paper
        elevation={0}
        sx={{
          width: "100%", maxWidth: 420, p: 4, borderRadius: 3,
          border: "1px solid", borderColor: "divider",
          position: "relative", zIndex: 1,
        }}
      >
        {/* Logo */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
          <Box
            sx={{
              width: 52, height: 52, borderRadius: 2.5, mb: 2,
              background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <AutoFixHighIcon sx={{ color: "#fff", fontSize: 26 }} />
          </Box>
          <Typography variant="h4" fontWeight={700} textAlign="center">
            {isRegister ? "Create Account" : "Welcome back"}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={0.5}>
            {isRegister ? "Sign up to AIVOA Complaint System" : "Sign in to AIVOA Complaint System"}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => dispatch(clearAuthError())}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {isRegister && (
            <TextField
              {...register("full_name", { required: "Full name is required" })}
              label="Full name"
              type="text"
              fullWidth
              autoFocus
              error={!!errors.full_name}
              helperText={errors.full_name?.message}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                  </InputAdornment>
                ),
              }}
            />
          )}

          <TextField
            {...register("email", { required: "Email is required", pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" } })}
            label="Email address"
            type="email"
            fullWidth
            autoComplete="email"
            autoFocus={!isRegister}
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
            label="Password"
            type={showPwd ? "text" : "password"}
            fullWidth
            autoComplete="current-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPwd((v) => !v)} edge="end">
                    {showPwd ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ mb: 2 }}
          >
            {loading ? (isRegister ? "Signing up…" : "Signing in…") : (isRegister ? "Sign Up" : "Sign In")}
          </Button>

          <Box textAlign="center" mt={1}>
            <Button
              onClick={() => {
                setIsRegister(!isRegister);
                dispatch(clearAuthError());
                reset();
              }}
              sx={{ textTransform: "none", color: "primary.main" }}
            >
              {isRegister ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
