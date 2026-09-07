"use client";

import React from "react";
import { PreviewEvidenceModal } from "@/src/features/shared/evidence-vault/components/PreviewEvidenceModal";
import { useEvidenceVaultViewState } from "../hooks/useEvidenceVaultViewState";
import { EvidenceItemsList } from "./EvidenceItemsList";
import { EvidenceSidebarWidgets } from "./EvidenceSidebarWidgets";

interface Props {
  id?: string;
  candidateName?: string;
  onBack: () => void;
  onOpenSelfAssessmentForm: () => void;
}

export const EvidenceVaultView: React.FC<Props> = ({
  id = "",
  onOpenSelfAssessmentForm,
}) => {
  const s = useEvidenceVaultViewState(id);

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <EvidenceItemsList
          selfAssessment={s.selfAssessment}
          onOpenSelfAssessmentForm={onOpenSelfAssessmentForm}
          isLoadingEvidence={s.isLoadingEvidence}
          evidenceItems={s.evidenceItems}
          onSelectPreview={(item) => s.setPreviewItem(item)}
        />

        <EvidenceSidebarWidgets
          activeFacilitator={s.activeFacilitator}
          appDetail={s.appDetail}
        />
      </div>

      <PreviewEvidenceModal
        item={s.previewItem}
        applicationId={id}
        onClose={() => s.setPreviewItem(null)}
      />
    </div>
  );
};
