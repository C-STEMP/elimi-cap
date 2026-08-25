"use client";

import React from "react";
import { PersonalDetailsDocumentSection } from "./PersonalDetailsDocumentSection";
import { WorkExperienceDocumentSection } from "./WorkExperienceDocumentSection";
import type { ApplicationDetail } from "@/src/features/shared/applications/api";

interface CandidateApplicationFormDocumentProps {
  candidateName: string;
  trade: string;
  applicationDetail?: ApplicationDetail | null;
}

export const CandidateApplicationFormDocument: React.FC<
  CandidateApplicationFormDocumentProps
> = ({ candidateName, trade, applicationDetail }) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <PersonalDetailsDocumentSection
        candidateName={candidateName}
        trade={trade}
        applicationDetail={applicationDetail}
      />
      <WorkExperienceDocumentSection applicationDetail={applicationDetail} />
    </div>
  );
};
