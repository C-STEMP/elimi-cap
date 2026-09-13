"use client";

import React, { useState, useEffect } from "react";
import { FiChevronLeft } from "react-icons/fi";
import { NsqAssessorSidebar } from "./NsqAssessorSidebar";
import {
  LearningOutcomeAccordionItem,
  type UnitLearningOutcome,
} from "./components/unit/LearningOutcomeAccordionItem";
import {
  ConfirmApproveEvidenceModal,
  EvidenceApprovedSuccessModal,
  RejectEvidenceModal,
  ConfirmAcceptObservationModal,
  ObservationAcceptedSuccessModal,
  ObservationRejectedSuccessModal,
} from "./NsqAssessorModals";
import {
  NsqAssessorObservationModal,
  type ObservationRequestDetails,
} from "./NsqAssessorObservationModal";
import {
  useGetUnitCriteria,
  useReviewUnitEvidence,
} from "@/src/features/shared/applications/hooks";

interface NsqAssessorUnitDetailViewProps {
  unitId?: string;
  unitNumber?: string;
  unitTitle?: string;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  candidatePhotoUrl?: string | null;
  applicationId: string;
  observation: ObservationRequestDetails | null;
  onUpdateObservation: (updated: ObservationRequestDetails) => void;
  onBack: () => void;
  onFillObservationForm: () => void;
}

const INITIAL_OUTCOMES: UnitLearningOutcome[] = [
  {
    id: "lo-1",
    title: "LO 1: Maintain personal health and hygiene",
    hasNewUpload: true,
    criteria: [
      {
        id: "pc-1-1",
        code: "PC 1.1",
        description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.",
        hasNewUpload: true,
        evidences: [
          { id: "ev-1", name: "Work Product(WP)", type: "WP", status: "approved" },
          {
            id: "ev-2",
            name: "Work Product(WP)",
            type: "WP",
            status: "rejected",
            feedback: "The uploaded photograph does not show compulsory eye shield/goggles while operating",
          },
          { id: "ev-3", name: "Work Product(WP)", type: "WP", status: "in_review" },
        ],
      },
      { id: "pc-1-2", code: "PC 1.2", description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.", evidences: [] },
      { id: "pc-1-3", code: "PC 1.3", description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.", hasNewUpload: true, evidences: [] },
      { id: "pc-1-4", code: "PC 1.4", description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.", evidences: [] },
      { id: "pc-1-5", code: "PC 1.5", description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.", evidences: [] },
      { id: "pc-1-6", code: "PC 1.6", description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.", evidences: [] },
      { id: "pc-1-7", code: "PC 1.7", description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.", evidences: [] },
      { id: "pc-1-8", code: "PC 1.8", description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.", evidences: [] },
      { id: "pc-1-9", code: "PC 1.9", description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.", evidences: [] },
    ],
  },
  { id: "lo-2", title: "LO 2: Maintain a hygienic, safe and hazard free workplace.", hasNewUpload: false, criteria: [] },
  { id: "lo-3", title: "LO 3: Maintain a hygienic, safe and secure workplace", hasNewUpload: false, criteria: [] },
];

export const NsqAssessorUnitDetailView: React.FC<
  NsqAssessorUnitDetailViewProps
> = ({
  unitId,
  unitNumber = "UNIT 1",
  candidateName = "Candidate",
  candidateEmail,
  candidatePhone,
  candidatePhotoUrl,
  applicationId,
  observation,
  onUpdateObservation,
  onBack,
  onFillObservationForm,
}) => {
  const resolvedUnitId = unitId || unitNumber.toLowerCase().replace(" ", "-");
  const { data: remoteCriteriaData } = useGetUnitCriteria(
    applicationId,
    resolvedUnitId,
    { enabled: Boolean(applicationId && resolvedUnitId) },
  );
  const { mutateAsync: reviewEvidenceMutation } = useReviewUnitEvidence(
    applicationId,
    resolvedUnitId,
  );

  const [learningOutcomes, setLearningOutcomes] = useState<UnitLearningOutcome[]>(INITIAL_OUTCOMES);
  const [expandedLos, setExpandedLos] = useState<Record<string, boolean>>({ "lo-1": true });
  const [expandedPcs, setExpandedPcs] = useState<Record<string, boolean>>({ "pc-1-1": true });

  useEffect(() => {
    if (remoteCriteriaData?.criteria && remoteCriteriaData.criteria.length > 0) {
      const groups: Record<string, { title: string; criteria: any[] }> = {};
      remoteCriteriaData.criteria.forEach((crit) => {
        const loKey = crit.learningObjectiveCode || "LO 1";
        const loTitle = crit.learningObjectiveText
          ? `${loKey}: ${crit.learningObjectiveText}`
          : `${loKey}: Occupational Criteria`;

        if (!groups[loKey]) {
          groups[loKey] = { title: loTitle, criteria: [] };
        }

        const evidences = (crit.history && crit.history.length > 0
          ? crit.history
          : crit.latest
            ? [crit.latest]
            : []
        ).map((ev) => ({
          id: ev.id,
          name:
            ev.evidenceType === "WP"
              ? "Work Product(WP)"
              : `${ev.evidenceType} Evidence`,
          type: ev.evidenceType,
          status: ev.status,
          feedback: ev.reviewComment || undefined,
        }));

        groups[loKey].criteria.push({
          id: `pc-${crit.code.replace(/[^a-zA-Z0-9]/g, "-")}`,
          code: crit.code.startsWith("PC") ? crit.code : `PC ${crit.code}`,
          description:
            crit.text || `Demonstrate occupational standard ${crit.code}`,
          hasNewUpload: crit.status === "pending",
          evidences,
        });
      });

      const outcomeList = Object.keys(groups).map((key, loIdx) => ({
        id: `lo-${loIdx + 1}`,
        title: groups[key].title,
        hasNewUpload: groups[key].criteria.some((c) => c.hasNewUpload),
        criteria: groups[key].criteria,
      }));

      if (outcomeList.length > 0) {
        setLearningOutcomes(outcomeList);
      }
    }
  }, [remoteCriteriaData]);

  const [targetEvidence, setTargetEvidence] = useState<{ loId: string; pcId: string; evidenceId: string } | null>(null);
  const [isConfirmApproveOpen, setIsConfirmApproveOpen] = useState(false);
  const [isApproveSuccessOpen, setIsApproveSuccessOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [isConfirmAcceptObsOpen, setIsConfirmAcceptObsOpen] = useState(false);
  const [isAcceptObsSuccessOpen, setIsAcceptObsSuccessOpen] = useState(false);
  const [isRejectObsSuccessOpen, setIsRejectObsSuccessOpen] = useState(false);

  const handleInitiateApprove = (loId: string, pcId: string, evidenceId: string) => {
    setTargetEvidence({ loId, pcId, evidenceId });
    setIsConfirmApproveOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!targetEvidence) return;
    setIsConfirmApproveOpen(false);
    try {
      await reviewEvidenceMutation({
        evidenceId: targetEvidence.evidenceId,
        payload: { decision: "approve" },
      });
    } catch {
      // useReviewUnitEvidence already surfaced an error toast — don't fake success.
      return;
    }

    setLearningOutcomes((prev) =>
      prev.map((lo) => lo.id !== targetEvidence.loId ? lo : {
        ...lo,
        criteria: lo.criteria.map((pc) => pc.id !== targetEvidence.pcId ? pc : {
          ...pc,
          evidences: pc.evidences.map((ev) => ev.id === targetEvidence.evidenceId ? { ...ev, status: "approved" as const } : ev),
        }),
      }),
    );
    setIsApproveSuccessOpen(true);
  };

  const handleInitiateReject = (loId: string, pcId: string, evidenceId: string) => {
    setTargetEvidence({ loId, pcId, evidenceId });
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!targetEvidence) return;
    setIsRejectModalOpen(false);
    try {
      await reviewEvidenceMutation({
        evidenceId: targetEvidence.evidenceId,
        payload: { decision: "reject", comment: reason },
      });
    } catch {
      // useReviewUnitEvidence already surfaced an error toast — don't fake success.
      return;
    }

    setLearningOutcomes((prev) =>
      prev.map((lo) => lo.id !== targetEvidence.loId ? lo : {
        ...lo,
        criteria: lo.criteria.map((pc) => pc.id !== targetEvidence.pcId ? pc : {
          ...pc,
          evidences: pc.evidences.map((ev) => ev.id === targetEvidence.evidenceId ? { ...ev, status: "rejected" as const, feedback: reason } : ev),
        }),
      }),
    );
  };

  return (
    <div className="w-full flex flex-col items-center select-text">
      <div className="w-full max-w-7xl xl:max-w-360 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Learning Outcomes & Criteria */}
          <div className="lg:col-span-8 flex flex-col gap-4 w-full">
            {learningOutcomes.map((lo) => (
              <LearningOutcomeAccordionItem
                key={lo.id}
                learningOutcome={lo}
                isExpanded={Boolean(expandedLos[lo.id])}
                onToggle={() => setExpandedLos((prev) => ({ ...prev, [lo.id]: !prev[lo.id] }))}
                expandedPcs={expandedPcs}
                onTogglePc={(pcId) => setExpandedPcs((prev) => ({ ...prev, [pcId]: !prev[pcId] }))}
                onApproveEvidence={handleInitiateApprove}
                onRejectEvidence={handleInitiateReject}
              />
            ))}
          </div>

          {/* Right Column: Reusable Sidebar */}
          <div className="lg:col-span-4 w-full">
            <NsqAssessorSidebar
              candidate={{ name: candidateName, email: candidateEmail, phone: candidatePhone, photoUrl: candidatePhotoUrl }}
              observation={observation}
              onOpenObservationModal={() => setIsObsModalOpen(true)}
              onFillObservationForm={onFillObservationForm}
            />
          </div>
        </div>
      </div>

      <ConfirmApproveEvidenceModal
        isOpen={isConfirmApproveOpen}
        onClose={() => setIsConfirmApproveOpen(false)}
        onConfirm={handleConfirmApprove}
      />
      <EvidenceApprovedSuccessModal isOpen={isApproveSuccessOpen} onClose={() => setIsApproveSuccessOpen(false)} />
      <RejectEvidenceModal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} onSubmit={handleConfirmReject} />

      {observation && (
        <NsqAssessorObservationModal
          isOpen={isObsModalOpen}
          onClose={() => setIsObsModalOpen(false)}
          details={observation}
          onAccept={() => {
            setIsObsModalOpen(false);
            setIsConfirmAcceptObsOpen(true);
          }}
          onReject={() => {
            onUpdateObservation({ ...observation, status: "rejected", rejectionReason: "Safety criteria not satisfied." });
            setIsObsModalOpen(false);
            setIsRejectObsSuccessOpen(true);
          }}
        />
      )}

      <ConfirmAcceptObservationModal
        isOpen={isConfirmAcceptObsOpen}
        onClose={() => setIsConfirmAcceptObsOpen(false)}
        onConfirm={() => {
          if (observation) onUpdateObservation({ ...observation, status: "confirmed", isSigned: true });
          setIsConfirmAcceptObsOpen(false);
          setIsAcceptObsSuccessOpen(true);
        }}
      />
      <ObservationAcceptedSuccessModal isOpen={isAcceptObsSuccessOpen} onClose={() => setIsAcceptObsSuccessOpen(false)} />
      <ObservationRejectedSuccessModal isOpen={isRejectObsSuccessOpen} onClose={() => setIsRejectObsSuccessOpen(false)} />
    </div>
  );
};
