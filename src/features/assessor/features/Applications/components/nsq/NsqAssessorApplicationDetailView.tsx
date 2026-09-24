"use client";

import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { ReviewVerifierModal } from "@/src/features/assessment-centre/features/Applications/components/ReviewVerifierModal";
import { submitUnitSignoffApi } from "@/src/features/shared/applications/api";
import type { DirectObservationSession } from "@/src/features/shared/applications/api/types";
import {
  useGetApplicationById,
  useGetDirectObservations,
  useGetInductionForm,
  useReviewApplication,
  useReviewDirectObservation,
} from "@/src/features/shared/applications/hooks";
import {
  APPLICATION_DETAIL_REFRESH_INTERVAL_MS,
  APPLICATION_QUERY_KEYS,
} from "@/src/features/shared/applications/hooks/queryKeys";
import {
  useGetEvidenceTypesByTrade,
  useGetTradeDetail,
} from "@/src/features/shared/reference/hooks";
import { useUrlModal } from "@/src/lib/hooks/usePersistentModal";
import {
  NSQ_ASSESSOR_OBSERVATION_MODAL,
  NSQ_REJECT_OBSERVATION_MODAL,
  REVIEW_VERIFIER_MODAL,
} from "@/src/lib/modal-keys";
import {
  closeUrlSubView,
  openUrlSubView,
} from "@/src/lib/navigation/url-sub-view";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiInfo,
  FiUserCheck,
  FiX,
} from "react-icons/fi";
import { useGetMeProfile } from "@/src/features/shared/account/hooks";
import { useGetAssessorProfile } from "@/src/features/assessor/hooks";
import { useAppSelector } from "@/src/store/hooks";
import { getAssessorRoleContext } from "@/src/features/shared/applications/utils/assessorRole";
import { IqamToolsDashboard } from "../../../iqam/IqamToolsDashboard";
import { ComprehensiveReportView } from "../../../iqam/components/con04/ComprehensiveReportView";
import { ObservationChecklistView } from "../../../iqam/components/con05/ObservationChecklistView";
import { FinalPortfolioReportView } from "../../../iqam/components/con06/FinalPortfolioReportView";
import type { AssessorApplicationRecord } from "../../types/applications.types";
import { CandidateInductionTriggerCard } from "./components/detail/CandidateInductionTriggerCard";
import { QualificationStandardCard } from "./components/detail/QualificationStandardCard";
import {
  QualificationUnitsList,
  type QualificationUnitItem,
} from "./components/detail/QualificationUnitsList";
import { NsqAssessorInductionModal } from "./NsqAssessorInductionModal";
import {
  ConfirmAcceptObservationModal,
  ObservationAcceptedSuccessModal,
  ObservationRejectedSuccessModal,
  RejectEvidenceModal,
} from "./NsqAssessorModals";
import { NsqAssessorObservationFormsView } from "./NsqAssessorObservationFormsView";
import {
  NsqAssessorObservationModal,
  type ObservationRequestDetails,
} from "./NsqAssessorObservationModal";
import { NsqAssessorSidebar } from "./NsqAssessorSidebar";
import { NsqAssessorUnitDetailView } from "./NsqAssessorUnitDetailView";

const mapSessionToObservation = (
  session?: DirectObservationSession | null,
): ObservationRequestDetails | null => {
  if (!session) return null;
  const [datePart, timePart] = (session.scheduledAt || "").split("T");
  const status: ObservationRequestDetails["status"] =
    session.status === "accepted" || session.status === "completed"
      ? "confirmed"
      : session.status === "requested" || session.status === "pending"
        ? "pending"
        : "rejected";
  return {
    units: session.unitIds || [],
    date: datePart || "",
    time: timePart ? timePart.slice(0, 5) : "",
    country: "",
    state: "",
    lga: "",
    address: session.address || "",
    status,
    requirements: session.requirements,
    rejectionReason: session.reviewComment || undefined,
  };
};

export type NsqAssessorSubView =
  | "overview"
  | "unit"
  | "observation_form"
  | "iqam_con04"
  | "iqam_con05"
  | "iqam_con06"
  | "iqam_workspace";

export interface NsqAssessorApplicationDetailViewProps {
  application: AssessorApplicationRecord;
  onBack: () => void;
  showHeader?: boolean;
  onSubViewChange?: (subViewTitle: string | null) => void;
  onRegisterMoveToIqam?: (fn: () => void) => void;
  onMoveToIqamStatusChange?: (hasMoved: boolean) => void;
  onCanMoveToIqamChange?: (canMove: boolean) => void;
  subViewNavState?: NsqAssessorSubView;
  onSubViewNavStateChange?: (state: NsqAssessorSubView) => void;
  onUpdateHeader?: (config: {
    title: string;
    breadcrumb: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null) => void;
}

const STAGE_ORDER = [
  "application_form",
  "payment",
  "induction",
  "regular_assessment",
  "internal_verification",
  "external_verification",
  "certification",
];

export const NsqAssessorApplicationDetailView: React.FC<
  NsqAssessorApplicationDetailViewProps
> = ({
  application,
  onBack,
  showHeader = false,
  onSubViewChange,
  onRegisterMoveToIqam,
  onMoveToIqamStatusChange,
  onCanMoveToIqamChange,
  subViewNavState: externalNavState,
  onSubViewNavStateChange,
  onUpdateHeader,
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [internalSubView, setInternalSubView] =
    useState<NsqAssessorSubView>("overview");
  const activeSubView = externalNavState || internalSubView;
  const [isReviewIvModalOpen, setIsReviewIvModalOpen] = useUrlModal(
    REVIEW_VERIFIER_MODAL,
  );

  const setActiveSubView = (next: NsqAssessorSubView) => {
    setInternalSubView(next);
    onSubViewNavStateChange?.(next);
    if (next === "overview") {
      onSubViewChange?.(null);
      onUpdateHeader?.(null);
    } else if (next === "unit") {
      onSubViewChange?.(selectedUnit?.unitNo || "Unit Details");
      onUpdateHeader?.(null);
    } else if (next === "observation_form") {
      onSubViewChange?.("Physical Observation Form");
      onUpdateHeader?.(null);
    } else if (next === "iqam_con04") {
      onSubViewChange?.("Comprehensive Internal Verifier Report Form");
    } else if (next === "iqam_con05") {
      onSubViewChange?.("IV Observation & Questioning Checklist");
    } else if (next === "iqam_con06") {
      onSubViewChange?.("Final Portfolio / Award Report Form");
    } else if (next === "iqam_workspace") {
      onSubViewChange?.("IQAM Tools Workspace");
    }
  };

  const { data: apiApp, isLoading: isLoadingApp } = useGetApplicationById(
    application.id,
    {
      refetchInterval: APPLICATION_DETAIL_REFRESH_INTERVAL_MS,
    },
  );
  const { data: inductionForm } = useGetInductionForm(application.id);

  const user = useAppSelector((state) => state.auth.user);
  const { data: meProfile } = useGetMeProfile();
  const { data: assessorProfile } = useGetAssessorProfile();

  const roleCtx = useMemo(() => {
    return getAssessorRoleContext({
      application: apiApp,
      user,
      meProfile,
      assessorProfile,
    });
  }, [apiApp, user, meProfile, assessorProfile]);

  const [perspective, setPerspective] = useState<"qaa" | "iqa">("qaa");

  const tradeId = apiApp?.tradeId || "";
  const { data: tradeDetail } = useGetTradeDetail(tradeId);
  const { data: remoteEvidenceTypes = [] } =
    useGetEvidenceTypesByTrade(tradeId);

  const wishedQualificationLevel = apiApp?.nsq?.wishedQualificationLevel;
  const nsqUnitsForLevel = wishedQualificationLevel
    ? apiApp?.nsq?.units?.filter(
        (u) => u.qualificationLevelId === wishedQualificationLevel.id,
      )
    : apiApp?.nsq?.units;
  const realUnits: QualificationUnitItem[] | null = nsqUnitsForLevel?.length
    ? nsqUnitsForLevel.map((u) => ({
        id: u.id,
        unitNo: u.referenceNumber,
        title: u.title,
        approvedCount: u.criteriaApproved,
        totalCount: u.criteriaTotal,
        hasNewUpload: u.criteriaPending > 0,
        status: u.status,
        criteriaPending: u.criteriaPending,
        criteriaRejected: u.criteriaRejected,
      }))
    : null;
  const unitsList = realUnits || [];

  const [selectedUnit, setSelectedUnit] =
    useState<QualificationUnitItem | null>(null);

  useEffect(() => {
    if (!realUnits || realUnits.length === 0) return;
    const unitParam = searchParams.get("unit");
    if (unitParam) {
      const match = realUnits.find((u) => u.id === unitParam);
      if (match) {
        if (selectedUnit?.id !== match.id) setSelectedUnit(match);
        if (activeSubView !== "unit") {
          setInternalSubView("unit");
          onSubViewNavStateChange?.("unit");
          onSubViewChange?.(match.unitNo);
        }
      }
      return;
    }
    if (!selectedUnit) {
      setSelectedUnit(realUnits[0]);
    }
  }, [realUnits, searchParams]);

  const { data: directObsList } = useGetDirectObservations(application.id, {
    enabled: Boolean(application.id),
  });
  const sessions =
    (directObsList as any)?.sessions ||
    (directObsList as any)?.items ||
    (apiApp as any)?.nsq?.directObservationSessions ||
    [];
  const sortedSessions = sessions.slice().sort((a: any, b: any) => {
    const timeA = new Date(a.createdAt || a.scheduledAt || 0).getTime();
    const timeB = new Date(b.createdAt || b.scheduledAt || 0).getTime();
    return timeB - timeA;
  });
  const liveObs = sortedSessions[0];
  const effectiveSessionId = liveObs?.id || "session-1";
  const hasFilledObservationForm =
    liveObs?.physicalStatus === "submitted" &&
    liveObs?.oralStatus === "submitted";

  const { mutateAsync: reviewObservationMutation } = useReviewDirectObservation(
    application.id,
    effectiveSessionId,
  );
  const { mutateAsync: reviewApplicationMutation } = useReviewApplication();
  const queryClient = useQueryClient();

  const [observation, setObservation] =
    useState<ObservationRequestDetails | null>(
      mapSessionToObservation(liveObs),
    );

  useEffect(() => {
    setObservation(mapSessionToObservation(liveObs));
  }, [liveObs?.id, liveObs?.status, liveObs?.scheduledAt]);

  const [isInductionModalOpen, setIsInductionModalOpen] = useState(false);
  const [isObsModalOpen, setIsObsModalOpen] = useUrlModal(
    NSQ_ASSESSOR_OBSERVATION_MODAL,
  );
  const [isConfirmAcceptObsOpen, setIsConfirmAcceptObsOpen] = useState(false);
  const [isRejectObsReasonOpen, setIsRejectObsReasonOpen] = useUrlModal(
    NSQ_REJECT_OBSERVATION_MODAL,
  );
  const [isAcceptObsSuccessOpen, setIsAcceptObsSuccessOpen] = useState(false);
  const [isRejectObsSuccessOpen, setIsRejectObsSuccessOpen] = useState(false);
  const [pendingAcceptRequirements, setPendingAcceptRequirements] = useState<
    string[]
  >([]);

  const candidateName = application.candidateName || "Candidate";
  const tradeName = tradeDetail?.name || application.trade || "—";
  const candidateEmail =
    apiApp?.personalInformation?.contactInformation?.emailAddress;
  const candidatePhoneNumber =
    apiApp?.personalInformation?.contactInformation?.phoneNumber;
  const candidatePhone = candidatePhoneNumber?.number
    ? `${candidatePhoneNumber.countryCode || ""} ${candidatePhoneNumber.number}`.trim()
    : undefined;

  const evidenceTypesText =
    remoteEvidenceTypes.length > 0 ? remoteEvidenceTypes.join("/") : undefined;

  const handleSelectUnit = (unit: QualificationUnitItem) => {
    setSelectedUnit(unit);
    setActiveSubView("unit");
    openUrlSubView(router, pathname, searchParams, unit.id);
  };

  const handleBackFromUnit = () => {
    setActiveSubView("overview");
    closeUrlSubView(router, pathname, searchParams);
  };

  const prevUnitParam = useRef(searchParams.get("unit"));
  useEffect(() => {
    const unitParam = searchParams.get("unit");
    if (prevUnitParam.current && !unitParam && activeSubView === "unit") {
      setActiveSubView("overview");
    }
    prevUnitParam.current = unitParam;
  }, [searchParams]);

  const effectiveStageKey =
    apiApp?.currentStageKey ||
    (application as any)?.currentStageKey ||
    (application as any)?.stageKey;

  const isInternalVerificationStage = Boolean(
    effectiveStageKey &&
    STAGE_ORDER.indexOf(effectiveStageKey) >=
      STAGE_ORDER.indexOf("internal_verification"),
  );

  const hasMovedToIqam = isInternalVerificationStage;
  const isRegularAssessmentStage = effectiveStageKey === "regular_assessment";

  // Qualification Units Readiness Validation
  const isUnitFullyApproved = (u: QualificationUnitItem) => {
    if (u.status === "approved") return true;
    const total = u.totalCount ?? 0;
    const approved = u.approvedCount ?? 0;
    return total > 0 && approved >= total;
  };

  const unitsWithNoEvidence = unitsList.filter(
    (u) =>
      !isUnitFullyApproved(u) &&
      (u.approvedCount ?? 0) === 0 &&
      (u.criteriaPending ?? 0) === 0 &&
      u.status !== "in_progress",
  );

  const unitsPendingApproval = unitsList.filter(
    (u) =>
      !isUnitFullyApproved(u) &&
      !unitsWithNoEvidence.some((m) => m.id === u.id),
  );

  const areAllUnitsApproved =
    unitsList.length > 0 && unitsList.every(isUnitFullyApproved);

  // Physical Observation Validation
  const hasObservation = Boolean(liveObs);
  const isObsPending = Boolean(
    liveObs && (liveObs.status === "pending" || liveObs.status === "requested"),
  );
  const isObsRejected = Boolean(
    liveObs && (liveObs.status === "rejected" || liveObs.status === "cancelled"),
  );
  const hasAssessorSignature = Boolean(
    liveObs?.signatures?.unitAssessor?.signedAt ||
      liveObs?.signatures?.unitAssessor,
  );
  const hasLearnerSignature = Boolean(
    liveObs?.signatures?.learner?.signedAt ||
      liveObs?.signatures?.learner,
  );
  const isObservationFullyCompleted = Boolean(
    hasObservation &&
      !isObsPending &&
      !isObsRejected &&
      hasFilledObservationForm &&
      hasAssessorSignature &&
      hasLearnerSignature,
  );

  const canMoveToIqam = Boolean(
    !hasMovedToIqam &&
      isRegularAssessmentStage &&
      areAllUnitsApproved &&
      isObservationFullyCompleted,
  );

  const [isMoveToIqamModalOpen, setIsMoveToIqamModalOpen] = useState(false);
  const [isMovingToIqam, setIsMovingToIqam] = useState(false);

  const handleMoveToIqam = () => {
    if (unitsList.length === 0) {
      toast({
        type: "error",
        title: "Units Not Loaded",
        description:
          "The qualification units for this candidate are not yet loaded. Please refresh the page.",
      });
      return;
    }

    if (unitsWithNoEvidence.length > 0) {
      const missingNames = unitsWithNoEvidence
        .map((u) => u.unitNo)
        .join(", ");
      toast({
        type: "error",
        title: "Candidate Evidence Incomplete",
        description: `Evidence has not been submitted for all qualification units. Missing: ${missingNames}. The candidate must upload evidence for every unit before advancing to Internal Quality Assurance (IQA).`,
      });
      return;
    }

    if (unitsPendingApproval.length > 0) {
      const pendingNames = unitsPendingApproval
        .map((u) => u.unitNo)
        .join(", ");
      toast({
        type: "error",
        title: "Evidence Pending Assessor Approval",
        description: `There is pending or unapproved evidence in: ${pendingNames}. Please review and approve all submitted evidence before handing over this application to IQAM.`,
      });
      return;
    }

    if (!hasObservation) {
      toast({
        type: "error",
        title: "Physical Observation Required",
        description:
          "A direct physical observation has not been conducted for this candidate. The candidate must request an observation session, and both the Physical Observation Log (ARF 02A) and Oral Questioning Record (ARF 04A) must be completed and signed before advancing.",
      });
      return;
    }

    if (isObsPending) {
      toast({
        type: "error",
        title: "Physical Observation Pending Review",
        description:
          "The candidate has requested a physical observation session that is awaiting your acceptance. Please review and accept the session from the sidebar before advancing.",
      });
      return;
    }

    if (isObsRejected) {
      toast({
        type: "error",
        title: "Physical Observation Incomplete",
        description:
          "The physical observation session was rejected or cancelled. A valid observation session must be completed before handing over to IQAM.",
      });
      return;
    }

    if (!hasFilledObservationForm) {
      toast({
        type: "error",
        title: "Observation Forms Incomplete",
        description:
          "Both the Physical Observation Log (ARF 02A) and Oral Questioning Record (ARF 04A) must be filled out and submitted before handing over to IQAM.",
      });
      return;
    }

    if (!hasAssessorSignature && !hasLearnerSignature) {
      toast({
        type: "error",
        title: "Observation Signatures Required",
        description:
          "Both you (the unit assessor) and the candidate must sign off on the completed physical observation report before the application can advance to Internal Quality Assurance.",
      });
      return;
    }

    if (!hasAssessorSignature) {
      toast({
        type: "error",
        title: "Assessor Signature Required",
        description:
          "Please open the observation form and append your signature to sign off on the observation report before advancing.",
      });
      return;
    }

    if (!hasLearnerSignature) {
      toast({
        type: "error",
        title: "Candidate Signature Pending",
        description:
          "The candidate has not yet appended their signature to the completed physical observation report. Both assessor and candidate signatures are mandatory before moving to Internal Quality Assurance.",
      });
      return;
    }

    setIsMoveToIqamModalOpen(true);
  };

  const executeMoveToIqam = async () => {
    if (!areAllUnitsApproved || !isObservationFullyCompleted) {
      handleMoveToIqam();
      return;
    }

    setIsMovingToIqam(true);

    try {
      await Promise.all(
        unitsList.map((u) =>
          submitUnitSignoffApi(application.id, u.id, {
            role: "unit_assessor",
            signedAt: new Date().toISOString(),
          }),
        ),
      );
    } catch (err) {
      toast({
        type: "error",
        title: "Sign-Off Failed",
        description:
          err instanceof Error
            ? err.message
            : "Could not sign off one or more units. Please try again.",
      });
      setIsMovingToIqam(false);
      return;
    }

    queryClient.invalidateQueries({
      queryKey: APPLICATION_QUERY_KEYS.detail(application.id),
    });
    unitsList.forEach((u) => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.unitCriteria(application.id, u.id),
      });
    });

    try {
      await reviewApplicationMutation({
        id: application.id,
        payload: {
          decision: "approve",
          stageKey: "regular_assessment",
          feedback: `QAA assessment complete for ${candidateName} — all ${unitsList.length} units and physical observation verified and signed off for Internal Quality Assurance.`,
        },
      });
    } catch {
      setIsMovingToIqam(false);
      return;
    }

    setIsMovingToIqam(false);
    setIsMoveToIqamModalOpen(false);

    toast({
      type: "success",
      title: "Handed over to IQAM",
      description: `All ${unitsList.length} units and physical observation signed off. Application for ${candidateName} has moved to Internal Quality Assurance.`,
    });
  };

  useEffect(() => {
    onRegisterMoveToIqam?.(handleMoveToIqam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    onRegisterMoveToIqam,
    handleMoveToIqam,
    candidateName,
    apiApp?.nsq?.units,
    liveObs,
  ]);

  const isIqamFormsComplete = Boolean(
    apiApp?.iqamForms?.length &&
    apiApp.iqamForms.every((f) => f.status === "submitted"),
  );
  const isIvApproved = Boolean((apiApp as any)?.ivApproved);

  useEffect(() => {
    onMoveToIqamStatusChange?.(hasMovedToIqam);
  }, [onMoveToIqamStatusChange, hasMovedToIqam]);

  useEffect(() => {
    onCanMoveToIqamChange?.(canMoveToIqam);
  }, [onCanMoveToIqamChange, canMoveToIqam]);

  const acceptObservation = async (requirements: string[]) => {
    await reviewObservationMutation({
      decision: "accept",
      requirements: requirements.length > 0 ? requirements : undefined,
    });
    if (observation) {
      setObservation({
        ...observation,
        status: "confirmed",
        isSigned: true,
        requirements,
      });
    }
  };

  const rejectObservation = async (reason: string) => {
    await reviewObservationMutation({ decision: "reject", comment: reason });
    if (observation) {
      setObservation({
        ...observation,
        status: "rejected",
        rejectionReason: reason,
      });
    }
  };

  const handleFinalConfirmAcceptObs = async () => {
    setIsConfirmAcceptObsOpen(false);
    try {
      await acceptObservation(pendingAcceptRequirements);
    } catch {
      return;
    }
    setIsAcceptObsSuccessOpen(true);
  };

  const handleRejectObservation = async (reason: string) => {
    setIsRejectObsReasonOpen(false);
    try {
      await rejectObservation(reason);
    } catch {
      return;
    }
    setIsRejectObsSuccessOpen(true);
  };

  if (activeSubView === "unit" && selectedUnit) {
    return (
      <NsqAssessorUnitDetailView
        unitId={selectedUnit.id}
        unitNumber={selectedUnit.unitNo}
        unitTitle={selectedUnit.title}
        candidateName={candidateName}
        candidateEmail={candidateEmail}
        candidatePhone={candidatePhone}
        candidatePhotoUrl={application.candidatePhotoUrl}
        applicationId={application.id}
        observation={observation}
        onAcceptObservation={acceptObservation}
        onRejectObservation={rejectObservation}
        onBack={handleBackFromUnit}
        onFillObservationForm={() => setActiveSubView("observation_form")}
      />
    );
  }

  if (activeSubView === "observation_form") {
    return (
      <NsqAssessorObservationFormsView
        sessionId={effectiveSessionId}
        candidateName={candidateName}
        applicationId={application.id}
        registrationNo={inductionForm?.data?.registrationNo}
        unitsAssessed={
          observation?.units && observation.units.length > 0
            ? observation.units
                .map(
                  (unitId) =>
                    unitsList.find((u) => u.id === unitId)?.unitNo || unitId,
                )
                .join("/")
            : undefined
        }
        onBack={() => setActiveSubView("overview")}
        onSubmitSuccess={() => {
          if (observation)
            setObservation({ ...observation, status: "confirmed" });
        }}
      />
    );
  }

  if (isInternalVerificationStage && activeSubView === "iqam_con04") {
    return (
      <ComprehensiveReportView
        applicationId={application.id}
        candidateName={candidateName}
        onBack={() => {
          onUpdateHeader?.(null);
          setActiveSubView("overview");
        }}
        onUpdateHeader={(cfg) => {
          onSubViewChange?.(
            cfg?.title || "Comprehensive Internal Verifier Report Form",
          );
          onUpdateHeader?.(
            cfg ? { ...cfg, breadcrumb: cfg.breadcrumb || cfg.title } : null,
          );
        }}
      />
    );
  }

  if (isInternalVerificationStage && activeSubView === "iqam_con05") {
    return (
      <ObservationChecklistView
        applicationId={application.id}
        candidateName={candidateName}
        onBack={() => {
          onUpdateHeader?.(null);
          setActiveSubView("overview");
        }}
        onUpdateHeader={(cfg) => {
          onSubViewChange?.(
            cfg?.title || "IV Observation & Questioning Checklist",
          );
          onUpdateHeader?.(
            cfg ? { ...cfg, breadcrumb: cfg.breadcrumb || cfg.title } : null,
          );
        }}
      />
    );
  }

  if (isInternalVerificationStage && activeSubView === "iqam_con06") {
    return (
      <FinalPortfolioReportView
        applicationId={application.id}
        candidateName={candidateName}
        onBack={() => {
          onUpdateHeader?.(null);
          setActiveSubView("overview");
        }}
        onUpdateHeader={(cfg) => {
          onSubViewChange?.(cfg?.title || "Final Portfolio / Award Report Form");
          onUpdateHeader?.(
            cfg ? { ...cfg, breadcrumb: cfg.breadcrumb || cfg.title } : null,
          );
        }}
      />
    );
  }

  if (isInternalVerificationStage && activeSubView === "iqam_workspace") {
    return (
      <IqamToolsDashboard
        initialToolId="CON/04/IQAM"
        initialApplicationId={application.id}
        initialCentreId={apiApp?.centreId || (application as any)?.centreId}
        initialCandidateName={candidateName}
        onBack={() => {
          onUpdateHeader?.(null);
          setActiveSubView("overview");
        }}
        onUpdateHeader={(cfg) => {
          onSubViewChange?.(cfg?.title || "IQAM Tools Workspace");
          onUpdateHeader?.(cfg);
        }}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center select-text">
      <div className="w-full max-w-7xl xl:max-w-360 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 flex flex-col gap-6 w-full">
            {/* Dual Role / IQA Assignment Banner */}
            {roleCtx.isDualRole ? (
              <div className="bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/80 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-start gap-3 sm:gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <FiUserCheck className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-extrabold text-neutral-primary">
                        Dual Role Assignment
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#900B27] text-white">
                        QAA + IQA
                      </span>
                    </div>
                    <p className="text-xs text-neutral-secondary mt-1 font-normal leading-relaxed">
                      You are assigned as both the QAA Assessor and Internal Verifier (IQA) for this candidate. You have full permission to assess units and fill out all IQAM verification forms.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 p-1 bg-white/90 border border-amber-200 rounded-2xl w-full sm:w-fit sm:flex sm:items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPerspective("qaa")}
                    className={`px-3 sm:px-4 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                      perspective === "qaa"
                        ? "bg-[#900B27] text-white shadow-xs"
                        : "text-gray-600 hover:text-neutral-primary"
                    }`}
                  >
                    Assessor (QAA) View
                  </button>
                  <button
                    type="button"
                    onClick={() => setPerspective("iqa")}
                    className={`px-3 sm:px-4 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                      perspective === "iqa"
                        ? "bg-[#900B27] text-white shadow-xs"
                        : "text-gray-600 hover:text-neutral-primary"
                    }`}
                  >
                    Verifier (IQA) View
                  </button>
                </div>
              </div>
            ) : !roleCtx.isDualRole && roleCtx.canPerformIqa && isInternalVerificationStage ? (
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-3xl p-4 sm:p-5 shadow-xs flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <FiCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-emerald-950">
                    Assigned Internal Verifier (IQA)
                  </h4>
                  <p className="text-xs text-emerald-800 font-normal mt-0.5 leading-relaxed">
                    You are the assigned Internal Verifier. Candidate evidence has moved to internal verification. You can fill out and submit all IQAM verification forms below.
                  </p>
                </div>
              </div>
            ) : null}

            {isInternalVerificationStage && !roleCtx.canPerformIqa && (
              <div className="bg-blue-50/90 border border-blue-200 rounded-3xl p-4 sm:p-6 shadow-xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <FiInfo className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-extrabold text-blue-950">
                    Application in Internal Quality Assurance (IQA)
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-800 leading-relaxed font-normal">
                    This candidate has finished the regular assessment phase and
                    advanced to Internal Quality Assurance. Candidate evidence
                    upload is now closed. The assigned Internal Verifier (IQA)
                    samples evidence and completes the IQAM verification forms
                    below.
                  </p>
                </div>
              </div>
            )}

            {perspective === "iqa" && isInternalVerificationStage ? (
              <>
                {/* 1. IQAM Forms Card Prominent in IQA view */}
                <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-extrabold text-neutral-primary tracking-tight">
                        IQAM Verification Forms
                      </h3>
                      {(() => {
                        const ivReportSubmitted = Boolean(
                          apiApp?.iqamForms?.find((f) => f.key === "iv_report")
                            ?.submittedAt,
                        );
                        const finalPortfolioSubmitted = Boolean(
                          apiApp?.iqamForms?.find(
                            (f) => f.key === "final_portfolio",
                          )?.submittedAt,
                        );
                        return ivReportSubmitted && finalPortfolioSubmitted ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#1E7F4C]/10 text-[#1E7F4C]">
                            Up to Date
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-500/10 text-amber-700">
                            Attention Required
                          </span>
                        );
                      })()}
                    </div>

                    <span className="self-start sm:self-auto text-[11px] font-bold text-neutral-secondary bg-gray-50 border border-gray-200/80 px-2.5 py-1 rounded-xl">
                      {roleCtx.isDualRole
                        ? "Acting as Internal Verifier"
                        : "Assigned Verifier"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* CON 04 */}
                    {(() => {
                      const isSub = Boolean(apiApp?.iqamForms?.find((f) => f.key === "iv_report")?.submittedAt);
                      return (
                        <div className="p-3.5 sm:p-4.5 bg-gray-50/80 hover:bg-gray-100/80 rounded-2xl border border-gray-100/90 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-[#900B27]/10 text-[#900B27] tracking-wider uppercase shrink-0">
                                CON 04
                              </span>
                              <div className="sm:hidden">
                                {isSub ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1E7F4C]/10 text-[#1E7F4C]">
                                    Submitted
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-700">
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-neutral-primary leading-snug">
                                Comprehensive Internal Verifier Report Form
                              </h4>
                              <span className="text-[11px] text-gray-500 font-normal mt-0.5">
                                CON/04/IQAM • Verification & Quality Evaluation
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/50 sm:border-transparent">
                            <div className="hidden sm:block shrink-0">
                              {isSub ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1E7F4C]/10 text-[#1E7F4C]">
                                  Submitted
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700">
                                  Pending
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveSubView("iqam_con04")}
                              className={`w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                                isSub
                                  ? "border border-gray-200 text-gray-700 hover:bg-gray-100 bg-white"
                                  : roleCtx.canPerformIqa
                                    ? "bg-[#900B27] hover:bg-[#72081f] text-white shadow-xs"
                                    : "text-[#fbab2a] hover:underline"
                              }`}
                            >
                              {!isSub && roleCtx.canPerformIqa ? (
                                <>
                                  <FiEdit3 className="w-3.5 h-3.5" />
                                  <span>Fill Form</span>
                                </>
                              ) : (
                                <span>View</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* CON 05 */}
                    {(() => {
                      const isSub = Boolean(apiApp?.iqamForms?.find((f) => f.key === "assessor_outcomes")?.submittedAt);
                      return (
                        <div className="p-3.5 sm:p-4.5 bg-gray-50/80 hover:bg-gray-100/80 rounded-2xl border border-gray-100/90 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-[#900B27]/10 text-[#900B27] tracking-wider uppercase shrink-0">
                                CON 05
                              </span>
                              <div className="sm:hidden">
                                {isSub ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1E7F4C]/10 text-[#1E7F4C]">
                                    Submitted
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-700">
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-neutral-primary leading-snug">
                                IV Observation &amp; Questioning Checklist
                              </h4>
                              <span className="text-[11px] text-gray-500 font-normal mt-0.5">
                                CON/05/IQAM • Assessor Practice Observation
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/50 sm:border-transparent">
                            <div className="hidden sm:block shrink-0">
                              {isSub ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1E7F4C]/10 text-[#1E7F4C]">
                                  Submitted
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700">
                                  Pending
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveSubView("iqam_con05")}
                              className={`w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                                isSub
                                  ? "border border-gray-200 text-gray-700 hover:bg-gray-100 bg-white"
                                  : roleCtx.canPerformIqa
                                    ? "bg-[#900B27] hover:bg-[#72081f] text-white shadow-xs"
                                    : "text-[#fbab2a] hover:underline"
                              }`}
                            >
                              {!isSub && roleCtx.canPerformIqa ? (
                                <>
                                  <FiEdit3 className="w-3.5 h-3.5" />
                                  <span>Fill Checklist</span>
                                </>
                              ) : (
                                <span>View</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* CON 06 */}
                    {(() => {
                      const isSub = Boolean(apiApp?.iqamForms?.find((f) => f.key === "final_portfolio")?.submittedAt);
                      return (
                        <div className="p-3.5 sm:p-4.5 bg-gray-50/80 hover:bg-gray-100/80 rounded-2xl border border-gray-100/90 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-[#900B27]/10 text-[#900B27] tracking-wider uppercase shrink-0">
                                CON 06
                              </span>
                              <div className="sm:hidden">
                                {isSub ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1E7F4C]/10 text-[#1E7F4C]">
                                    Submitted
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-700">
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-neutral-primary leading-snug">
                                Final Portfolio / Award Report Form
                              </h4>
                              <span className="text-[11px] text-gray-500 font-normal mt-0.5">
                                CON/06/IQAM • Final Award & Verification Audit
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/50 sm:border-transparent">
                            <div className="hidden sm:block shrink-0">
                              {isSub ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1E7F4C]/10 text-[#1E7F4C]">
                                  Submitted
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700">
                                  Pending
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveSubView("iqam_con06")}
                              className={`w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                                isSub
                                  ? "border border-gray-200 text-gray-700 hover:bg-gray-100 bg-white"
                                  : roleCtx.canPerformIqa
                                    ? "bg-[#900B27] hover:bg-[#72081f] text-white shadow-xs"
                                    : "text-[#fbab2a] hover:underline"
                              }`}
                            >
                              {!isSub && roleCtx.canPerformIqa ? (
                                <>
                                  <FiEdit3 className="w-3.5 h-3.5" />
                                  <span>Fill Report</span>
                                </>
                              ) : (
                                <span>View</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-t border-gray-100">
                      <span className="text-xs text-neutral-secondary font-medium leading-relaxed">
                        Need to review sampling plans, records or candidate allocations?
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSubView("iqam_workspace")}
                        className="text-xs font-bold text-[#fbab2a] hover:text-[#e89b1f] hover:underline flex items-center gap-1.5 cursor-pointer shrink-0 py-1"
                      >
                        <span>Open Full IQAM Workspace (CON 01 – CON 06)</span>
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isIqamFormsComplete && !isIvApproved && (
                    <button
                      type="button"
                      onClick={() => setIsReviewIvModalOpen(true)}
                      className="w-full h-11 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Mark IQA Competent</span>
                      <FiCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <QualificationStandardCard
                  tradeName={tradeName}
                  qualificationCode={unitsList[0]?.unitNo}
                  evidenceTypes={evidenceTypesText}
                  sector={apiApp?.sector?.name}
                  level={
                    apiApp?.nsq?.wishedQualificationLevel
                      ? `Level ${apiApp.nsq.wishedQualificationLevel.level}`
                      : undefined
                  }
                />

                <QualificationUnitsList
                  tradeName={tradeName}
                  level={
                    apiApp?.nsq?.wishedQualificationLevel
                      ? `Level ${apiApp.nsq.wishedQualificationLevel.level}`
                      : undefined
                  }
                  units={unitsList}
                  onSelectUnit={handleSelectUnit}
                  isLoading={isLoadingApp}
                />
              </>
            ) : (
              <>
                <QualificationStandardCard
                  tradeName={tradeName}
                  qualificationCode={unitsList[0]?.unitNo}
                  evidenceTypes={evidenceTypesText}
                  sector={apiApp?.sector?.name}
                  level={
                    apiApp?.nsq?.wishedQualificationLevel
                      ? `Level ${apiApp.nsq.wishedQualificationLevel.level}`
                      : undefined
                  }
                />
                <CandidateInductionTriggerCard
                  onView={() => setIsInductionModalOpen(true)}
                />

                {/* Handover to IQAM Readiness Card (Visible in Regular Assessment) */}
                {!isInternalVerificationStage && (
                  <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4 select-text">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            canMoveToIqam
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {canMoveToIqam ? (
                            <FiCheckCircle className="w-5 h-5 stroke-[2.5]" />
                          ) : (
                            <FiClock className="w-5 h-5 stroke-[2.5]" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-sm sm:text-base font-extrabold text-neutral-primary">
                            Internal Quality Assurance (IQA) Handover Status
                          </h4>
                          <span className="text-[11px] sm:text-xs text-gray-500 font-medium">
                            Stage 4: Regular Assessment Completion
                          </span>
                        </div>
                      </div>
                      <span
                        className={`self-start sm:self-auto px-3 py-1 rounded-full text-[11px] font-bold ${
                          canMoveToIqam
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {canMoveToIqam ? "Ready for IQAM" : "Assessment in Progress"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Unit Evidence Status */}
                      <div
                        className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                          areAllUnitsApproved
                            ? "bg-emerald-50/60 border-emerald-100"
                            : "bg-gray-50/80 border-gray-100"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {areAllUnitsApproved ? (
                            <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <FiAlertTriangle className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-neutral-primary">
                            Qualification Units
                          </span>
                          <span className="text-[11px] text-gray-600 mt-0.5">
                            {areAllUnitsApproved
                              ? `All ${unitsList.length} Units Approved (100%)`
                              : unitsWithNoEvidence.length > 0
                                ? `${unitsWithNoEvidence.length} Unit(s) Missing Evidence`
                                : `${unitsPendingApproval.length} Unit(s) Pending Review`}
                          </span>
                        </div>
                      </div>

                      {/* Physical Observation Status */}
                      <div
                        className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                          isObservationFullyCompleted
                            ? "bg-emerald-50/60 border-emerald-100"
                            : "bg-gray-50/80 border-gray-100"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isObservationFullyCompleted ? (
                            <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <FiClock className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-neutral-primary">
                            Physical Observation
                          </span>
                          <span className="text-[11px] text-gray-600 mt-0.5">
                            {isObservationFullyCompleted
                              ? "ARF 02A & 04A Completed & Signed"
                              : !hasObservation
                                ? "Session Not Yet Scheduled"
                                : isObsPending
                                  ? "Session Awaiting Assessor Acceptance"
                                  : !hasFilledObservationForm
                                    ? "Forms ARF 02A & 04A Incomplete"
                                    : !hasAssessorSignature
                                      ? "Awaiting Assessor Signature"
                                      : "Awaiting Candidate Signature"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {canMoveToIqam
                          ? "All qualification requirements are met. You can now advance this application to the Internal Quality Assurance stage."
                          : "All units must have approved evidence and physical observation forms must be completed and signed by both assessor and candidate before hand-off."}
                      </p>
                      <button
                        type="button"
                        onClick={handleMoveToIqam}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                          canMoveToIqam
                            ? "bg-[#fbab2a] hover:bg-[#e89b1f] text-white shadow-xs"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        <span>{canMoveToIqam ? "Hand Over to IQAM" : "Check Requirements"}</span>
                        <FiArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <QualificationUnitsList
                  tradeName={tradeName}
                  level={
                    apiApp?.nsq?.wishedQualificationLevel
                      ? `Level ${apiApp.nsq.wishedQualificationLevel.level}`
                      : undefined
                  }
                  units={unitsList}
                  onSelectUnit={handleSelectUnit}
                  isLoading={isLoadingApp}
                />

                {/* 4. IQAM Forms Card — status from GET /applications/{id} `iqamForms` */}
                {isInternalVerificationStage && (
                  <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-extrabold text-neutral-primary tracking-tight">
                          IQAM Forms
                        </h3>
                        {(() => {
                          const ivReportSubmitted = Boolean(
                            apiApp?.iqamForms?.find((f) => f.key === "iv_report")
                              ?.submittedAt,
                          );
                          const finalPortfolioSubmitted = Boolean(
                            apiApp?.iqamForms?.find(
                              (f) => f.key === "final_portfolio",
                            )?.submittedAt,
                          );
                          return ivReportSubmitted && finalPortfolioSubmitted ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#1E7F4C]/10 text-[#1E7F4C]">
                              Up to Date
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-500/10 text-amber-700">
                              Attention Required
                            </span>
                          );
                        })()}
                      </div>

                      {roleCtx.canPerformIqa && (
                        <span className="self-start sm:self-auto text-[11px] font-bold text-neutral-secondary bg-gray-50 border border-gray-200/80 px-2.5 py-1 rounded-xl">
                          {roleCtx.isDualRole
                            ? "Acting as Internal Verifier"
                            : "Assigned Verifier"}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* CON 04 */}
                      {(() => {
                        const isSub = Boolean(apiApp?.iqamForms?.find((f) => f.key === "iv_report")?.submittedAt);
                        return (
                          <div className="p-3.5 sm:p-4.5 bg-gray-50/80 hover:bg-gray-100/80 rounded-2xl border border-gray-100/90 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-[#900B27]/10 text-[#900B27] tracking-wider uppercase shrink-0">
                                  CON 04
                                </span>
                                <div className="sm:hidden">
                                  {isSub ? (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1E7F4C]/10 text-[#1E7F4C]">
                                      Submitted
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-700">
                                      Pending
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold text-neutral-primary leading-snug">
                                  Comprehensive Internal Verifier Report Form
                                </h4>
                                <span className="text-[11px] text-gray-500 font-normal mt-0.5">
                                  CON/04/IQAM • Verification & Quality Evaluation
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/50 sm:border-transparent">
                              <div className="hidden sm:block shrink-0">
                                {isSub ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1E7F4C]/10 text-[#1E7F4C]">
                                    Submitted
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700">
                                    Pending
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => setActiveSubView("iqam_con04")}
                                className={`w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                                  isSub
                                    ? "border border-gray-200 text-gray-700 hover:bg-gray-100 bg-white"
                                    : roleCtx.canPerformIqa
                                      ? "bg-[#900B27] hover:bg-[#72081f] text-white shadow-xs"
                                      : "text-[#fbab2a] hover:underline"
                                }`}
                              >
                                {!isSub && roleCtx.canPerformIqa ? (
                                  <>
                                    <FiEdit3 className="w-3.5 h-3.5" />
                                    <span>Fill Form</span>
                                  </>
                                ) : (
                                  <span>View</span>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* CON 05 */}
                      {(() => {
                        const isSub = Boolean(apiApp?.iqamForms?.find((f) => f.key === "assessor_outcomes")?.submittedAt);
                        return (
                          <div className="p-3.5 sm:p-4.5 bg-gray-50/80 hover:bg-gray-100/80 rounded-2xl border border-gray-100/90 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-[#900B27]/10 text-[#900B27] tracking-wider uppercase shrink-0">
                                  CON 05
                                </span>
                                <div className="sm:hidden">
                                  {isSub ? (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1E7F4C]/10 text-[#1E7F4C]">
                                      Submitted
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-700">
                                      Pending
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold text-neutral-primary leading-snug">
                                  IV Observation &amp; Questioning Checklist
                                </h4>
                                <span className="text-[11px] text-gray-500 font-normal mt-0.5">
                                  CON/05/IQAM • Assessor Practice Observation
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/50 sm:border-transparent">
                              <div className="hidden sm:block shrink-0">
                                {isSub ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1E7F4C]/10 text-[#1E7F4C]">
                                    Submitted
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700">
                                    Pending
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => setActiveSubView("iqam_con05")}
                                className={`w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                                  isSub
                                    ? "border border-gray-200 text-gray-700 hover:bg-gray-100 bg-white"
                                    : roleCtx.canPerformIqa
                                      ? "bg-[#900B27] hover:bg-[#72081f] text-white shadow-xs"
                                      : "text-[#fbab2a] hover:underline"
                                }`}
                              >
                                {!isSub && roleCtx.canPerformIqa ? (
                                  <>
                                    <FiEdit3 className="w-3.5 h-3.5" />
                                    <span>Fill Checklist</span>
                                  </>
                                ) : (
                                  <span>View</span>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* CON 06 */}
                      {(() => {
                        const isSub = Boolean(apiApp?.iqamForms?.find((f) => f.key === "final_portfolio")?.submittedAt);
                        return (
                          <div className="p-3.5 sm:p-4.5 bg-gray-50/80 hover:bg-gray-100/80 rounded-2xl border border-gray-100/90 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-[#900B27]/10 text-[#900B27] tracking-wider uppercase shrink-0">
                                  CON 06
                                </span>
                                <div className="sm:hidden">
                                  {isSub ? (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1E7F4C]/10 text-[#1E7F4C]">
                                      Submitted
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-700">
                                      Pending
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold text-neutral-primary leading-snug">
                                  Final Portfolio / Award Report Form
                                </h4>
                                <span className="text-[11px] text-gray-500 font-normal mt-0.5">
                                  CON/06/IQAM • Final Award & Verification Audit
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/50 sm:border-transparent">
                              <div className="hidden sm:block shrink-0">
                                {isSub ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1E7F4C]/10 text-[#1E7F4C]">
                                    Submitted
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700">
                                    Pending
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => setActiveSubView("iqam_con06")}
                                className={`w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                                  isSub
                                    ? "border border-gray-200 text-gray-700 hover:bg-gray-100 bg-white"
                                    : roleCtx.canPerformIqa
                                      ? "bg-[#900B27] hover:bg-[#72081f] text-white shadow-xs"
                                      : "text-[#fbab2a] hover:underline"
                                }`}
                              >
                                {!isSub && roleCtx.canPerformIqa ? (
                                  <>
                                    <FiEdit3 className="w-3.5 h-3.5" />
                                    <span>Fill Report</span>
                                  </>
                                ) : (
                                  <span>View</span>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-t border-gray-100">
                        <span className="text-xs text-neutral-secondary font-medium leading-relaxed">
                          Need to review sampling plans, records or candidate allocations?
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveSubView("iqam_workspace")}
                          className="text-xs font-bold text-[#fbab2a] hover:text-[#e89b1f] hover:underline flex items-center gap-1.5 cursor-pointer shrink-0 py-1"
                        >
                          <span>Open Full IQAM Workspace (CON 01 – CON 06)</span>
                          <FiArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {isIqamFormsComplete && !isIvApproved && (
                      <button
                        type="button"
                        onClick={() => setIsReviewIvModalOpen(true)}
                        className="w-full h-11 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Mark IQA Competent</span>
                        <FiCheck className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-4 w-full">
            <NsqAssessorSidebar
              candidate={{
                name: candidateName,
                email: candidateEmail,
                phone: candidatePhone,
                photoUrl: application.candidatePhotoUrl,
              }}
              observation={observation}
              observationActionLabel={
                hasFilledObservationForm ? "View" : "Fill Form"
              }
              onOpenObservationModal={() => setIsObsModalOpen(true)}
              onFillObservationForm={() => setActiveSubView("observation_form")}
            />
          </div>
        </div>
      </div>

      <NsqAssessorInductionModal
        isOpen={isInductionModalOpen}
        onClose={() => setIsInductionModalOpen(false)}
        candidateName={candidateName}
        tradeName={tradeName}
        inductionData={inductionForm}
      />

      {observation && (
        <NsqAssessorObservationModal
          isOpen={isObsModalOpen}
          onClose={() => setIsObsModalOpen(false)}
          details={observation}
          onAccept={(payload) => {
            setPendingAcceptRequirements(payload.requirements);
            setIsObsModalOpen(false);
            setIsConfirmAcceptObsOpen(true);
          }}
          onReject={() => {
            setIsObsModalOpen(false);
            setIsRejectObsReasonOpen(true);
          }}
        />
      )}

      <ConfirmAcceptObservationModal
        isOpen={isConfirmAcceptObsOpen}
        onClose={() => setIsConfirmAcceptObsOpen(false)}
        onConfirm={handleFinalConfirmAcceptObs}
      />

      <RejectEvidenceModal
        isOpen={isRejectObsReasonOpen}
        modalKey={NSQ_REJECT_OBSERVATION_MODAL}
        onClose={() => setIsRejectObsReasonOpen(false)}
        onSubmit={handleRejectObservation}
        title="Reject Observation Request"
        subtitle="Let the candidate know why this request is being rejected"
        submitLabel="Reject Request"
      />

      <ObservationAcceptedSuccessModal
        isOpen={isAcceptObsSuccessOpen}
        onClose={() => setIsAcceptObsSuccessOpen(false)}
      />

      <ObservationRejectedSuccessModal
        isOpen={isRejectObsSuccessOpen}
        onClose={() => setIsRejectObsSuccessOpen(false)}
      />

      <ReviewVerifierModal
        isOpen={isReviewIvModalOpen}
        onClose={() => setIsReviewIvModalOpen(false)}
        applicationId={application.id}
        verifierType="internal"
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: APPLICATION_QUERY_KEYS.detail(application.id),
          });
          queryClient.invalidateQueries({
            queryKey: APPLICATION_QUERY_KEYS.stages(application.id),
          });
        }}
      />

      <AnimatePresence>
        {isMoveToIqamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-text">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-gray-100 flex flex-col gap-5"
            >
              <button
                type="button"
                onClick={() => setIsMoveToIqamModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FiCheckCircle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Hand Over to Internal Verification (IQAM)?
                  </h3>
                  <p className="text-xs text-gray-500">
                    Candidate:{" "}
                    <span className="font-semibold text-gray-700">
                      {candidateName}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">
                    Total Qualification Units:
                  </span>
                  <span className="font-bold text-gray-900">
                    {unitsList.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">
                    Units with Approved Evidence:
                  </span>
                  <span className="font-bold text-emerald-600">
                    {unitsList.length} of {unitsList.length} (100% Complete)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">
                    Physical Observation &amp; Oral Exam:
                  </span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <FiCheck className="w-3.5 h-3.5" />
                    Completed &amp; Signed
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 flex items-start gap-2.5">
                <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Assessment Requirements Met: </span>
                  All qualification units have approved evidence and the physical observation record is signed by both assessor and candidate.
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Advancing will sign off all qualification units and transition the
                application to the <strong>Internal Verification (IQA)</strong>{" "}
                stage for sampling and quality assurance by the Internal Verifier.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMoveToIqamModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="button"
                  variant="amber"
                  loading={isMovingToIqam}
                  onClick={executeMoveToIqam}
                  className="px-6 py-2.5 bg-[#fbab2a] hover:bg-[#e89b1f] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer border-none"
                >
                  Confirm &amp; Move to IQAM
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
