import { useCallback } from "react";
import { useAppDispatch } from "@/app/store";
import { showToast, type ToastSeverity } from "@/app/toastSlice";

export function useToast() {
  const dispatch = useAppDispatch();
  return useCallback(
    (message: string, severity: ToastSeverity = "info", duration = 4000) => {
      dispatch(showToast({ message, severity, duration }));
    },
    [dispatch]
  );
}
