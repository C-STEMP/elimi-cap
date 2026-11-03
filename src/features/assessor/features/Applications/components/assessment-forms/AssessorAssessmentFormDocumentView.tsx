"use client";

import { ASSETS_URL } from "@/src/assets";
import { useToast } from "@/src/components/ui/toast";
import { CandidateInterviewFormModal } from "@/src/features/candidate/features/Application/components/CandidateInterviewFormModal";
import type {
  ApplicationAssessmentMapping,
  AssessmentMappingEvidenceItem,
  AssessmentMappingLearningObjective,
  AssessmentMappingPerformanceCriterion,
  AssessmentMappingUnit,
  InterviewForm,
  InterviewFormRecord,
  InterviewPanel,
} from "@/src/features/shared/applications/api/types";
import {
  useGetApplicationAssessmentMapping,
  useGetApplicationById,
  useGetInterviewPanel,
  useGetInterviewFormsBundle,
  useUpdateInterviewForm,
} from "@/src/features/shared/applications/hooks";
import {
  getRplScopedUnits,
  resolveAppliedTradeLevel,
} from "@/src/features/shared/applications/utils/rplTradeLevel";
import type { Unit } from "@/src/features/shared/reference/api";
import {
  useGetTradeDetail,
  useGetUnitsByTrade,
} from "@/src/features/shared/reference/hooks";
import { useResolveAssets } from "@/src/features/shared/storage/hooks";
import { useAppSelector } from "@/src/store/hooks";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { FiArrowLeft, FiCheckCircle, FiClock, FiEdit3 } from "react-icons/fi";
import { FormHeaderActions } from "../form/FormHeaderActions";
import { useAssessorSignature } from "./useAssessorSignature";
import {
  AssessorSignatureModal,
  type AssessorSignatureData,
} from "./AssessorSignatureModal";
import { cleanQuestionTitle } from "./utils";
import { DigitalSignaturePad } from "./DigitalSignaturePad";

interface AssessorAssessmentFormDocumentViewProps {
  applicationId?: string;
  formId: string;
  candidateName: string;
  formData?: Record<string, any>;
  onBack: () => void;
  isCandidate?: boolean;
  formRecord?: InterviewForm | null;
  panelistRecords?: InterviewFormRecord[];
  interviewPanel?: InterviewPanel | null;
  applicationTrade?: string;
  unitLabels?: string[];
  levelLabel?: string;
  isInterviewStage?: boolean;
}

const FORM_TITLES: Record<
  string,
  { title: string; subtitle: string; code: string }
> = {
  skills_demo: {
    title: "Skills Demonstration Records Form",
    subtitle:
      "Assessor record of occupational performance demonstration against designated occupational standards.",
    code: "NBTE/RPL/SDR-01",
  },
  skill_demonstration: {
    title: "Skills Demonstration Records Form",
    subtitle:
      "Assessor record of occupational performance demonstration against designated occupational standards.",
    code: "NBTE/RPL/SDR-01",
  },
  observation_checklist: {
    title: "Practical Observation Record",
    subtitle:
      "Assessor on-site observation of real-time occupational tasks under industrial conditions.",
    code: "NBTE/RPL/POR-02",
  },
  practical_observation: {
    title: "Practical Observation Record",
    subtitle:
      "Assessor on-site observation of real-time occupational tasks under industrial conditions.",
    code: "NBTE/RPL/POR-02",
  },
  interview_record: {
    title: "Interview Question Bank & Record Sheet",
    subtitle:
      "Structured oral questioning instrument assessing theoretical knowledge, safety protocols, and problem-solving.",
    code: "NBTE/RPL/IQB-03",
  },
  records: {
    title: "Interview Question Bank & Record Sheet",
    subtitle:
      "Structured oral questioning instrument assessing theoretical knowledge, safety protocols, and problem-solving.",
    code: "NBTE/RPL/IQB-03",
  },
  assessment_mapping: {
    title: "RPL Assessment Grid / Mapping Form",
    subtitle:
      "Read-only matrix assembling candidate personal details and National Occupational Standards performance criteria.",
    code: "NBTE/RPL/AGM-04",
  },
  assessment_grid: {
    title: "RPL Assessment Grid / Mapping Form",
    subtitle:
      "Read-only matrix assembling candidate personal details and National Occupational Standards performance criteria.",
    code: "NBTE/RPL/AGM-04",
  },
};

const FORM_BACKEND_MAP: Record<
  string,
  | "skill_demonstration"
  | "assessment_grid"
  | "practical_observation"
  | "records"
> = {
  skills_demo: "skill_demonstration",
  skill_demonstration: "skill_demonstration",
  observation_checklist: "practical_observation",
  practical_observation: "practical_observation",
  interview_record: "records",
  records: "records",
  assessment_mapping: "assessment_grid",
  assessment_grid: "assessment_grid",
};

function transformScopedUnitToMappingUnit(su: Unit): AssessmentMappingUnit {
  const struct = su.structure as Record<string, any> | undefined;
  const rawLos = Array.isArray(struct?.learningObjectives)
    ? struct.learningObjectives
    : Array.isArray(struct?.learningOutcomes)
      ? struct.learningOutcomes
      : Array.isArray(struct?.elements)
        ? struct.elements
        : Array.isArray(struct)
          ? struct
          : [];

  const learningObjectives = rawLos.map((lo: any, loIdx: number) => {
    const rawPcs = Array.isArray(lo?.performanceCriteria)
      ? lo.performanceCriteria
      : Array.isArray(lo?.criteria)
        ? lo.criteria
        : Array.isArray(lo?.performance_criteria)
          ? lo.performance_criteria
          : [];

    const performanceCriteria = rawPcs.map((pc: any, pcIdx: number) => {
      const code =
        typeof pc === "object" && pc?.code
          ? pc.code
          : `${loIdx + 1}.${pcIdx + 1}`;
      const text =
        typeof pc === "string"
          ? pc
          : pc?.text || pc?.title || pc?.description || "";
      const evidenceTypes =
        Array.isArray(pc?.evidenceTypes) && pc.evidenceTypes.length > 0
          ? pc.evidenceTypes
          : Array.isArray(su.assessmentMethods) &&
              su.assessmentMethods.length > 0
            ? su.assessmentMethods
            : ["DO", "QA", "WT"];

      return {
        code,
        text,
        evidenceTypes,
      };
    });

    return {
      code: lo?.code || `LO ${loIdx + 1}`,
      text: lo?.text || lo?.title || "Core Learning Objective",
      title: lo?.title || lo?.text || "Core Learning Objective",
      performanceCriteria:
        performanceCriteria.length > 0
          ? performanceCriteria
          : [
              {
                code: `${loIdx + 1}.1`,
                text:
                  typeof lo === "string"
                    ? lo
                    : lo?.text ||
                      lo?.title ||
                      "Demonstrate competency criteria to standard",
                evidenceTypes: su.assessmentMethods || ["DO", "WT"],
              },
            ],
    };
  });

  const finalLos =
    learningObjectives.length > 0
      ? learningObjectives
      : [
          {
            code: "1.0",
            text:
              su.purpose ||
              `Demonstrate core occupational skills for ${su.title}`,
            title:
              su.purpose ||
              `Demonstrate core occupational skills for ${su.title}`,
            performanceCriteria: [
              {
                code: "1.1",
                text: `Prepare workspace, tools, and equipment safely in accordance with ${su.referenceNumber || su.title} standard`,
                evidenceTypes: su.assessmentMethods || ["DO", "WT"],
              },
              {
                code: "1.2",
                text: `Execute standard operational procedures and techniques required for ${su.title}`,
                evidenceTypes: su.assessmentMethods || ["DO", "PS"],
              },
              {
                code: "1.3",
                text: `Perform quality control inspection, testing, and rectify technical errors to standard`,
                evidenceTypes: su.assessmentMethods || ["QA", "WT"],
              },
              {
                code: "1.4",
                text: `Complete operational handover, restore work area, and comply with safety regulations`,
                evidenceTypes: su.assessmentMethods || ["DO", "QA"],
              },
            ],
          },
        ];

  return {
    id: su.id,
    referenceNumber: su.referenceNumber,
    title: su.title,
    assessmentMethods: su.assessmentMethods || ["DO", "QA", "WT", "PS"],
    learningObjectives: finalLos,
    evidence: [],
  };
}

export const AssessorAssessmentFormDocumentView: React.FC<
  AssessorAssessmentFormDocumentViewProps
> = ({
  applicationId,
  formId,
  candidateName,
  formData: initialFormData,
  onBack,
  isCandidate = false,
  formRecord,
  panelistRecords: propPanelistRecords,
  interviewPanel: propInterviewPanel,
  applicationTrade,
  unitLabels = [],
  levelLabel,
  isInterviewStage = true,
}) => {
  const { toast } = useToast();
  const user = useAppSelector((state) => state.auth.user);
  const [formData, setFormData] = useState<Record<string, any> | undefined>(
    initialFormData,
  );
  const [panelistRecordsState, setPanelistRecordsState] = useState<
    InterviewFormRecord[] | undefined
  >(propPanelistRecords);

  React.useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  React.useEffect(() => {
    if (propPanelistRecords) {
      setPanelistRecordsState(propPanelistRecords);
    }
  }, [propPanelistRecords]);

  const isAssessmentMapping =
    formId === "assessment_mapping" ||
    formId === "assessment_grid" ||
    FORM_BACKEND_MAP[formId] === "assessment_grid";

  const { data: mappingData, isLoading: isLoadingMapping } =
    useGetApplicationAssessmentMapping(applicationId || "", {
      enabled: isAssessmentMapping && Boolean(applicationId),
    });

  const { data: applicationData } = useGetApplicationById(applicationId || "");
  const resolvedTradeId =
    applicationData?.tradeId || (applicationData?.trade as any)?.id || "";
  const { data: tradeDetail } = useGetTradeDetail(resolvedTradeId);
  const { levelNumber } = resolveAppliedTradeLevel(
    applicationData,
    tradeDetail,
  );
  const { data: rawTradeUnits = [] } = useGetUnitsByTrade(
    resolvedTradeId,
    levelNumber,
  );
  const scopedUnits = React.useMemo(
    () =>
      getRplScopedUnits({
        tradeUnits: rawTradeUnits,
        tradeDetail,
        levelNumber,
        preferredUnitIds: applicationData?.unitIds,
      }),
    [rawTradeUnits, tradeDetail, levelNumber, applicationData?.unitIds],
  );

  const resolvedMappingUnits = React.useMemo(() => {
    const apiUnits = mappingData?.units || [];
    if (apiUnits.length > 0) {
      const apiUnitIds = new Set(apiUnits.map((u) => u.id));
      const missingScoped = scopedUnits.filter((su) => !apiUnitIds.has(su.id));
      if (missingScoped.length === 0) return apiUnits;
      return [
        ...apiUnits,
        ...missingScoped.map((su) => transformScopedUnitToMappingUnit(su)),
      ];
    }
    return scopedUnits.map((su) => transformScopedUnitToMappingUnit(su));
  }, [mappingData?.units, scopedUnits]);

  const isInterviewForm = formId === "interview_record" || formId === "records";
  const effectiveIsInterviewStage = Boolean(
    isInterviewStage &&
      (!applicationData?.currentStageKey ||
        applicationData.currentStageKey === "interview" ||
        applicationData.currentStageKey === "direct_observation" ||
        applicationData.currentStageKey === "observation" ||
        (applicationData as any)?.stage === "interview"),
  );
  const shouldFetchInterviewPanel = Boolean(
    applicationId &&
      (effectiveIsInterviewStage || isInterviewForm),
  );
  const { data: fetchedInterviewPanel } = useGetInterviewPanel(
    applicationId || "",
    {
      enabled: shouldFetchInterviewPanel && !propInterviewPanel,
    },
  );
  const interviewPanel = propInterviewPanel || fetchedInterviewPanel;

  const { data: formsBundle } = useGetInterviewFormsBundle(
    applicationId || "",
    {
      enabled: Boolean(applicationId) && !propPanelistRecords,
    },
  );
  const effectivePanelistRecords =
    panelistRecordsState || formsBundle?.panelistRecords || [];

  const updateFormMutation = useUpdateInterviewForm(applicationId || "");
  const [isSigningRole, setIsSigningRole] = useState<string | null>(null);
  const [signatureModalConfig, setSignatureModalConfig] = useState<{
    isOpen: boolean;
    role: "lead" | "panel" | "iv";
    title: string;
    signerName: string;
  }>({
    isOpen: false,
    role: "lead",
    title: "Append Signature",
    signerName: "",
  });

  const currentAssessorId =
    (user as any)?.assessorId || (user as any)?.profileId || user?.id;
  const currentAssessorEmail = user?.email?.toLowerCase();

  const isMemberMatch = (m: any) => {
    if (!m) return false;
    const mAssessorId = (m.assessorId || m.userId || m.id || "")
      .toString()
      .toLowerCase()
      .trim();
    const mEmail = (m.email || "").toLowerCase().trim();
    const mName = (m.name || "").toLowerCase().trim();

    if (currentAssessorEmail && mEmail && mEmail === currentAssessorEmail)
      return true;
    if (
      currentAssessorId &&
      mAssessorId === currentAssessorId.toString().toLowerCase().trim()
    )
      return true;
    if (user?.id && mAssessorId === user.id.toLowerCase().trim()) return true;
    const userNames = [
      user?.fullName,
      (user as any)?.name,
      (user as any)?.firstName,
      (user as any)?.lastName,
      `${(user as any)?.firstName || ""} ${(user as any)?.lastName || ""}`.trim(),
    ]
      .filter(Boolean)
      .map((n) => (n as string).toLowerCase().trim());

    if (
      mName &&
      userNames.some(
        (n) => n === mName || n.includes(mName) || mName.includes(n),
      )
    )
      return true;
    return false;
  };

  const leadMember = interviewPanel?.members?.find((m: any) => m.isLead);
  const panelMember = interviewPanel?.members?.find(
    (m: any) => !m.isLead && !m.isObserver,
  );
  const ivMember = interviewPanel?.members?.find((m: any) => m.isObserver);

  const isCandidateSigned = Boolean(
    initialFormData?.candidateSignedAt || formRecord?.candidateSignedAt,
  );

  const isAssessorSigned = Boolean(
    formData?.leadPanelistSigned ||
    formData?.assessorSigned ||
    formData?.leadPanelistSignedAt ||
    formData?.assessorSignedAt ||
    isCandidateSigned ||
    formRecord?.candidateSignedAt ||
    formRecord?.status === "completed" ||
    formData?.submittedAt ||
    Boolean(formRecord?.populatedBy),
  );

  const isAssessorUser =
    !isCandidate &&
    Boolean(
      user?.role?.toLowerCase()?.includes("assessor") ||
      user?.role?.toLowerCase()?.includes("centre") ||
      user?.role?.toLowerCase()?.includes("center") ||
      user?.role?.toLowerCase()?.includes("facilitator") ||
      user?.role?.toLowerCase()?.includes("admin"),
    );

  const isMatchLead = Boolean(leadMember && isMemberMatch(leadMember));
  const isMatchIV = Boolean(ivMember && isMemberMatch(ivMember));
  const isMatchPanelMember = Boolean(panelMember && isMemberMatch(panelMember));

  const canSignLead =
    isAssessorUser &&
    isInterviewStage &&
    !isCandidateSigned &&
    !isAssessorSigned &&
    isMatchLead;

  const {
    signatureUrl: profileSignatureUrl,
    signatureAssetId: profileSignatureAssetId,
  } = useAssessorSignature({ enabled: !isCandidate && isAssessorUser });

  const targetBackendType = FORM_BACKEND_MAP[formId] || "records";

  const nonLeadMembers = useMemo(() => {
    return (interviewPanel?.members || []).filter(
      (m: any) => !m.isLead && !m.isObserver,
    );
  }, [interviewPanel?.members]);

  const assetsToResolve = useMemo(() => {
    const ids: string[] = [];
    const assessorAssetId =
      (formData as any)?.assessorSignature?.assetId ||
      (formData as any)?.leadSignature?.assetId ||
      (formData as any)?.assessorSignatureAssetId ||
      (formData as any)?.leadPanelistSignatureAssetId;
    const candidateAssetId =
      formRecord?.candidateSignatureAssetId ||
      (formData as any)?.candidateSignatureAssetId;

    if (
      assessorAssetId &&
      !(formData as any)?.assessorSignature?.url &&
      !(formData as any)?.leadSignature?.url &&
      !(formData as any)?.assessorSignatureUrl &&
      !(formData as any)?.leadPanelistSignatureUrl
    ) {
      ids.push(assessorAssetId);
    }
    if (candidateAssetId && !(formData as any)?.candidateSignatureUrl) {
      ids.push(candidateAssetId);
    }

    effectivePanelistRecords.forEach((pr) => {
      if (
        pr.formType === targetBackendType ||
        (pr.formType as string) === formId
      ) {
        const prSig =
          (pr.data as any)?.assessorSignature ||
          (pr.data as any)?.panelMemberSignature ||
          (pr.data as any)?.internalVerifierSignature;
        const prAssetId =
          prSig?.assetId ||
          (pr.data as any)?.assessorSignatureAssetId ||
          (pr.data as any)?.panelMemberSignatureAssetId ||
          (pr.data as any)?.internalVerifierSignatureAssetId;
        if (prAssetId && !prSig?.url && !ids.includes(prAssetId)) {
          ids.push(prAssetId);
        }
      }
    });

    return ids;
  }, [formData, formRecord, effectivePanelistRecords, targetBackendType, formId]);

  const { data: resolvedSignatureAssets } = useResolveAssets(assetsToResolve);

  const sigAssetsList: Array<{ assetId: string; url?: string }> = Array.isArray(
    resolvedSignatureAssets,
  )
    ? resolvedSignatureAssets
    : Array.isArray((resolvedSignatureAssets as any)?.assets)
      ? (resolvedSignatureAssets as any).assets
      : [];

  const resolveSigUrl = (
    sigObj?: any,
    fallbackAssetId?: string,
    fallbackUrl?: string,
  ) => {
    if (sigObj?.url) return sigObj.url;
    if (fallbackUrl) return fallbackUrl;
    const targetAssetId = sigObj?.assetId || fallbackAssetId;
    if (!targetAssetId) return null;
    return sigAssetsList.find((a) => a.assetId === targetAssetId)?.url || null;
  };

  const leadSig =
    formData?.leadSignature ||
    formData?.assessorSignature;

  const resolvedLeadSigUrl =
    resolveSigUrl(
      leadSig,
      (formData as any)?.assessorSignatureAssetId ||
        (formData as any)?.leadPanelistSignatureAssetId,
      (formData as any)?.assessorSignatureUrl ||
        (formData as any)?.leadPanelistSignatureUrl,
    ) || (isAssessorSigned ? profileSignatureUrl : null);

  const displayAssessorSigUrl = resolvedLeadSigUrl;

  const displayCandidateSigUrl =
    (formData as any)?.candidateSignatureUrl ||
    sigAssetsList.find(
      (a) =>
        a.assetId === formRecord?.candidateSignatureAssetId ||
        a.assetId === (formData as any)?.candidateSignatureAssetId,
    )?.url ||
    null;

  const isLeadFormSigned = Boolean(
    isAssessorSigned ||
      leadSig?.assetId ||
      formData?.leadPanelistSigned ||
      formData?.assessorSigned ||
      formData?.leadPanelistSignedAt ||
      formData?.assessorSignedAt ||
      formRecord?.assessorSignedAt ||
      formData?.submittedAt,
  );

  const leadSignerName =
    leadSig?.name ||
    formData?.leadPanelistName ||
    formData?.assessorName ||
    leadMember?.name ||
    "Lead Assessor";

  const leadSignedAt =
    leadSig?.signedAt ||
    formData?.leadPanelistSignedAt ||
    formData?.assessorSignedAt ||
    formData?.submittedAt ||
    formRecord?.assessorSignedAt;

  const handleSignWithSignatureData = async (
    role: "lead" | "panel" | "iv",
    sig: AssessorSignatureData,
  ) => {
    if (!applicationId) return;
    setIsSigningRole(role);
    try {
      const now = new Date().toISOString();
      const updatedData: Record<string, any> = {
        ...(formData || {}),
        assessorSignature: sig,
        assessorSigned: true,
        assessorSignedAt: sig.signedAt || now,
        assessorName: sig.name,
        assessorSignatureAssetId: sig.assetId,
        assessorSignatureUrl: sig.url,
      };

      if (role === "lead") {
        updatedData.leadSignature = sig;
        updatedData.leadPanelistSigned = true;
        updatedData.leadPanelistSignedAt = sig.signedAt || now;
        updatedData.leadPanelistName = sig.name;
        updatedData.leadPanelistSignatureAssetId = sig.assetId;
        updatedData.leadPanelistSignatureUrl = sig.url;
        updatedData.status = "submitted";
        updatedData.submittedAt = now;
      } else if (role === "iv") {
        updatedData.internalVerifierSignature = sig;
        updatedData.internalVerifierSigned = true;
        updatedData.internalVerifierSignedAt = sig.signedAt || now;
        updatedData.internalVerifierName = sig.name;
      } else {
        updatedData.panelMemberSignature = sig;
        updatedData.panelMemberSigned = true;
        updatedData.panelMemberSignedAt = sig.signedAt || now;
        updatedData.panelMemberName = sig.name;
      }

      await updateFormMutation.mutateAsync({
        formType: FORM_BACKEND_MAP[formId] || "records",
        data: updatedData,
      });

      if (role === "lead") {
        setFormData(updatedData);
      } else {
        setPanelistRecordsState((prev = []) => {
          const filtered = prev.filter(
            (r) =>
              !(
                r.assessorId === currentAssessorId &&
                r.formType === (FORM_BACKEND_MAP[formId] || "records")
              ),
          );
          return [
            ...filtered,
            {
              id: `pr-${Date.now()}`,
              applicationId,
              assessorId: currentAssessorId || "",
              formType: FORM_BACKEND_MAP[formId] || "records",
              data: updatedData,
              createdAt: now,
              updatedAt: now,
              isObserver: role === "iv",
            } as any,
          ];
        });
      }

      toast({
        type: "success",
        title: "Form Signed",
        description: `Successfully signed form as ${
          role === "lead"
            ? isInterviewRecord
              ? "Lead Panelist"
              : "Lead Assessor"
            : role === "iv"
              ? "Internal Verifier"
              : "Panel Member"
        }.`,
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Signature Failed",
        description: err?.message || "Failed to append signature.",
      });
    } finally {
      setIsSigningRole(null);
    }
  };

  const handleSignClick = (role: "lead" | "panel" | "iv") => {
    if (isCandidateSigned) {
      toast({
        type: "info",
        title: "Form Completed",
        description:
          "This form has already been signed by the candidate and cannot be modified.",
      });
      return;
    }
    const uName = user?.fullName || (user as any)?.name || "Assessor";
    if (profileSignatureAssetId || profileSignatureUrl) {
      handleSignWithSignatureData(role, {
        assetId: profileSignatureAssetId || "",
        name: uName,
        signedAt: new Date().toISOString(),
        url: profileSignatureUrl || undefined,
      });
    } else {
      setSignatureModalConfig({
        isOpen: true,
        role,
        title: `Sign as ${
          role === "lead"
            ? isInterviewRecord
              ? "Lead Panelist"
              : "Lead Assessor"
            : role === "iv"
              ? "Internal Verifier"
              : "Panel Member"
        }`,
        signerName: uName,
      });
    }
  };

  const [isCandidateSignModalOpen, setIsCandidateSignModalOpen] =
    useState(false);
  const isInterviewRecord =
    formId === "records" ||
    formId === "interview_record" ||
    FORM_BACKEND_MAP[formId] === "records";
  const meta = FORM_TITLES[formId] || FORM_TITLES.records;

  const pd = (mappingData?.personalDetails || {}) as Record<string, any>;
  const pdFullName = [pd.firstName, pd.middleName, pd.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const candidateFullName =
    pdFullName || formData?.candidateFullName || candidateName || "Candidate";
  const assessorName =
    formData?.assessorName || formData?.interviewerNames || "Assessor";
  const effectiveLevelLabel = levelLabel || formData?.levelAppliedFor || "";
  const unitTitleCode =
    formData?.unitTitleCode ||
    formData?.levelAppliedFor ||
    unitLabels[0] ||
    "—";

  const unitsList = React.useMemo(() => {
    if (typeof unitTitleCode === "string" && unitTitleCode.includes("|")) {
      return unitTitleCode
        .split(/\s*\|\s*/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (Array.isArray(unitLabels) && unitLabels.length > 0) {
      return unitLabels;
    }
    if (unitTitleCode && unitTitleCode !== "—") {
      return [unitTitleCode];
    }
    return [];
  }, [unitTitleCode, unitLabels]);
  const dateStr =
    formData?.demonstrationDate ||
    formData?.observationDate ||
    formData?.interviewDate ||
    formData?.dateCollected ||
    "Not specified";
  const locationStr =
    formData?.location ||
    formData?.observationSite ||
    formData?.workplaceContext ||
    "Not specified";

  const safeFormName = `${meta.title.replace(/\s+/g, "_")}_${candidateFullName.replace(/\s+/g, "_")}`;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-6 px-4 sm:px-6 select-text">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap no-print">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-neutral-primary hover:bg-gray-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs whitespace-nowrap shrink-0 self-start"
        >
          <FiArrowLeft className="w-4 h-4 text-gray-500" />
          Back to Application
        </button>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap justify-end">
          {!isAssessmentMapping &&
            isCandidate &&
            !isCandidateSigned &&
            isInterviewStage && (
              <button
                type="button"
                onClick={() => setIsCandidateSignModalOpen(true)}
                className="bg-[#8A1538] hover:bg-[#72112d] text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0"
              >
                <FiEdit3 className="w-3.5 h-3.5 shrink-0" />
                <span>Sign Document</span>
              </button>
            )}
          <FormHeaderActions
            formName={safeFormName}
            elementId="printable-assessment-form"
          />
        </div>
      </div>

      <div
        id="printable-assessment-form"
        className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-10 border border-gray-100 shadow-xs flex flex-col gap-6 sm:gap-8 w-full printable-container"
      >
        <div className="flex flex-col items-center text-center gap-2 border-b border-gray-100 pb-6">
          <div className="flex justify-center mb-1">
            <Image
              src={ASSETS_URL.logoIcon2}
              alt="ELIMI Logo"
              width={120}
              height={48}
              className="w-auto h-9 object-contain"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <span className="text-[11px] font-bold tracking-widest text-[#8A1538] uppercase">
            {meta.code}
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-neutral-primary tracking-tight uppercase max-w-2xl leading-tight">
            {meta.title}
          </h2>
          <p className="text-xs text-neutral-secondary max-w-lg">
            {meta.subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-[11px] font-bold text-neutral-primary uppercase tracking-widest border-b border-gray-100 pb-2">
            {isAssessmentMapping
              ? "Candidate Personal Details"
              : "Assessment Information & Particulars"}
          </h3>
          {isAssessmentMapping ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100 text-xs">
              <div>
                <span className="font-semibold text-neutral-secondary block mb-0.5">
                  Candidate Name:
                </span>
                <span className="font-bold text-neutral-primary text-sm">
                  {candidateFullName}
                </span>
              </div>
              {applicationTrade && (
                <div>
                  <span className="font-semibold text-neutral-secondary block mb-0.5">
                    Trade / Occupation:
                  </span>
                  <span className="font-bold text-neutral-primary text-sm">
                    {applicationTrade}
                  </span>
                </div>
              )}
              {(pd.email || pd.emailAddress) && (
                <div>
                  <span className="font-semibold text-neutral-secondary block mb-0.5">
                    Email:
                  </span>
                  <span className="font-medium text-neutral-primary">
                    {pd.email || pd.emailAddress}
                  </span>
                </div>
              )}
              {(pd.phoneNumber || pd.phone) && (
                <div>
                  <span className="font-semibold text-neutral-secondary block mb-0.5">
                    Phone Number:
                  </span>
                  <span className="font-medium text-neutral-primary">
                    {typeof pd.phoneNumber === "object"
                      ? `${pd.phoneNumber.countryCode || ""} ${pd.phoneNumber.number || ""}`.trim()
                      : pd.phoneNumber || pd.phone}
                  </span>
                </div>
              )}
              {pd.gender && (
                <div>
                  <span className="font-semibold text-neutral-secondary block mb-0.5">
                    Gender:
                  </span>
                  <span className="font-medium text-neutral-primary">
                    {pd.gender}
                  </span>
                </div>
              )}
              {(pd.dateOfBirth || pd.dob) && (
                <div>
                  <span className="font-semibold text-neutral-secondary block mb-0.5">
                    Date of Birth:
                  </span>
                  <span className="font-medium text-neutral-primary">
                    {pd.dateOfBirth || pd.dob}
                  </span>
                </div>
              )}
              {pd.nationality && (
                <div>
                  <span className="font-semibold text-neutral-secondary block mb-0.5">
                    Nationality:
                  </span>
                  <span className="font-medium text-neutral-primary">
                    {pd.nationality}
                  </span>
                </div>
              )}
              {(pd.stateOfResidence || pd.state) && (
                <div>
                  <span className="font-semibold text-neutral-secondary block mb-0.5">
                    State of Residence:
                  </span>
                  <span className="font-medium text-neutral-primary">
                    {pd.stateOfResidence || pd.state}
                  </span>
                </div>
              )}
              {(pd.localGovernment || pd.lga) && (
                <div>
                  <span className="font-semibold text-neutral-secondary block mb-0.5">
                    Local Government:
                  </span>
                  <span className="font-medium text-neutral-primary">
                    {pd.localGovernment || pd.lga}
                  </span>
                </div>
              )}
              {(pd.address || pd.residentialAddress || pd.streetAddress) && (
                <div className="sm:col-span-2">
                  <span className="font-semibold text-neutral-secondary block mb-0.5">
                    Residential Address:
                  </span>
                  <span className="font-medium text-neutral-primary">
                    {pd.address || pd.residentialAddress || pd.streetAddress}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-4 text-xs">
              {/* Primary Assessment Particulars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
                <div>
                  <span className="font-semibold text-neutral-secondary block mb-0.5">
                    Candidate Name:
                  </span>
                  <span className="font-bold text-neutral-primary text-sm block">
                    {candidateFullName}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-neutral-secondary block mb-0.5">
                    Assessor / Interviewer:
                  </span>
                  <span className="font-bold text-neutral-primary text-sm block">
                    {assessorName}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-neutral-secondary block mb-0.5">
                    Assessment Date:
                  </span>
                  <span className="font-bold text-neutral-primary text-sm block">
                    {dateStr}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-neutral-secondary block mb-0.5">
                    Location / Facility / Workplace:
                  </span>
                  <span className="font-bold text-neutral-primary text-sm block">
                    {locationStr}
                  </span>
                </div>
              </div>

              {/* Units of Competency / Level */}
              <div className="pt-3.5 border-t border-gray-200/70 flex flex-col gap-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-semibold text-neutral-secondary">
                    Unit / Level{unitsList.length > 1 ? ` (${unitsList.length} Units)` : ""}:
                  </span>
                  {(applicationTrade || effectiveLevelLabel) && (
                    <span className="text-[11px] font-bold text-neutral-primary bg-white border border-gray-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                      {[applicationTrade, effectiveLevelLabel].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </div>

                {unitsList.length > 1 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
                    {unitsList.map((unit, idx) => {
                      const colonIdx = unit.indexOf(":");
                      const code = colonIdx > -1 ? unit.substring(0, colonIdx).trim() : null;
                      const title = colonIdx > -1 ? unit.substring(colonIdx + 1).trim() : unit;
                      return (
                        <div
                          key={idx}
                          className="bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 flex items-start gap-2.5 shadow-2xs hover:border-gray-300 transition-colors break-inside-avoid"
                        >
                          {code && (
                            <span className="shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#FFF8EB] text-[#B45309] border border-[#FDE68A] rounded-md">
                              {code}
                            </span>
                          )}
                          <span className="text-xs font-semibold text-neutral-primary leading-snug">
                            {title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200/80 rounded-xl px-3.5 py-2.5 flex items-start gap-2.5 shadow-2xs">
                    {(() => {
                      const single = unitsList[0] || unitTitleCode;
                      const colonIdx = single.indexOf(":");
                      const code = colonIdx > -1 ? single.substring(0, colonIdx).trim() : null;
                      const title = colonIdx > -1 ? single.substring(colonIdx + 1).trim() : single;
                      return (
                        <>
                          {code && (
                            <span className="shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#FFF8EB] text-[#B45309] border border-[#FDE68A] rounded-md">
                              {code}
                            </span>
                          )}
                          <span className="text-xs sm:text-sm font-bold text-neutral-primary">
                            {title}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {renderFormContent(
          formId,
          formData,
          mappingData,
          isLoadingMapping,
          resolvedMappingUnits,
        )}

        <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
          <h3 className="text-[11px] font-bold text-neutral-primary uppercase tracking-widest border-b border-gray-100 pb-2">
            Signatures &amp; Verification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* 1. Lead Assessor */}
            <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-4.5 border border-gray-100 flex flex-col justify-between shadow-2xs">
              <DigitalSignaturePad
                label={isInterviewRecord ? "Lead Panelist" : "Assessor / Lead Assessor"}
                required={false}
                isSigned={isLeadFormSigned}
                signerName={leadSignerName || "Lead Assessor"}
                signedAt={leadSignedAt || undefined}
                signatureUrl={resolvedLeadSigUrl}
                isReadOnly={!canSignLead}
                isLoading={isSigningRole === "lead"}
                buttonText={isInterviewRecord ? "Sign as Lead Panelist" : "Sign as Assessor"}
                waitingText={isInterviewRecord ? "Awaiting Lead Panelist" : "Awaiting Lead Assessor"}
                onAppendSignature={() => handleSignClick("lead")}
              />
            </div>

            {/* 2. Panel Members (Co-Assessors) */}
            {nonLeadMembers.map((m: any, idx: number) => {
              const mRecord = effectivePanelistRecords.find(
                (pr) =>
                  (pr.assessorId === m.assessorId || isMemberMatch(m)) &&
                  (pr.formType === targetBackendType ||
                    (pr.formType as string) === formId),
              );
              const mSig =
                (mRecord?.data as any)?.assessorSignature ||
                (mRecord?.data as any)?.panelMemberSignature;
              const isMemberSigned = Boolean(
                mSig?.assetId ||
                  (mRecord?.data as any)?.assessorSigned ||
                  (mRecord?.data as any)?.panelMemberSigned,
              );
              const mSigUrl = resolveSigUrl(
                mSig,
                (mRecord?.data as any)?.assessorSignatureAssetId ||
                  (mRecord?.data as any)?.panelMemberSignatureAssetId,
                (mRecord?.data as any)?.assessorSignatureUrl ||
                  (mRecord?.data as any)?.panelMemberSignatureUrl,
              );
              const isCurrentLoggedInMember = isMemberMatch(m);
              const canSignThisMember =
                isAssessorUser &&
                isInterviewStage &&
                !isCandidateSigned &&
                !isMemberSigned &&
                isCurrentLoggedInMember;

              const memberName =
                mSig?.name ||
                (mRecord?.data as any)?.assessorName ||
                m.name ||
                `Panelist ${idx + 1}`;
              const memberSignedAt =
                mSig?.signedAt ||
                (mRecord?.data as any)?.assessorSignedAt ||
                (mRecord?.data as any)?.panelMemberSignedAt ||
                mRecord?.createdAt;

              return (
                <div
                  key={m.assessorId || idx}
                  className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-4.5 border border-gray-100 flex flex-col justify-between shadow-2xs"
                >
                  <DigitalSignaturePad
                    label={`Panel Member (${memberName})`}
                    required={false}
                    isSigned={isMemberSigned}
                    signerName={memberName}
                    signedAt={memberSignedAt || undefined}
                    signatureUrl={mSigUrl}
                    isReadOnly={!canSignThisMember}
                    isLoading={isSigningRole === "panel"}
                    buttonText="Sign as Panel Member"
                    waitingText="Awaiting Panel Member"
                    onAppendSignature={() => handleSignClick("panel")}
                  />
                </div>
              );
            })}

            {/* 3. Internal Verifier (Observer) */}
            {ivMember &&
              (() => {
                const ivRecord = effectivePanelistRecords.find(
                  (pr) =>
                    (pr.assessorId === ivMember.assessorId ||
                      isMemberMatch(ivMember) ||
                      pr.isObserver) &&
                    (pr.formType === targetBackendType ||
                      (pr.formType as string) === formId),
                );
                const ivSig =
                  (ivRecord?.data as any)?.assessorSignature ||
                  (ivRecord?.data as any)?.internalVerifierSignature ||
                  formData?.internalVerifierSignature;
                const isIvSigned = Boolean(
                  ivSig?.assetId ||
                    (ivRecord?.data as any)?.assessorSigned ||
                    (ivRecord?.data as any)?.internalVerifierSigned ||
                    formData?.internalVerifierSigned,
                );
                const ivSigUrl = resolveSigUrl(
                  ivSig,
                  (ivRecord?.data as any)?.assessorSignatureAssetId ||
                    (ivRecord?.data as any)?.internalVerifierSignatureAssetId,
                  (ivRecord?.data as any)?.assessorSignatureUrl ||
                    (ivRecord?.data as any)?.internalVerifierSignatureUrl,
                );
                const canSignIvRole =
                  isAssessorUser &&
                  isInterviewStage &&
                  !isCandidateSigned &&
                  !isIvSigned &&
                  isMatchIV;

                const ivName =
                  ivSig?.name ||
                  (ivRecord?.data as any)?.assessorName ||
                  ivMember.name ||
                  "Internal Verifier";
                const ivSignedAt =
                  ivSig?.signedAt ||
                  (ivRecord?.data as any)?.assessorSignedAt ||
                  (ivRecord?.data as any)?.internalVerifierSignedAt ||
                  ivRecord?.createdAt;

                return (
                  <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-4.5 border border-gray-100 flex flex-col justify-between shadow-2xs">
                    <DigitalSignaturePad
                      label="Internal Verifier"
                      required={false}
                      isSigned={isIvSigned}
                      signerName={ivName}
                      signedAt={ivSignedAt || undefined}
                      signatureUrl={ivSigUrl}
                      isReadOnly={!canSignIvRole}
                      isLoading={isSigningRole === "iv"}
                      buttonText="Sign as Internal Verifier"
                      waitingText="Awaiting Internal Verifier"
                      onAppendSignature={() => handleSignClick("iv")}
                    />
                  </div>
                );
              })()}

            {/* 4. Candidate */}
            <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-4.5 border border-gray-100 flex flex-col justify-between shadow-2xs">
              <DigitalSignaturePad
                label="Candidate"
                required={false}
                isSigned={isCandidateSigned}
                signerName={candidateFullName}
                signedAt={
                  formData?.candidateSignedAt ||
                  formRecord?.candidateSignedAt ||
                  undefined
                }
                signatureUrl={displayCandidateSigUrl}
                isReadOnly={!(isCandidate && isInterviewStage && !isCandidateSigned)}
                buttonText="Append Signature"
                waitingText="Awaiting Candidate"
                onAppendSignature={() => setIsCandidateSignModalOpen(true)}
              />
            </div>
          </div>
        </div>

        <AssessorSignatureModal
          isOpen={signatureModalConfig.isOpen}
          onClose={() =>
            setSignatureModalConfig((prev) => ({ ...prev, isOpen: false }))
          }
          onConfirm={(sig) =>
            handleSignWithSignatureData(signatureModalConfig.role, sig)
          }
          signerName={signatureModalConfig.signerName}
          title={signatureModalConfig.title}
          subtitle={`Sign ${meta.title}`}
        />
      </div>

      {applicationId && (
        <CandidateInterviewFormModal
          isOpen={isCandidateSignModalOpen}
          onClose={() => setIsCandidateSignModalOpen(false)}
          applicationId={applicationId}
          formType={FORM_BACKEND_MAP[formId] || "records"}
          formTitle={meta.title}
          formRecord={formRecord}
          candidateName={candidateFullName}
        />
      )}
    </div>
  );
};

function renderFormContent(
  formId: string,
  formData?: Record<string, any>,
  mappingData?: ApplicationAssessmentMapping,
  isLoadingMapping?: boolean,
  resolvedMappingUnits: AssessmentMappingUnit[] = [],
) {
  switch (formId) {
    case "skills_demo":
    case "skill_demonstration":
      return (
        <div className="flex flex-col gap-6">
          {(formData?.taskDemonstrated ||
            formData?.workplaceDescription ||
            formData?.toolsUsed) && (
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-neutral-primary uppercase tracking-wide">
                Demonstration Details
              </h4>
              <div className="grid grid-cols-1 gap-3 bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 text-xs">
                {formData?.taskDemonstrated && (
                  <div>
                    <span className="font-semibold text-neutral-secondary block mb-1">
                      Task Demonstrated:
                    </span>
                    <p className="text-neutral-primary font-medium whitespace-pre-wrap">
                      {formData.taskDemonstrated}
                    </p>
                  </div>
                )}
                {formData?.workplaceDescription && (
                  <div>
                    <span className="font-semibold text-neutral-secondary block mb-1">
                      Workplace Setup Description:
                    </span>
                    <p className="text-neutral-primary font-medium whitespace-pre-wrap">
                      {formData.workplaceDescription}
                    </p>
                  </div>
                )}
                {formData?.toolsUsed && (
                  <div>
                    <span className="font-semibold text-neutral-secondary block mb-1">
                      Tools &amp; Materials Used:
                    </span>
                    <p className="text-neutral-primary font-medium whitespace-pre-wrap">
                      {formData.toolsUsed}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-neutral-primary uppercase tracking-wide">
              Demonstration Criteria &amp; Standards Checklist
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] text-neutral-secondary font-bold border-b border-gray-200">
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">Criterion / Standard</th>
                    <th className="p-3 w-28 text-center">Demonstrated</th>
                    <th className="p-3">Assessor Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.isArray(formData?.criteria) &&
                  formData.criteria.length > 0 ? (
                    formData.criteria.map((item: any, idx: number) => (
                      <tr key={item.id || idx} className="hover:bg-gray-50/50">
                        <td className="p-3 text-center text-neutral-secondary font-bold">
                          {idx + 1}
                        </td>
                        <td className="p-3 font-semibold text-neutral-primary">
                          {cleanQuestionTitle(item.title)}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              item.demonstrated
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {item.demonstrated ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="p-3 text-neutral-secondary italic">
                          {item.comments || "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-4 text-center text-gray-400 italic"
                      >
                        No criteria items recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-neutral-primary uppercase tracking-wide">
              Verdict &amp; Technical Notes
            </h4>
            <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-neutral-secondary">
                  Verdict:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    formData?.verdict === "Competent"
                      ? "bg-[#1E7F4C] text-white"
                      : "bg-[#8A1538] text-white"
                  }`}
                >
                  {formData?.verdict || "Competent"}
                </span>
              </div>
              {formData?.technicalNotes && (
                <div>
                  <span className="font-semibold text-neutral-secondary block mb-1">
                    Technical Notes:
                  </span>
                  <p className="text-neutral-primary font-medium whitespace-pre-wrap">
                    {formData.technicalNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case "observation_checklist":
    case "practical_observation":
      return (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-neutral-primary uppercase tracking-wide">
              Observation Criteria &amp; Standards Checklist
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] text-neutral-secondary font-bold border-b border-gray-200">
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">Standard / Task</th>
                    <th className="p-3 w-28 text-center">Demonstrated</th>
                    <th className="p-3">Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.isArray(formData?.checklist) &&
                  formData.checklist.length > 0 ? (
                    formData.checklist.map((item: any, idx: number) => (
                      <tr key={item.id || idx} className="hover:bg-gray-50/50">
                        <td className="p-3 text-center text-neutral-secondary font-bold">
                          {idx + 1}
                        </td>
                        <td className="p-3 font-semibold text-neutral-primary">
                          {cleanQuestionTitle(item.title)}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              item.demonstrated
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {item.demonstrated ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="p-3 text-neutral-secondary italic">
                          {item.comments || "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-4 text-center text-gray-400 italic"
                      >
                        No checklist items recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-neutral-primary uppercase tracking-wide">
              Practical Observation Verdict &amp; Notes
            </h4>
            <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-neutral-secondary">
                  Verdict:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    formData?.verdict === "Competent"
                      ? "bg-[#1E7F4C] text-white"
                      : "bg-[#8A1538] text-white"
                  }`}
                >
                  {formData?.verdict || "Competent"}
                </span>
              </div>
              {formData?.observationNotes && (
                <div>
                  <span className="font-semibold text-neutral-secondary block mb-1">
                    Detailed Observation Notes:
                  </span>
                  <p className="text-neutral-primary font-medium whitespace-pre-wrap">
                    {formData.observationNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case "interview_record":
    case "records":
      return (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-neutral-primary uppercase tracking-wide">
              Question Bank &amp; Live Responses
            </h4>
            <div className="flex flex-col gap-3">
              {Array.isArray(formData?.questions) &&
              formData.questions.length > 0 ? (
                formData.questions.map((q: any, idx: number) => (
                  <div
                    key={q.id || idx}
                    className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100 flex flex-col gap-1.5 text-xs"
                  >
                    <span className="font-bold text-neutral-primary">
                      {idx + 1}. {cleanQuestionTitle(q.question)}
                    </span>
                    <p className="text-neutral-secondary pl-3 border-l-2 border-[#8A1538] py-0.5 whitespace-pre-wrap font-medium">
                      {q.candidateResponse || (
                        <span className="italic text-gray-400">
                          No response recorded
                        </span>
                      )}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic bg-[#F8F9FA] p-4 rounded-xl">
                  No interview questions recorded.
                </p>
              )}
            </div>
          </div>

          {(formData?.strengths || formData?.areasForDevelopment) && (
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-neutral-primary uppercase tracking-wide">
                Overall Assessment
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 text-xs">
                {formData?.strengths && (
                  <div>
                    <span className="font-semibold text-neutral-secondary block mb-1">
                      Strengths Identified:
                    </span>
                    <p className="text-neutral-primary font-medium whitespace-pre-wrap">
                      {formData.strengths}
                    </p>
                  </div>
                )}
                {formData?.areasForDevelopment && (
                  <div>
                    <span className="font-semibold text-neutral-secondary block mb-1">
                      Areas for Development:
                    </span>
                    <p className="text-neutral-primary font-medium whitespace-pre-wrap">
                      {formData.areasForDevelopment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );

    case "assessment_mapping":
    case "assessment_grid": {
      const unitsToRender =
        resolvedMappingUnits.length > 0
          ? resolvedMappingUnits
          : mappingData?.units || [];
      return (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-neutral-primary uppercase tracking-wide">
              National Occupational Standards &amp; Performance Criteria Mapping
            </h4>
            {isLoadingMapping && unitsToRender.length === 0 ? (
              <p className="text-xs text-gray-400 italic bg-[#F8F9FA] p-4 rounded-xl">
                Loading assessment mapping...
              </p>
            ) : unitsToRender.length > 0 ? (
              <div className="flex flex-col gap-5">
                {unitsToRender.map(
                  (unit: AssessmentMappingUnit, idx: number) => (
                    <div
                      key={unit.id || idx}
                      className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-4 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/70 pb-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-bold text-[#8A1538] uppercase tracking-wider">
                            {unit.referenceNumber || `Unit #${idx + 1}`}
                          </span>
                          <span className="font-bold text-neutral-primary text-sm sm:text-base">
                            {unit.title}
                          </span>
                        </div>
                        {Array.isArray(unit.assessmentMethods) &&
                          unit.assessmentMethods.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {unit.assessmentMethods.map(
                                (method: string, mIdx: number) => (
                                  <span
                                    key={mIdx}
                                    className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 capitalize"
                                  >
                                    {String(method).replace(/_/g, " ")}
                                  </span>
                                ),
                              )}
                            </div>
                          )}
                      </div>

                      {Array.isArray(unit.learningObjectives) &&
                      unit.learningObjectives.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          {unit.learningObjectives.map(
                            (
                              lo: AssessmentMappingLearningObjective,
                              loIdx: number,
                            ) => (
                              <div
                                key={lo.code || loIdx}
                                className="bg-white rounded-xl p-3.5 sm:p-4 border border-gray-100 flex flex-col gap-2.5"
                              >
                                <div className="font-bold text-neutral-primary text-xs sm:text-sm">
                                  {lo.code
                                    ? `${lo.code}: `
                                    : `LO ${loIdx + 1}: `}
                                  {lo.text || lo.title || "Learning Objective"}
                                </div>

                                {Array.isArray(lo.performanceCriteria) &&
                                lo.performanceCriteria.length > 0 ? (
                                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                                    <table className="w-full text-left text-xs border-collapse">
                                      <thead>
                                        <tr className="bg-[#F8F9FA] text-neutral-secondary font-bold border-b border-gray-200">
                                          <th className="p-2.5 w-20">Code</th>
                                          <th className="p-2.5">
                                            Performance Criterion
                                          </th>
                                          <th className="p-2.5 w-48">
                                            Evidence Types
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {lo.performanceCriteria.map(
                                          (
                                            pc: AssessmentMappingPerformanceCriterion,
                                            pcIdx: number,
                                          ) => (
                                            <tr
                                              key={pc.code || pcIdx}
                                              className="hover:bg-gray-50/50"
                                            >
                                              <td className="p-2.5 font-bold text-neutral-secondary whitespace-nowrap">
                                                {pc.code ||
                                                  `${loIdx + 1}.${pcIdx + 1}`}
                                              </td>
                                              <td className="p-2.5 text-neutral-primary font-medium">
                                                {pc.text || "—"}
                                              </td>
                                              <td className="p-2.5">
                                                {Array.isArray(
                                                  pc.evidenceTypes,
                                                ) &&
                                                pc.evidenceTypes.length > 0 ? (
                                                  <div className="flex flex-wrap gap-1">
                                                    {pc.evidenceTypes.map(
                                                      (
                                                        et: string,
                                                        etIdx: number,
                                                      ) => (
                                                        <span
                                                          key={etIdx}
                                                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize"
                                                        >
                                                          {String(et).replace(
                                                            /_/g,
                                                            " ",
                                                          )}
                                                        </span>
                                                      ),
                                                    )}
                                                  </div>
                                                ) : (
                                                  <span className="text-gray-400 italic">
                                                    —
                                                  </span>
                                                )}
                                              </td>
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">
                                    No performance criteria listed.
                                  </p>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">
                          No learning objectives listed for this unit.
                        </p>
                      )}

                      {/* Claimed General Evidence tagged to this unit */}
                      {Array.isArray(unit.evidence) &&
                        unit.evidence.length > 0 && (
                          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                            <span className="text-[11px] font-bold text-neutral-secondary uppercase tracking-wider">
                              Claimed Evidence ({unit.evidence.length})
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {unit.evidence.map(
                                (
                                  ev: AssessmentMappingEvidenceItem,
                                  evIdx: number,
                                ) => (
                                  <div
                                    key={ev.id || evIdx}
                                    className="p-2.5 rounded-xl bg-white border border-gray-100 flex items-center justify-between gap-2"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-xs font-bold text-neutral-primary truncate">
                                        {ev.documentName}
                                      </span>
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                                        {ev.evidenceType}
                                      </span>
                                    </div>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                                        ev.reviewStatus === "approved"
                                          ? "bg-emerald-100 text-emerald-800"
                                          : ev.reviewStatus === "rejected"
                                            ? "bg-rose-100 text-rose-800"
                                            : "bg-amber-100 text-amber-800"
                                      }`}
                                    >
                                      {ev.reviewStatus || "pending"}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ),
                )}
              </div>
            ) : Array.isArray(formData?.units) && formData.units.length > 0 ? (
              <div className="flex flex-col gap-3.5">
                {formData.units.map((unit: any, idx: number) => (
                  <div
                    key={unit.id || idx}
                    className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-primary text-sm">
                        Unit #{idx + 1}:{" "}
                        {unit.occupationalUnit || "Untitled Unit"}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                          unit.status === "Satisfied"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {unit.status || "Satisfied"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {unit.performanceCriteria && (
                        <div>
                          <span className="font-semibold text-neutral-secondary block mb-0.5">
                            Performance Criteria:
                          </span>
                          <p className="text-neutral-primary font-medium">
                            {unit.performanceCriteria}
                          </p>
                        </div>
                      )}
                      {unit.typeOfEvidence && (
                        <div>
                          <span className="font-semibold text-neutral-secondary block mb-0.5">
                            Type of Evidence:
                          </span>
                          <p className="text-neutral-primary font-medium">
                            {unit.typeOfEvidence}
                          </p>
                        </div>
                      )}
                    </div>

                    {unit.description && (
                      <div className="text-xs">
                        <span className="font-semibold text-neutral-secondary block mb-0.5">
                          Description:
                        </span>
                        <p className="text-neutral-primary font-medium whitespace-pre-wrap">
                          {unit.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic bg-[#F8F9FA] p-4 rounded-xl">
                No competency units mapped yet.
              </p>
            )}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
