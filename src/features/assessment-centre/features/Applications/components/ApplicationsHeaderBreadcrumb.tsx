"use client";

import React from "react";

interface Props {
  selectedCandidateName: string | null;
  selectedInterviewTitle?: string | null;
  showSelfAssessmentForm: boolean;
  showEvidenceVault: boolean;
  showCandidateForm: boolean;
  onBackToList: () => void;
  onBackFromInterview?: () => void;
  onBackFromSelfAssessment: () => void;
  onBackFromEvidenceVault: () => void;
  onBackFromCandidateForm: () => void;
  onAcceptApplication?: () => void;
}

export const ApplicationsHeaderBreadcrumb: React.FC<Props> = ({
  selectedCandidateName,
  selectedInterviewTitle,
  showSelfAssessmentForm,
  showEvidenceVault,
  showCandidateForm,
  onBackToList,
  onBackFromInterview,
  onBackFromSelfAssessment,
  onBackFromEvidenceVault,
  onBackFromCandidateForm,
  onAcceptApplication,
}) => {
  if (selectedInterviewTitle) {
    return (
      <div className="flex flex-col gap-1 pt-2">
        <button
          type="button"
          onClick={onBackFromInterview}
          className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
        >
          <span className="text-xl font-bold">&lt;</span>
          <span>{selectedInterviewTitle}</span>
        </button>
        <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
          <span onClick={onBackFromInterview} className="hover:underline cursor-pointer">
            Applications
          </span>
          <span>&gt;</span>
          <span className="font-semibold text-white">{selectedInterviewTitle}</span>
        </div>
      </div>
    );
  }

  if (selectedCandidateName && showSelfAssessmentForm) {
    return (
      <div className="flex flex-col gap-1 pt-2">
        <button
          type="button"
          onClick={onBackFromSelfAssessment}
          className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
        >
          <span className="text-xl font-bold">&lt;</span>
          <span>Self Assessment Form</span>
        </button>
        <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal flex-wrap">
          <span onClick={onBackToList} className="hover:underline cursor-pointer">Applications</span>
          <span>&gt;</span>
          <span onClick={onBackFromEvidenceVault} className="hover:underline cursor-pointer">{selectedCandidateName}</span>
          <span>&gt;</span>
          <span onClick={onBackFromSelfAssessment} className="hover:underline cursor-pointer">Evidence Vault</span>
          <span>&gt;</span>
          <span className="font-semibold text-white">Self Assessment Form</span>
        </div>
      </div>
    );
  }

  if (selectedCandidateName && showEvidenceVault) {
    return (
      <div className="flex flex-col gap-1 pt-2">
        <button
          type="button"
          onClick={onBackFromEvidenceVault}
          className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
        >
          <span className="text-xl font-bold">&lt;</span>
          <span>Evidence Vault</span>
        </button>
        <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
          <span onClick={onBackToList} className="hover:underline cursor-pointer">Applications</span>
          <span>&gt;</span>
          <span onClick={onBackFromEvidenceVault} className="hover:underline cursor-pointer">{selectedCandidateName}</span>
          <span>&gt;</span>
          <span className="font-semibold text-white">Evidence Vault</span>
        </div>
      </div>
    );
  }

  if (selectedCandidateName && showCandidateForm) {
    return (
      <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={onBackFromCandidateForm}
            className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
          >
            <span className="text-xl font-bold">&lt;</span>
            <span>Application Form</span>
          </button>
          <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
            <span onClick={onBackToList} className="hover:underline cursor-pointer">Applications</span>
            <span>&gt;</span>
            <span onClick={onBackFromCandidateForm} className="hover:underline cursor-pointer">{selectedCandidateName}</span>
            <span>&gt;</span>
            <span className="font-semibold text-white">Application Form</span>
          </div>
        </div>

        {onAcceptApplication && (
          <button
            type="button"
            onClick={onAcceptApplication}
            className="bg-secondary hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shrink-0"
          >
            <span>Accept Application</span>
          </button>
        )}
      </div>
    );
  }

  if (selectedCandidateName) {
    return (
      <div className="flex flex-col gap-1 pt-2">
        <button
          type="button"
          onClick={onBackToList}
          className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
        >
          <span className="text-xl font-bold">&lt;</span>
          <span>{selectedCandidateName}</span>
        </button>
        <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
          <span onClick={onBackToList} className="hover:underline cursor-pointer">Applications</span>
          <span>&gt;</span>
          <span className="font-semibold text-white">{selectedCandidateName}</span>
        </div>
      </div>
    );
  }

  return null;
};
