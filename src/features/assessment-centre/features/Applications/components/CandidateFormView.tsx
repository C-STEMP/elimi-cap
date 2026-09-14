"use client";

import React from "react";
import { FiDownload, FiPrinter } from "react-icons/fi";
import { downloadFormElement, printFormElement } from "@/src/lib/formPrintDownload";
import { useCandidateFormState } from "../hooks/useCandidateFormState";
import { CandidateFormCard } from "./CandidateFormCard";
import { CandidateDecisionSidebar } from "./CandidateDecisionSidebar";
import { CandidateDecisionModals } from "./CandidateDecisionModals";

interface Props {
  id?: string;
  candidateName?: string;
  onBack: () => void;
  onAcceptApplication?: () => void;
}

export const CandidateFormView: React.FC<Props> = (props) => {
  const s = useCandidateFormState(props);

  if (s.isLoadingDetail && !s.appDetail) {
    return (
      <div className="w-full flex flex-col gap-6 select-text">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-48" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-100 rounded w-full max-w-md" />
            ))}
          </div>
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="flex items-center justify-end gap-3 no-print">
        <a
          href="#"
          download={s.formDownloadName}
          onClick={(e) => {
            e.preventDefault();
            downloadFormElement("printable-application-card", s.formDownloadName);
          }}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <span>Download</span>
          <FiDownload className="w-4 h-4 text-gray-500" />
        </a>

        <button
          type="button"
          onClick={() => printFormElement("printable-application-card", s.formTitle)}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <span>Print</span>
          <FiPrinter className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <CandidateFormCard
          appDetail={s.appDetail}
          formCandidateName={s.formCandidateName}
          resolvedFullName={s.resolvedFullName}
          resolvedPassportUrl={s.resolvedPassportUrl}
          personalDetails={s.personalDetails}
          residentialAddress={s.residentialAddress}
          contactInfo={s.contactInfo}
          evidenceCandidate={s.evidenceCandidate}
          declaration={s.declaration}
        />

        <CandidateDecisionSidebar
          stages={s.stages}
          appDetail={s.appDetail}
          isAccepted={s.isAccepted}
          isReviewPending={s.reviewMutation.isPending}
          onOpenAccept={() => s.setIsConfirmAcceptOpen(true)}
          onOpenReject={() => s.setIsConfirmRejectOpen(true)}
        />
      </div>

      <CandidateDecisionModals
        isConfirmAcceptOpen={s.isConfirmAcceptOpen}
        onCloseAccept={() => s.setIsConfirmAcceptOpen(false)}
        onAccept={s.handleAccept}
        isConfirmRejectOpen={s.isConfirmRejectOpen}
        onCloseReject={() => s.setIsConfirmRejectOpen(false)}
        onReject={s.handleReject}
        rejectReason={s.rejectReason}
        setRejectReason={s.setRejectReason}
        isAcceptSuccessOpen={s.isAcceptSuccessOpen}
        onCloseSuccess={() => s.setIsAcceptSuccessOpen(false)}
        isReviewPending={s.reviewMutation.isPending}
      />
    </div>
  );
};
