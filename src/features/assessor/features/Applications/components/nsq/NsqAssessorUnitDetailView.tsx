"use client";

import {
  useGetUnitCriteria,
  useReviewUnitEvidence,
  APPLICATION_DETAIL_REFRESH_INTERVAL_MS,
} from "@/src/features/shared/applications/hooks";
import type { NsqEvidenceThreadItem } from "@/src/features/shared/applications/api/types";
import { useResolveAssets } from "@/src/features/shared/storage/hooks";
import React, { useEffect, useState } from "react";
import {
  LearningOutcomeAccordionItem,
  type UnitLearningOutcome,
} from "./components/unit/LearningOutcomeAccordionItem";
import {
  ConfirmAcceptObservationModal,
  ConfirmApproveEvidenceModal,
  EvidenceApprovedSuccessModal,
  ObservationAcceptedSuccessModal,
  ObservationRejectedSuccessModal,
  RejectEvidenceModal,
} from "./NsqAssessorModals";
import {
  NsqAssessorObservationModal,
  type ObservationRequestDetails,
} from "./NsqAssessorObservationModal";
import { NsqAssessorSidebar } from "./NsqAssessorSidebar";
import { useUrlModal, clearModalDraft } from "@/src/lib/hooks/usePersistentModal";
import { REJECT_EVIDENCE_MODAL, NSQ_UNIT_ASSESSOR_OBSERVATION_MODAL, NSQ_UNIT_REJECT_OBSERVATION_MODAL } from "@/src/lib/modal-keys";

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
  observationActionLabel?: string;
  availableUnits?: Array<{
    id: string;
    label?: string;
    title?: string;
    unitNo?: string;
  }>;
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
  observationActionLabel,
  availableUnits,
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
    refetchInterval: APPLICATION_DETAIL_REFRESH_INTERVAL_MS,
  });
  const { mutateAsync: reviewEvidenceMutation } = useReviewUnitEvidence(
    applicationId,
    resolvedUnitId,
  );

  const [learningOutcomes, setLearningOutcomes] = useState<
    UnitLearningOutcome[]
  >([]);
  const [expandedLos, setExpandedLos] = useState<Record<string, boolean>>({});
  const [expandedPcs, setExpandedPcs] = useState<Record<string, boolean>>({});

  const assetIdsToResolve = React.useMemo(() => {
    if (!remoteCriteriaData?.criteria) return [];
    const ids: string[] = [];
    remoteCriteriaData.criteria.forEach((crit) => {
      const items = [
        ...(crit.latest ? [crit.latest] : []),
        ...(Array.isArray(crit.history) ? crit.history : []),
      ];
      items.forEach((item) => {
        const assetId = item.evidenceAssetId || item.evidence?.assetId;
        if (assetId && !item.evidence?.url) {
          ids.push(assetId);
        }
      });
    });
    return Array.from(new Set(ids));
  }, [remoteCriteriaData]);

  const { data: resolvedAssets } = useResolveAssets(assetIdsToResolve);

  const resolvedAssetMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    if (Array.isArray(resolvedAssets)) {
      resolvedAssets.forEach((a) => {
        if (a.assetId && a.url) {
          map[a.assetId] = a.url;
        }
      });
    }
    return map;
  }, [resolvedAssets]);

  useEffect(() => {
    if (
      remoteCriteriaData?.criteria &&
      remoteCriteriaData.criteria.length > 0
    ) {
      const groups: Record<string, { title: string; criteria: any[] }> = {};
      remoteCriteriaData.criteria.forEach((crit) => {
        const loKey = crit.learningObjectiveCode || "LO 1";
        const loTitle = crit.learningObjectiveText
          ? `${loKey}: ${crit.learningObjectiveText}`
          : loKey;

        if (!groups[loKey]) {
          groups[loKey] = { title: loTitle, criteria: [] };
        }

        const hasRejectedHistory = Boolean(
          Array.isArray(crit.history) &&
            crit.history.some(
              (h) => h.id !== crit.latest?.id && h.reviewStatus === "rejected",
            ),
        );
        const seenIds = new Set<string>();
        const rawItems: Array<{ ev: NsqEvidenceThreadItem; isHistory: boolean }> =
          [];
        if (crit.latest) {
          seenIds.add(crit.latest.id);
          rawItems.push({ ev: crit.latest, isHistory: false });
        }
        if (Array.isArray(crit.history)) {
          crit.history.forEach((h) => {
            if (!seenIds.has(h.id)) {
              seenIds.add(h.id);
              rawItems.push({
                ev: h,
                isHistory: h.reviewStatus === "rejected",
              });
            }
          });
        }

        const evidences = rawItems.map(({ ev, isHistory }) => {
          const assetId =
            ev.evidenceAssetId ||
            ev.evidence?.assetId ||
            (ev as any).assetId ||
            undefined;
          const resolvedUrl =
            ev.evidence?.url ||
            (ev as any).url ||
            (ev as any).fileUrl ||
            (assetId && resolvedAssetMap[assetId]) ||
            null;

          return {
            id: ev.id,
            name:
              ev.evidenceType === "WP"
                ? "Work Product(WP)"
                : `${ev.evidenceType} Evidence`,
            type: ev.evidenceType,
            status:
              ev.reviewStatus === "pending" ? "in_review" : ev.reviewStatus,
            isHistory,
            isReuploaded:
              ev.id === crit.latest?.id &&
              ev.reviewStatus === "pending" &&
              hasRejectedHistory,
            feedback:
              ev.reviewComment ||
              ev.iqaReviewComment ||
              (ev as any).comment ||
              (ev as any).feedback ||
              undefined,
            url: resolvedUrl,
            refPage: ev.evidenceRefPage || null,
          };
        });

        const hasPendingEvidence =
          crit.status === "pending" ||
          (crit.pendingCount ?? 0) > 0 ||
          evidences.some((e) => e.status === "in_review");

        groups[loKey].criteria.push({
          id: `pc-${crit.code.replace(/[^a-zA-Z0-9]/g, "-")}`,
          code: crit.code.startsWith("PC") ? crit.code : `PC ${crit.code}`,
          description:
            crit.text || "",
          hasNewUpload: hasPendingEvidence,
          hasReupload: hasPendingEvidence && hasRejectedHistory,
          evidences,
        });
      });

      const outcomeList = Object.keys(groups).map((key, loIdx) => ({
        id: `lo-${loIdx + 1}`,
        title: groups[key].title,
        hasNewUpload: groups[key].criteria.some((c) => c.hasNewUpload),
        hasReupload: groups[key].criteria.some((c) => c.hasReupload),
        criteria: groups[key].criteria,
      }));

      if (outcomeList.length > 0) {
        setLearningOutcomes(outcomeList);
        setExpandedLos((prev) =>
          Object.keys(prev).length > 0 ? prev : { [outcomeList[0].id]: true },
        );
        const firstCriterion = outcomeList[0].criteria[0];
        if (firstCriterion) {
          setExpandedPcs((prev) =>
            Object.keys(prev).length > 0 ? prev : { [firstCriterion.id]: true },
          );
        }
      }
    }
  }, [remoteCriteriaData, resolvedAssetMap]);

  const [targetEvidence, setTargetEvidence] = useState<{
    loId: string;
    pcId: string;
    evidenceId: string;
  } | null>(null);
  const [isConfirmApproveOpen, setIsConfirmApproveOpen] = useState(false);
  const [isApproveSuccessOpen, setIsApproveSuccessOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useUrlModal(REJECT_EVIDENCE_MODAL);

  const [isObsModalOpen, setIsObsModalOpen] = useUrlModal(NSQ_UNIT_ASSESSOR_OBSERVATION_MODAL);
  const [isConfirmAcceptObsOpen, setIsConfirmAcceptObsOpen] = useState(false);
  const [isRejectObsReasonOpen, setIsRejectObsReasonOpen] = useUrlModal(NSQ_UNIT_REJECT_OBSERVATION_MODAL);
  const [isAcceptObsSuccessOpen, setIsAcceptObsSuccessOpen] = useState(false);
  const [isRejectObsSuccessOpen, setIsRejectObsSuccessOpen] = useState(false);
  const [pendingAcceptRequirements, setPendingAcceptRequirements] = useState<
    string[]
  >([]);

  const handleInitiateApprove = (
    loId: string,
    pcId: string,
    evidenceId: string,
  ) => {
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
      prev.map((lo) =>
        lo.id !== targetEvidence.loId
          ? lo
          : {
              ...lo,
              criteria: lo.criteria.map((pc) =>
                pc.id !== targetEvidence.pcId
                  ? pc
                  : {
                      ...pc,
                      evidences: pc.evidences.map((ev) =>
                        ev.id === targetEvidence.evidenceId
                          ? { ...ev, status: "approved" as const }
                          : ev,
                      ),
                    },
              ),
            },
      ),
    );
    setIsApproveSuccessOpen(true);
  };

  const handleInitiateReject = (
    loId: string,
    pcId: string,
    evidenceId: string,
  ) => {
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
      prev.map((lo) =>
        lo.id !== targetEvidence.loId
          ? lo
          : {
              ...lo,
              criteria: lo.criteria.map((pc) =>
                pc.id !== targetEvidence.pcId
                  ? pc
                  : {
                      ...pc,
                      evidences: pc.evidences.map((ev) =>
                        ev.id === targetEvidence.evidenceId
                          ? {
                              ...ev,
                              status: "rejected" as const,
                              feedback: reason,
                            }
                          : ev,
                      ),
                    },
              ),
            },
      ),
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
                  setExpandedPcs((prev) => (prev[pcId] ? {} : { [pcId]: true }))
                }
                onApproveEvidence={handleInitiateApprove}
                onRejectEvidence={handleInitiateReject}
              />
            ))}

          
          </div>

          {/* Right Column: Reusable Sidebar */}
          <div className="lg:col-span-4 w-full">
            <NsqAssessorSidebar
              candidate={{
                name: candidateName,
                email: candidateEmail,
                phone: candidatePhone,
                photoUrl: candidatePhotoUrl,
              }}
              observation={observation}
              observationActionLabel={observationActionLabel}
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
      <EvidenceApprovedSuccessModal
        isOpen={isApproveSuccessOpen}
        onClose={() => setIsApproveSuccessOpen(false)}
      />
      <RejectEvidenceModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onSubmit={handleConfirmReject}
      />


      {observation && (
        <NsqAssessorObservationModal
          isOpen={isObsModalOpen}
          modalKey={NSQ_UNIT_ASSESSOR_OBSERVATION_MODAL}
          onClose={() => setIsObsModalOpen(false)}
          details={observation}
          availableUnits={availableUnits}
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
            clearModalDraft(NSQ_UNIT_ASSESSOR_OBSERVATION_MODAL);
          } catch {
            return;
          }
          setIsAcceptObsSuccessOpen(true);
        }}
      />
      <RejectEvidenceModal
        isOpen={isRejectObsReasonOpen}
        modalKey={NSQ_UNIT_REJECT_OBSERVATION_MODAL}
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
