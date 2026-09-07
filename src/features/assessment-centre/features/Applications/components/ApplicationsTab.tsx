"use client";

import React from "react";
import { motion } from "framer-motion";
import { InterviewDetailView } from "./InterviewDetailView";
import { SelfAssessmentFormView } from "./SelfAssessmentFormView";
import { EvidenceVaultView } from "./EvidenceVaultView";
import { CandidateFormView } from "./CandidateFormView";
import { ApplicationDetail } from "./ApplicationDetail";
import { ApplicationsView } from "./ApplicationsView";
import { type InterviewRowData } from "./ViewInterviewDetailModal";

interface ApplicationsTabProps {
  selectedInterview: InterviewRowData | null;
  selectedCandidateName: string | null;
  selectedApplicationId: string | null;
  showCandidateForm: boolean;
  showEvidenceVault: boolean;
  showSelfAssessmentForm: boolean;
  onSelectInterview: (interview: InterviewRowData | null) => void;
  onSelectCandidate: (name: string | null, id?: string | null) => void;
  onCloseCandidateForm: () => void;
  onOpenCandidateForm: () => void;
  onCloseEvidenceVault: () => void;
  onOpenEvidenceVault: () => void;
  onCloseSelfAssessmentForm: () => void;
  onOpenSelfAssessmentForm: () => void;
  onOpenCreatePanel: () => void;
  onOpenCreateInterview?: () => void;
  onOpenScheduleInterview: () => void;
}

export const ApplicationsTab: React.FC<ApplicationsTabProps> = ({
  selectedInterview,
  selectedCandidateName,
  selectedApplicationId,
  showCandidateForm,
  showEvidenceVault,
  showSelfAssessmentForm,
  onSelectInterview,
  onSelectCandidate,
  onCloseCandidateForm,
  onOpenCandidateForm,
  onCloseEvidenceVault,
  onOpenEvidenceVault,
  onCloseSelfAssessmentForm,
  onOpenSelfAssessmentForm,
  onOpenCreatePanel,
  onOpenCreateInterview,
  onOpenScheduleInterview,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {selectedInterview ? (
        <InterviewDetailView
          interview={selectedInterview}
          onBack={() => onSelectInterview(null)}
          onSelectCandidate={(name, id) => {
            onSelectInterview(null);
            onSelectCandidate(name, id || null);
          }}
        />
      ) : selectedCandidateName && showSelfAssessmentForm ? (
        <SelfAssessmentFormView
          id={selectedApplicationId || undefined}
          candidateName={selectedCandidateName}
          onBack={onCloseSelfAssessmentForm}
        />
      ) : selectedCandidateName && showEvidenceVault ? (
        <EvidenceVaultView
          id={selectedApplicationId || undefined}
          candidateName={selectedCandidateName}
          onBack={onCloseEvidenceVault}
          onOpenSelfAssessmentForm={onOpenSelfAssessmentForm}
        />
      ) : selectedCandidateName && showCandidateForm ? (
        <CandidateFormView
          id={selectedApplicationId || undefined}
          candidateName={selectedCandidateName}
          onBack={onCloseCandidateForm}
        />
      ) : selectedCandidateName ? (
        <ApplicationDetail
          id={selectedApplicationId || undefined}
          candidateName={selectedCandidateName}
          onBack={() => onSelectCandidate(null, null)}
          onOpenCandidateForm={onOpenCandidateForm}
          onOpenEvidenceVault={onOpenEvidenceVault}
        />
      ) : (
        <ApplicationsView
          onSelectCandidate={(name, id) => onSelectCandidate(name, id || null)}
          onSelectInterview={(interview) => onSelectInterview(interview)}
          onOpenCreatePanel={onOpenCreatePanel}
          onOpenCreateInterview={onOpenCreateInterview}
          onOpenScheduleInterview={onOpenScheduleInterview}
        />
      )}
    </motion.div>
  );
};
