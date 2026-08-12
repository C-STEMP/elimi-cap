"use client";

import React from "react";
import { FiClipboard } from "react-icons/fi";
import { useGetApplications } from "@/src/features/shared/applications/hooks";

interface ApplicationsHeaderProps {
  selectedCandidateName: string | null;
  showSelfAssessmentForm: boolean;
  showEvidenceVault: boolean;
  showCandidateForm: boolean;
  onBackToList: () => void;
  onBackFromSelfAssessment: () => void;
  onBackFromEvidenceVault: () => void;
  onBackFromCandidateForm: () => void;
}

export const ApplicationsHeader: React.FC<ApplicationsHeaderProps> = ({
  selectedCandidateName,
  showSelfAssessmentForm,
  showEvidenceVault,
  showCandidateForm,
  onBackToList,
  onBackFromSelfAssessment,
  onBackFromEvidenceVault,
  onBackFromCandidateForm,
}) => {
  const { data: applications = [] } = useGetApplications();

  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === "draft").length;
  const ongoingCount = applications.filter((a) => a.status === "in_progress").length;
  const completedCount = applications.filter((a) => a.status === "certified").length;
  const archivedCount = applications.filter(
    (a) => a.status === "rejected" || a.status === "withdrawn",
  ).length;

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
          <span
            onClick={onBackToList}
            className="hover:underline cursor-pointer"
          >
            Applications
          </span>
          <span>&gt;</span>
          <span
            onClick={onBackFromEvidenceVault}
            className="hover:underline cursor-pointer"
          >
            {selectedCandidateName}
          </span>
          <span>&gt;</span>
          <span
            onClick={onBackFromSelfAssessment}
            className="hover:underline cursor-pointer"
          >
            Evidence Vault
          </span>
          <span>&gt;</span>
          <span className="font-semibold text-white">
            Self Assessment Form
          </span>
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
          <span
            onClick={onBackToList}
            className="hover:underline cursor-pointer"
          >
            Applications
          </span>
          <span>&gt;</span>
          <span
            onClick={onBackFromEvidenceVault}
            className="hover:underline cursor-pointer"
          >
            {selectedCandidateName}
          </span>
          <span>&gt;</span>
          <span className="font-semibold text-white">Evidence Vault</span>
        </div>
      </div>
    );
  }

  if (selectedCandidateName && showCandidateForm) {
    return (
      <div className="flex items-center justify-between gap-4 pt-2">
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
            <span
              onClick={onBackToList}
              className="hover:underline cursor-pointer"
            >
              Applications
            </span>
            <span>&gt;</span>
            <span
              onClick={onBackFromCandidateForm}
              className="hover:underline cursor-pointer"
            >
              {selectedCandidateName}
            </span>
            <span>&gt;</span>
            <span className="font-semibold text-white">
              Application Form
            </span>
          </div>
        </div>
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
          <span
            onClick={onBackToList}
            className="hover:underline cursor-pointer"
          >
            Applications
          </span>
          <span>&gt;</span>
          <span className="font-semibold text-white">
            {selectedCandidateName}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-2">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        Applications
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 flex flex-col gap-1 border border-white/15 transition-all shadow-xs">
          <span className="text-xs font-semibold text-white/90">
            Total Applications
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              {totalCount.toLocaleString()}
            </span>
            <span className="text-xs text-white/80 font-normal">
              applications
            </span>
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 flex flex-col gap-1 border border-white/15 transition-all shadow-xs">
          <span className="text-xs font-semibold text-white/90">
            Pending
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              {pendingCount.toLocaleString()}
            </span>
            <span className="text-xs text-white/80 font-normal">
              applications
            </span>
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 flex flex-col gap-1 border border-white/15 transition-all shadow-xs">
          <span className="text-xs font-semibold text-white/90">
            Ongoing
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              {ongoingCount.toLocaleString()}
            </span>
            <span className="text-xs text-white/80 font-normal">
              applications
            </span>
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 flex flex-col gap-1 border border-white/15 transition-all shadow-xs">
          <span className="text-xs font-semibold text-white/90">
            Completed
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              {completedCount.toLocaleString()}
            </span>
            <span className="text-xs text-white/80 font-normal">
              applications
            </span>
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 flex flex-col gap-1 border border-white/15 transition-all shadow-xs">
          <span className="text-xs font-semibold text-white/90">
            Archived
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              {archivedCount.toLocaleString()}
            </span>
            <span className="text-xs text-white/80 font-normal">
              applications
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
