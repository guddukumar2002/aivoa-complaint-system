import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const rawBase = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token
            ?? localStorage.getItem("access_token");
        if (token)
            headers.set("Authorization", `Bearer ${token}`);
        return headers;
    },
});
// Wrap base query: on 401 clear token and let ProtectedRoute redirect
const baseQueryWithReauth = async (args, api, extra) => {
    const result = await rawBase(args, api, extra);
    if (result.error?.status === 401) {
        localStorage.removeItem("access_token");
        // Dispatch logout without importing the slice (avoids circular dep)
        api.dispatch({ type: "auth/logout" });
    }
    return result;
};
export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Complaint", "Timeline", "AIAnalysis", "Upload", "User"],
    endpoints: () => ({}),
});
