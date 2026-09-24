"use client";

import React from "react";
import {
  FormHeaderActions,
  CandidateApplicationFormDocument,
} from "./form";
import type { ApplicationDetail } from "@/src/features/shared/applications/api";

interface CandidateApplicationFormViewProps {
  candidateName: string;
  trade: string;
  applicationId?: string;
  applicationDetail?: ApplicationDetail | null;
  isApproved?: boolean;
}

// Read-only: the backend has no assessor feedback endpoint for the
// application form (centre staff review it via POST /review).
export const CandidateApplicationFormView: React.FC<
  CandidateApplicationFormViewProps
> = ({ candidateName, trade, applicationDetail }) => {
  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <FormHeaderActions
        formName={`Application_Form_${(candidateName || "Candidate").replace(/\s+/g, "_")}`}
        elementId="printable-application-card"
      />

      <div
        id="printable-application-card"
        className="max-w-4xl mx-auto w-full flex flex-col gap-6 printable-application-card"
      >
        <CandidateApplicationFormDocument
          candidateName={candidateName}
          trade={trade}
          applicationDetail={applicationDetail}
        />
      </div>
    </div>
  );
};
