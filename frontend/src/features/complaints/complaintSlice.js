import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    selectedId: null,
    filters: {},
    page: 1,
    pageSize: 20,
    deletingIds: [],
    updatingIds: [],
};
const complaintSlice = createSlice({
    name: "complaint",
    initialState,
    reducers: {
        selectComplaint: (state, { payload }) => {
            state.selectedId = payload;
        },
        setFilters: (state, { payload }) => {
            state.filters = payload;
            state.page = 1;
        },
        setStatusFilter: (state, { payload }) => {
            state.filters = { ...state.filters, status: payload };
            state.page = 1;
        },
        setPriorityFilter: (state, { payload }) => {
            state.filters = { ...state.filters, priority: payload };
            state.page = 1;
        },
        setCategoryFilter: (state, { payload }) => {
            state.filters = { ...state.filters, category: payload };
            state.page = 1;
        },
        clearFilters: (state) => {
            state.filters = {};
            state.page = 1;
        },
        setPage: (state, { payload }) => {
            state.page = payload;
        },
        setPageSize: (state, { payload }) => {
            state.pageSize = payload;
            state.page = 1;
        },
        markDeleting: (state, { payload }) => {
            if (!state.deletingIds.includes(payload))
                state.deletingIds.push(payload);
        },
        unmarkDeleting: (state, { payload }) => {
            state.deletingIds = state.deletingIds.filter((id) => id !== payload);
        },
        markUpdating: (state, { payload }) => {
            if (!state.updatingIds.includes(payload))
                state.updatingIds.push(payload);
        },
        unmarkUpdating: (state, { payload }) => {
            state.updatingIds = state.updatingIds.filter((id) => id !== payload);
        },
    },
});
export const { selectComplaint, setFilters, setStatusFilter, setPriorityFilter, setCategoryFilter, clearFilters, setPage, setPageSize, markDeleting, unmarkDeleting, markUpdating, unmarkUpdating, } = complaintSlice.actions;
export default complaintSlice.reducer;
