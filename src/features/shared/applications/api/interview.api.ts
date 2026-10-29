import { capFetch } from "@/src/lib/api/cap";
import type {
  Application,
  InterviewForm,
  InterviewFormRecord,
  InterviewFormsList,
  InterviewObserverComment,
  InterviewPanel,
  InterviewSchedule,
} from "./types";

export interface EvaluateInterviewPayload {
  feedback: string;
  signatureAssetId: string;
  decision?: "approve" | "reject";
  outcome?: "unsuccessful" | "inconclusive";
}

export async function getInterviewPanelApi(
  id: string,
): Promise<InterviewPanel | null> {
  try {
    return await capFetch<InterviewPanel>(`/applications/${id}/interview/panel`, {
      method: "GET",
    });
  } catch (err: any) {
    if (
      err?.statusCode === 404 ||
      err?.status === 404 ||
      err?.statusCode === 403 ||
      err?.status === 403 ||
      err?.code === "auth.out_of_scope" ||
      err?.error?.code === "auth.out_of_scope" ||
      err?.error?.code?.includes("not_found") ||
      err?.error?.code?.includes("out_of_scope")
    ) {
      return null;
    }
    throw err;
  }
}

export async function getInterviewScheduleApi(
  id: string,
): Promise<InterviewSchedule | null> {
  try {
    return await capFetch<InterviewSchedule>(`/applications/${id}/interview/schedule`, {
      method: "GET",
    });
  } catch (err: any) {
    if (
      err?.statusCode === 404 ||
      err?.status === 404 ||
      err?.statusCode === 403 ||
      err?.status === 403 ||
      err?.code === "auth.out_of_scope" ||
      err?.error?.code === "auth.out_of_scope" ||
      err?.error?.code?.includes("not_found") ||
      err?.error?.code?.includes("out_of_scope")
    ) {
      return null;
    }
    throw err;
  }
}

export interface EvaluateInterviewResponse {
  message?: string;
  pendingSignatures?: Array<{
    assessorId: string;
    name?: string;
    isLead?: boolean;
  }>;
  missingLeadDecision?: boolean;
}

export async function evaluateInterviewApi(
  id: string,
): Promise<EvaluateInterviewResponse>;
export async function evaluateInterviewApi(
  id: string,
  payload: EvaluateInterviewPayload,
): Promise<EvaluateInterviewResponse>;
export async function evaluateInterviewApi(
  id: string,
  payload?: EvaluateInterviewPayload,
): Promise<EvaluateInterviewResponse> {
  return await capFetch<EvaluateInterviewResponse>(`/applications/${id}/interview/evaluate`, {
    method: "POST",
    data: payload,
  });
}

export async function getInterviewFormsBundleApi(
  id: string,
): Promise<InterviewFormsList> {
  try {
    const res = await capFetch<
      | InterviewFormsList
      | InterviewForm[]
      | { data: InterviewFormsList | InterviewForm[] }
    >(`/applications/${id}/interview/forms`, { method: "GET" });

    if (Array.isArray(res)) {
      return { forms: res, panelistRecords: [] };
    }
    const unwrapped =
      res && typeof res === "object" && "data" in res && !("forms" in res)
        ? (res as any).data
        : res;

    if (Array.isArray(unwrapped)) {
      return { forms: unwrapped, panelistRecords: [] };
    }

    return {
      forms: Array.isArray((unwrapped as any)?.forms)
        ? (unwrapped as any).forms
        : [],
      panelistRecords: Array.isArray((unwrapped as any)?.panelistRecords)
        ? (unwrapped as any).panelistRecords
        : [],
    };
  } catch (err: any) {
    if (
      err?.statusCode === 404 ||
      err?.status === 404 ||
      err?.statusCode === 403 ||
      err?.status === 403 ||
      err?.code === "auth.out_of_scope" ||
      err?.error?.code === "auth.out_of_scope" ||
      err?.error?.code?.includes("not_found") ||
      err?.error?.code?.includes("out_of_scope")
    ) {
      return { forms: [], panelistRecords: [] };
    }
    throw err;
  }
}

export async function getInterviewFormsApi(
  id: string,
): Promise<InterviewForm[]> {
  const bundle = await getInterviewFormsBundleApi(id);
  return bundle.forms;
}

export async function updateInterviewFormApi(
  id: string,
  formType:
    | "records"
    | "assessment_grid"
    | "practical_observation"
    | "skill_demonstration",
  payload: { data: Record<string, unknown> },
): Promise<InterviewForm | InterviewFormRecord> {
  return capFetch<InterviewForm | InterviewFormRecord>(
    `/applications/${id}/interview/forms/${formType}`,
    { method: "PUT", data: payload },
  );
}

export async function signoffInterviewFormApi(
  id: string,
  formType:
    | "records"
    | "assessment_grid"
    | "practical_observation"
    | "skill_demonstration",
  payload: {
    signatureMode: "upload" | "default" | "typed";
    signatureAssetId?: string;
    typedName?: string;
  },
): Promise<InterviewForm> {
  return capFetch<InterviewForm>(
    `/applications/${id}/interview/forms/${formType}/signoff`,
    { method: "POST", data: payload },
  );
}

export async function getInterviewObserverCommentsApi(
  id: string,
): Promise<InterviewObserverComment[]> {
  try {
    const res = await capFetch<InterviewObserverComment[] | { data: InterviewObserverComment[] }>(
      `/applications/${id}/interview/observer-comments`,
      { method: "GET" },
    );
    return Array.isArray(res) ? res : (res as any)?.data || [];
  } catch (err: any) {
    if (
      err?.statusCode === 404 ||
      err?.status === 404 ||
      err?.error?.code?.includes("not_found")
    ) {
      return [];
    }
    throw err;
  }
}

export async function postInterviewObserverCommentApi(
  id: string,
  content: string,
): Promise<InterviewObserverComment> {
  return capFetch<InterviewObserverComment>(
    `/applications/${id}/interview/observer-comments`,
    { method: "POST", data: { content } },
  );
}

export async function assignFacilitatorApi(
  id: string,
  assessorId: string,
): Promise<Application> {
  return capFetch<Application>(`/applications/${id}/facilitator`, {
    method: "POST",
    data: { assessorId },
  });
}

export async function curateInterviewPanelApi(
  id: string,
  payload: {
    assessorIds: string[];
    leadAssessorId: string;
    observerIvAssessorId?: string;
  },
): Promise<InterviewPanel> {
  return capFetch<InterviewPanel>(`/applications/${id}/interview/panel`, {
    method: "POST",
    data: payload,
  });
}

export async function scheduleInterviewApi(
  id: string,
  payload: {
    scheduledAt: string;
    mode: "physical" | "online";
    location?: string;
    useCentreAddress?: boolean;
    link?: string;
  },
): Promise<InterviewSchedule> {
  return capFetch<InterviewSchedule>(`/applications/${id}/interview/schedule`, {
    method: "POST",
    data: payload,
  });
}
