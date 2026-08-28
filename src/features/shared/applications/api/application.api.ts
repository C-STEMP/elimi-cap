import { capFetch } from "@/src/lib/api/cap";
import type {
  PersonalDetails,
  ContactInformation,
  ResidentialAddress,
} from "@/src/features/shared/account/api";

export type ApplicationType = "RPL" | "NSQ";

export type ApplicationStatus =
  | "draft"
  | "in_progress"
  | "certified"
  | "rejected"
  | "withdrawn";

export interface ApplicationCandidateRef {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
}

export interface ApplicationNamedRef {
  id: string;
  name: string;
  slug?: string;
}

export interface Application {
  id: string;
  candidateId: string;
  centreId: string;
  awardingBodyId?: string | null;
  type: ApplicationType;
  status: ApplicationStatus;
  currentStageKey: string;
  createdAt: string;
  updatedAt?: string;
  submittedAt?: string | null;
  sectorId?: string | null;
  tradeId?: string | null;
  candidate?: ApplicationCandidateRef;
  centre?: ApplicationNamedRef;
  sector?: ApplicationNamedRef | null;
  trade?: ApplicationNamedRef | null;
}

export interface CreateApplicationPayload {
  type: ApplicationType;
  sectorId: string;
  tradeId: string;
  unitIds: string[];
  centreId: string;
}

export interface ApplicationEvent {
  id: string;
  applicationId: string;
  stageKey: string;
  actorPersona: string;
  actorUserId?: string;
  action: string;
  fromStatus?: string;
  toStatus?: string;
  comment?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ApplicationStage {
  stageKey: string;
  label: string;
  status:
    | "not_started"
    | "awaiting_payment"
    | "in_progress"
    | "under_review"
    | "scheduled"
    | "successful"
    | "rejected";
  enteredAt?: string | null;
  deadline?: string | null;
  amountMinorUnits?: string;
  currency?: string;
  receipt?: {
    assetId: string;
    url?: string | null;
  } | null;
}

export interface CurrentOccupationHistory {
  company: string;
  jobTitle: string;
  employmentType: string;
  startDate: string;
  endDate?: string;
  keyResponsibilities: string;
}

export interface CurrentOccupation {
  occupation: string;
  yearsOfExperience: number;
  employmentHistory: CurrentOccupationHistory[];
}

export interface EvidenceCandidateCanProvide {
  resume?: boolean;
  workSamples?: boolean;
  employmentLetter?: boolean;
  certificates?: boolean;
  statementsOfAttainment?: boolean;
  thirdPartyReportsOrReferences?: boolean;
  jobDescriptions?: boolean;
  photosOrVideosOfWork?: boolean;
  other?: boolean;
}

export interface AssessmentDeclaration {
  infoProvidedIsAccurate?: boolean;
  understandsDoesNotGuaranteeCertification?: boolean;
  understandsThatNeedsToProvideSufficientEvidenceToDemonstrateCompetence?: boolean;
  agreesToTermsAndPrivacyPolicy?: boolean;
}

export interface ApplicationDetail extends Application {
  unitIds?: string[];
  identityVerified?: boolean;
  identityFieldsLocked?: boolean;
  reasonForSeekingRPL?: string | null;
  evidenceCandidateCanProvide?: EvidenceCandidateCanProvide | null;
  assessmentDeclaration?: AssessmentDeclaration | null;
  personalInformation?: {
    personalDetails?: PersonalDetails;
    contactInformation?: ContactInformation;
    residentialAddress?: ResidentialAddress;
  };
  currentOccupation?: CurrentOccupation | null;
  frozenProfile?: Record<string, unknown> | null;
  internalVerifier?: {
    assessorId: string;
    name: string;
    qualifications: string[];
    assignedAt: string;
  } | null;
}

export interface ApplicationVersion {
  versionNo: number;
  data: Record<string, unknown>;
  submittedBy: string;
  feedback?: string | null;
  createdAt: string;
}

export interface ReviewDecisionPayload {
  decision: "approve" | "reject";
  stageKey?: string;
  feedback?: string;
}

export interface PaymentInitiationResponse {
  paymentId: string;
  checkoutUrl: string;
}

export interface PaymentReceipt {
  status: "pending" | "completed" | "failed";
  paymentId: string;
  amount: { amountMinorUnits: string; currency: string };
  currency: string;
  applicationType: ApplicationType;
  candidateName: string;
  assetId?: string | null;
  url?: string | null;
  paidAt?: string | null;
  provider?: string;
}

export interface PaymentQuote {
  amountMinorUnits: string;
  currency: string;
  source: "centre" | "platform_floor";
}

export interface ApplicationProgress {
  personalInformation: number;
  experienceAndTrade: number;
  verifyIdentity: number;
  reviewAndSubmit: number;
}

export interface EvidenceVaultItem {
  id: string;
  kind: "self_assessment" | "third_party_report" | "general";
  documentName?: string;
  evidenceType?: string;
  status?: string;
  createdAt: string;
}

export interface GeneralEvidence {
  id: string;
  applicationId: string;
  documentName: string;
  evidenceType: string;
  assetId?: string | null;
  formData?: Record<string, unknown> | null;
  textValue?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ThirdPartyReportEvidence {
  applicationId: string;
  assetId?: string | null;
  submittedAt?: string | null;
}

export interface InterviewPanelMember {
  assessorId: string;
  isLead: boolean;
  isObserver: boolean;
  name?: string;
  sectors?: Array<{ id: string; name: string }>;
}

export interface InterviewPanel {
  id: string;
  applicationId: string;
  members: InterviewPanelMember[];
}

export interface InterviewSchedule {
  scheduledAt: string;
  status: "scheduled" | "completed" | "cancelled";
  mode?: "physical" | "online";
  location?: string;
  link?: string;
  useCentreAddress?: boolean;
}

export interface InterviewForm {
  id: string;
  formType: "records" | "assessment_grid" | "practical_observation";
  data: Record<string, unknown>;
  status: "draft" | "completed";
  populatedBy?: string;
  candidateSignatureAssetId?: string | null;
  candidateSignedAt?: string | null;
  signatureMode?: "upload" | "default" | "typed" | null;
  typedSignatureName?: string | null;
}

export interface InterviewObserverComment {
  id: string;
  panelId: string;
  panelMemberId: string;
  content: string;
  createdAt: string;
}

export interface Appeal {
  id: string;
  applicationId: string;
  stageKey: string;
  status: "open" | "resolved_reopened" | "resolved_dismissed";
  comment: string;
  createdAt: string;
}

export interface RecommendationsResponse {
  applicationId: string;
  closeReason: "GAP_TRAINING";
  gapTrainingPending: boolean;
  closed: boolean;
  aiProvider: string;
  lmsMode: string;
  courses: Array<{
    id: string;
    title: string;
    description: string;
    rank: number;
    explanation?: string;
    tradeId?: string;
    sectorId?: string;
    url?: string;
  }>;
}

export async function createApplicationApi(
  payload: CreateApplicationPayload,
): Promise<Application> {
  return capFetch<Application>("/applications", {
    method: "POST",
    data: payload,
  });
}

export async function getApplicationsApi(params?: {
  status?: ApplicationStatus;
  type?: ApplicationType;
  q?: string;
  tradeId?: string;
  stage?: string;
  sort?: string;
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}): Promise<Application[]> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.type) query.append("type", params.type);
  if (params?.q) query.append("q", params.q);
  if (params?.tradeId) query.append("tradeId", params.tradeId);
  if (params?.stage) query.append("stage", params.stage);
  if (params?.sort) query.append("sort", params.sort);
  if (params?.order) query.append("order", params.order);
  if (params?.cursor) query.append("cursor", params.cursor);
  if (params?.limit) query.append("limit", params.limit.toString());

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return capFetch<Application[]>(`/applications${queryString}`, {
    method: "GET",
  });
}

export async function getApplicationByIdApi(id: string): Promise<Application> {
  return capFetch<Application>(`/applications/${id}`, {
    method: "GET",
  });
}

export async function patchApplicationDraftApi(
  id: string,
  payload: Record<string, unknown>,
): Promise<Application> {
  return capFetch<Application>(`/applications/${id}`, {
    method: "PATCH",
    data: payload,
  });
}

export async function getApplicationProgressApi(
  id: string,
): Promise<ApplicationProgress> {
  return capFetch<ApplicationProgress>(`/applications/${id}/progress`, {
    method: "GET",
  });
}

export async function submitApplicationApi(id: string): Promise<Application> {
  return capFetch<Application>(`/applications/${id}/submit`, {
    method: "POST",
  });
}

export async function getApplicationHistoryApi(
  id: string,
): Promise<ApplicationVersion[]> {
  return capFetch<ApplicationVersion[]>(`/applications/${id}/history`, {
    method: "GET",
  });
}

export async function getApplicationStagesApi(
  id: string,
): Promise<ApplicationStage[]> {
  return capFetch<ApplicationStage[]>(`/applications/${id}/stages`, {
    method: "GET",
  });
}

export async function getPaymentQuoteApi(id: string): Promise<PaymentQuote> {
  return capFetch<PaymentQuote>(`/applications/${id}/payment-quote`, {
    method: "GET",
  });
}

export async function reviewApplicationApi(
  id: string,
  payload: ReviewDecisionPayload,
): Promise<Application> {
  return capFetch<Application>(`/applications/${id}/review`, {
    method: "POST",
    data: payload,
  });
}

export async function initiateApplicationPaymentApi(
  id: string,
): Promise<PaymentInitiationResponse> {
  return capFetch<PaymentInitiationResponse>(`/applications/${id}/pay`, {
    method: "POST",
  });
}

export async function getApplicationReceiptApi(
  id: string,
): Promise<PaymentReceipt> {
  return capFetch<PaymentReceipt>(`/applications/${id}/receipt`, {
    method: "GET",
  });
}

export async function getEvidenceVaultApi(
  id: string,
  params?: { cursor?: string; limit?: number },
): Promise<EvidenceVaultItem[]> {
  const query = new URLSearchParams();
  if (params?.cursor) query.append("cursor", params.cursor);
  if (params?.limit) query.append("limit", params.limit.toString());
  const queryString = query.toString() ? `?${query.toString()}` : "";
  return capFetch<EvidenceVaultItem[]>(`/applications/${id}/evidence${queryString}`, {
    method: "GET",
  });
}

export async function createGeneralEvidenceApi(
  id: string,
  payload: {
    documentName: string;
    evidenceType: string;
    assetId?: string;
    formData?: Record<string, unknown>;
    textValue?: string;
  },
): Promise<GeneralEvidence> {
  return capFetch<GeneralEvidence>(`/applications/${id}/evidence`, {
    method: "POST",
    data: payload,
  });
}

export async function getGeneralEvidenceByIdApi(
  id: string,
  evidenceId: string,
): Promise<GeneralEvidence> {
  return capFetch<GeneralEvidence>(
    `/applications/${id}/evidence/${evidenceId}`,
    {
      method: "GET",
    },
  );
}

export async function deleteGeneralEvidenceApi(
  id: string,
  evidenceId: string,
): Promise<void> {
  await capFetch<void>(`/applications/${id}/evidence/${evidenceId}`, {
    method: "DELETE",
  });
}

export async function getThirdPartyReportApi(
  id: string,
): Promise<ThirdPartyReportEvidence> {
  return capFetch<ThirdPartyReportEvidence>(
    `/applications/${id}/evidence/third-party-report`,
    {
      method: "GET",
    },
  );
}

export async function uploadThirdPartyReportApi(
  id: string,
  assetId: string,
): Promise<ThirdPartyReportEvidence> {
  return capFetch<ThirdPartyReportEvidence>(
    `/applications/${id}/evidence/third-party-report`,
    {
      method: "POST",
      data: { assetId },
    },
  );
}

export async function getInterviewPanelApi(
  id: string,
): Promise<InterviewPanel> {
  return capFetch<InterviewPanel>(`/applications/${id}/interview/panel`, {
    method: "GET",
  });
}

export async function getInterviewScheduleApi(
  id: string,
): Promise<InterviewSchedule> {
  return capFetch<InterviewSchedule>(`/applications/${id}/interview/schedule`, {
    method: "GET",
  });
}

export interface EvaluateInterviewPayload {
  feedback: string;
  signatureAssetId: string;
  decision?: "approve" | "reject";
  outcome?: "unsuccessful" | "inconclusive";
}

export async function evaluateInterviewApi(
  id: string,
  payload: EvaluateInterviewPayload,
): Promise<void> {
  await capFetch<void>(`/applications/${id}/interview/evaluate`, {
    method: "POST",
    data: payload,
  });
}

export async function getInterviewFormsApi(
  id: string,
): Promise<InterviewForm[]> {
  const res = await capFetch<InterviewForm[] | { data: InterviewForm[] }>(
    `/applications/${id}/interview/forms`,
    {
      method: "GET",
    },
  );
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

export async function updateInterviewFormApi(
  id: string,
  formType: "records" | "assessment_grid" | "practical_observation",
  payload: { data: Record<string, unknown> },
): Promise<InterviewForm> {
  return capFetch<InterviewForm>(
    `/applications/${id}/interview/forms/${formType}`,
    {
      method: "PUT",
      data: payload,
    },
  );
}

export async function signoffInterviewFormApi(
  id: string,
  formType: "records" | "assessment_grid" | "practical_observation",
  payload: {
    signatureMode: "upload" | "default" | "typed";
    signatureAssetId?: string;
    typedName?: string;
  },
): Promise<InterviewForm> {
  return capFetch<InterviewForm>(
    `/applications/${id}/interview/forms/${formType}/signoff`,
    {
      method: "POST",
      data: payload,
    },
  );
}

export async function getInterviewObserverCommentsApi(
  id: string,
): Promise<InterviewObserverComment[]> {
  const res = await capFetch<
    InterviewObserverComment[] | { data: InterviewObserverComment[] }
  >(`/applications/${id}/interview/observer-comments`, {
    method: "GET",
  });
  return Array.isArray(res) ? res : (res as any)?.data || [];
}

export async function postInterviewObserverCommentApi(
  id: string,
  content: string,
): Promise<InterviewObserverComment> {
  return capFetch<InterviewObserverComment>(
    `/applications/${id}/interview/observer-comments`,
    {
      method: "POST",
      data: { content },
    },
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

export async function assignIvApi(
  id: string,
  assessorId: string,
): Promise<Application> {
  return capFetch<Application>(`/applications/${id}/iv`, {
    method: "POST",
    data: { assessorId },
  });
}

export async function reviewIvApi(
  id: string,
  payload: { decision: "approve" | "reject"; feedback?: string; stageKey?: string },
): Promise<Application> {
  return capFetch<Application>(`/applications/${id}/iv/review`, {
    method: "POST",
    data: payload,
  });
}

export async function assignEvApi(
  id: string,
  assessorId: string,
): Promise<Application> {
  return capFetch<Application>(`/applications/${id}/ev`, {
    method: "POST",
    data: { assessorId },
  });
}

export async function reviewEvApi(
  id: string,
  payload: { decision: "approve" | "reject"; feedback?: string; stageKey?: string },
): Promise<Application> {
  return capFetch<Application>(`/applications/${id}/ev/review`, {
    method: "POST",
    data: payload,
  });
}

export async function forwardToAwardingBodyApi(
  id: string,
): Promise<Application> {
  return capFetch<Application>(`/applications/${id}/forward-to-awarding-body`, {
    method: "POST",
  });
}

export async function createAppealApi(
  id: string,
  comment: string,
): Promise<Appeal> {
  return capFetch<Appeal>(`/applications/${id}/appeal`, {
    method: "POST",
    data: { comment },
  });
}

export async function resolveAppealApi(
  id: string,
  appealId: string,
  payload: { decision: "reopen" | "dismiss"; comment?: string },
): Promise<void> {
  await capFetch<void>(`/applications/${id}/appeal/${appealId}/resolve`, {
    method: "POST",
    data: payload,
  });
}

export async function getRecommendationsApi(
  id: string,
): Promise<RecommendationsResponse> {
  return capFetch<RecommendationsResponse>(
    `/applications/${id}/recommendations`,
    {
      method: "GET",
    },
  );
}

export async function closeRecommendationsApi(
  id: string,
): Promise<Record<string, unknown>> {
  return capFetch<Record<string, unknown>>(
    `/applications/${id}/recommendations/close`,
    {
      method: "POST",
    },
  );
}

export interface SelfAssessment {
  applicationId: string;
  personalInformation?: Record<string, unknown>;
  frozenPersonalInformation?: Record<string, unknown>;
  competencies?: Array<Record<string, unknown>>;
  reflection?: Record<string, unknown>;
  declaration?: Record<string, unknown>;
  submittedAt?: string | null;
}

export interface SaveSelfAssessmentPayload {
  competencies?: Array<Record<string, unknown>>;
  reflection?: Record<string, unknown>;
  declaration?: Record<string, unknown>;
  submit?: boolean;
}

export async function getSelfAssessmentApi(
  applicationId: string,
): Promise<SelfAssessment> {
  return capFetch<SelfAssessment>(
    `/applications/${applicationId}/evidence/self-assessment`,
    {
      method: "GET",
    },
  );
}

export async function saveSelfAssessmentApi(
  applicationId: string,
  payload: SaveSelfAssessmentPayload,
): Promise<SelfAssessment> {
  return capFetch<SelfAssessment>(
    `/applications/${applicationId}/evidence/self-assessment`,
    {
      method: "PUT",
      data: payload,
    },
  );
}

// ==========================================
// NSQ-Specific Endpoints (OpenAPI Spec)
// ==========================================

export interface InductionForm {
  applicationId: string;
  data: Record<string, unknown>;
  submittedAt?: string | null;
}

export async function submitInductionFormApi(
  applicationId: string,
  data: Record<string, unknown>,
): Promise<InductionForm> {
  return capFetch<InductionForm>(`/applications/${applicationId}/induction-form`, {
    method: "POST",
    data: { data },
  });
}

export interface DirectObservationSession {
  id: string;
  applicationId: string;
  scheduledAt: string;
  status: "scheduled" | "completed" | "cancelled";
}

export async function scheduleDirectObservationApi(
  applicationId: string,
  scheduledAt: string,
): Promise<DirectObservationSession> {
  return capFetch<DirectObservationSession>(
    `/applications/${applicationId}/direct-observation`,
    {
      method: "POST",
      data: { scheduledAt },
    },
  );
}

export interface PostUnitEvidencePayload {
  performanceCriteriaCode: string;
  evidenceType: string;
  evidenceAssetId: string;
  evidenceRefPage?: string;
}

export async function submitUnitEvidenceApi(
  applicationId: string,
  unitId: string,
  payload: PostUnitEvidencePayload,
): Promise<{ message?: string }> {
  return capFetch<{ message?: string }>(
    `/applications/${applicationId}/units/${unitId}/evidence`,
    {
      method: "POST",
      data: payload,
    },
  );
}

export interface PostUnitSignoffPayload {
  role: "learner" | "unit_assessor" | "iqa" | "eqa";
  signatureAssetId?: string;
  signedAt: string;
}

export async function submitUnitSignoffApi(
  applicationId: string,
  unitId: string,
  payload: PostUnitSignoffPayload,
): Promise<{ message?: string }> {
  return capFetch<{ message?: string }>(
    `/applications/${applicationId}/units/${unitId}/signoff`,
    {
      method: "POST",
      data: payload,
    },
  );
}

export async function assignUnitAssessorApi(
  applicationId: string,
  unitId: string,
  assessorId: string,
): Promise<{ message?: string }> {
  return capFetch<{ message?: string }>(
    `/applications/${applicationId}/units/${unitId}/assessor`,
    {
      method: "POST",
      data: { assessorId },
    },
  );
}

