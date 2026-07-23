import { baseApi } from "@/app/baseApi";
import type { AIAnalysis, PipelineOutput, CopilotData } from "@/shared/types";

export const aiApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    // ── Fetch persisted AI analysis for a complaint ────────────────────
    getAIAnalysis: build.query<AIAnalysis, string>({
      query: (complaintId) => `/complaints/${complaintId}/ai-analysis`,
      providesTags: (_r, _e, id) => [{ type: "AIAnalysis", id }],
    }),

    // ── Run full LangGraph pipeline ────────────────────────────────────
    runPipeline: build.mutation<PipelineOutput, {
      complaint_id: string;
      title: string;
      description: string;
      category?: string;
      existing_complaints?: string[];
    }>({
      query: (body) => ({ url: "/ai/pipeline", method: "POST", body }),
      invalidatesTags: (_r, _e, { complaint_id }) => [
        { type: "AIAnalysis", id: complaint_id },
      ],
    }),

    // ── Copilot: extract from raw text ────────────────────────────────
    copilotFromText: build.mutation<CopilotData, string>({
      query: (text) => {
        const form = new FormData();
        form.append("text", text);
        return { url: "/ai/copilot/text", method: "POST", body: form };
      },
    }),

    // ── Copilot: extract from uploaded file ───────────────────────────
    copilotFromFile: build.mutation<CopilotData, File>({
      query: (file) => {
        const form = new FormData();
        form.append("file", file);
        return { url: "/ai/copilot/upload", method: "POST", body: form };
      },
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetAIAnalysisQuery,
  useRunPipelineMutation,
  useCopilotFromTextMutation,
  useCopilotFromFileMutation,
} = aiApi;
