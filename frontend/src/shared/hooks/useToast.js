import { useCallback } from "react";
import { useAppDispatch } from "@/app/store";
import { showToast } from "@/app/toastSlice";
export function useToast() {
    const dispatch = useAppDispatch();
    return useCallback((message, severity = "info", duration = 4000) => {
        dispatch(showToast({ message, severity, duration }));
    }, [dispatch]);
}
