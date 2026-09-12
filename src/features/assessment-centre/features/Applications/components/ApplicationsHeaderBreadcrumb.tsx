"use client";

import React from "react";
import { FiLink } from "react-icons/fi";

interface Props {
  selectedCandidateName: string | null;
  selectedInterviewTitle?: string | null;
  selectedUnitNumber?: string | null;
  selectedTradeName?: string | null;
  showSelfAssessmentForm: boolean;
  showEvidenceVault: boolean;
  showCandidateForm: boolean;
  isApplicationApproved?: boolean;
  isNsqApplication?: boolean;
  onGenerateLink?: () => void;
  onBackToList: () => void;
  onBackFromInterview?: () => void;
  onBackFromUnit?: () => void;
  onBackFromSelfAssessment: () => void;
  onBackFromEvidenceVault: () => void;
  onBackFromCandidateForm: () => void;
  onAcceptApplication?: () => void;
  onShareApplication?: () => void;
}

export const ApplicationsHeaderBreadcrumb: React.FC<Props> = ({
  selectedCandidateName,
  selectedInterviewTitle,
  selectedUnitNumber,
  selectedTradeName,
  showSelfAssessmentForm,
  showEvidenceVault,
  showCandidateForm,
  isApplicationApproved,
  isNsqApplication,
  onGenerateLink,
  onBackToList,
  onBackFromInterview,
  onBackFromUnit,
  onBackFromSelfAssessment,
  onBackFromEvidenceVault,
  onBackFromCandidateForm,
  onAcceptApplication,
  onShareApplication,
}) => {
  if (selectedUnitNumber) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 w-full">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={onBackFromUnit}
            className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
          >
            <span className="text-xl font-bold">&lt;</span>
            <span>{selectedUnitNumber}</span>
          </button>
          <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
            <span onClick={onBackToList} className="hover:underline cursor-pointer">
              Applications
            </span>
            <span>&gt;</span>
            <span onClick={onBackFromUnit} className="hover:underline cursor-pointer">
              {selectedCandidateName}
            </span>
            <span>&gt;</span>
            <span className="font-semibold text-white">{selectedUnitNumber}</span>
          </div>
        </div>

        {onGenerateLink && (
          <button
            type="button"
            onClick={onGenerateLink}
            className="bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
          >
            <span>Generate Link</span>
            <FiLink className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
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

        {onAcceptApplication && !isApplicationApproved && (
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
    const isNsq = Boolean(isNsqApplication);
    const displayName = isNsq ? (selectedTradeName || "Masonry") : selectedCandidateName;
    const parentLabel = isNsq ? "My Applications" : "Applications";

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 w-full">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={onBackToList}
            className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
          >
            <span className="text-xl font-bold">&lt;</span>
            <span>{displayName}</span>
          </button>
          <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
            <span onClick={onBackToList} className="hover:underline cursor-pointer">{parentLabel}</span>
            <span>&gt;</span>
            <span className="font-semibold text-white">{displayName}</span>
          </div>
        </div>

        {isNsqApplication ? (
          onGenerateLink && (
            <button
              type="button"
              onClick={onGenerateLink}
              className="bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
            >
              <span>Generate Link</span>
              <FiLink className="w-4 h-4" />
            </button>
          )
        ) : (
          onShareApplication && (
            <button
              type="button"
              onClick={onShareApplication}
              className="bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span>Share Dossier</span>
            </button>
          )
        )}
      </div>
    );
  }

  return null;
};
