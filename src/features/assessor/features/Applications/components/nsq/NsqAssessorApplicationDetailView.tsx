"use client";

import React, { useState, useEffect } from "react";
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
import type { AssessorApplicationRecord } from "../../types/applications.types";

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

  const [selectedUnit, setSelectedUnit] = useState<QualificationUnitItem | null>(DEFAULT_UNITS[0]);

  // Observation Request State
  const [observation, setObservation] = useState<ObservationRequestDetails | null>({
    units: ["UNIT 1", "UNIT 2", "UNIT 3"],
    time: "12:00PM",
    date: "22/03/2026",
    country: "Nigeria",
    state: "Abuja",
    lga: "Bwari",
    address: "3 Abbey Street, Kubwa Expressway",
    status: "confirmed",
    isSigned: true,
  });

  const [isInductionModalOpen, setIsInductionModalOpen] = useState(false);
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [isConfirmAcceptObsOpen, setIsConfirmAcceptObsOpen] = useState(false);
  const [isAcceptObsSuccessOpen, setIsAcceptObsSuccessOpen] = useState(false);
  const [isRejectObsSuccessOpen, setIsRejectObsSuccessOpen] = useState(false);

  const candidateName = application.candidateName || "Samson David";
  const tradeName = application.trade || "Masonry";

  const handleSelectUnit = (unit: QualificationUnitItem) => {
    setSelectedUnit(unit);
    setActiveSubView("unit");
  };

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

  const handleFinalConfirmAcceptObs = () => {
    if (observation) setObservation({ ...observation, status: "confirmed", isSigned: true });
    setIsConfirmAcceptObsOpen(false);
    setIsAcceptObsSuccessOpen(true);
  };

  const handleRejectObservation = () => {
    if (observation) {
      setObservation({
        ...observation,
        status: "rejected",
        rejectionReason: "Safety criteria and venue protocol did not meet required standards.",
      });
    }
    setIsObsModalOpen(false);
    setIsRejectObsSuccessOpen(true);
  };

  if (activeSubView === "unit" && selectedUnit) {
    return (
      <NsqAssessorUnitDetailView
        unitNumber={selectedUnit.unitNo}
        unitTitle={selectedUnit.title}
        candidateName={candidateName}
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
        candidateName={candidateName}
        applicationId={application.id}
        unitsAssessed="UNIT 1/UNIT 2/UNIT 3"
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
        candidateName={candidateName}
        onBack={() => setActiveSubView("overview")}
      />
    );
  }

  if (activeSubView === "iqam_con05") {
    return (
      <ObservationChecklistView
        candidateName={candidateName}
        onBack={() => setActiveSubView("overview")}
      />
    );
  }

  if (activeSubView === "iqam_con06") {
    return (
      <FinalPortfolioReportView
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
            <QualificationStandardCard tradeName={tradeName} />
            <CandidateInductionTriggerCard onView={() => setIsInductionModalOpen(true)} />
            <QualificationUnitsList
              tradeName={tradeName}
              units={DEFAULT_UNITS}
              onSelectUnit={handleSelectUnit}
            />

            {/* 4. IQAM Forms Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-extrabold text-neutral-primary tracking-tight">
                  IQAM Forms
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#fce7f3] text-[#be185d]">
                  Attention Required
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-4 bg-gray-50/70 hover:bg-gray-100/70 rounded-2xl border border-gray-100/80 transition-all flex items-center justify-between gap-3">
                  <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
                    Comprehensive Internal Verifier Report Form
                  </span>
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
                  <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
                    Final Portfolio / Award Report Form
                  </span>
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
                email: "Samsondav@gmail.com",
                phone: "+2349123537212",
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
