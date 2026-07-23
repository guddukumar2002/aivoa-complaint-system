import { useCallback, useRef } from "react";
import { useAppDispatch } from "@/app/store";
import { startUpload, setProgress, finishUpload, failUpload, } from "@/features/complaints/uploadSlice";
import { uploadApi } from "@/features/complaints/uploadApi";
// ─── Constants ────────────────────────────────────────────────────────────────
export const ACCEPTED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "text/plain",
    "message/rfc822", // .eml
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.gif,.webp,.txt,.eml,.doc,.docx";
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_FILES_PER_UPLOAD = 10;
export function validateFiles(files) {
    const valid = [];
    const errors = [];
    for (const file of files) {
        if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
            errors.push({ file: file.name, reason: `File type "${file.type || "unknown"}" is not supported` });
            continue;
        }
        if (file.size === 0) {
            errors.push({ file: file.name, reason: "File is empty" });
            continue;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            const mb = (file.size / (1024 * 1024)).toFixed(1);
            errors.push({ file: file.name, reason: `File is ${mb} MB — maximum is 10 MB` });
            continue;
        }
        valid.push(file);
    }
    return { valid, errors };
}
// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useFileUpload(complaintId) {
    const dispatch = useAppDispatch();
    const abortRefs = useRef({});
    const uploadFile = useCallback((file, uploadId) => {
        const token = localStorage.getItem("access_token") ?? "";
        const baseUrl = import.meta.env.VITE_API_BASE_URL ??
            "http://localhost:8000/api/v1";
        dispatch(startUpload({ uploadId, fileName: file.name }));
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const controller = new AbortController();
            abortRefs.current[uploadId] = controller;
            xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                    const pct = Math.round((e.loaded / e.total) * 100);
                    dispatch(setProgress({ uploadId, progress: pct }));
                }
            });
            xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    dispatch(finishUpload(uploadId));
                    // Invalidate RTK Query cache so DocumentList refreshes
                    dispatch(uploadApi.util.invalidateTags([{ type: "Upload", id: complaintId }]));
                    delete abortRefs.current[uploadId];
                    resolve();
                }
                else {
                    let msg = `Upload failed (${xhr.status})`;
                    try {
                        const body = JSON.parse(xhr.responseText);
                        if (body.detail)
                            msg = body.detail;
                    }
                    catch { /* ignore */ }
                    dispatch(failUpload({ uploadId, error: msg }));
                    reject(new Error(msg));
                }
            });
            xhr.addEventListener("error", () => {
                const msg = "Network error — upload failed";
                dispatch(failUpload({ uploadId, error: msg }));
                reject(new Error(msg));
            });
            xhr.addEventListener("abort", () => {
                dispatch(failUpload({ uploadId, error: "Upload cancelled" }));
                reject(new Error("Upload cancelled"));
            });
            controller.signal.addEventListener("abort", () => xhr.abort());
            const form = new FormData();
            form.append("file", file);
            xhr.open("POST", `${baseUrl}/complaints/${complaintId}/documents`);
            if (token)
                xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            xhr.send(form);
        });
    }, [complaintId, dispatch]);
    const cancelUpload = useCallback((uploadId) => {
        abortRefs.current[uploadId]?.abort();
        delete abortRefs.current[uploadId];
    }, []);
    return { uploadFile, cancelUpload };
}
