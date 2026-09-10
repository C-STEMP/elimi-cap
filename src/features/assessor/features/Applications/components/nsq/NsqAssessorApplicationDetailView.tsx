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
import { useToast } from "@/src/components/ui/toast";
import type { AssessorApplicationRecord } from "../../types/applications.types";

export interface NsqAssessorApplicationDetailViewProps {
  application: AssessorApplicationRecord;
  onBack: () => void;
  showHeader?: boolean;
  onSubViewChange?: (subViewTitle: string | null) => void;
  onRegisterMoveToIqam?: (fn: () => void) => void;
  subViewNavState?: "overview" | "unit" | "observation_form";
  onSubViewNavStateChange?: (state: "overview" | "unit" | "observation_form") => void;
}

const DEFAULT_UNITS: QualificationUnitItem[] = [
  { id: "unit-1", unitNo: "UNIT 1", title: "Lorem ipsum dolor dolor satuir", approvedCount: 0, totalCount: 10, hasNewUpload: false },
  { id: "unit-2", unitNo: "UNIT 2", title: "Lorem ipsum dolor dolor satuir", approvedCount: 0, totalCount: 10, hasNewUpload: true },
  { id: "unit-3", unitNo: "UNIT 3", title: "Lorem ipsum dolor dolor satuir", approvedCount: 0, totalCount: 10, hasNewUpload: false },
  { id: "unit-4", unitNo: "UNIT 4", title: "Lorem ipsum dolor dolor satuir", approvedCount: 0, totalCount: 10, hasNewUpload: false },
  { id: "unit-5", unitNo: "UNIT 5", title: "Lorem ipsum dolor dolor satuir", approvedCount: 0, totalCount: 10, hasNewUpload: true },
  { id: "unit-6", unitNo: "UNIT 6", title: "Lorem ipsum dolor dolor satuir", approvedCount: 0, totalCount: 10, hasNewUpload: false },
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
  const [internalSubView, setInternalSubView] = useState<"overview" | "unit" | "observation_form">("overview");
  const activeSubView = externalNavState || internalSubView;

  const setActiveSubView = (next: "overview" | "unit" | "observation_form") => {
    setInternalSubView(next);
    onSubViewNavStateChange?.(next);
    if (next === "overview") onSubViewChange?.(null);
    else if (next === "unit") onSubViewChange?.(selectedUnit?.unitNo || "UNIT 1");
    else if (next === "observation_form") onSubViewChange?.("Physical Observation Form");
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
