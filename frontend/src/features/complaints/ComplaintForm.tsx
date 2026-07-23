import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  Alert, Box, Button, CircularProgress, Divider, FormControl,
  FormHelperText, Grid, InputLabel, MenuItem, Select, Skeleton,
  TextField, Tooltip, Typography,
} from "@mui/material";
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

interface FormValues {
  customer_name: string;
  product_name: string;
  batch_number: string;
  lot_number: string;
  manufacturing_date: string;
  expiry_date: string;
  complaint_category: string;
  complaint_description: string;
  severity: string;
  risk_level: string;
  root_cause: string;
  capa: string;
  summary: string;
  next_action: string;
}

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

const defaultValues: FormValues = {
  customer_name: "", product_name: "", batch_number: "", lot_number: "",
  manufacturing_date: "", expiry_date: "", complaint_category: "",
  complaint_description: "", severity: "", risk_level: "",
  root_cause: "", capa: "", summary: "", next_action: "",
};

// Confidence scores are optional — copilot may return them as a separate map
interface CopilotApplyPayload {
  data: Record<string, string>;
  confidence?: Record<string, number>;
}

export default function ComplaintForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { selected: complaint, loading: detailsLoading, submitting, error } = useAppSelector((s) => s.complaints);
  const { loading: copilotLoading } = useAppSelector((s) => s.copilot);
  const aiFilledFields = useAppSelector(selectAIFilledFields);
  const appliedRef = useRef(false);

  const { control, handleSubmit, setValue, reset, formState: { errors, isDirty } } =
    useForm<FormValues>({ defaultValues });

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
        } else if (p.startsWith("CAPA: ")) {
          capa = p.replace("CAPA: ", "");
        } else if (p.startsWith("Next Action: ")) {
          nextAction = p.replace("Next Action: ", "");
        } else {
          if (descriptionText) descriptionText += "\n\n";
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

  const handleCopilotApply = ({ data, confidence }: CopilotApplyPayload) => {
    const filled: string[] = [];
    (Object.keys(data) as (keyof FormValues)[]).forEach((key) => {
      if (data[key]) {
        setValue(key, data[key], { shouldDirty: true, shouldValidate: true });
        filled.push(key);
      }
    });
    dispatch(setAIFilledFields(filled));
    // Store confidence on window for field-level display (lightweight, avoids extra slice)
    if (confidence) (window as unknown as Record<string, unknown>).__aiConfidence = confidence;
    appliedRef.current = true;
  };

  const handleFieldEdit = (fieldName: string) => {
    if (aiFilledFields.includes(fieldName)) {
      dispatch(setAIFilledFields(aiFilledFields.filter((f) => f !== fieldName)));
    }
  };

  const getConfidence = (field: string): number | null => {
    const conf = (window as unknown as Record<string, unknown>).__aiConfidence as Record<string, number> | undefined;
    return conf?.[field] ?? null;
  };

  const isAIField = (field: string) => aiFilledFields.includes(field);

  const onSubmit = async (values: FormValues) => {
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
    const category = (values.complaint_category as "billing" | "technical" | "service" | "product" | "other") || "other";
    const priority = (values.severity as "low" | "medium" | "high" | "critical") || "medium";

    if (isEdit && id) {
      const result = await dispatch(updateComplaintWithToast({
        id,
        title,
        description,
        category,
        priority,
      }));
      if (updateComplaint.fulfilled.match(result as any) || (result.payload && !(result as any).error)) {
        navigate(`/complaints/${id}`);
      }
    } else {
      const result = await dispatch(createComplaintWithToast({
        title,
        description,
        category,
      }));
      if (createComplaint.fulfilled.match(result as any) || (result.payload && !(result as any).error)) {
        navigate(`/complaints/${(result.payload as any).id}`);
      }
    }
  };

  if (isEdit && detailsLoading && !complaint) {
    return (
      <AppLayout title="Edit Complaint">
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 960, mx: "auto" }}>
          <Skeleton height={60} sx={{ mb: 3 }} />
          <Skeleton height={200} sx={{ mb: 3 }} />
          <Skeleton height={200} />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={isEdit ? "Edit Complaint" : "New Complaint"}>
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 960, mx: "auto" }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
          <Button
            variant="text" size="small" startIcon={<ArrowBackIcon />}
            onClick={() => navigate(isEdit ? `/complaints/${id}` : "/complaints")}
            sx={{ color: "text.secondary" }}
          >
            Back
          </Button>
          <Divider orientation="vertical" flexItem />
          <Typography variant="h5" fontWeight={700}>
            {isEdit ? "Edit Complaint" : "New Complaint"}
          </Typography>
        </Box>

        {/* AI Copilot (only show for new complaints) */}
        {!isEdit && <CopilotPanel onApply={handleCopilotApply} />}

        {/* AI loading overlay hint */}
        {copilotLoading && !isEdit && (
          <Box
            sx={{
              display: "flex", alignItems: "center", gap: 1.5, mb: 2.5,
              p: 1.5, borderRadius: 2,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
              border: "1px solid", borderColor: (t) => alpha(t.palette.primary.main, 0.2),
            }}
          >
            <CircularProgress size={16} />
            <Typography variant="body2" color="primary.main" fontWeight={500}>
              AI is analyzing your complaint — form fields will auto-populate when complete…
            </Typography>
          </Box>
        )}

        {/* AI filled badge */}
        {aiFilledFields.length > 0 && !copilotLoading && !isEdit && (
          <Box
            sx={{
              display: "flex", alignItems: "center", gap: 1, mb: 2.5,
              p: 1.25, borderRadius: 2,
              bgcolor: (t) => alpha(t.palette.success.main, 0.06),
              border: "1px solid", borderColor: (t) => alpha(t.palette.success.main, 0.25),
            }}
          >
            <AutoFixHighIcon sx={{ fontSize: 16, color: "success.main" }} />
            <Typography variant="body2" color="success.dark" fontWeight={500}>
              {aiFilledFields.length} fields auto-populated by AI
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              — highlighted in blue. Edit any field to clear its AI highlight.
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ position: "relative" }}>
          {/* Skeleton overlay while AI is processing */}
          {copilotLoading && !isEdit && (
            <Box sx={{ position: "absolute", inset: 0, zIndex: 1, bgcolor: "rgba(248,250,252,0.7)", borderRadius: 2 }}>
              <Grid container spacing={2} p={1}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Skeleton variant="rounded" height={40} />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Skeleton variant="rounded" height={96} />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Section: Customer & Product */}
          <SectionHeader title="Customer & Product Information" />
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <AITextField
                name="customer_name" label="Customer Name"
                control={control} isAI={isAIField("customer_name")}
                confidence={getConfidence("customer_name")}
                onEdit={() => handleFieldEdit("customer_name")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AITextField
                name="product_name" label="Product Name"
                control={control} isAI={isAIField("product_name")}
                confidence={getConfidence("product_name")}
                onEdit={() => handleFieldEdit("product_name")}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <AITextField
                name="batch_number" label="Batch Number"
                control={control} isAI={isAIField("batch_number")}
                confidence={getConfidence("batch_number")}
                onEdit={() => handleFieldEdit("batch_number")}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <AITextField
                name="lot_number" label="Lot Number"
                control={control} isAI={isAIField("lot_number")}
                confidence={getConfidence("lot_number")}
                onEdit={() => handleFieldEdit("lot_number")}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <AITextField
                name="manufacturing_date" label="Manufacturing Date" placeholder="YYYY-MM-DD"
                control={control} isAI={isAIField("manufacturing_date")}
                confidence={getConfidence("manufacturing_date")}
                onEdit={() => handleFieldEdit("manufacturing_date")}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <AITextField
                name="expiry_date" label="Expiry Date" placeholder="YYYY-MM-DD"
                control={control} isAI={isAIField("expiry_date")}
                confidence={getConfidence("expiry_date")}
                onEdit={() => handleFieldEdit("expiry_date")}
              />
            </Grid>
          </Grid>


          {/* Section: Complaint */}
          <SectionHeader title="Complaint Details" />
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={4}>
              <AISelectField
                name="complaint_category" label="Complaint Category *"
                options={CATEGORIES} control={control}
                rules={{ required: "Category is required" }}
                error={errors.complaint_category}
                isAI={isAIField("complaint_category")}
                confidence={getConfidence("complaint_category")}
                onEdit={() => handleFieldEdit("complaint_category")}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <AISelectField
                name="severity" label="Severity *"
                options={LEVELS} control={control}
                rules={{ required: "Severity is required" }}
                error={errors.severity}
                isAI={isAIField("severity")}
                confidence={getConfidence("severity")}
                onEdit={() => handleFieldEdit("severity")}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <AISelectField
                name="risk_level" label="Risk Level"
                options={LEVELS} control={control}
                isAI={isAIField("risk_level")}
                confidence={getConfidence("risk_level")}
                onEdit={() => handleFieldEdit("risk_level")}
              />
            </Grid>
            <Grid item xs={12}>
              <AITextField
                name="complaint_description" label="Complaint Description *"
                control={control} multiline minRows={4}
                rules={{ required: "Description is required", minLength: { value: 20, message: "At least 20 characters" } }}
                error={errors.complaint_description}
                isAI={isAIField("complaint_description")}
                confidence={getConfidence("complaint_description")}
                onEdit={() => handleFieldEdit("complaint_description")}
              />
            </Grid>
          </Grid>

          {/* Section: Analysis */}
          <SectionHeader title="Analysis & Actions" />
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <AITextField
                name="root_cause" label="Root Cause"
                control={control} multiline minRows={3}
                isAI={isAIField("root_cause")}
                confidence={getConfidence("root_cause")}
                onEdit={() => handleFieldEdit("root_cause")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AITextField
                name="capa" label="CAPA (Corrective & Preventive Actions)"
                control={control} multiline minRows={3}
                isAI={isAIField("capa")}
                confidence={getConfidence("capa")}
                onEdit={() => handleFieldEdit("capa")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AITextField
                name="summary" label="Summary"
                control={control} multiline minRows={3}
                isAI={isAIField("summary")}
                confidence={getConfidence("summary")}
                onEdit={() => handleFieldEdit("summary")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AITextField
                name="next_action" label="Next Action"
                control={control} multiline minRows={3}
                isAI={isAIField("next_action")}
                confidence={getConfidence("next_action")}
                onEdit={() => handleFieldEdit("next_action")}
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          <Box display="flex" gap={2} justifyContent="flex-end">
            {isEdit ? (
              <Button variant="outlined" onClick={() => navigate(`/complaints/${id}`)} disabled={submitting}>
                Cancel
              </Button>
            ) : (
              <Button variant="outlined" onClick={() => { reset(defaultValues); dispatch(clearAIFilledFields()); }} disabled={!isDirty || submitting}>
                Reset
              </Button>
            )}
            <Button
              type="submit" variant="contained" size="large"
              disabled={submitting || copilotLoading}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            >
              {isEdit ? (submitting ? "Saving…" : "Save Changes") : (submitting ? "Submitting…" : "Submit Complaint")}
            </Button>
          </Box>
        </Box>
      </Box>
    </AppLayout>
  );
}

// ─── Shared AI-aware field components ────────────────────────────────────────

interface AIFieldBase {
  isAI: boolean;
  confidence: number | null;
  onEdit: () => void;
}

function AIBadge({ confidence }: { confidence: number | null }) {
  return (
    <Tooltip
      title={confidence != null ? `AI confidence: ${Math.round(confidence * 100)}%` : "AI-generated value"}
      arrow
    >
      <Box
        component="span"
        sx={{
          display: "inline-flex", alignItems: "center", gap: 0.4,
          px: 0.75, py: 0.2, borderRadius: 1,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
          color: "primary.main", fontSize: "0.65rem", fontWeight: 700,
          letterSpacing: "0.04em", cursor: "default", userSelect: "none",
          lineHeight: 1,
        }}
      >
        <AutoFixHighIcon sx={{ fontSize: 10 }} />
        AI{confidence != null ? ` ${Math.round(confidence * 100)}%` : ""}
      </Box>
    </Tooltip>
  );
}

function aiFieldSx(isAI: boolean): import("@mui/material").SxProps<any> {
  return isAI
    ? {
        "& .MuiOutlinedInput-root fieldset": {
          borderColor: "#2563EB !important",
          borderWidth: "1.5px !important",
        },
        "& .MuiOutlinedInput-root": {
          bgcolor: (t: any) => alpha(t.palette.primary.main, 0.03),
        },
      }
    : {};
}

interface AITextFieldProps extends AIFieldBase {
  name: keyof FormValues;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  multiline?: boolean;
  minRows?: number;
  placeholder?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
}

function AITextField({ name, label, control, multiline, minRows, placeholder, rules, error, isAI, confidence, onEdit }: AITextFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <TextField
          {...field}
          label={
            isAI ? (
              <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                {label} <AIBadge confidence={confidence} />
              </Box>
            ) : label
          }
          fullWidth
          multiline={multiline}
          minRows={minRows}
          placeholder={placeholder}
          error={!!error}
          helperText={error?.message}
          onChange={(e) => { field.onChange(e); onEdit(); }}
          sx={aiFieldSx(isAI)}
        />
      )}
    />
  );
}

interface AISelectFieldProps extends AIFieldBase {
  name: keyof FormValues;
  label: string;
  options: { value: string; label: string }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
}

function AISelectField({ name, label, options, control, rules, error, isAI, confidence, onEdit }: AISelectFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <FormControl fullWidth error={!!error} sx={aiFieldSx(isAI)}>
          <InputLabel>
            {isAI ? (
              <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                {label} <AIBadge confidence={confidence} />
              </Box>
            ) : label}
          </InputLabel>
          <Select
            {...field}
            label={label}
            onChange={(e) => { field.onChange(e); onEdit(); }}
          >
            {options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Box mb={1.5}>
      <Typography variant="overline" color="text.secondary" fontWeight={600}>{title}</Typography>
      <Divider sx={{ mt: 0.5 }} />
    </Box>
  );
}
