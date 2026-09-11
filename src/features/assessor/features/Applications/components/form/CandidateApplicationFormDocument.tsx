"use client";

import React from "react";
import { CandidateFormCard } from "@/src/features/assessment-centre/features/Applications/components/CandidateFormCard";
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
    <CandidateFormCard
      appDetail={applicationDetail}
      formCandidateName={candidateName}
      className="w-full flex flex-col gap-6 printable-application-card"
    />
  );
};
