// ─── Domain ───────────────────────────────────────────────────────────────────

export type ComplaintStatus = "open" | "in_progress" | "resolved" | "closed";
export type ComplaintPriority = "low" | "medium" | "high" | "critical";
export type ComplaintCategory = "billing" | "technical" | "service" | "product" | "other";

export interface Complaint {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  category: ComplaintCategory;
  assigned_agent_id: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComplaintListResponse {
  items: Complaint[];
  total: number;
  page: number;
  page_size: number;
}

export interface ComplaintCreatePayload {
  title: string;
  description: string;
  category: ComplaintCategory;
}

export interface ComplaintUpdatePayload {
  title?: string;
  description?: string;
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  category?: ComplaintCategory;
  assigned_agent_id?: string | null;
  resolution_notes?: string | null;
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string;
  complaint_id: string;
  event_type: string;
  description: string;
  created_by: string | null;
  created_at: string;
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export interface AIAnalysis {
  id: string;
  complaint_id: string;
  sentiment: string | null;
  sentiment_score: number | null;
  suggested_category: string | null;
  suggested_priority: string | null;
  summary: string | null;
  suggested_response: string | null;
  raw_output: PipelineOutput | null;
}

export interface PipelineOutput {
  complaint_id: string;
  pipeline_status: string;
  is_valid: boolean;
  is_duplicate: boolean;
  duplicate_of: string | null;
  similarity_score: number;
  validation_issues: string[];
  extraction: {
    title: string;
    description: string;
    keywords: string[];
    entities: string[];
  };
  completeness: {
    score: number;
    missing_fields: string[];
    reasoning: string;
  };
  summary: string;
  risk: {
    sentiment: string;
    sentiment_score: number;
    risk_level: string;
    suggested_category: string;
    suggested_priority: string;
  };
  root_cause_analysis: {
    root_cause: string;
    contributing_factors: string[];
  };
  capa: {
    corrective_actions: string[];
    preventive_actions: string[];
    timeline_days: number | null;
  };
  suggested_response: string;
  explanations: {
    extraction: string;
    validation: string;
    completeness: string;
    duplicate_detection: string;
    summary: string;
    risk_classification: string;
    root_cause: string;
    capa: string;
  };
  errors: string[];
}

export interface CopilotData {
  customer_name: string | null;
  product_name: string | null;
  batch_number: string | null;
  lot_number: string | null;
  manufacturing_date: string | null;
  expiry_date: string | null;
  complaint_category: string | null;
  complaint_description: string | null;
  severity: string | null;
  risk_level: string | null;
  root_cause: string | null;
  capa: string | null;
  summary: string | null;
  next_action: string | null;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadedDocument {
  id: string;
  complaint_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  file_path: string;
  uploaded_by: string;
  created_at: string;
}

// ─── Auth / User ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "agent" | "user";
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  critical: number;
  high: number;
}

// ─── Filters / Pagination ─────────────────────────────────────────────────────

export interface ComplaintFilters {
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  category?: ComplaintCategory;
  page?: number;
  page_size?: number;
}

// ─── Error ────────────────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  message: string;
  details?: { field: string; message: string }[];
}

export interface ApiErrorResponse {
  error: ApiError;
}
