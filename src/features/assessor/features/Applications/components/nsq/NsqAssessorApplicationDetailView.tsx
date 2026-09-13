"use client";

import React, { useEffect, useState } from "react";
import { FiChevronLeft, FiPlus } from "react-icons/fi";
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
} from "./NsqAssessorModals";
import { ComprehensiveReportView } from "../../../iqam/components/con04/ComprehensiveReportView";
import { ObservationChecklistView } from "../../../iqam/components/con05/ObservationChecklistView";
import { FinalPortfolioReportView } from "../../../iqam/components/con06/FinalPortfolioReportView";
import { useToast } from "@/src/components/ui/toast";
import {
  useGetApplicationById,
  useGetInductionForm,
  useGetDirectObservations,
  useReviewDirectObservation,
} from "@/src/features/shared/applications/hooks";
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
    isSigned: Boolean(session.learnerSignature),
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
  subViewNavState?: NsqAssessorSubView;
  onSubViewNavStateChange?: (state: NsqAssessorSubView) => void;
}

const DEFAULT_UNITS: QualificationUnitItem[] = [
  { id: "unit-1", unitNo: "UNIT 1", title: "Lorem ipsum dolor dolor satuir", approvedCount: 0, totalCount: 10, hasNewUpload: false },
  { id: "unit-2", unitNo: "UNIT 2", title: "Lorem ipsum dolor dolor satuir", approvedCount: 10, totalCount: 10, hasNewUpload: false },
  { id: "unit-3", unitNo: "UNIT 3", title: "Lorem ipsum dolor dolor satuir", approvedCount: 10, totalCount: 10, hasNewUpload: false },
];

export const NsqAssessorApplicationDetailView: React.FC<
  NsqAssessorApplicationDetailViewProps
> = ({
  application,
  onBack,
  showHeader = false,
  onSubViewChange,
  onRegisterMoveToIqam,
  subViewNavState: externalNavState,
  onSubViewNavStateChange,
}) => {
  const { toast } = useToast();
  const [internalSubView, setInternalSubView] = useState<NsqAssessorSubView>("overview");
  const activeSubView = externalNavState || internalSubView;

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
  const { data: apiApp } = useGetApplicationById(application.id);
  const { data: inductionForm } = useGetInductionForm(application.id);

  const tradeId = apiApp?.tradeId || "";
  const { data: tradeDetail } = useGetTradeDetail(tradeId);
  const { data: remoteEvidenceTypes = [] } = useGetEvidenceTypesByTrade(tradeId);

  // Real qualification units — GET /applications/{id} `nsq.units`, already
  // carrying per-unit evidence counts (criteriaApproved/criteriaTotal) and
  // the "new upload" signal (criteriaPending > 0). No extra fetch needed.
  const realUnits: QualificationUnitItem[] | null = apiApp?.nsq?.units?.length
    ? apiApp.nsq.units.map((u) => ({
        id: u.id,
        unitNo: u.referenceNumber,
        title: u.title,
        approvedCount: u.criteriaApproved,
        totalCount: u.criteriaTotal,
        hasNewUpload: u.criteriaPending > 0,
      }))
    : null;
  const unitsList = realUnits || DEFAULT_UNITS;

  const [selectedUnit, setSelectedUnit] = useState<QualificationUnitItem | null>(null);

  // Keep the selected unit in sync once real units load.
  useEffect(() => {
    if (realUnits && realUnits.length > 0 && !selectedUnit) {
      setSelectedUnit(realUnits[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realUnits]);

  // Direct Observation Queries & Mutation
  const { data: directObsList } = useGetDirectObservations(application.id, {
    enabled: Boolean(application.id),
  });
  const liveObs = directObsList?.items?.[0];
  const effectiveSessionId = liveObs?.id || "session-1";

  const { mutateAsync: reviewObservationMutation } = useReviewDirectObservation(
    application.id,
    effectiveSessionId,
  );

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
  const [isAcceptObsSuccessOpen, setIsAcceptObsSuccessOpen] = useState(false);
  const [isRejectObsSuccessOpen, setIsRejectObsSuccessOpen] = useState(false);

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
  };

  // No backend "move to IQAM" action exists for NSQ — IV assignment is
  // centre-driven (POST /applications/{id}/iv). This stays an informational
  // nudge for the assessor rather than a state-changing call.
  const handleMoveToIqam = () => {
    toast({
      type: "success",
      title: "Handed over to IQAM",
      description: `Application for ${candidateName} has been recommended to Internal Quality Assurance.`,
    });
  };

  useEffect(() => {
    onRegisterMoveToIqam?.(handleMoveToIqam);
  }, [onRegisterMoveToIqam, candidateName]);

  const handleFinalConfirmAcceptObs = async () => {
    setIsConfirmAcceptObsOpen(false);
    try {
      await reviewObservationMutation({ decision: "accept" });
    } catch {
      // useReviewDirectObservation already surfaced an error toast.
      return;
    }
    if (observation) setObservation({ ...observation, status: "confirmed", isSigned: true });
    setIsAcceptObsSuccessOpen(true);
  };

  const handleRejectObservation = async () => {
    const reason = "Safety criteria and venue protocol did not meet required standards.";
    setIsObsModalOpen(false);
    try {
      await reviewObservationMutation({ decision: "reject", comment: reason });
    } catch {
      // useReviewDirectObservation already surfaced an error toast.
      return;
    }
    if (observation) {
      setObservation({
        ...observation,
        status: "rejected",
        rejectionReason: reason,
      });
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
        onUpdateObservation={setObservation}
        onBack={() => setActiveSubView("overview")}
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
              units={unitsList}
              onSelectUnit={handleSelectUnit}
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
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#ecfdf5] text-[#10b981]">
                      Up to Date
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#fce7f3] text-[#be185d]">
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
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#ecfdf5] text-[#10b981]">
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
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#ecfdf5] text-[#10b981]">
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
          onAccept={() => {
            setIsObsModalOpen(false);
            setIsConfirmAcceptObsOpen(true);
          }}
          onReject={handleRejectObservation}
        />
      )}

      <ConfirmAcceptObservationModal
        isOpen={isConfirmAcceptObsOpen}
        onClose={() => setIsConfirmAcceptObsOpen(false)}
        onConfirm={handleFinalConfirmAcceptObs}
      />

      <ObservationAcceptedSuccessModal
        isOpen={isAcceptObsSuccessOpen}
        onClose={() => setIsAcceptObsSuccessOpen(false)}
      />

      <ObservationRejectedSuccessModal
        isOpen={isRejectObsSuccessOpen}
        onClose={() => setIsRejectObsSuccessOpen(false)}
      />
    </div>
  );
};
