import { baseApi } from "@/app/baseApi";
/** Returns undo-able patches for every fulfilled getComplaints cache entry. */
function patchAllListCaches(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
dispatch, queries, updater) {
    return Object.values(queries)
        .filter((q) => q.endpointName === "getComplaints" && q.status === "fulfilled")
        .map((q) => dispatch(complaintsApi.util.updateQueryData("getComplaints", q.originalArgs, updater)));
}
export const complaintsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // ── List ──────────────────────────────────────────────────────────
        getComplaints: build.query({
            query: (params) => ({ url: "/complaints", params }),
            providesTags: (result) => result
                ? [
                    ...result.items.map(({ id }) => ({ type: "Complaint", id })),
                    { type: "Complaint", id: "LIST" },
                ]
                : [{ type: "Complaint", id: "LIST" }],
        }),
        // ── Single ────────────────────────────────────────────────────────
        getComplaint: build.query({
            query: (id) => `/complaints/${id}`,
            providesTags: (_r, _e, id) => [{ type: "Complaint", id }],
        }),
        // ── Create ────────────────────────────────────────────────────────
        createComplaint: build.mutation({
            query: (body) => ({ url: "/complaints", method: "POST", body }),
            invalidatesTags: [{ type: "Complaint", id: "LIST" }],
        }),
        // ── Update (optimistic) ───────────────────────────────────────────
        updateComplaint: build.mutation({
            query: ({ id, ...body }) => ({ url: `/complaints/${id}`, method: "PUT", body }),
            onQueryStarted: async ({ id, ...patch }, { dispatch, queryFulfilled, getState }) => {
                const singlePatch = dispatch(complaintsApi.util.updateQueryData("getComplaint", id, (draft) => {
                    Object.assign(draft, patch);
                }));
                const queries = getState().api.queries;
                const listPatches = patchAllListCaches(dispatch, queries, (draft) => {
                    const item = draft.items.find((c) => c.id === id);
                    if (item)
                        Object.assign(item, patch);
                });
                try {
                    await queryFulfilled;
                }
                catch {
                    singlePatch.undo();
                    listPatches.forEach((p) => p.undo());
                }
            },
            invalidatesTags: (_r, _e, { id }) => [{ type: "Complaint", id }],
        }),
        // ── Delete (optimistic) ───────────────────────────────────────────
        deleteComplaint: build.mutation({
            query: (id) => ({ url: `/complaints/${id}`, method: "DELETE" }),
            onQueryStarted: async (id, { dispatch, queryFulfilled, getState }) => {
                const queries = getState().api.queries;
                const listPatches = patchAllListCaches(dispatch, queries, (draft) => {
                    draft.items = draft.items.filter((c) => c.id !== id);
                    draft.total = Math.max(0, draft.total - 1);
                });
                try {
                    await queryFulfilled;
                }
                catch {
                    listPatches.forEach((p) => p.undo());
                }
            },
            invalidatesTags: (_r, _e, id) => [
                { type: "Complaint", id },
                { type: "Complaint", id: "LIST" },
            ],
        }),
        // ── Timeline ──────────────────────────────────────────────────────
        getTimeline: build.query({
            query: (id) => `/complaints/${id}/timeline`,
            providesTags: (_r, _e, id) => [{ type: "Timeline", id }],
        }),
    }),
    overrideExisting: false,
});
export const { useGetComplaintsQuery, useGetComplaintQuery, useCreateComplaintMutation, useUpdateComplaintMutation, useDeleteComplaintMutation, useGetTimelineQuery, } = complaintsApi;
