import { baseApi } from "@/app/baseApi";
export const uploadApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        uploadDocument: build.mutation({
            query: ({ complaintId, file }) => {
                const form = new FormData();
                form.append("file", file);
                return { url: `/complaints/${complaintId}/documents`, method: "POST", body: form };
            },
            invalidatesTags: (_r, _e, { complaintId }) => [{ type: "Upload", id: complaintId }],
        }),
        getDocuments: build.query({
            query: (complaintId) => `/complaints/${complaintId}/documents`,
            providesTags: (_r, _e, id) => [{ type: "Upload", id }],
        }),
        deleteDocument: build.mutation({
            query: ({ complaintId, documentId }) => ({
                url: `/complaints/${complaintId}/documents/${documentId}`,
                method: "DELETE",
            }),
            // Optimistic removal from cache
            onQueryStarted: async ({ complaintId, documentId }, { dispatch, queryFulfilled }) => {
                const patch = dispatch(uploadApi.util.updateQueryData("getDocuments", complaintId, (draft) => {
                    return draft.filter((d) => d.id !== documentId);
                }));
                try {
                    await queryFulfilled;
                }
                catch {
                    patch.undo();
                }
            },
            invalidatesTags: (_r, _e, { complaintId }) => [{ type: "Upload", id: complaintId }],
        }),
    }),
    overrideExisting: false,
});
export const { useUploadDocumentMutation, useGetDocumentsQuery, useDeleteDocumentMutation, } = uploadApi;
