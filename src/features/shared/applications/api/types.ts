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

export interface InductionForm {
  applicationId: string;
  data: Record<string, unknown>;
  submittedAt?: string | null;
}

export interface DirectObservationSession {
  id: string;
  applicationId: string;
  scheduledAt: string;
  status: "scheduled" | "completed" | "cancelled";
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
