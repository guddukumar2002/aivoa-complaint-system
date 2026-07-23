import { jsx as _jsx } from "react/jsx-runtime";
import { Alert, Slide, Snackbar, Stack } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { dismissToast } from "@/app/toastSlice";
export default function ToastContainer() {
    const dispatch = useAppDispatch();
    const queue = useAppSelector((s) => s.toast.queue);
    return (_jsx(Stack, { spacing: 1, sx: { position: "fixed", bottom: 24, right: 24, zIndex: 2000, maxWidth: 400 }, children: queue.map((toast) => (_jsx(Snackbar, { open: true, autoHideDuration: toast.duration ?? 4000, onClose: () => dispatch(dismissToast(toast.id)), anchorOrigin: { vertical: "bottom", horizontal: "right" }, TransitionComponent: Slide, sx: { position: "relative", bottom: "auto", right: "auto" }, children: _jsx(Alert, { severity: toast.severity, onClose: () => dispatch(dismissToast(toast.id)), variant: "filled", sx: { width: "100%", boxShadow: 4, borderRadius: 2 }, children: toast.message }) }, toast.id))) }));
}
