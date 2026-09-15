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
  onAcceptObservation: (requirements: string[]) => Promise<void>;
  onRejectObservation: (reason: string) => Promise<void>;
  onBack: () => void;
  onFillObservationForm: () => void;
}

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
  onAcceptObservation,
  onRejectObservation,
  onBack,
  onFillObservationForm,
}) => {
  const resolvedUnitId = unitId || unitNumber.toLowerCase().replace(" ", "-");
  const {
    data: remoteCriteriaData,
    isLoading: isLoadingCriteria,
    isError: isCriteriaError,
  } = useGetUnitCriteria(applicationId, resolvedUnitId, {
    enabled: Boolean(applicationId && resolvedUnitId),
  });
  const { mutateAsync: reviewEvidenceMutation } = useReviewUnitEvidence(
    applicationId,
    resolvedUnitId,
  );

  const [learningOutcomes, setLearningOutcomes] = useState<UnitLearningOutcome[]>([]);
  const [expandedLos, setExpandedLos] = useState<Record<string, boolean>>({});
  const [expandedPcs, setExpandedPcs] = useState<Record<string, boolean>>({});

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

        // Per the backend contract, `latest` is the single live row for this
        // criterion — `history` holds already-superseded submissions. Only
        // the live row should be actionable here; rendering the full
        // history would surface stale, already-reviewed rows as if they
        // still needed a decision.
        const evidences = (crit.latest ? [crit.latest] : []).map((ev) => ({
          id: ev.id,
          name:
            ev.evidenceType === "WP"
              ? "Work Product(WP)"
              : `${ev.evidenceType} Evidence`,
          type: ev.evidenceType,
          // The API's `reviewStatus` is "pending" while UnitEvidenceRecord's
          // UI states use "in_review" for the same not-yet-decided state.
          status: ev.reviewStatus === "pending" ? "in_review" : ev.reviewStatus,
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
        // Expand the first outcome (and its first criterion) by default,
        // same as the previous fixture-driven behavior, now against
        // whatever the live data's first group actually is.
        setExpandedLos((prev) =>
          Object.keys(prev).length > 0 ? prev : { [outcomeList[0].id]: true },
        );
        const firstCriterion = outcomeList[0].criteria[0];
        if (firstCriterion) {
          setExpandedPcs((prev) =>
            Object.keys(prev).length > 0
              ? prev
              : { [firstCriterion.id]: true },
          );
        }
      }
    }
  }, [remoteCriteriaData]);

  const [targetEvidence, setTargetEvidence] = useState<{ loId: string; pcId: string; evidenceId: string } | null>(null);
  const [isConfirmApproveOpen, setIsConfirmApproveOpen] = useState(false);
  const [isApproveSuccessOpen, setIsApproveSuccessOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [isConfirmAcceptObsOpen, setIsConfirmAcceptObsOpen] = useState(false);
  const [isRejectObsReasonOpen, setIsRejectObsReasonOpen] = useState(false);
  const [isAcceptObsSuccessOpen, setIsAcceptObsSuccessOpen] = useState(false);
  const [isRejectObsSuccessOpen, setIsRejectObsSuccessOpen] = useState(false);
  const [pendingAcceptRequirements, setPendingAcceptRequirements] = useState<
    string[]
  >([]);

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
            {isLoadingCriteria && (
              <div className="flex flex-col gap-3 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-50/70 rounded-2xl border border-gray-100"
                  />
                ))}
              </div>
            )}
            {!isLoadingCriteria && isCriteriaError && (
              <p className="text-xs text-rose-500 font-medium py-2">
                Could not load this unit&apos;s criteria. Please try again.
              </p>
            )}
            {!isLoadingCriteria &&
              !isCriteriaError &&
              learningOutcomes.length === 0 && (
                <p className="text-xs text-gray-400 font-medium py-2">
                  No criteria found for this unit yet.
                </p>
              )}
            {learningOutcomes.map((lo) => (
              <LearningOutcomeAccordionItem
                key={lo.id}
                learningOutcome={lo}
                isExpanded={Boolean(expandedLos[lo.id])}
                onToggle={() =>
                  setExpandedLos((prev) =>
                    prev[lo.id] ? {} : { [lo.id]: true },
                  )
                }
                expandedPcs={expandedPcs}
                onTogglePc={(pcId) =>
                  setExpandedPcs((prev) =>
                    prev[pcId] ? {} : { [pcId]: true },
                  )
                }
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
        onConfirm={async () => {
          setIsConfirmAcceptObsOpen(false);
          try {
            await onAcceptObservation(pendingAcceptRequirements);
          } catch {
            // onAcceptObservation's underlying mutation already surfaced an
            // error toast.
            return;
          }
          setIsAcceptObsSuccessOpen(true);
        }}
      />
      <RejectEvidenceModal
        isOpen={isRejectObsReasonOpen}
        onClose={() => setIsRejectObsReasonOpen(false)}
        onSubmit={async (reason) => {
          setIsRejectObsReasonOpen(false);
          try {
            await onRejectObservation(reason);
          } catch {
            return;
          }
          setIsRejectObsSuccessOpen(true);
        }}
        title="Reject Observation Request"
        subtitle="Let the candidate know why this request is being rejected"
        submitLabel="Reject Request"
      />
      <ObservationAcceptedSuccessModal isOpen={isAcceptObsSuccessOpen} onClose={() => setIsAcceptObsSuccessOpen(false)} />
      <ObservationRejectedSuccessModal isOpen={isRejectObsSuccessOpen} onClose={() => setIsRejectObsSuccessOpen(false)} />
    </div>
  );
};
