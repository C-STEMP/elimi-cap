// Types for the assessor-authored IQAM tools (/assessor/iqam/*).
// Distinct from the read-only CentreIqam* stubs in
// shared/applications/api/types.ts, which cover the centre's view-only
// mirror of the same documents.

export interface IqamCentreItem {
  centreId: string;
  centreName: string;
  assignedCount: number;
  status: "pending" | "approved" | "revoked" | "rejected" | "active";
  joinedAt: string;
  retainedRequestId?: string | null;
}

export interface IqamAllocationItem {
  applicationId: string;
  candidate: { id: string; name: string };
  unitAssessor: { assessorId: string; name: string } | null;
  wishedQualificationLevel: { id: string; level: number } | null;
  wishedUnits: Array<{ id: string; referenceNumber: string; title: string }>;
  currentStageKey: string;
  status: "in_progress";
}

export interface IqamSamplingPlanUnitHeader {
  id: string;
  referenceNumber: string;
  title: string;
}

export interface IqamSamplingPlanRow {
  applicationId: string;
  candidate: { id: string; name: string };
  unitAssessor: { assessorId: string; name: string } | null;
  termType: string | null;
  plannedDate: string | null;
  sampledUnitIds: string[];
  status: string;
  submittedAt: string | null;
}

export interface IqamSamplingPlanMatrix {
  centre: { id: string; name: string };
  trade: { id: string; name: string };
  qualificationLevel: { id: string; level: number };
  units: IqamSamplingPlanUnitHeader[];
  data: IqamSamplingPlanRow[];
}

export interface IqamSamplingPlanSubmitResult {
  centre: { id: string; name: string };
  trade: { id: string; name: string };
  qualificationLevel: { id: string; level: number };
  submittedAt: string;
  count: number;
}

export interface IqamSamplingRecordRow {
  applicationId: string;
  candidate: { id: string; name: string };
  unitAssessor: { assessorId: string; name: string } | null;
  assessmentSite: string | null;
  auditStatus: string | null;
  process: string | null;
  status: string;
  submittedAt: string | null;
}

export interface IqamSamplingRecordMatrix {
  centre: { id: string; name: string };
  trade: { id: string; name: string };
  qualificationLevel: { id: string; level: number };
  internalVerifier: { assessorId: string; name: string };
  methods: string[];
  data: IqamSamplingRecordRow[];
}

export interface IqamSamplingRecordSubmitResult {
  centre: { id: string; name: string };
  trade: { id: string; name: string };
  qualificationLevel: { id: string; level: number };
  submittedAt: string;
  count: number;
}

export interface IqamSignatureStub {
  status: "awaiting" | "appended";
  signedAt?: string | null;
  signatureMode?: "upload" | "typed";
  signatureAssetId?: string | null;
}

export interface IqamIvReportAction {
  id: string;
  actionRequired: string;
  byWho: string;
  timeline?: string | null;
  achieved?: boolean | null;
}

export interface IqamIvReportData {
  schemaVersion: 1;
  con04a?: {
    dateOfVerification?: string | null;
    countersigningIvName?: string | null;
    countersigningAssessorName?: string | null;
    visits?: {
      first?: string | null;
      second?: string | null;
      third?: string | null;
      fourth?: string | null;
      final?: string | null;
    };
    sampledLoEvidence?: string[];
    standardizationNotes?: string | null;
  };
  con04b?: {
    methodsSampled?: string[];
    vacsr?: { valid?: boolean; sufficient?: boolean; current?: boolean; authentic?: boolean };
    consistentPractice?: boolean | null;
    processChecked?: {
      planning?: boolean;
      reviewing?: boolean;
      recording?: boolean;
      judgement?: boolean;
    };
    countersignedByQualifiedAssessor?: boolean | null;
    ivSummary?: string | null;
    actions?: IqamIvReportAction[];
    actionConfirmation?: string | null;
    ivSignature?: IqamSignatureStub | null;
  };
  con04c?: {
    verifiedUnitIds?: string[];
    fullQualificationAchievedAt?: string | null;
    accessProblems?: string | null;
    appealsAndOutcomes?: string | null;
    secondLineFeedback?: string | null;
    signatures?: {
      secondLineIqa?: IqamSignatureStub | null;
      iv?: IqamSignatureStub | null;
      countersigningIqa?: IqamSignatureStub | null;
      assessor?: IqamSignatureStub | null;
      countersigningAssessor?: IqamSignatureStub | null;
    };
  };
}

export interface IqamIvReport {
  applicationId: string;
  candidate: { id: string; name: string };
  unitAssessor: { assessorId: string; name: string } | null;
  internalVerifier: { assessorId: string; name: string };
  centre: { id: string; name: string };
  trade: { id: string; name: string };
  qualificationLevel: { id: string; level: number };
  units: Array<{ id: string; referenceNumber: string; title: string }>;
  methods: string[];
  data: IqamIvReportData;
  status: string;
  submittedAt: string | null;
}

export interface IqamAssessorOutcomesData {
  schemaVersion: 1;
  questions?: Array<{ id: string; question: string; answer?: "yes" | "no" | null; comments?: string }>;
  ivSignature?: IqamSignatureStub | null;
  secondLineIvSignature?: IqamSignatureStub | null;
  [key: string]: unknown;
}

export interface IqamAssessorOutcomes {
  applicationId: string;
  candidate: { id: string; name: string };
  unitAssessor: { assessorId: string; name: string } | null;
  internalVerifier: { assessorId: string; name: string };
  centre: { id: string; name: string };
  data: IqamAssessorOutcomesData;
  status: string;
  submittedAt: string | null;
}

export interface IqamFinalPortfolioCheckpoint {
  id: string;
  question: string;
  answer?: "yes" | "no" | null;
  comments?: string;
}

export interface IqamFinalPortfolioData {
  schemaVersion: 1;
  fullAwardVerified?: boolean | null;
  checkpoints?: IqamFinalPortfolioCheckpoint[];
  actionForAssessor?: string | null;
  planAchieved?: string | null;
  signatures?: {
    iv?: IqamSignatureStub | null;
    countersigningIqa?: IqamSignatureStub | null;
    assessor?: IqamSignatureStub | null;
    countersigningAssessor?: IqamSignatureStub | null;
  };
  [key: string]: unknown;
}

export interface IqamFinalPortfolio {
  applicationId: string;
  candidate: { id: string; name: string };
  unitAssessor: { assessorId: string; name: string } | null;
  internalVerifier: { assessorId: string; name: string };
  centre: { id: string; name: string };
  trade: { id: string; name: string };
  qualificationLevel: { id: string; level: number };
  data: IqamFinalPortfolioData;
  status: string;
  submittedAt: string | null;
}
