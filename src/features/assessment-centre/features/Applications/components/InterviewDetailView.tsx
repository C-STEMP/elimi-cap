"use client";

import React from "react";
import { type InterviewRowData } from "./ViewInterviewDetailModal";
import { useInterviewDetailState } from "../hooks/useInterviewDetailState";
import { SittingMetadataCard } from "./SittingMetadataCard";
import { SittingAssessorsRow } from "./SittingAssessorsRow";
import { SittingCandidatesSection } from "./SittingCandidatesSection";

interface Props {
  interview: InterviewRowData;
  onBack: () => void;
  onSelectCandidate: (candidateName: string, id?: string) => void;
}

export const InterviewDetailView: React.FC<Props> = ({
  interview,
  onSelectCandidate,
}) => {
  const s = useInterviewDetailState(interview);

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <SittingMetadataCard
        interview={interview}
        interviewDetail={s.interviewDetail}
        centreProfile={s.centreProfile}
      />

      <SittingAssessorsRow
        leadAssessor={s.leadAssessor}
        memberAssessor={s.memberAssessor}
        ivAssessor={s.ivAssessor}
      />

      <SittingCandidatesSection
        searchQuery={s.searchQuery}
        setSearchQuery={s.setSearchQuery}
        selectedTrade={s.selectedTrade}
        setSelectedTrade={s.setSelectedTrade}
        selectedAssessmentType={s.selectedAssessmentType}
        setSelectedAssessmentType={s.setSelectedAssessmentType}
        selectedStage={s.selectedStage}
        setSelectedStage={s.setSelectedStage}
        viewMode={s.viewMode}
        setViewMode={s.setViewMode}
        selectedCandidateIds={s.selectedCandidateIds}
        tradeOptions={s.tradeOptions}
        stageOptions={s.stageOptions}
        filteredCandidates={s.filteredCandidates}
        toggleSelectAll={s.toggleSelectAll}
        toggleSelectRow={s.toggleSelectRow}
        onSelectCandidate={onSelectCandidate}
      />
    </div>
  );
};
