"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FiChevronLeft, FiPlus, FiCheck } from "react-icons/fi";
import { NsqAssessorSidebar } from "./NsqAssessorSidebar";
import { NsqAssessorUnitDetailView } from "./NsqAssessorUnitDetailView";
import { NsqAssessorObservationFormsView } from "./NsqAssessorObservationFormsView";
import { NsqAssessorInductionModal } from "./NsqAssessorInductionModal";
import { QualificationStandardCard } from "./components/detail/QualificationStandardCard";
import { CandidateInductionTriggerCard } from "./components/detail/CandidateInductionTriggerCard";
import {
  QualificationUnitsList,
  type QualificationUnitItem,
} from "./components/detail/QualificationUnitsList";
import {
  NsqAssessorObservationModal,
  type ObservationRequestDetails,
} from "./NsqAssessorObservationModal";
import {
  ConfirmAcceptObservationModal,
  ObservationAcceptedSuccessModal,
  ObservationRejectedSuccessModal,
  RejectEvidenceModal,
} from "./NsqAssessorModals";
import { ComprehensiveReportView } from "../../../iqam/components/con04/ComprehensiveReportView";
import { ObservationChecklistView } from "../../../iqam/components/con05/ObservationChecklistView";
import { FinalPortfolioReportView } from "../../../iqam/components/con06/FinalPortfolioReportView";
import { ReviewVerifierModal } from "@/src/features/assessment-centre/features/Applications/components/ReviewVerifierModal";
import { useToast } from "@/src/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetApplicationById,
  useGetInductionForm,
  useGetDirectObservations,
  useReviewDirectObservation,
  useReviewApplication,
} from "@/src/features/shared/applications/hooks";
import {
  APPLICATION_QUERY_KEYS,
  APPLICATION_DETAIL_REFRESH_INTERVAL_MS,
} from "@/src/features/shared/applications/hooks/queryKeys";
import { submitUnitSignoffApi } from "@/src/features/shared/applications/api";
import {
  useGetTradeDetail,
  useGetEvidenceTypesByTrade,
} from "@/src/features/shared/reference/hooks";
import type { DirectObservationSession } from "@/src/features/shared/applications/api/types";
import type { AssessorApplicationRecord } from "../../types/applications.types";

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
  subViewNavState?: NsqAssessorSubView;
  onSubViewNavStateChange?: (state: NsqAssessorSubView) => void;
}

// Workflow order — moving to IQAM means the application is on this stage or
// later, i.e. regular_assessment (QAA) has already been marked complete.
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
  subViewNavState: externalNavState,
  onSubViewNavStateChange,
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [internalSubView, setInternalSubView] = useState<NsqAssessorSubView>("overview");
  const activeSubView = externalNavState || internalSubView;
  const [isReviewIvModalOpen, setIsReviewIvModalOpen] = useState(false);

  const setActiveSubView = (next: NsqAssessorSubView) => {
    setInternalSubView(next);
    onSubViewNavStateChange?.(next);
    if (next === "overview") onSubViewChange?.(null);
    else if (next === "unit") onSubViewChange?.(selectedUnit?.unitNo || "UNIT 1");
    else if (next === "observation_form") onSubViewChange?.("Physical Observation Form");
    else if (next === "iqam_con04") onSubViewChange?.("Comprehensive Internal Verifier Report Form");
    else if (next === "iqam_con05") onSubViewChange?.("IV Observation & Questioning Checklist");
    else if (next === "iqam_con06") onSubViewChange?.("Final Portfolio / Award Report Form");
  };

  // Full application detail — same query key as the route view that fetched
  // this application, so it's served from cache rather than refetched.
  const { data: apiApp, isLoading: isLoadingApp } = useGetApplicationById(application.id, {
    refetchInterval: APPLICATION_DETAIL_REFRESH_INTERVAL_MS,
  });
  const { data: inductionForm } = useGetInductionForm(application.id);

  const tradeId = apiApp?.tradeId || "";
  const { data: tradeDetail } = useGetTradeDetail(tradeId);
  const { data: remoteEvidenceTypes = [] } = useGetEvidenceTypesByTrade(tradeId);

  // Real qualification units — GET /applications/{id} `nsq.units`, already
  // carrying per-unit evidence counts (criteriaApproved/criteriaTotal) and
  // the "new upload" signal (criteriaPending > 0). No extra fetch needed.
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

  const [selectedUnit, setSelectedUnit] = useState<QualificationUnitItem | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realUnits, searchParams]);

  // Direct Observation Queries & Mutation
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
    liveObs?.physicalStatus === "submitted" && liveObs?.oralStatus === "submitted";

  const { mutateAsync: reviewObservationMutation } = useReviewDirectObservation(
    application.id,
    effectiveSessionId,
  );
  const { mutateAsync: reviewApplicationMutation } = useReviewApplication();
  const queryClient = useQueryClient();

  // Observation Request State — seeded from the real backend session and
  // kept as local state only so accept/reject can optimistically update it.
  const [observation, setObservation] = useState<ObservationRequestDetails | null>(
    mapSessionToObservation(liveObs),
  );

  useEffect(() => {
    setObservation(mapSessionToObservation(liveObs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveObs?.id, liveObs?.status, liveObs?.scheduledAt]);

  const [isInductionModalOpen, setIsInductionModalOpen] = useState(false);
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [isConfirmAcceptObsOpen, setIsConfirmAcceptObsOpen] = useState(false);
  const [isRejectObsReasonOpen, setIsRejectObsReasonOpen] = useState(false);
  const [isAcceptObsSuccessOpen, setIsAcceptObsSuccessOpen] = useState(false);
  const [isRejectObsSuccessOpen, setIsRejectObsSuccessOpen] = useState(false);
  const [pendingAcceptRequirements, setPendingAcceptRequirements] = useState<
    string[]
  >([]);

  const candidateName = application.candidateName || "Candidate";
  const tradeName = tradeDetail?.name || application.trade || "—";
  const candidateEmail = apiApp?.personalInformation?.contactInformation?.emailAddress;
  const candidatePhoneNumber = apiApp?.personalInformation?.contactInformation?.phoneNumber;
  const candidatePhone = candidatePhoneNumber?.number
    ? `${candidatePhoneNumber.countryCode || ""} ${candidatePhoneNumber.number}`.trim()
    : undefined;

  const evidenceTypesText = remoteEvidenceTypes.length > 0 ? remoteEvidenceTypes.join("/") : undefined;

  const handleSelectUnit = (unit: QualificationUnitItem) => {
    setSelectedUnit(unit);
    setActiveSubView("unit");
    const params = new URLSearchParams(searchParams.toString());
    params.set("unit", unit.id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleBackFromUnit = () => {
    setActiveSubView("overview");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("unit");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // Every unit with attached evidence must be individually signed off
  // (POST /applications/{id}/units/{unitId}/signoff) before the application
  // can move to Internal Quality Assurance — units are the primary
  // assessable entity, so a single blanket approval can't stand in for it.
  // Once every eligible unit is signed off, the regular_assessment stage is
  // marked complete, which advances the application to internal_verification
  // — the centre then assigns the IQA from there (a separate, centre-driven
  // step via POST /applications/{id}/iv).
  const handleMoveToIqam = async () => {
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
      // useReviewApplication already surfaced an error toast.
      return;
    }

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

  const hasMovedToIqam = Boolean(
    apiApp?.currentStageKey &&
      STAGE_ORDER.indexOf(apiApp.currentStageKey) > STAGE_ORDER.indexOf("regular_assessment"),
  );

  // Once every IQAM form is submitted, the assigned IV can mark themselves
  // competent (POST /applications/{id}/iv/review) — only the assigned IV may
  // call this, which is why it lives here rather than on the centre's view.
  const isIqamFormsComplete = Boolean(
    apiApp?.iqamForms?.length && apiApp.iqamForms.every((f) => f.status === "submitted"),
  );
  const isIvApproved = Boolean((apiApp as any)?.ivApproved);

  useEffect(() => {
    onMoveToIqamStatusChange?.(hasMovedToIqam);
  }, [onMoveToIqamStatusChange, hasMovedToIqam]);

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
      setObservation({ ...observation, status: "rejected", rejectionReason: reason });
    }
  };

  const handleFinalConfirmAcceptObs = async () => {
    setIsConfirmAcceptObsOpen(false);
    try {
      await acceptObservation(pendingAcceptRequirements);
    } catch {
      // useReviewDirectObservation already surfaced an error toast.
      return;
    }
    setIsAcceptObsSuccessOpen(true);
  };

  const handleRejectObservation = async (reason: string) => {
    setIsRejectObsReasonOpen(false);
    try {
      await rejectObservation(reason);
    } catch {
      // useReviewDirectObservation already surfaced an error toast.
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
                .map((unitId) => unitsList.find((u) => u.id === unitId)?.unitNo || unitId)
                .join("/")
            : undefined
        }
        onBack={() => setActiveSubView("overview")}
        onSubmitSuccess={() => {
          if (observation) setObservation({ ...observation, status: "confirmed" });
        }}
      />
    );
  }

  if (activeSubView === "iqam_con04") {
    return (
      <ComprehensiveReportView
        applicationId={application.id}
        candidateName={candidateName}
        onBack={() => setActiveSubView("overview")}
      />
    );
  }

  if (activeSubView === "iqam_con05") {
    return (
      <ObservationChecklistView
        applicationId={application.id}
        candidateName={candidateName}
        onBack={() => setActiveSubView("overview")}
      />
    );
  }

  if (activeSubView === "iqam_con06") {
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
            <CandidateInductionTriggerCard onView={() => setIsInductionModalOpen(true)} />
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
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-extrabold text-neutral-primary tracking-tight">
                  IQAM Forms
                </h3>
                {(() => {
                  const ivReportSubmitted = Boolean(
                    apiApp?.iqamForms?.find((f) => f.key === "iv_report")?.submittedAt,
                  );
                  const finalPortfolioSubmitted = Boolean(
                    apiApp?.iqamForms?.find((f) => f.key === "final_portfolio")?.submittedAt,
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
                    {apiApp?.iqamForms?.find((f) => f.key === "iv_report")?.submittedAt && (
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
                    {apiApp?.iqamForms?.find((f) => f.key === "final_portfolio")?.submittedAt && (
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
              observationActionLabel={hasFilledObservationForm ? "View" : "Fill Form"}
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
          queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.detail(application.id) });
          queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.stages(application.id) });
        }}
      />
    </div>
  );
};
