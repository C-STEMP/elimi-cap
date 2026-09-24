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
import React, { useEffect, useRef, useState } from "react";
import { FiAlertTriangle, FiCheck, FiInfo, FiX } from "react-icons/fi";
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
  | "iqam_con06";

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
    if (next === "overview") onSubViewChange?.(null);
    else if (next === "unit")
      onSubViewChange?.(selectedUnit?.unitNo || "UNIT 1");
    else if (next === "observation_form")
      onSubViewChange?.("Physical Observation Form");
    else if (next === "iqam_con04")
      onSubViewChange?.("Comprehensive Internal Verifier Report Form");
    else if (next === "iqam_con05")
      onSubViewChange?.("IV Observation & Questioning Checklist");
    else if (next === "iqam_con06")
      onSubViewChange?.("Final Portfolio / Award Report Form");
  };

  const { data: apiApp, isLoading: isLoadingApp } = useGetApplicationById(
    application.id,
    {
      refetchInterval: APPLICATION_DETAIL_REFRESH_INTERVAL_MS,
    },
  );
  const { data: inductionForm } = useGetInductionForm(application.id);

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

  const [isMoveToIqamModalOpen, setIsMoveToIqamModalOpen] = useState(false);
  const [isMovingToIqam, setIsMovingToIqam] = useState(false);

  const handleMoveToIqam = () => {
    const unitsWithEvidence = unitsList.filter((u) => (u.totalCount ?? 0) > 0);
    const notFullyApproved = unitsWithEvidence.filter(
      (u) => (u.approvedCount ?? 0) !== (u.totalCount ?? 0),
    );

    if (unitsWithEvidence.length === 0) {
      toast({
        type: "error",
        title: "No Evidence Submitted",
        description: "There's no unit evidence to sign off yet.",
      });
      return;
    }

    if (notFullyApproved.length > 0) {
      toast({
        type: "error",
        title: "Units Not Ready",
        description: `Approve all evidence in ${notFullyApproved
          .map((u) => u.unitNo)
          .join(", ")} before moving this application to IQAM.`,
      });
      return;
    }

    setIsMoveToIqamModalOpen(true);
  };

  const executeMoveToIqam = async () => {
    const unitsWithEvidence = unitsList.filter((u) => (u.totalCount ?? 0) > 0);
    setIsMovingToIqam(true);

    try {
      await Promise.all(
        unitsWithEvidence.map((u) =>
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
    unitsWithEvidence.forEach((u) => {
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
          feedback: `QAA assessment complete for ${candidateName} — ready for Internal Quality Assurance.`,
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
      description: `All units signed off. Application for ${candidateName} has moved to Internal Quality Assurance.`,
    });
  };

  useEffect(() => {
    onRegisterMoveToIqam?.(handleMoveToIqam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRegisterMoveToIqam, candidateName, apiApp?.nsq?.units]);

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

  const unitsWithEvidence = unitsList.filter((u) => (u.totalCount ?? 0) > 0);
  const notFullyApproved = unitsWithEvidence.filter(
    (u) => (u.approvedCount ?? 0) !== (u.totalCount ?? 0),
  );
  const isRegularAssessmentStage = effectiveStageKey === "regular_assessment";
  const canMoveToIqam = Boolean(
    !hasMovedToIqam &&
    isRegularAssessmentStage &&
    unitsWithEvidence.length > 0 &&
    notFullyApproved.length === 0,
  );

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
        onBack={() => setActiveSubView("overview")}
      />
    );
  }

  if (isInternalVerificationStage && activeSubView === "iqam_con05") {
    return (
      <ObservationChecklistView
        applicationId={application.id}
        candidateName={candidateName}
        onBack={() => setActiveSubView("overview")}
      />
    );
  }

  if (isInternalVerificationStage && activeSubView === "iqam_con06") {
    return (
      <FinalPortfolioReportView
        applicationId={application.id}
        candidateName={candidateName}
        onBack={() => setActiveSubView("overview")}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center select-text">
      <div className="w-full max-w-7xl xl:max-w-360 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 flex flex-col gap-6 w-full">
            {isInternalVerificationStage && (
              <div className="bg-blue-50/90 border border-blue-200 rounded-3xl p-5 sm:p-6 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
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
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-extrabold text-neutral-primary tracking-tight">
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
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-primary/10 text-primary">
                        Attention Required
                      </span>
                    );
                  })()}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="p-4 bg-gray-50/70 hover:bg-gray-100/70 rounded-2xl border border-gray-100/80 transition-all flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
                        Comprehensive Internal Verifier Report Form
                      </span>
                      {apiApp?.iqamForms?.find((f) => f.key === "iv_report")
                        ?.submittedAt && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1E7F4C]/10 text-[#1E7F4C]">
                          Submitted
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSubView("iqam_con04")}
                      className="text-[#fbab2a] hover:text-[#e89b1f] hover:underline font-bold text-xs sm:text-sm cursor-pointer select-none shrink-0"
                    >
                      View
                    </button>
                  </div>

                  <div className="p-4 bg-gray-50/70 hover:bg-gray-100/70 rounded-2xl border border-gray-100/80 transition-all flex items-center justify-between gap-3">
                    <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
                      IV Observation & Questioning Checklist
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveSubView("iqam_con05")}
                      className="text-[#fbab2a] hover:text-[#e89b1f] hover:underline font-bold text-xs sm:text-sm cursor-pointer select-none shrink-0"
                    >
                      View
                    </button>
                  </div>

                  <div className="p-4 bg-gray-50/70 hover:bg-gray-100/70 rounded-2xl border border-gray-100/80 transition-all flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
                        Final Portfolio / Award Report Form
                      </span>
                      {apiApp?.iqamForms?.find(
                        (f) => f.key === "final_portfolio",
                      )?.submittedAt && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1E7F4C]/10 text-[#1E7F4C]">
                          Submitted
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSubView("iqam_con06")}
                      className="text-[#fbab2a] hover:text-[#e89b1f] hover:underline font-bold text-xs sm:text-sm cursor-pointer select-none shrink-0"
                    >
                      View
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
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <FiAlertTriangle className="w-6 h-6" />
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
                    {
                      unitsList.filter(
                        (u) =>
                          (u.totalCount ?? 0) > 0 &&
                          u.approvedCount === u.totalCount,
                      ).length
                    }
                  </span>
                </div>
                {unitsList.filter((u) => (u.approvedCount ?? 0) === 0).length >
                  0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">
                      Units without Evidence:
                    </span>
                    <span className="font-bold text-amber-600">
                      {
                        unitsList.filter((u) => (u.approvedCount ?? 0) === 0)
                          .length
                      }
                    </span>
                  </div>
                )}
              </div>

              {unitsList.filter((u) => (u.approvedCount ?? 0) === 0).length >
                0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-start gap-2.5">
                  <FiAlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Important Warning: </span>
                    Not all qualification units have approved evidence. Moving
                    to IQAM will finalize the assessment phase. Once moved, the
                    candidate will{" "}
                    <strong>no longer be able to upload evidence</strong> for
                    any remaining units.
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 leading-relaxed">
                Advancing will sign off all eligible units and transition the
                application to the <strong>Internal Verification (IQA)</strong>{" "}
                stage for sampling by the Internal Verifier.
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
