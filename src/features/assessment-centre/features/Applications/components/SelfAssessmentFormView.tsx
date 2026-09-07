"use client";

import React from "react";
import { FiDownload, FiPrinter } from "react-icons/fi";
import { Loader } from "@/src/components/ui/loader";
import { downloadFormElement, printFormElement } from "@/src/lib/formPrintDownload";
import { useSelfAssessmentFormState } from "../hooks/useSelfAssessmentFormState";
import { SelfAssessmentFormCard } from "./SelfAssessmentFormCard";

interface Props {
  id?: string;
  candidateName?: string;
  onBack: () => void;
}

export const SelfAssessmentFormView: React.FC<Props> = (props) => {
  const s = useSelfAssessmentFormState(props);

  if (s.isLoadingSelfAssessment && !s.selfAssessment) {
    return (
      <div className="w-full min-h-100 flex items-center justify-center">
        <Loader tip="Loading self-assessment form..." />
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

      <div className="w-full flex flex-col items-center">
        <SelfAssessmentFormCard
          resolvedPassportUrl={s.resolvedPassportUrl}
          formCandidateName={s.formCandidateName}
          resolvedFullName={s.resolvedFullName}
          personalDetails={s.personalDetails}
          residentialAddress={s.residentialAddress}
          contactInfo={s.contactInfo}
          rawCompetencies={s.rawCompetencies}
          reflectionData={s.reflectionData}
          declarationData={s.declarationData}
        />
      </div>
    </div>
  );
};
