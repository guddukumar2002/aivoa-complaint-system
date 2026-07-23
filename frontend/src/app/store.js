import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { baseApi } from "@/app/baseApi";
import authReducer from "@/features/auth/authSlice";
import complaintReducer from "@/features/complaints/complaintSlice";
import complaintsReducer from "@/features/complaints/complaintsSlice";
import copilotReducer from "@/features/complaints/copilotSlice";
import aiReducer from "@/features/complaints/aiSlice";
import uploadReducer from "@/features/complaints/uploadSlice";
import dashboardReducer from "@/features/dashboard/dashboardSlice";
import loadingReducer, { startLoading, stopLoading } from "@/app/loadingSlice";
import toastReducer from "@/app/toastSlice";
const loadingMiddleware = (store) => (next) => (action) => {
    if (action.type) {
        if (action.type.endsWith("/pending")) {
            store.dispatch(startLoading(action.type));
        }
        else if (action.type.endsWith("/fulfilled") || action.type.endsWith("/rejected")) {
            const baseType = action.type.replace(/\/(fulfilled|rejected)$/, "/pending");
            store.dispatch(stopLoading(baseType));
        }
    }
    return next(action);
};
export const store = configureStore({
    reducer: {
        // RTK Query
        [baseApi.reducerPath]: baseApi.reducer,
        // Feature slices
        auth: authReducer,
        complaint: complaintReducer,
        complaints: complaintsReducer,
        copilot: copilotReducer,
        ai: aiReducer,
        upload: uploadReducer,
        dashboard: dashboardReducer,
        loading: loadingReducer,
        toast: toastReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware, loadingMiddleware),
});
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector.withTypes();
