import { createSelector } from "@reduxjs/toolkit";
const selectAuthState = (state) => state.auth;
export const selectCurrentUser = createSelector(selectAuthState, (auth) => auth.user);
export const selectToken = createSelector(selectAuthState, (auth) => auth.token);
export const selectIsAuthenticated = createSelector(selectAuthState, (auth) => auth.token !== null && auth.user !== null);
export const selectAuthLoading = createSelector(selectAuthState, (auth) => auth.loading);
export const selectAuthError = createSelector(selectAuthState, (auth) => auth.error);
export const selectUserRole = createSelector(selectCurrentUser, (user) => user?.role ?? null);
export const selectIsAdmin = createSelector(selectUserRole, (role) => role === "admin");
