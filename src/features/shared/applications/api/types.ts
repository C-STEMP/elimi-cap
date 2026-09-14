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
  photoAssetId?: string | null;
  photo?: {
    assetId?: string;
    url?: string | null;
  } | null;
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
  mustProvideSufficientEvidence?: boolean;
  agreesToTermsAndPrivacyPolicy?: boolean;
}

export interface NsqScopeUnit {
  id: string;
  referenceNumber: string;
  title: string;
  isMandatory: boolean;
  qualificationLevelId: string;
  qualificationLevel: number;
  wished: boolean;
  criteriaTotal: number;
  criteriaPending: number;
  criteriaRejected: number;
  criteriaApproved: number;
  status: "not_started" | "in_progress" | "approved";
}

export interface NsqScope {
  wishedQualificationLevel?: { id: string; level: number } | null;
  wishedUnitIds: string[];
  units: NsqScopeUnit[];
  directObservationSessions?: unknown[];
}

export interface IqamFormSummaryItem {
  key:
    | "sampling_plan"
    | "sampling_record"
    | "iv_report"
    | "assessor_outcomes"
    | "final_portfolio";
  status: string;
  submittedAt?: string | null;
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
  facilitator?: {
    assessorId?: string;
    id?: string;
    name: string;
    avatar?: string;
    photoAssetId?: string | null;
    photo?: {
      assetId?: string;
      url?: string | null;
    } | null;
    role?: string;
    tags?: string[];
    trade?: string;
    assignedAt?: string;
  } | null;
  nsq?: NsqScope | null;
  iqamForms?: IqamFormSummaryItem[] | null;
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
  name?: string;
  title?: string;
  category?: string;
  feedback?: string;
  reviewComment?: string;
  size?: string;
  assetId?: string;
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
  formType:
    | "records"
    | "assessment_grid"
    | "practical_observation"
    | "skill_demonstration";
  data: Record<string, unknown>;
  status: "draft" | "completed";
  populatedBy?: string;
  candidateSignatureAssetId?: string | null;
  candidateSignedAt?: string | null;
  assessorSignedAt?: string | null;
  signatureMode?: "upload" | "default" | "typed" | null;
  typedSignatureName?: string | null;
}

export interface ApplicationShareToken {
  token: string;
  applicationId: string;
  createdAt: string;
}

export interface ApplicationDossier {
  application: Application;
  stages: ApplicationStage[];
  stageHistory: Array<Record<string, unknown>>;
  appeals: Appeal[];
  interview?: Record<string, unknown> | null;
  evidence?: Record<string, unknown> | null;
  assessors: Array<Record<string, unknown>>;
  nsq?: Record<string, unknown> | null;
}

export interface CentreBulkCertifyResult {
  updated: string[];
  skipped: string[];
  failed: Array<{ id: string; code: string; message: string }>;
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

export interface InductionFormOptionUnit {
  id: string;
  referenceNumber: string;
  title: string;
  isMandatory: boolean;
  qualificationLevelId: string;
}

export interface InductionFormOptionLevel {
  id: string;
  level: number;
  slug?: string;
  purpose?: string;
}

export interface InductionFormOptions {
  qualificationLevels: InductionFormOptionLevel[];
  units: InductionFormOptionUnit[];
}

export interface InductionFormData {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  registrationNo?: string;
  qualificationLevelId?: string;
  assessmentType?: string;
  courseStartDate?: string;
  unitIds?: string[];
  relevantQualification?: string;
  hasImpairment?: boolean;
  impairment?: string;
  learningStrengths?: string[];
  learningWeaknesses?: string[];
  passportAssetId?: string;
  signatureAssetId?: string;
  [key: string]: unknown;
}

export interface InductionForm {
  applicationId: string;
  data: InductionFormData;
  submittedAt?: string | null;
  trade?: { id: string; name: string };
  qualificationLevel?: InductionFormOptionLevel | null;
  units?: InductionFormOptionUnit[];
  passport?: { assetId?: string; url?: string | null } | null;
  signature?: { assetId?: string; url?: string | null } | null;
  options?: InductionFormOptions;
}

export interface InductionFormWritePayload {
  submit?: boolean;
  data?: InductionFormData;
  tradeId?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  registrationNo?: string;
  qualificationLevelId?: string;
  assessmentType?: string;
  courseStartDate?: string;
  unitIds?: string[];
  relevantQualification?: string;
  hasImpairment?: boolean;
  impairment?: string;
  learningStrengths?: string[];
  learningWeaknesses?: string[];
  passportAssetId?: string;
  signatureAssetId?: string;
}

export interface NsqEvidenceThreadItem {
  id: string;
  performanceCriteriaCode: string;
  evidenceType: string;
  evidenceAssetId: string;
  evidenceRefPage?: string | null;
  // Per the CAP API contract, the QAA decision on this row lives in
  // `reviewStatus` (there is no plain `status` field on evidence rows —
  // that name belongs to NsqCriterion, one level up).
  reviewStatus: "pending" | "approved" | "rejected";
  reviewComment?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  iqaReviewStatus?: "pending" | "approved" | "rejected";
  iqaReviewComment?: string | null;
  iqaReviewedBy?: string | null;
  iqaReviewedAt?: string | null;
  createdAt: string;
}

export interface NsqCriterion {
  code: string;
  text?: string | null;
  learningObjectiveCode?: string | null;
  learningObjectiveText?: string | null;
  unmatched: boolean;
  status: "none" | "pending" | "rejected" | "approved";
  pendingCount: number;
  latest?: NsqEvidenceThreadItem | null;
  history: NsqEvidenceThreadItem[];
}

export interface NsqUnitCriteria {
  applicationId: string;
  unitId: string;
  referenceNumber: string;
  title: string;
  criteria: NsqCriterion[];
}

export interface ReviewUnitEvidencePayload {
  decision: "approve" | "reject";
  comment?: string;
}

export interface DirectObservationRow {
  unitId: string;
  performanceCriteriaCode: string;
  comment?: string;
  met: boolean;
}

export interface DirectObservationFormPayload {
  status: "draft" | "submitted";
  submittedAt?: string | null;
  rows: DirectObservationRow[];
}

export interface DirectObservationSignature {
  signedBy: string;
  signedAt: string;
  signatureMode: "upload" | "default" | "typed";
  signatureAssetId?: string | null;
  typedName?: string | null;
}

export interface DirectObservationCatalogueCriterion {
  code: string;
  text: string;
  learningObjectiveCode?: string | null;
  learningObjectiveText?: string | null;
}

export interface DirectObservationCatalogueUnit {
  unitId: string;
  referenceNumber: string;
  title: string;
  criteria: DirectObservationCatalogueCriterion[];
}

export interface DirectObservationSession {
  id: string;
  applicationId: string;
  assessorId?: string;
  requestedBy?: string;
  scheduledAt: string;
  address?: string;
  unitIds?: string[];
  requirements?: string[];
  status:
    | "requested"
    | "rejected"
    | "accepted"
    | "completed"
    | "cancelled"
    | "pending"
    | "scheduled";
  reviewComment?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  physicalStatus?: string;
  oralStatus?: string;
  physicalForm?: DirectObservationFormPayload | null;
  oralForm?: DirectObservationFormPayload | null;
  assessorSignature?: DirectObservationSignature | null;
  learnerSignature?: DirectObservationSignature | null;
  catalogue?: DirectObservationCatalogueUnit[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DirectObservationSessionList {
  items: DirectObservationSession[];
}

export interface ScheduleObservationPayload {
  unitIds: string[];
  scheduledAt: string;
  address: string;
}

export interface ReviewObservationPayload {
  decision: "accept" | "reject";
  requirements?: string[];
  comment?: string;
}

export interface SaveObservationFormPayload {
  formKind: "physical" | "oral";
  submit?: boolean;
  rows: DirectObservationRow[];
}

export interface SignObservationPayload {
  role: "unit_assessor" | "learner" | "iqa";
  signatureMode: "upload" | "default" | "typed";
  signatureAssetId?: string;
  typedName?: string;
  signedAt: string;
}

export interface PostUnitEvidencePayload {
  performanceCriteriaCode: string;
  evidenceType: string;
  evidenceAssetId: string;
  evidenceRefPage?: string;
}

export interface PostUnitSignoffPayload {
  role: "learner" | "unit_assessor" | "iqa" | "eqa";
  signatureAssetId?: string;
  signedAt: string;
}

export interface CentreIqamSamplingPlan {
  applicationId: string;
  candidateName?: string;
  tradeName?: string;
  levelName?: string;
  termType?: string;
  plannedDate?: string;
  units?: Array<{
    id: string;
    referenceNumber: string;
    title: string;
    sampled?: boolean;
  }>;
  assessor?: { id: string; name: string } | null;
  verifier?: { id: string; name: string } | null;
  status?: string;
  [key: string]: unknown;
}

export interface CentreIqamSamplingRecord {
  applicationId: string;
  candidateName?: string;
  auditStatus?: string;
  process?: string;
  assessmentSite?: string;
  unitsAssessed?: string;
  method?: string;
  assessor?: { id: string; name: string } | null;
  status?: string;
  [key: string]: unknown;
}

export interface CentreIqamIvReport {
  applicationId: string;
  candidateName?: string;
  scope?: Record<string, unknown>;
  qualityFeedback?: string;
  outcomes?: Record<string, unknown>;
  agreedActions?: Array<{
    id: string;
    action: string;
    byWho: string;
    timeline: string;
  }>;
  verifierSignature?: Record<string, unknown>;
  status?: string;
  [key: string]: unknown;
}

export interface CentreIqamAssessorOutcomes {
  applicationId: string;
  candidateName?: string;
  checklist?: Array<{
    id: string;
    question: string;
    answer?: "yes" | "no";
    comments?: string;
  }>;
  feedback?: string;
  [key: string]: unknown;
}

export interface CentreIqamFinalPortfolio {
  applicationId: string;
  candidateName?: string;
  tradeName?: string;
  overallStatus?: string;
  unitsSummary?: Array<Record<string, unknown>>;
  signatures?: Record<string, unknown>;
  [key: string]: unknown;
}
