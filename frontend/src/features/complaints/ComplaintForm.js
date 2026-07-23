import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Alert, Box, Button, CircularProgress, Divider, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Skeleton, TextField, Tooltip, Typography, } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { alpha } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { fetchComplaint, createComplaint, updateComplaint, createComplaintWithToast, updateComplaintWithToast, clearError } from "./complaintsSlice";
import { clearCopilot } from "./copilotSlice";
import { setAIFilledFields, clearAIFilledFields } from "./aiSlice";
import { selectAIFilledFields } from "./aiSelectors";
import AppLayout from "@/shared/components/AppLayout";
import CopilotPanel from "./CopilotPanel";
const CATEGORIES = [
    { value: "product_quality", label: "Product Quality" },
    { value: "packaging", label: "Packaging" },
    { value: "labeling", label: "Labeling" },
    { value: "adverse_event", label: "Adverse Event" },
    { value: "delivery", label: "Delivery" },
    { value: "other", label: "Other" },
];
const LEVELS = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
];
const defaultValues = {
    customer_name: "", product_name: "", batch_number: "", lot_number: "",
    manufacturing_date: "", expiry_date: "", complaint_category: "",
    complaint_description: "", severity: "", risk_level: "",
    root_cause: "", capa: "", summary: "", next_action: "",
};
export default function ComplaintForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { selected: complaint, loading: detailsLoading, submitting, error } = useAppSelector((s) => s.complaints);
    const { loading: copilotLoading } = useAppSelector((s) => s.copilot);
    const aiFilledFields = useAppSelector(selectAIFilledFields);
    const appliedRef = useRef(false);
    const { control, handleSubmit, setValue, reset, formState: { errors, isDirty } } = useForm({ defaultValues });
    useEffect(() => {
        if (isEdit && id) {
            dispatch(fetchComplaint(id));
        }
    }, [id, isEdit, dispatch]);
    useEffect(() => {
        if (isEdit && complaint) {
            // Parse multi-field details from single description string
            const parts = complaint.description.split("\n\n");
            let descriptionText = "";
            let rootCause = "";
            let capa = "";
            let nextAction = "";
            parts.forEach((p) => {
                if (p.startsWith("Root Cause: ")) {
                    rootCause = p.replace("Root Cause: ", "");
                }
                else if (p.startsWith("CAPA: ")) {
                    capa = p.replace("CAPA: ", "");
                }
                else if (p.startsWith("Next Action: ")) {
                    nextAction = p.replace("Next Action: ", "");
                }
                else {
                    if (descriptionText)
                        descriptionText += "\n\n";
                    descriptionText += p;
                }
            });
            // Split title to retrieve product name if it matches "Product — Category" format
            const titleParts = complaint.title.split(" — ");
            const productName = titleParts[0] ?? "";
            reset({
                customer_name: "", // Leave blank, or map from title if structured
                product_name: productName,
                batch_number: "",
                lot_number: "",
                manufacturing_date: "",
                expiry_date: "",
                complaint_category: complaint.category === "other" ? "other" : complaint.category,
                complaint_description: descriptionText,
                severity: complaint.priority,
                risk_level: complaint.priority,
                root_cause: rootCause,
                capa: capa,
                summary: "",
                next_action: nextAction,
            });
        }
    }, [complaint, isEdit, reset]);
    useEffect(() => {
        return () => {
            dispatch(clearCopilot());
            dispatch(clearError());
            dispatch(clearAIFilledFields());
        };
    }, [dispatch]);
    const handleCopilotApply = ({ data, confidence }) => {
        const filled = [];
        Object.keys(data).forEach((key) => {
            if (data[key]) {
                setValue(key, data[key], { shouldDirty: true, shouldValidate: true });
                filled.push(key);
            }
        });
        dispatch(setAIFilledFields(filled));
        // Store confidence on window for field-level display (lightweight, avoids extra slice)
        if (confidence)
            window.__aiConfidence = confidence;
        appliedRef.current = true;
    };
    const handleFieldEdit = (fieldName) => {
        if (aiFilledFields.includes(fieldName)) {
            dispatch(setAIFilledFields(aiFilledFields.filter((f) => f !== fieldName)));
        }
    };
    const getConfidence = (field) => {
        const conf = window.__aiConfidence;
        return conf?.[field] ?? null;
    };
    const isAIField = (field) => aiFilledFields.includes(field);
    const onSubmit = async (values) => {
        const title = values.product_name
            ? `${values.product_name} — ${values.complaint_category || "Complaint"}`
            : values.complaint_description.slice(0, 80);
        const description = [
            values.complaint_description,
            values.root_cause && `Root Cause: ${values.root_cause}`,
            values.capa && `CAPA: ${values.capa}`,
            values.next_action && `Next Action: ${values.next_action}`,
        ].filter(Boolean).join("\n\n");
        // Map form values to API categories/priorities
        const category = values.complaint_category || "other";
        const priority = values.severity || "medium";
        if (isEdit && id) {
            const result = await dispatch(updateComplaintWithToast({
                id,
                title,
                description,
                category,
                priority,
            }));
            if (updateComplaint.fulfilled.match(result) || (result.payload && !result.error)) {
                navigate(`/complaints/${id}`);
            }
        }
        else {
            const result = await dispatch(createComplaintWithToast({
                title,
                description,
                category,
            }));
            if (createComplaint.fulfilled.match(result) || (result.payload && !result.error)) {
                navigate(`/complaints/${result.payload.id}`);
            }
        }
    };
    if (isEdit && detailsLoading && !complaint) {
        return (_jsx(AppLayout, { title: "Edit Complaint", children: _jsxs(Box, { sx: { p: { xs: 2, sm: 3 }, maxWidth: 960, mx: "auto" }, children: [_jsx(Skeleton, { height: 60, sx: { mb: 3 } }), _jsx(Skeleton, { height: 200, sx: { mb: 3 } }), _jsx(Skeleton, { height: 200 })] }) }));
    }
    return (_jsx(AppLayout, { title: isEdit ? "Edit Complaint" : "New Complaint", children: _jsxs(Box, { sx: { p: { xs: 2, sm: 3 }, maxWidth: 960, mx: "auto" }, children: [_jsxs(Box, { display: "flex", alignItems: "center", gap: 1.5, mb: 3, children: [_jsx(Button, { variant: "text", size: "small", startIcon: _jsx(ArrowBackIcon, {}), onClick: () => navigate(isEdit ? `/complaints/${id}` : "/complaints"), sx: { color: "text.secondary" }, children: "Back" }), _jsx(Divider, { orientation: "vertical", flexItem: true }), _jsx(Typography, { variant: "h5", fontWeight: 700, children: isEdit ? "Edit Complaint" : "New Complaint" })] }), !isEdit && _jsx(CopilotPanel, { onApply: handleCopilotApply }), copilotLoading && !isEdit && (_jsxs(Box, { sx: {
                        display: "flex", alignItems: "center", gap: 1.5, mb: 2.5,
                        p: 1.5, borderRadius: 2,
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
                        border: "1px solid", borderColor: (t) => alpha(t.palette.primary.main, 0.2),
                    }, children: [_jsx(CircularProgress, { size: 16 }), _jsx(Typography, { variant: "body2", color: "primary.main", fontWeight: 500, children: "AI is analyzing your complaint \u2014 form fields will auto-populate when complete\u2026" })] })), aiFilledFields.length > 0 && !copilotLoading && !isEdit && (_jsxs(Box, { sx: {
                        display: "flex", alignItems: "center", gap: 1, mb: 2.5,
                        p: 1.25, borderRadius: 2,
                        bgcolor: (t) => alpha(t.palette.success.main, 0.06),
                        border: "1px solid", borderColor: (t) => alpha(t.palette.success.main, 0.25),
                    }, children: [_jsx(AutoFixHighIcon, { sx: { fontSize: 16, color: "success.main" } }), _jsxs(Typography, { variant: "body2", color: "success.dark", fontWeight: 500, children: [aiFilledFields.length, " fields auto-populated by AI"] }), _jsx(Typography, { variant: "caption", color: "text.secondary", sx: { ml: 0.5 }, children: "\u2014 highlighted in blue. Edit any field to clear its AI highlight." })] })), error && (_jsx(Alert, { severity: "error", sx: { mb: 2.5 }, onClose: () => dispatch(clearError()), children: error })), _jsxs(Box, { component: "form", onSubmit: handleSubmit(onSubmit), sx: { position: "relative" }, children: [copilotLoading && !isEdit && (_jsx(Box, { sx: { position: "absolute", inset: 0, zIndex: 1, bgcolor: "rgba(248,250,252,0.7)", borderRadius: 2 }, children: _jsxs(Grid, { container: true, spacing: 2, p: 1, children: [Array.from({ length: 8 }).map((_, i) => (_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(Skeleton, { variant: "rounded", height: 40 }) }, i))), _jsx(Grid, { item: true, xs: 12, children: _jsx(Skeleton, { variant: "rounded", height: 96 }) })] }) })), _jsx(SectionHeader, { title: "Customer & Product Information" }), _jsxs(Grid, { container: true, spacing: 2, mb: 3, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(AITextField, { name: "customer_name", label: "Customer Name", control: control, isAI: isAIField("customer_name"), confidence: getConfidence("customer_name"), onEdit: () => handleFieldEdit("customer_name") }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(AITextField, { name: "product_name", label: "Product Name", control: control, isAI: isAIField("product_name"), confidence: getConfidence("product_name"), onEdit: () => handleFieldEdit("product_name") }) }), _jsx(Grid, { item: true, xs: 12, sm: 3, children: _jsx(AITextField, { name: "batch_number", label: "Batch Number", control: control, isAI: isAIField("batch_number"), confidence: getConfidence("batch_number"), onEdit: () => handleFieldEdit("batch_number") }) }), _jsx(Grid, { item: true, xs: 12, sm: 3, children: _jsx(AITextField, { name: "lot_number", label: "Lot Number", control: control, isAI: isAIField("lot_number"), confidence: getConfidence("lot_number"), onEdit: () => handleFieldEdit("lot_number") }) }), _jsx(Grid, { item: true, xs: 12, sm: 3, children: _jsx(AITextField, { name: "manufacturing_date", label: "Manufacturing Date", placeholder: "YYYY-MM-DD", control: control, isAI: isAIField("manufacturing_date"), confidence: getConfidence("manufacturing_date"), onEdit: () => handleFieldEdit("manufacturing_date") }) }), _jsx(Grid, { item: true, xs: 12, sm: 3, children: _jsx(AITextField, { name: "expiry_date", label: "Expiry Date", placeholder: "YYYY-MM-DD", control: control, isAI: isAIField("expiry_date"), confidence: getConfidence("expiry_date"), onEdit: () => handleFieldEdit("expiry_date") }) })] }), _jsx(SectionHeader, { title: "Complaint Details" }), _jsxs(Grid, { container: true, spacing: 2, mb: 3, children: [_jsx(Grid, { item: true, xs: 12, sm: 4, children: _jsx(AISelectField, { name: "complaint_category", label: "Complaint Category *", options: CATEGORIES, control: control, rules: { required: "Category is required" }, error: errors.complaint_category, isAI: isAIField("complaint_category"), confidence: getConfidence("complaint_category"), onEdit: () => handleFieldEdit("complaint_category") }) }), _jsx(Grid, { item: true, xs: 12, sm: 4, children: _jsx(AISelectField, { name: "severity", label: "Severity *", options: LEVELS, control: control, rules: { required: "Severity is required" }, error: errors.severity, isAI: isAIField("severity"), confidence: getConfidence("severity"), onEdit: () => handleFieldEdit("severity") }) }), _jsx(Grid, { item: true, xs: 12, sm: 4, children: _jsx(AISelectField, { name: "risk_level", label: "Risk Level", options: LEVELS, control: control, isAI: isAIField("risk_level"), confidence: getConfidence("risk_level"), onEdit: () => handleFieldEdit("risk_level") }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(AITextField, { name: "complaint_description", label: "Complaint Description *", control: control, multiline: true, minRows: 4, rules: { required: "Description is required", minLength: { value: 20, message: "At least 20 characters" } }, error: errors.complaint_description, isAI: isAIField("complaint_description"), confidence: getConfidence("complaint_description"), onEdit: () => handleFieldEdit("complaint_description") }) })] }), _jsx(SectionHeader, { title: "Analysis & Actions" }), _jsxs(Grid, { container: true, spacing: 2, mb: 3, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(AITextField, { name: "root_cause", label: "Root Cause", control: control, multiline: true, minRows: 3, isAI: isAIField("root_cause"), confidence: getConfidence("root_cause"), onEdit: () => handleFieldEdit("root_cause") }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(AITextField, { name: "capa", label: "CAPA (Corrective & Preventive Actions)", control: control, multiline: true, minRows: 3, isAI: isAIField("capa"), confidence: getConfidence("capa"), onEdit: () => handleFieldEdit("capa") }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(AITextField, { name: "summary", label: "Summary", control: control, multiline: true, minRows: 3, isAI: isAIField("summary"), confidence: getConfidence("summary"), onEdit: () => handleFieldEdit("summary") }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(AITextField, { name: "next_action", label: "Next Action", control: control, multiline: true, minRows: 3, isAI: isAIField("next_action"), confidence: getConfidence("next_action"), onEdit: () => handleFieldEdit("next_action") }) })] }), _jsx(Divider, { sx: { mb: 3 } }), _jsxs(Box, { display: "flex", gap: 2, justifyContent: "flex-end", children: [isEdit ? (_jsx(Button, { variant: "outlined", onClick: () => navigate(`/complaints/${id}`), disabled: submitting, children: "Cancel" })) : (_jsx(Button, { variant: "outlined", onClick: () => { reset(defaultValues); dispatch(clearAIFilledFields()); }, disabled: !isDirty || submitting, children: "Reset" })), _jsx(Button, { type: "submit", variant: "contained", size: "large", disabled: submitting || copilotLoading, startIcon: submitting ? _jsx(CircularProgress, { size: 16, color: "inherit" }) : _jsx(SaveIcon, {}), children: isEdit ? (submitting ? "Saving…" : "Save Changes") : (submitting ? "Submitting…" : "Submit Complaint") })] })] })] }) }));
}
function AIBadge({ confidence }) {
    return (_jsx(Tooltip, { title: confidence != null ? `AI confidence: ${Math.round(confidence * 100)}%` : "AI-generated value", arrow: true, children: _jsxs(Box, { component: "span", sx: {
                display: "inline-flex", alignItems: "center", gap: 0.4,
                px: 0.75, py: 0.2, borderRadius: 1,
                bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                color: "primary.main", fontSize: "0.65rem", fontWeight: 700,
                letterSpacing: "0.04em", cursor: "default", userSelect: "none",
                lineHeight: 1,
            }, children: [_jsx(AutoFixHighIcon, { sx: { fontSize: 10 } }), "AI", confidence != null ? ` ${Math.round(confidence * 100)}%` : ""] }) }));
}
function aiFieldSx(isAI) {
    return isAI
        ? {
            "& .MuiOutlinedInput-root fieldset": {
                borderColor: "#2563EB !important",
                borderWidth: "1.5px !important",
            },
            "& .MuiOutlinedInput-root": {
                bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
            },
        }
        : {};
}
function AITextField({ name, label, control, multiline, minRows, placeholder, rules, error, isAI, confidence, onEdit }) {
    return (_jsx(Controller, { name: name, control: control, rules: rules, render: ({ field }) => (_jsx(TextField, { ...field, label: isAI ? (_jsxs(Box, { component: "span", sx: { display: "flex", alignItems: "center", gap: 0.75 }, children: [label, " ", _jsx(AIBadge, { confidence: confidence })] })) : label, fullWidth: true, multiline: multiline, minRows: minRows, placeholder: placeholder, error: !!error, helperText: error?.message, onChange: (e) => { field.onChange(e); onEdit(); }, sx: aiFieldSx(isAI) })) }));
}
function AISelectField({ name, label, options, control, rules, error, isAI, confidence, onEdit }) {
    return (_jsx(Controller, { name: name, control: control, rules: rules, render: ({ field }) => (_jsxs(FormControl, { fullWidth: true, error: !!error, sx: aiFieldSx(isAI), children: [_jsx(InputLabel, { children: isAI ? (_jsxs(Box, { component: "span", sx: { display: "flex", alignItems: "center", gap: 0.75 }, children: [label, " ", _jsx(AIBadge, { confidence: confidence })] })) : label }), _jsx(Select, { ...field, label: label, onChange: (e) => { field.onChange(e); onEdit(); }, children: options.map((o) => _jsx(MenuItem, { value: o.value, children: o.label }, o.value)) }), error && _jsx(FormHelperText, { children: error.message })] })) }));
}
function SectionHeader({ title }) {
    return (_jsxs(Box, { mb: 1.5, children: [_jsx(Typography, { variant: "overline", color: "text.secondary", fontWeight: 600, children: title }), _jsx(Divider, { sx: { mt: 0.5 } })] }));
}
