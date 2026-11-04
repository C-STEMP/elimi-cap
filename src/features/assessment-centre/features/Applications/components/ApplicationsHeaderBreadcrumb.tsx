"use client";

import React, { useState } from "react";
import { FiCheck, FiChevronLeft, FiLink } from "react-icons/fi";
import { useToast } from "@/src/components/ui/toast";
import { useCreateShareToken } from "@/src/features/shared/centre/hooks";

interface Props {
  selectedCandidateName: string | null;
  selectedInterviewTitle?: string | null;
  selectedInductionTitle?: string | null;
  selectedUnitNumber?: string | null;
  selectedTradeName?: string | null;
  showSelfAssessmentForm: boolean;
  showEvidenceVault: boolean;
  showCandidateForm: boolean;
  isApplicationApproved?: boolean;
  isNsqApplication?: boolean;
  applicationId?: string;
  isNsqIqaComplete?: boolean;
  isNsqIqaFormsComplete?: boolean;
  isNsqIvApproved?: boolean;
  isNsqForwardedToAwardingBody?: boolean;
  onBackToList: () => void;
  onBackFromInterview?: () => void;
  onBackFromInduction?: () => void;
  onBackFromUnit?: () => void;
  onBackFromSelfAssessment: () => void;
  onBackFromEvidenceVault: () => void;
  onBackFromCandidateForm: () => void;
  onAcceptApplication?: () => void;
}

export const ApplicationsHeaderBreadcrumb: React.FC<Props> = ({
  selectedCandidateName,
  selectedInterviewTitle,
  selectedInductionTitle,
  selectedUnitNumber,
  selectedTradeName,
  showSelfAssessmentForm,
  showEvidenceVault,
  showCandidateForm,
  isApplicationApproved,
  isNsqApplication,
  applicationId,
  isNsqIqaComplete,
  isNsqIqaFormsComplete,
  isNsqIvApproved,
  isNsqForwardedToAwardingBody,
  onBackToList,
  onBackFromInterview,
  onBackFromInduction,
  onBackFromUnit,
  onBackFromSelfAssessment,
  onBackFromEvidenceVault,
  onBackFromCandidateForm,
  onAcceptApplication,
}) => {
  const { toast } = useToast();
  const [generatedLink, setGeneratedLink] = useState("");
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const createShareTokenMutation = useCreateShareToken(applicationId || "");

  const handleGenerateLink = async () => {
    if (!applicationId) return;
    try {
      const res = await createShareTokenMutation.mutateAsync();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const fullUrl = res?.token
        ? `${origin}/shared/applications/${res.token}`
        : `${origin}/applications/${applicationId}?from=centre`;
      setGeneratedLink(fullUrl);
      setIsLinkModalOpen(true);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Failed to Generate Link",
        description: err?.message || "Unable to generate a share link. Please try again.",
      });
    }
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(generatedLink);
    }
    setIsLinkModalOpen(false);
    toast({
      type: "success",
      title: "Link Copied",
      description: "You have successfully copied a link",
    });
  };
  if (selectedUnitNumber) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 w-full">
        <div className="flex flex-col gap-1 min-w-0 max-w-full">
          <button
            type="button"
            onClick={onBackFromUnit}
            className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-lg sm:text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer select-none"
          >
            <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] shrink-0" />
            <span className="wrap-break-word">{selectedUnitNumber}</span>
          </button>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs lg:text-sm text-white/90 font-normal mt-0.5">
            <span onClick={onBackToList} className="hover:underline transition-colors text-white/80 cursor-pointer">
              Applications
            </span>
            <span className="text-white/60">&gt;</span>
            <span onClick={onBackFromUnit} className="hover:underline transition-colors text-white/80 cursor-pointer">
              {selectedCandidateName}
            </span>
            <span className="text-white/60">&gt;</span>
            <span className="font-semibold text-white wrap-break-word">{selectedUnitNumber}</span>
          </div>
        </div>
      </div>
    );
  }
  if (selectedInterviewTitle) {
    return (
      <div className="flex flex-col gap-1 pt-2 min-w-0 max-w-full">
        <button
          type="button"
          onClick={onBackFromInterview}
          className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-lg sm:text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer select-none"
        >
          <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] shrink-0" />
          <span className="wrap-break-word">{selectedInterviewTitle}</span>
        </button>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs lg:text-sm text-white/90 font-normal mt-0.5">
          <span onClick={onBackFromInterview} className="hover:underline transition-colors text-white/80 cursor-pointer">
            Applications
          </span>
          <span className="text-white/60">&gt;</span>
          <span className="font-semibold text-white wrap-break-word">{selectedInterviewTitle}</span>
        </div>
      </div>
    );
  }
  if (selectedInductionTitle) {
    return (
      <div className="flex flex-col gap-1 pt-2 min-w-0 max-w-full">
        <button
          type="button"
          onClick={onBackFromInduction}
          className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-lg sm:text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer select-none"
        >
          <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] shrink-0" />
          <span className="wrap-break-word">{selectedInductionTitle}</span>
        </button>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs lg:text-sm text-white/90 font-normal mt-0.5">
          <span onClick={onBackFromInduction} className="hover:underline transition-colors text-white/80 cursor-pointer">
            Applications
          </span>
          <span className="text-white/60">&gt;</span>
          <span className="font-semibold text-white wrap-break-word">{selectedInductionTitle}</span>
        </div>
      </div>
    );
  }

  if (selectedCandidateName && showSelfAssessmentForm) {
    return (
      <div className="flex flex-col gap-1 pt-2 min-w-0 max-w-full">
        <button
          type="button"
          onClick={onBackFromSelfAssessment}
          className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-lg sm:text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer select-none"
        >
          <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] shrink-0" />
          <span className="wrap-break-word">Self Assessment Form</span>
        </button>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs lg:text-sm text-white/90 font-normal mt-0.5">
          <span onClick={onBackToList} className="hover:underline transition-colors text-white/80 cursor-pointer">Applications</span>
          <span className="text-white/60">&gt;</span>
          <span onClick={onBackFromEvidenceVault} className="hover:underline transition-colors text-white/80 cursor-pointer">{selectedCandidateName}</span>
          <span className="text-white/60">&gt;</span>
          <span onClick={onBackFromSelfAssessment} className="hover:underline transition-colors text-white/80 cursor-pointer">Evidence Vault</span>
          <span className="text-white/60">&gt;</span>
          <span className="font-semibold text-white wrap-break-word">Self Assessment Form</span>
        </div>
      </div>
    );
  }

  if (selectedCandidateName && showEvidenceVault) {
    return (
      <div className="flex flex-col gap-1 pt-2 min-w-0 max-w-full">
        <button
          type="button"
          onClick={onBackFromEvidenceVault}
          className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-lg sm:text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer select-none"
        >
          <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] shrink-0" />
          <span className="wrap-break-word">Evidence Vault</span>
        </button>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs lg:text-sm text-white/90 font-normal mt-0.5">
          <span onClick={onBackToList} className="hover:underline transition-colors text-white/80 cursor-pointer">Applications</span>
          <span className="text-white/60">&gt;</span>
          <span onClick={onBackFromEvidenceVault} className="hover:underline transition-colors text-white/80 cursor-pointer">{selectedCandidateName}</span>
          <span className="text-white/60">&gt;</span>
          <span className="font-semibold text-white wrap-break-word">Evidence Vault</span>
        </div>
      </div>
    );
  }

  if (selectedCandidateName && showCandidateForm) {
    return (
      <div className="flex items-center justify-between gap-4 pt-2 flex-wrap w-full">
        <div className="flex flex-col gap-1 min-w-0 max-w-full">
          <button
            type="button"
            onClick={onBackFromCandidateForm}
            className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-lg sm:text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer select-none"
          >
            <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] shrink-0" />
            <span className="wrap-break-word">Application Form</span>
          </button>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs lg:text-sm text-white/90 font-normal mt-0.5">
            <span onClick={onBackToList} className="hover:underline transition-colors text-white/80 cursor-pointer">Applications</span>
            <span className="text-white/60">&gt;</span>
            <span onClick={onBackFromCandidateForm} className="hover:underline transition-colors text-white/80 cursor-pointer">{selectedCandidateName}</span>
            <span className="text-white/60">&gt;</span>
            <span className="font-semibold text-white wrap-break-word">Application Form</span>
          </div>
        </div>

        {onAcceptApplication && !isApplicationApproved && (
          <button
            type="button"
            onClick={onAcceptApplication}
            className="bg-secondary hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md self-start sm:self-auto shrink-0"
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
    const parentLabel = "Applications";

    return (
      <>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 w-full">
          <div className="flex flex-col gap-1 min-w-0 max-w-full">
            <button
              type="button"
              onClick={onBackToList}
              className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-lg sm:text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer select-none"
            >
              <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] shrink-0" />
              <span className="wrap-break-word">{displayName}</span>
            </button>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs lg:text-sm text-white/90 font-normal mt-0.5">
              <span onClick={onBackToList} className="hover:underline transition-colors text-white/80 cursor-pointer">{parentLabel}</span>
              <span className="text-white/60">&gt;</span>
              <span className="font-semibold text-white wrap-break-word">{displayName}</span>
            </div>
          </div>

          {isNsq && isNsqIqaComplete && (
            <button
              type="button"
              onClick={handleGenerateLink}
              disabled={createShareTokenMutation.isPending}
              className="bg-secondary hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md self-start sm:self-auto shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{createShareTokenMutation.isPending ? "Generating..." : "Generate Link"}</span>
              <FiLink className="w-4 h-4" />
            </button>
          )}
        </div>

        {isLinkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-text">
            <div className="bg-white rounded-3xl p-7 sm:p-9 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-linear-to-tr from-[#10B981] to-[#34D399] flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white mb-1">
                <FiCheck className="w-10 h-10 stroke-3" />
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Congratulations</h3>
                <p className="text-xs text-gray-500 mt-1 font-normal">Link was generated successfully</p>
              </div>
              <div className="w-full mt-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full py-3.5 bg-[#fbab2a] hover:bg-[#e89b1f] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer border-none"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
