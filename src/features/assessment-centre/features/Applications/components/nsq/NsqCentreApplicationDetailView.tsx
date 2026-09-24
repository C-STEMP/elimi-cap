"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FiCheck,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiX,
  FiUserPlus,
} from "react-icons/fi";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import { TransactionReceiptModal } from "@/features/assessment-centre/features/Payment/components/TransactionReceiptModal";
import type { PaymentTransaction } from "@/features/assessment-centre/types";
import { Avatar } from "@/src/components/ui/avatar";
import { ConfirmNsqDecisionModal } from "./ConfirmNsqDecisionModal";
import { AssignNsqAssessorModal, type NsqRoleType } from "./AssignNsqAssessorModal";
import { useGetCentreAssessors } from "@/src/features/shared/centre/hooks";
import {
  useGetTradeDetail,
  useGetUnitsByTrade,
  useGetEvidenceTypesByTrade,
  useGetCentres,
  useGetSectors,
} from "@/src/features/shared/reference/hooks";
import {
  useGetInductionForm,
  useGetDirectObservations,
  useGetApplicationStages,
  useGetPaymentQuote,
  useGetApplicationReceipt,
  useGetUnitCriteria,
  APPLICATION_DETAIL_REFRESH_INTERVAL_MS,
} from "@/src/features/shared/applications/hooks";
import { formatCurrency } from "@/src/utils/currency";
import { NsqAssessorObservationFormsView } from "@/src/features/assessor/features/Applications/components/nsq/NsqAssessorObservationFormsView";
import { CentreIqamFormViewer } from "./CentreIqamFormViewer";
import { getNsqScopedUnits } from "@/src/features/shared/applications/utils/nsqUnits";
import type { IqamToolId } from "@/src/features/assessor/features/iqam/types/iqam.types";
import type { ApplicationDetail, NsqCriterion } from "@/src/features/shared/applications/api/types";
import { useModalDraft, useUrlModal } from "@/src/lib/hooks/usePersistentModal";
import { NSQ_ASSIGN_ASSESSOR_MODAL, NSQ_DECISION_MODAL } from "@/src/lib/modal-keys";

const NSQ_PROGRESS_STEPS = [
  { key: "induction", label: "Induction Form" },
  { key: "regular_assessment", label: "QAA" },
  { key: "internal_verification", label: "IQA" },
  { key: "external_verification", label: "Awarding Body" },
  { key: "certification", label: "Certification" },
] as const;

const STAGE_ORDER = [
  "application_form",
  "payment",
  "induction",
  "regular_assessment",
  "internal_verification",
  "external_verification",
  "certification",
];

interface NsqCentreApplicationDetailViewProps {
  application: ApplicationDetail | any;
  onBack: () => void;
  selectedUnitNumber?: string | null;
  onSelectUnit?: (unitNo: string | null) => void;
}

interface QualificationUnitItem {
  id: string;
  unitNo: string;
  title: string;
  status: "Not Started" | "In Progress" | "Completed" | "Approved";
  criteriaApproved?: number;
  criteriaTotal?: number;
}

const IQAM_FORMS_LIST: { id: IqamToolId; title: string }[] = [
  { id: "CON/02/IQAM", title: "Internal Verification Sampling Plan" },
  { id: "CON/03/IQAM", title: "Internal Verification Sampling Record" },
  { id: "CON/04/IQAM", title: "Comprehensive Internal Verifier Report Form" },
  { id: "CON/05/IQAM", title: "IV Observation & Questioning Checklist" },
  { id: "CON/06/IQAM", title: "Final Portfolio / Award Report Form" },
];

interface CentreUnitEvidenceItem {
  id: string;
  title: string;
  status: "approved" | "rejected" | "in_review";
  feedback?: string | null;
}

interface CentreUnitCriterion {
  code: string;
  description: string;
  evidence: CentreUnitEvidenceItem | null;
}

interface CentreUnitLearningOutcome {
  id: string;
  title: string;
  criteria: CentreUnitCriterion[];
}

// Groups the real per-criterion evidence thread (GET /applications/{id}/units/{unitId}/criteria)
// into LO -> PC cards for the read-only centre view. Only `latest` is shown
// per criterion — per the backend contract it's the single live row, and
// `history` is already-superseded submissions (same rule applied on the
// candidate/assessor evidence views).
function groupCriteriaForCentreView(
  criteria: NsqCriterion[],
): CentreUnitLearningOutcome[] {
  const groups: Record<string, { title: string; criteria: CentreUnitCriterion[] }> = {};

  criteria.forEach((crit) => {
    const loKey = crit.learningObjectiveCode || "LO 1";
    const loTitle = crit.learningObjectiveText
      ? `${loKey}: ${crit.learningObjectiveText}`
      : loKey;

    if (!groups[loKey]) {
      groups[loKey] = { title: loTitle, criteria: [] };
    }

    const evidence: CentreUnitEvidenceItem | null = crit.latest
      ? {
          id: crit.latest.id,
          title:
            crit.latest.evidenceType === "WP"
              ? "Work Product(WP)"
              : `${crit.latest.evidenceType} Evidence`,
          status:
            crit.latest.reviewStatus === "approved"
              ? "approved"
              : crit.latest.reviewStatus === "rejected"
                ? "rejected"
                : "in_review",
          feedback: crit.latest.reviewComment || crit.latest.iqaReviewComment,
        }
      : null;

    groups[loKey].criteria.push({
      code: crit.code.startsWith("PC") ? crit.code : `PC ${crit.code}`,
      description: crit.text || `Demonstrate performance standard for ${crit.code}`,
      evidence,
    });
  });

  return Object.keys(groups).map((key, idx) => ({
    id: `lo-${idx + 1}`,
    title: groups[key].title,
    criteria: groups[key].criteria,
  }));
}

export const NsqCentreApplicationDetailView: React.FC<
  NsqCentreApplicationDetailViewProps
> = ({ application, onBack, selectedUnitNumber, onSelectUnit }) => {
  const router = useRouter();
  const params = useParams();
  const effectiveAppId = application?.id || (params?.id as string) || "";

  // NSQ Backend Queries
  const { data: inductionForm } = useGetInductionForm(effectiveAppId);
  const { data: directObservationsData } = useGetDirectObservations(
    effectiveAppId,
  );
  const rawSessions =
    (directObservationsData as any)?.sessions ||
    (directObservationsData as any)?.items ||
    (application as any)?.nsq?.directObservationSessions ||
    [];
  const sortedSessions = rawSessions.slice().sort((a: any, b: any) => {
    const timeA = new Date(a.createdAt || a.scheduledAt || 0).getTime();
    const timeB = new Date(b.createdAt || b.scheduledAt || 0).getTime();
    return timeB - timeA;
  });
  const liveObservation = sortedSessions[0];

  // Unit navigation state (internal + controlled via props)
  const [internalUnitNumber, setInternalUnitNumber] = useState<string | null>(
    null,
  );
  const activeUnitNumber =
    selectedUnitNumber !== undefined ? selectedUnitNumber : internalUnitNumber;

  const handleSelectUnit = (unitNo: string | null) => {
    setInternalUnitNumber(unitNo);
    onSelectUnit?.(unitNo);
  };

  // Accordion state for Unit Detail View
  const [expandedLos, setExpandedLos] = useState<Record<string, boolean>>({
    "lo-1": true,
  });
  const [expandedPcs, setExpandedPcs] = useState<Record<string, boolean>>({
    "pc-1-1": true,
  });

  const toggleLo = (id: string) => {
    setExpandedLos((prev) => (prev[id] ? {} : { [id]: true }));
  };

  const togglePc = (id: string) => {
    setExpandedPcs((prev) => (prev[id] ? {} : { [id]: true }));
  };

  // Local approval state for instant UI update
  const [localStatus, setLocalStatus] = useState<string | null>(null);

  // Decision Modal State
  // Open flag lives in the URL (and the decision in the modal's draft) so the
  // modal survives the page reloading while the user is away.
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useUrlModal(NSQ_DECISION_MODAL);
  const [decisionType, setDecisionType] = useModalDraft<"approve" | "reject">(
    NSQ_DECISION_MODAL,
    "decision",
    "approve",
  );
  const decisionModal = { isOpen: isDecisionModalOpen, decision: decisionType };
  const setDecisionModal = (next: typeof decisionModal) => {
    setIsDecisionModalOpen(next.isOpen);
    setDecisionType(next.decision);
  };

  // Assessor/Verifier Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useUrlModal(NSQ_ASSIGN_ASSESSOR_MODAL);
  const [assignRoleType, setAssignRoleType] = useModalDraft<NsqRoleType>(
    NSQ_ASSIGN_ASSESSOR_MODAL,
    "roleType",
    "QAA",
  );
  const assignModal = { isOpen: isAssignModalOpen, roleType: assignRoleType };
  const setAssignModal = (next: typeof assignModal) => {
    setIsAssignModalOpen(next.isOpen);
    setAssignRoleType(next.roleType);
  };

  // Fetch centre assessors roster to resolve photos and details if not attached directly to application
  const { data: centreAssessors = [] } = useGetCentreAssessors({
    status: "all",
  });

  const extractPhoto = (obj: any): string | undefined => {
    if (!obj) return undefined;
    return (
      obj.photo?.url ||
      obj.photoUrl ||
      obj.avatar ||
      (typeof obj.photoAssetId === "string" ? obj.photoAssetId : undefined) ||
      undefined
    );
  };

  const isSameAssessor = (
    a?: { id?: string; name?: string } | null,
    b?: { id?: string; name?: string } | null,
  ): boolean => {
    if (!a || !b) return false;
    if (a.id && b.id && a.id === b.id) return true;
    const nameA = a.name?.trim().toLowerCase();
    const nameB = b.name?.trim().toLowerCase();
    return Boolean(nameA && nameB && nameA === nameB);
  };

  // Assigned Staff State — no assessor until either assigned this session or
  // hydrated from real backend data below.
  const [assignedAssessor, setAssignedAssessor] = useState<{
    id: string;
    name: string;
    email?: string;
    qualification?: string;
    photoUrl?: string;
  } | null>(null);

  const [assignedIqa, setAssignedIqa] = useState<{
    id: string;
    name: string;
    email?: string;
    qualification?: string;
    photoUrl?: string;
  } | null>(null);

  // Hydrate the assigned QAA / Unit Assessor and Internal Verifier from the real ApplicationDetail
  useEffect(() => {
    const unitAssessor =
      (application as any)?.unitAssessor ||
      (application as any)?.facilitator;
    if (unitAssessor) {
      const qaaPhoto = extractPhoto(unitAssessor);
      setAssignedAssessor((prev) => ({
        id: unitAssessor.assessorId || unitAssessor.id,
        name: unitAssessor.name,
        qualification:
          unitAssessor.qualifications?.join(", ") || "QAA Assessor",
        photoUrl: qaaPhoto || prev?.photoUrl,
      }));
    }
  }, [
    (application as any)?.unitAssessor,
    (application as any)?.facilitator,
  ]);

  useEffect(() => {
    if (application?.internalVerifier) {
      const iv = application.internalVerifier as any;
      const unitAssessor =
        (application as any)?.unitAssessor ||
        (application as any)?.facilitator;
      const same = isSameAssessor(
        { id: iv.assessorId, name: iv.name },
        unitAssessor
          ? { id: unitAssessor.assessorId || unitAssessor.id, name: unitAssessor.name }
          : null,
      );

      const fallbackPhoto = same ? extractPhoto(unitAssessor) : undefined;
      const directPhoto = extractPhoto(iv);

      setAssignedIqa((prev) => ({
        id: iv.assessorId,
        name: iv.name,
        qualification: "IQAM Verifier",
        photoUrl: directPhoto || fallbackPhoto || prev?.photoUrl,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    application?.internalVerifier,
    (application as any)?.unitAssessor,
    (application as any)?.facilitator,
  ]);

  // Robustly resolve Assessor photo across direct state, unitAssessor, same-person link, and roster
  const resolvedAssessorPhoto = useMemo(() => {
    if (assignedAssessor?.photoUrl) return assignedAssessor.photoUrl;

    const unitAssessor =
      (application as any)?.unitAssessor ||
      (application as any)?.facilitator;
    const directPhoto = extractPhoto(unitAssessor);
    if (directPhoto) return directPhoto;

    const qaaObj = assignedAssessor || (unitAssessor ? {
      id: unitAssessor.assessorId || unitAssessor.id,
      name: unitAssessor.name,
    } : null);

    const iqaObj = assignedIqa || (application?.internalVerifier ? {
      id: application.internalVerifier.assessorId,
      name: application.internalVerifier.name,
    } : null);

    // If same person as IQA, borrow IQA's photo
    if (isSameAssessor(qaaObj, iqaObj)) {
      const iqaPhoto =
        assignedIqa?.photoUrl ||
        extractPhoto(application?.internalVerifier);
      if (iqaPhoto) return iqaPhoto;
    }

    // Resolve from centreAssessors directory
    if (qaaObj) {
      const matched = centreAssessors.find(
        (a) =>
          (qaaObj.id && (a.id === qaaObj.id || (a as any).assessorId === qaaObj.id || (a as any).userId === qaaObj.id)) ||
          (qaaObj.name && a.name?.trim().toLowerCase() === qaaObj.name.trim().toLowerCase()),
      );
      const matchedPhoto = extractPhoto(matched);
      if (matchedPhoto) return matchedPhoto;
    }

    if (isSameAssessor(qaaObj, iqaObj) && iqaObj) {
      const matchedIqa = centreAssessors.find(
        (a) =>
          (iqaObj.id && (a.id === iqaObj.id || (a as any).assessorId === iqaObj.id || (a as any).userId === iqaObj.id)) ||
          (iqaObj.name && a.name?.trim().toLowerCase() === iqaObj.name.trim().toLowerCase()),
      );
      const matchedIqaPhoto = extractPhoto(matchedIqa);
      if (matchedIqaPhoto) return matchedIqaPhoto;
    }

    return undefined;
  }, [
    assignedAssessor,
    application?.unitAssessor,
    application?.facilitator,
    assignedIqa,
    application?.internalVerifier,
    centreAssessors,
  ]);

  // Robustly resolve IQA photo across direct state, internalVerifier, same-person link, and roster
  const resolvedIqaPhoto = useMemo(() => {
    if (assignedIqa?.photoUrl) return assignedIqa.photoUrl;

    const ivRaw = application?.internalVerifier;
    const directPhoto = extractPhoto(ivRaw);
    if (directPhoto) return directPhoto;

    const iqaObj = assignedIqa || (ivRaw ? {
      id: ivRaw.assessorId,
      name: ivRaw.name,
    } : null);

    const unitAssessor =
      (application as any)?.unitAssessor ||
      (application as any)?.facilitator;
    const qaaObj = assignedAssessor || (unitAssessor ? {
      id: unitAssessor.assessorId || unitAssessor.id,
      name: unitAssessor.name,
    } : null);

    // If same person as QAA Assessor, borrow QAA's photo
    if (isSameAssessor(iqaObj, qaaObj)) {
      const qaaPhoto =
        assignedAssessor?.photoUrl ||
        extractPhoto(unitAssessor);
      if (qaaPhoto) return qaaPhoto;
    }

    // Resolve from centreAssessors directory
    if (iqaObj) {
      const matched = centreAssessors.find(
        (a) =>
          (iqaObj.id && (a.id === iqaObj.id || (a as any).assessorId === iqaObj.id || (a as any).userId === iqaObj.id)) ||
          (iqaObj.name && a.name?.trim().toLowerCase() === iqaObj.name.trim().toLowerCase()),
      );
      const matchedPhoto = extractPhoto(matched);
      if (matchedPhoto) return matchedPhoto;
    }

    if (isSameAssessor(iqaObj, qaaObj) && qaaObj) {
      const matchedQaa = centreAssessors.find(
        (a) =>
          (qaaObj.id && (a.id === qaaObj.id || (a as any).assessorId === qaaObj.id || (a as any).userId === qaaObj.id)) ||
          (qaaObj.name && a.name?.trim().toLowerCase() === qaaObj.name.trim().toLowerCase()),
      );
      const matchedQaaPhoto = extractPhoto(matchedQaa);
      if (matchedQaaPhoto) return matchedQaaPhoto;
    }

    return undefined;
  }, [
    assignedIqa,
    application?.internalVerifier,
    assignedAssessor,
    application?.unitAssessor,
    application?.facilitator,
    centreAssessors,
  ]);

  // Modals for induction, receipt & IQAM form viewer
  const [isInductionModalOpen, setIsInductionModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedIqamTool, setSelectedIqamTool] = useState<IqamToolId | null>(null);
  const [isObservationFormOpen, setIsObservationFormOpen] = useState<boolean>(false);

  // Real workflow stages — GET /applications/{id}/stages.
  const { data: stagesData } = useGetApplicationStages(effectiveAppId, {
    refetchInterval: APPLICATION_DETAIL_REFRESH_INTERVAL_MS,
  });
  const applicationFormStage = stagesData?.find((s) => s.stageKey === "application_form");
  const paymentStage = stagesData?.find((s) => s.stageKey === "payment");

  // Resolve ID helper
  const isRawId = (str?: string) => {
    if (!str) return false;
    return /^[0-9A-Z]{20,}$/.test(str) || /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(str);
  };

  const tradeId =
    application?.tradeId ||
    (typeof application?.trade === "object" ? application?.trade?.id : null) ||
    (typeof application?.trade === "string" && isRawId(application?.trade)
      ? application?.trade
      : "") ||
    "";

  const sectorId =
    application?.sectorId ||
    (typeof application?.sector === "object" ? application?.sector?.id : null) ||
    (typeof application?.sector === "string" && isRawId(application?.sector)
      ? application?.sector
      : "") ||
    "";

  // Dynamic reference data
  const { data: tradeDetail } = useGetTradeDetail(tradeId);
  const { data: remoteUnits = [], isLoading: isLoadingUnits } = useGetUnitsByTrade(tradeId);
  const { data: remoteEvidenceTypes = [] } = useGetEvidenceTypesByTrade(tradeId);
  const { data: remoteCentres = [] } = useGetCentres();
  const { data: remoteSectors = [] } = useGetSectors();

  // Resolved Names
  const resolvedTradeName =
    tradeDetail?.name ||
    application?.trade?.name ||
    (typeof application?.trade === "string" && !isRawId(application?.trade)
      ? application?.trade
      : "") ||
    "Masonry";

  const resolvedSectorName =
    remoteSectors.find((s) => s.id === sectorId)?.name ||
    application?.sector?.name ||
    (typeof application?.sector === "string" && !isRawId(application?.sector)
      ? application?.sector
      : "") ||
    "Construction & Building";

  const resolvedCentreName =
    remoteCentres.find((c) => c.id === application?.centreId)?.name ||
    application?.centre?.name ||
    "—";

  const candidateName =
    application?.candidate?.name ||
    (application?.candidate?.firstName
      ? `${application.candidate.firstName} ${
          application.candidate.lastName || ""
        }`.trim()
      : application?.user?.name || application?.candidateName || "Candidate");

  const candidateEmail =
    (application as any)?.personalInformation?.contactInformation?.emailAddress ||
    application?.candidate?.email ||
    application?.user?.email ||
    "—";
  const candidatePhoneNumber = (application as any)?.personalInformation?.contactInformation
    ?.phoneNumber;
  const candidatePhone = candidatePhoneNumber?.number
    ? `${candidatePhoneNumber.countryCode || ""} ${candidatePhoneNumber.number}`.trim()
    : application?.candidate?.phone || application?.user?.phone || "—";
  const candidatePhoto =
    application?.candidate?.photo?.url || application?.candidate?.photoUrl || null;

  const wishedQualificationLevel = (application as any)?.nsq?.wishedQualificationLevel;
  const levelName = wishedQualificationLevel
    ? `Level ${wishedQualificationLevel.level}`
    : (tradeDetail as any)?.level ||
      (typeof application?.trade === "object" && (application.trade as any)?.level) ||
      "";

  const evidenceTypesText =
    remoteEvidenceTypes.length > 0
      ? (remoteEvidenceTypes as any[])
          .map((e: any) =>
            typeof e === "string" ? e : e?.code || e?.name || "",
          )
          .filter(Boolean)
          .slice(0, 5)
          .join("/")
      : "—";

  // Units list — the candidate's induction-picked units from GET
  // /applications/{id} `nsq.units` (real per-unit evidence progress), over the
  // generic trade catalogue, which has no progress data.
  const nsqUnitsForLevel = getNsqScopedUnits(application?.nsq, inductionForm);

  const qualificationCode =
    nsqUnitsForLevel?.[0]?.referenceNumber ||
    remoteUnits[0]?.referenceNumber ||
    (tradeDetail?.activeNosDocument as any)?.qualificationLevels?.[0]?.slug ||
    (tradeDetail?.activeNosDocument as any)?.title ||
    "—";

  const unitsList: QualificationUnitItem[] = nsqUnitsForLevel?.length
    ? nsqUnitsForLevel.map((u: any) => ({
        id: u.id,
        unitNo: u.referenceNumber,
        title: u.title,
        status:
          u.status === "approved"
            ? "Approved"
            : u.status === "in_progress"
              ? "In Progress"
              : "Not Started",
        criteriaApproved: u.criteriaApproved,
        criteriaTotal: u.criteriaTotal,
      }))
    : remoteUnits.length > 0
      ? (remoteUnits as any[]).map((u: any, i: number) => ({
          id: u.id,
          unitNo: u.referenceNumber || u.code || `UNIT ${i + 1}`,
          title: u.title || u.name || `Unit ${i + 1}`,
          status: "Not Started" as const,
        }))
      : [];

  // Real per-criterion evidence for the unit currently drilled into — GET
  // /applications/{id}/units/{unitId}/criteria. This view is read-only for
  // the centre (evidence review is the QAA/assessor's job), it just shows
  // the real submitted evidence instead of a fixed mock LO/PC layout.
  const activeUnit = unitsList.find((u) => u.unitNo === activeUnitNumber) || null;
  const { data: unitCriteriaData, isLoading: isLoadingUnitCriteria } = useGetUnitCriteria(
    effectiveAppId,
    activeUnit?.id || "",
    { enabled: Boolean(effectiveAppId && activeUnit?.id) },
  );
  const unitLearningOutcomes = unitCriteriaData?.criteria
    ? groupCriteriaForCentreView(unitCriteriaData.criteria)
    : [];

  // Compute status — application_form stage is the source of truth;
  // localStatus is only an instant-UI override until the stages query refetches.
  const currentStatus = localStatus || application?.status || "draft";

  const isApproved =
    localStatus === "approved" ||
    applicationFormStage?.status === "successful" ||
    (applicationFormStage?.status as string) === "approved" ||
    currentStatus === "certified" ||
    currentStatus === "approved" ||
    paymentStage?.status === "successful" ||
    (application?.currentStageKey &&
      !["application_form", "application_review", "draft", "submitted"].includes(
        application.currentStageKey,
      ));

  const isRejected =
    localStatus === "rejected" ||
    applicationFormStage?.status === "rejected" ||
    currentStatus === "rejected";

  const isSubmitted = Boolean(
    (application as any)?.submittedAt ||
      (stagesData && stagesData.length > 0) ||
      (application?.currentStageKey && application.currentStageKey !== "draft") ||
      currentStatus === "submitted" ||
      currentStatus === "in_progress" ||
      currentStatus === "under_review",
  );

  const isExplicitDraft =
    currentStatus === "draft" &&
    !(application as any)?.submittedAt &&
    (!stagesData || stagesData.length === 0) &&
    (!application?.currentStageKey || application.currentStageKey === "draft");

  const isPending = !isApproved && !isRejected && !isExplicitDraft;
  const isDraft = !isApproved && !isRejected && isExplicitDraft;

  // Payment — GET /applications/{id}/stages (payment row), readable by centre
  // staff the same as the receipt/payment-quote endpoints.
  const isPaymentPaid = paymentStage?.status === "successful";
  const { data: paymentQuote } = useGetPaymentQuote(effectiveAppId, {
    enabled: Boolean(effectiveAppId && !isPaymentPaid),
  });
  const { data: receiptData } = useGetApplicationReceipt(effectiveAppId, {
    enabled: Boolean(effectiveAppId && isPaymentPaid),
  });

  const paymentAmountText = receiptData?.amount?.amountMinorUnits
    ? formatCurrency(receiptData.amount.amountMinorUnits, receiptData.amount.currency)
    : paymentQuote?.amountMinorUnits
      ? formatCurrency(paymentQuote.amountMinorUnits, paymentQuote.currency)
      : paymentStage?.amountMinorUnits
        ? formatCurrency(paymentStage.amountMinorUnits, paymentStage.currency || "NGN")
        : "—";

  // Assessment Progress timeline nodes, resolved against the real stage rows.
  const effectiveStageKey =
    application?.currentStageKey ||
    (application as any)?.stageKey;


  // Only the application's current stage decides this. Stage rows can change
  // status per unit (e.g. after one unit is approved), which would wrongly
  // show the application as in IQA before the assessor hands it over.
  const isInternalVerificationStage = Boolean(
    effectiveStageKey &&
      STAGE_ORDER.indexOf(effectiveStageKey) >= STAGE_ORDER.indexOf("internal_verification"),
  );

  const progressSteps = useMemo(
    () =>
      NSQ_PROGRESS_STEPS.map((step) => ({
        ...step,
        status: stagesData?.find((s) => s.stageKey === step.key)?.status ?? "not_started",
      })),
    [stagesData],
  );
  const completedStepsCount = progressSteps.filter((s) => s.status === "successful").length;
  const progressPercent =
    progressSteps.length > 1 ? (completedStepsCount / (progressSteps.length - 1)) * 100 : 0;

  // Receipt transaction object — GET /applications/{id}/receipt.
  const receiptTransaction: PaymentTransaction = {
    id: receiptData?.paymentId || application?.id || "",
    candidateName,
    assessmentType: levelName
      ? `NSQ ${resolvedTradeName} (${levelName})`
      : `NSQ ${resolvedTradeName}`,
    amountPaid: paymentAmountText,
    status: isPaymentPaid ? "Paid" : "Pending",
    date: receiptData?.paidAt
      ? new Date(receiptData.paidAt).toLocaleDateString("en-GB")
      : application?.submittedAt
        ? new Date(application.submittedAt).toLocaleDateString("en-GB")
        : "—",
    transactionId:
      receiptData?.paymentId ||
      `TX-NSQ-${(application?.id || "001").replace(/-/g, "").slice(0, 8).toUpperCase()}`,
    paymentMethod: receiptData?.provider || "Paystack",
    description: "NSQ Standard Assessment Fee Payment",
  };

  const handleDecisionSuccess = (decision: "approve" | "reject") => {
    setLocalStatus(decision === "approve" ? "approved" : "rejected");
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Column */}
        {activeUnitNumber ? (
          /* Unit Detail View — real per-criterion evidence from
             GET /applications/{id}/units/{unitId}/criteria (read-only for
             the centre; evidence review belongs to the QAA/assessor). */
          <div className="lg:col-span-8 flex flex-col gap-4">
            {isLoadingUnitCriteria ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-3 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-64" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              ))
            ) : unitLearningOutcomes.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 text-sm text-gray-400 italic">
                No criteria found for this unit yet.
              </div>
            ) : (
              unitLearningOutcomes.map((lo) => (
                <div
                  key={lo.id}
                  className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4"
                >
                  <div
                    onClick={() => toggleLo(lo.id)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <h3 className="text-base font-bold text-gray-900">{lo.title}</h3>
                    {expandedLos[lo.id] ? (
                      <FiChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <FiChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  {expandedLos[lo.id] && (
                    <div className="flex flex-col gap-3 pt-1">
                      {lo.criteria.map((pc) => {
                        const pcKey = `${lo.id}-${pc.code}`;
                        const isExpanded = Boolean(expandedPcs[pcKey]);
                        return (
                          <div
                            key={pcKey}
                            className="border border-gray-100 bg-[#F8F9FA] rounded-xl p-4 flex flex-col gap-3"
                          >
                            <div
                              onClick={() => togglePc(pcKey)}
                              className="flex items-center justify-between cursor-pointer select-none gap-2"
                            >
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <span className="px-2 py-0.5 bg-[#FDF2F4] text-[#E11D48] font-bold text-xs rounded-md shrink-0">
                                  {pc.code}
                                </span>
                                <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                  {pc.description}
                                </span>
                              </div>
                              {isExpanded ? (
                                <FiChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                              ) : (
                                <FiChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                              )}
                            </div>

                            {isExpanded && (
                              pc.evidence ? (
                                <div className="flex flex-col gap-3 pt-1">
                                  {pc.evidence.status === "approved" ? (
                                    <div className="rounded-xl p-3.5 flex items-center justify-between border border-[#A7F3D0] bg-[#ECFDF5] gap-3">
                                      <div className="flex items-center gap-2 text-xs font-semibold text-[#065F46] min-w-0">
                                        <FiFileText className="w-4 h-4 text-[#059669] shrink-0" />
                                        <span className="truncate">{pc.evidence.title}</span>
                                      </div>
                                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#10753A] text-white flex items-center gap-1.5 shrink-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                        <span>Approved</span>
                                      </span>
                                    </div>
                                  ) : pc.evidence.status === "rejected" ? (
                                    <div className="rounded-xl p-3.5 flex flex-col gap-2.5 border border-[#FECDD3] bg-[#FFF1F2]">
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-[#9F1239] min-w-0">
                                          <FiFileText className="w-4 h-4 text-[#E11D48] shrink-0" />
                                          <span className="truncate">{pc.evidence.title}</span>
                                        </div>
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DC2626] text-white flex items-center gap-1.5 shrink-0">
                                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                          <span>Rejected</span>
                                        </span>
                                      </div>
                                      {pc.evidence.feedback && (
                                        <div className="bg-white rounded-lg p-3 text-xs text-[#E11D48] font-normal leading-relaxed">
                                          {pc.evidence.feedback}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="rounded-xl p-3.5 flex items-center justify-between border border-[#FDE68A] bg-[#FFFBEB] gap-3">
                                      <div className="flex items-center gap-2 text-xs font-semibold text-[#92400E] min-w-0">
                                        <FiFileText className="w-4 h-4 text-[#D97706] shrink-0" />
                                        <span className="truncate">{pc.evidence.title}</span>
                                      </div>
                                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D97706] text-white flex items-center gap-1.5 shrink-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                        <span>In Review</span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="pt-2 text-xs text-gray-400 italic">
                                  No evidence submitted for this criterion yet.
                                </div>
                              )
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="lg:col-span-8 flex flex-col gap-5">
          {/* 1. Assessment Progress Stepper Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-gray-100 flex flex-col gap-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Assessment Progress
            </h3>

            {/* Steps Progress — driven by GET /applications/{id}/stages.
                Application Form and Payment have their own cards below, so
                the timeline covers the remaining five workflow stages. */}
            <div className="relative flex items-start justify-between w-full px-4 sm:px-10">
              {/* Connector line background */}
              <div className="absolute left-8 right-8 top-3.5 h-[1.5px] bg-gray-200 z-0" />
              <div
                className="absolute left-8 top-3.5 h-[1.5px] z-0 bg-[#10b981] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />

              {progressSteps.map((step) => {
                const isComplete = step.status === "successful";
                const isRejectedStep = step.status === "rejected";
                const isActive =
                  !isComplete && !isRejectedStep && step.status !== "not_started";

                return (
                  <div
                    key={step.key}
                    className="flex flex-col items-center gap-2.5 z-10 flex-1 min-w-0 px-0.5"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 ${
                        isComplete
                          ? "bg-[#10b981] shadow-xs"
                          : isRejectedStep
                            ? "bg-red-500 shadow-xs"
                            : isActive
                              ? "bg-[#fbab2a] shadow-xs"
                              : "border border-gray-400 bg-white"
                      }`}
                    >
                      {(isComplete || isRejectedStep || isActive) && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span
                      className={`w-full text-[10px] sm:text-xs text-center font-medium leading-tight wrap-break-word ${
                        isComplete
                          ? "text-[#10b981] font-semibold"
                          : isRejectedStep
                            ? "text-red-500 font-semibold"
                            : isActive
                              ? "text-[#fbab2a] font-semibold"
                              : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Application Status Card */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <h4 className="text-base font-bold text-gray-900">
                  Application Status
                </h4>
                {isApproved ? (
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#059669]">
                    Approved
                  </span>
                ) : isRejected ? (
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                    Rejected
                  </span>
                ) : isDraft ? (
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                    Draft — Not Submitted
                  </span>
                ) : (
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706]">
                    Pending
                  </span>
                )}
              </div>

              {/* Reject / Approve actions in Pending state */}
              {isPending && (
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() =>
                      setDecisionModal({ isOpen: true, decision: "reject" })
                    }
                    className="text-[#DC2626] font-semibold text-sm hover:underline cursor-pointer transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDecisionModal({ isOpen: true, decision: "approve" })
                    }
                    className="text-[#16A34A] font-semibold text-sm hover:underline cursor-pointer transition-colors"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-gray-500 font-normal">
              {resolvedCentreName} | {resolvedSectorName} | {resolvedTradeName}
            </p>
          </div>

          {/* 3. Payment Card */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <span className="text-base sm:text-lg font-bold text-gray-900">
                  {paymentAmountText}
                </span>
                {isPaymentPaid ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#059669]">
                    Successful
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                    Not Started
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-normal">
                NSQ Standard Assessment Fee
              </span>
            </div>

            {isPaymentPaid && (
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(true)}
                className="text-sm font-semibold text-[#fbab2a] hover:text-[#e89b1f] hover:underline cursor-pointer select-none shrink-0"
              >
                Receipt
              </button>
            )}
          </div>

          {/* 4. Candidate Induction Form Card */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex items-center justify-between gap-4">
            <span className="text-sm sm:text-base font-bold text-gray-900">
              Candidate Induction Form
            </span>

            <button
              type="button"
              onClick={() => setIsInductionModalOpen(true)}
              className="text-sm font-semibold text-[#fbab2a] hover:text-[#e89b1f] hover:underline cursor-pointer select-none shrink-0"
            >
              View
            </button>
          </div>

          {/* Progressed Content: NOS Cards, Assessors, Units, IQAM Forms (Shown when payment is successful) */}
          {isPaymentPaid && (
            <>
              {/* 5. NOS Qualification & Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: NOS Qualification Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between gap-5">
                  <div className="flex flex-col gap-2">
                    <span className="self-start px-2.5 py-0.5 rounded-md bg-[#FCE7F3] text-[#BE185D] font-bold text-[10px] tracking-wide">
                      Mandatory
                    </span>
                    <h4 className="text-base font-bold text-gray-900">
                      {resolvedTradeName} National Occupational Standard
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                        QUALIFICATION CODE
                      </span>
                      <span
                        className="text-xs sm:text-sm font-bold text-gray-900 truncate mt-0.5"
                        title={qualificationCode}
                      >
                        {qualificationCode}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                        EVIDENCE TYPE
                      </span>
                      <span
                        className="text-xs sm:text-sm font-bold text-gray-900 truncate mt-0.5"
                        title={evidenceTypesText}
                      >
                        {evidenceTypesText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Sector, Score & Level Metrics */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs grid grid-cols-2 gap-4 items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      SECTOR
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900 truncate mt-0.5">
                      {resolvedSectorName}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      MANDATORY UNIT SCORE
                    </span>
                    <span className="text-base sm:text-lg font-bold text-gray-900 mt-0.5">
                      0
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      LEVEL
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5">
                      {levelName}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      OPTIONAL UNIT SCORE
                    </span>
                    <span className="text-base sm:text-lg font-bold text-gray-900 mt-0.5">
                      0
                    </span>
                  </div>
                </div>
              </div>

              {/* 6. Assessors Section */}
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">
                    Assessors
                  </h3>
                  {(assignedAssessor || assignedIqa) && (
                    <button
                      type="button"
                      onClick={() =>
                        setAssignModal({
                          isOpen: true,
                          roleType: assignedIqa ? "QAA" : "IQA",
                        })
                      }
                      className="text-xs font-semibold text-[#fbab2a] hover:text-[#e89b1f] hover:underline cursor-pointer"
                    >
                      Reassign Assessors
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left: QAA Assessor Subcard */}
                  {assignedAssessor ? (
                    <div className="bg-[#F8F9FA] rounded-xl p-5 border border-gray-100 flex items-center gap-3.5 min-h-25">
                      <Avatar
                        src={resolvedAssessorPhoto || assignedAssessor.photoUrl}
                        name={assignedAssessor.name}
                        className="w-12 h-12 shrink-0 border border-gray-200"
                        alt={assignedAssessor.name}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-gray-900 truncate">
                          {assignedAssessor.name}
                        </span>
                        <span className="text-xs text-gray-500 truncate mt-0.5">
                          QAA Assessor
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#F8F9FA] rounded-xl p-5 border border-gray-100 flex flex-col items-center text-center justify-center gap-1.5 min-h-25">
                      <span className="font-bold text-sm text-gray-800">
                        No assessor assigned
                      </span>
                      <span className="text-xs text-gray-400">
                        Assign an assessor to begin the verification process.
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setAssignModal({ isOpen: true, roleType: "QAA" })
                        }
                        className="text-[#fbab2a] hover:text-[#e89b1f] text-xs font-bold flex items-center gap-1.5 mt-2 cursor-pointer"
                      >
                        <FiUserPlus className="w-3.5 h-3.5" />
                        <span>Assign QAA assessor</span>
                      </button>
                    </div>
                  )}

                  {/* Right: IQA Verifier Subcard */}
                  {assignedIqa ? (
                    <div className="bg-[#F8F9FA] rounded-xl p-5 border border-gray-100 flex items-center gap-3.5 min-h-25">
                      <Avatar
                        src={resolvedIqaPhoto || assignedIqa.photoUrl}
                        name={assignedIqa.name}
                        className="w-12 h-12 shrink-0 border border-gray-200"
                        alt={assignedIqa.name}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-gray-900 truncate">
                          {assignedIqa.name}
                        </span>
                        <span className="text-xs text-gray-500 truncate mt-0.5">
                          IQAM Verifier
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#F8F9FA] rounded-xl p-5 border border-gray-100 flex flex-col items-center text-center justify-center gap-1.5 min-h-25">
                      <span className="font-bold text-sm text-gray-800">
                        No assessor assigned
                      </span>
                      <span className="text-xs text-gray-400">
                        Assign an assessor to begin the verification process.
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setAssignModal({ isOpen: true, roleType: "IQA" })
                        }
                        className="text-[#fbab2a] hover:text-[#e89b1f] text-xs font-bold flex items-center gap-1.5 mt-2 cursor-pointer"
                      >
                        <FiUserPlus className="w-3.5 h-3.5" />
                        <span>Assign IQA assessor</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 8. Qualification Units Card */}
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
                <h3 className="text-base font-bold text-gray-900">
                  {levelName ? `${resolvedTradeName} ${levelName}` : resolvedTradeName}
                </h3>

                <div className="flex flex-col gap-2.5">
                  {isLoadingUnits && !application?.nsq?.units?.length ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-[#F8F9FA] flex items-center justify-between gap-4 animate-pulse"
                      >
                        <div className="h-3.5 bg-gray-200 rounded w-2/3" />
                        <div className="h-5 bg-gray-200 rounded-full w-20 shrink-0" />
                      </div>
                    ))
                  ) : (
                    <>
                      {unitsList.length === 0 && (
                        <p className="text-xs text-gray-400 font-medium py-2">
                          Units will appear here once the candidate&apos;s qualification standard is loaded.
                        </p>
                      )}
                      {unitsList.map((unit, index) => {
                    const hasCounts =
                      typeof unit.criteriaApproved === "number" &&
                      typeof unit.criteriaTotal === "number";
                    const badgeText = hasCounts
                      ? `${unit.criteriaApproved}/${unit.criteriaTotal} Approved`
                      : unit.status === "Approved"
                        ? "Approved"
                        : unit.status === "In Progress"
                          ? "In Progress"
                          : "Not Started";
                    const badgeClass =
                      unit.status === "Approved"
                        ? "bg-[#10753A] text-white"
                        : unit.status === "In Progress"
                          ? "bg-[#FEF3C7] text-[#D97706]"
                          : "bg-gray-200/80 text-gray-600";
                    return (
                      <div
                        key={unit.id}
                        onClick={() => handleSelectUnit(unit.unitNo)}
                        className="p-4 rounded-xl bg-[#F8F9FA] hover:bg-gray-100/80 flex items-center justify-between gap-4 transition-all cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-xs sm:text-sm text-gray-900 uppercase shrink-0">
                            {unit.unitNo}:
                          </span>
                          <span className="text-xs sm:text-sm text-gray-600 font-normal truncate">
                            {unit.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badgeClass}`}
                          >
                            {badgeText}
                          </span>
                          <FiChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>

              {/* 9. IQAM Forms Card */}
              {isInternalVerificationStage && (
                <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
                  <h3 className="text-base font-bold text-gray-900">
                    IQAM Forms
                  </h3>

                  <div className="flex flex-col gap-2.5">
                    {IQAM_FORMS_LIST.map((form) => (
                      <div
                        key={form.id}
                        className="p-4 rounded-xl bg-[#F8F9FA] flex items-center justify-between gap-4 transition-all"
                      >
                        <span className="text-xs sm:text-sm font-semibold text-gray-800">
                          {form.title}
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedIqamTool(form.id)}
                          className="text-xs sm:text-sm font-bold text-[#fbab2a] hover:text-[#e89b1f] hover:underline cursor-pointer shrink-0"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

        {/* Right Sidebar Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Calendar Widget (Dark Theme matching mockup) */}
          <CalendarWidget />

          {/* Observation Request Card — GET /applications/{id}/direct-observation */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-gray-900">
              Observation Request
            </h4>

            {liveObservation ? (
              <>
                <div className="relative bg-[#F8F9FA] rounded-xl p-4 border border-gray-100 flex items-center justify-between gap-3 overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      liveObservation.status === "accepted" ||
                      liveObservation.status === "completed"
                        ? "bg-[#1E7F4C]"
                        : liveObservation.status === "rejected" ||
                            liveObservation.status === "cancelled"
                          ? "bg-red-500"
                          : "bg-[#fbab2a]"
                    }`}
                  />

                  <div className="flex flex-col gap-1.5 pl-1.5 min-w-0">
                    <span
                      className={`self-start px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        liveObservation.status === "accepted" ||
                        liveObservation.status === "completed"
                          ? "bg-[#1E7F4C]/10 text-[#1E7F4C]"
                          : liveObservation.status === "rejected" ||
                              liveObservation.status === "cancelled"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {liveObservation.status === "accepted"
                        ? "Confirmed"
                        : liveObservation.status === "completed"
                          ? "Completed"
                          : liveObservation.status === "rejected"
                            ? "Rejected"
                            : liveObservation.status === "cancelled"
                              ? "Cancelled"
                              : "Pending Review"}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      Physically Observation
                    </span>
                    <div className="flex items-center gap-4 text-[11px] text-gray-500 pt-0.5">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          TIME
                        </span>
                        <span className="font-semibold text-gray-700">
                          {liveObservation.scheduledAt
                            ?.split("T")[1]
                            ?.slice(0, 5) || "—"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          DATE
                        </span>
                        <span className="font-semibold text-gray-700">
                          {liveObservation.scheduledAt?.split("T")[0] || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <FiChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </div>

                <button
                  type="button"
                  onClick={() => setIsObservationFormOpen(true)}
                  className="w-full py-2.5 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-all shadow-xs"
                >
                  View
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                <span className="text-xs font-bold text-gray-800">No request</span>
                <p className="text-[11px] text-gray-400 font-medium max-w-50">
                  The candidate&apos;s scheduled observation will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Candidate Information Card */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-gray-900">
              Candidate Information
            </h4>

            <div className="flex items-center gap-3.5 pt-1">
              <Avatar
                src={candidatePhoto}
                name={candidateName}
                className="w-12 h-12 shrink-0 border border-gray-100"
                alt={candidateName}
              />

              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-gray-900 truncate">
                  {candidateName}
                </span>
                <span className="text-xs text-gray-400 truncate mt-0.5">
                  {candidateEmail}
                </span>
                <span className="text-xs text-gray-400 truncate mt-0.5">
                  {candidatePhone}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Confirmation Modal (Approve / Reject) */}
      <ConfirmNsqDecisionModal
        isOpen={decisionModal.isOpen}
        onClose={() => setDecisionModal({ ...decisionModal, isOpen: false })}
        applicationId={effectiveAppId}
        candidateName={candidateName}
        tradeName={resolvedTradeName}
        decision={decisionModal.decision}
        onSuccess={handleDecisionSuccess}
      />

      {/* Assign Assessor / IQA Modal */}
      <AssignNsqAssessorModal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal({ ...assignModal, isOpen: false })}
        applicationId={effectiveAppId}
        roleType={assignModal.roleType}
        tradeName={resolvedTradeName}
        unitIds={unitsList.map((u) => u.id)}
        currentAssignedId={
          assignModal.roleType === "QAA"
            ? assignedAssessor?.id
            : assignedIqa?.id
        }
        onAssigned={(assigned) => {
          if (assignModal.roleType === "QAA") {
            setAssignedAssessor(assigned);
          } else {
            setAssignedIqa(assigned);
          }
        }}
      />

      {/* Induction Form Modal */}
      {isInductionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-text">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative border border-gray-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsInductionModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                National Skills Qualification (NSQ)
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight mt-0.5">
                Candidate Induction Form
              </h3>
              <p className="text-xs text-neutral-secondary font-normal mt-0.5">
                Verified candidate registration details, selected trade units, and self-declaration
              </p>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    CANDIDATE NAME
                  </span>
                  <span className="font-bold text-neutral-primary text-xs mt-0.5 block">
                    {inductionForm?.data?.firstName
                      ? `${inductionForm.data.firstName} ${inductionForm.data.lastName || ""}`.trim()
                      : candidateName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    REGISTERED TRADE
                  </span>
                  <span className="font-bold text-neutral-primary text-xs mt-0.5 block">
                    {inductionForm?.trade?.name || resolvedTradeName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    REGISTRATION STATUS
                  </span>
                  <span className="text-emerald-700 font-bold text-xs mt-0.5 inline-flex items-center gap-1">
                    <FiCheck className="w-3.5 h-3.5" />{" "}
                    {inductionForm?.submittedAt
                      ? "Induction Completed"
                      : "Induction Form"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    SUBMISSION DATE
                  </span>
                  <span className="font-medium text-neutral-primary text-xs mt-0.5 block">
                    {inductionForm?.submittedAt
                      ? new Date(inductionForm.submittedAt).toLocaleDateString(
                          "en-GB",
                        )
                      : application?.submittedAt
                        ? new Date(application.submittedAt).toLocaleDateString(
                            "en-GB",
                          )
                        : "—"}
                  </span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-2xl p-4 flex flex-col gap-2.5">
                <span className="font-bold text-xs text-neutral-primary">
                  Registered Qualification Units
                </span>
                <div className="flex flex-wrap gap-2">
                  {(inductionForm?.units && inductionForm.units.length > 0
                    ? inductionForm.units.map((u) => ({
                        id: u.id,
                        unitNo: u.referenceNumber,
                        title: u.title,
                      }))
                    : unitsList
                  ).map((u) => (
                    <span
                      key={u.id}
                      className="px-3 py-1.5 bg-rose-50 border border-rose-100 text-[#a31d38] font-bold text-[11px] rounded-xl"
                    >
                      {u.unitNo}: {u.title}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-xs text-emerald-900 block">
                    Candidate Declaration & Verification
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Candidate confirmed agreement to NOS assessment requirements and code of conduct.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-xl shrink-0">
                  Signed
                </span>
              </div>
            </div>

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsInductionModalOpen(false)}
                className="px-5 py-2 bg-[#fbab2a] hover:bg-[#e89b1f] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        isOpen={isReceiptModalOpen}
        transaction={receiptTransaction}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      {/* IQAM Tool Viewer Modal */}
      {selectedIqamTool && isInternalVerificationStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs select-text">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Internal Quality Assurance
                </span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  {IQAM_FORMS_LIST.find((f) => f.id === selectedIqamTool)?.title || selectedIqamTool}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIqamTool(null)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <CentreIqamFormViewer toolId={selectedIqamTool} applicationId={application?.id || ""} />
            </div>
          </div>
        </div>
      )}

      {/* Observation Form Viewer Modal (read-only) */}
      {isObservationFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs select-text">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  National Skills Qualification (NSQ)
                </span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Physical Observation Form
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsObservationFormOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <NsqAssessorObservationFormsView
                sessionId={liveObservation?.id}
                candidateName={candidateName}
                applicationId={application?.id || ""}
                registrationNo={inductionForm?.data?.registrationNo}
                unitsAssessed={
                  liveObservation?.unitIds && liveObservation.unitIds.length > 0
                    ? liveObservation.unitIds
                        .map((unitId: string) => unitsList.find((u) => u.id === unitId)?.unitNo || unitId)
                        .join("/")
                    : undefined
                }
                readOnly
                onBack={() => setIsObservationFormOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
