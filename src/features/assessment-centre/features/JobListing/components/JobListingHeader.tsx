"use client";

import React from "react";
import {
  FiPlus,
  FiUser,
  FiCheck,
  FiClipboard,
} from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { JobListing, AssessorApplicant } from "@/features/assessment-centre/types";
import { MOCK_JOB_LISTINGS, MOCK_ASSESSOR_APPLICANTS } from "@/features/assessment-centre/utils/constants";

interface JobListingHeaderProps {
  selectedJobId: string | null;
  selectedApplicantId: string | null;
  onBackToList: () => void;
  onBackFromJob: () => void;
  onBackFromApplicant: () => void;
  onPostRequest: () => void;
  onMarkAsFilled: () => void;
}

export const JobListingHeader: React.FC<JobListingHeaderProps> = ({
  selectedJobId,
  selectedApplicantId,
  onBackToList,
  onBackFromJob,
  onBackFromApplicant,
  onPostRequest,
  onMarkAsFilled,
}) => {
  if (selectedApplicantId) {
    const applicant =
      MOCK_ASSESSOR_APPLICANTS.find((a) => a.id === selectedApplicantId) ||
      MOCK_ASSESSOR_APPLICANTS[0];
    return (
      <ApplicantDetailHeader
        applicant={applicant}
        onBack={onBackFromApplicant}
        onBackToRequests={() => {
          onBackFromApplicant();
          onBackFromJob();
        }}
      />
    );
  }

  if (selectedJobId) {
    const job =
      MOCK_JOB_LISTINGS.find((j) => j.id === selectedJobId) ||
      MOCK_JOB_LISTINGS[0];
    return (
      <JobDetailHeader
        job={job}
        onBack={onBackFromJob}
        onMarkAsFilled={onMarkAsFilled}
      />
    );
  }

  return <JobListHeader onPostRequest={onPostRequest} />;
};

interface ApplicantDetailHeaderProps {
  applicant: AssessorApplicant;
  onBack: () => void;
  onBackToRequests: () => void;
}

const ApplicantDetailHeader: React.FC<ApplicantDetailHeaderProps> = ({
  applicant,
  onBack,
  onBackToRequests,
}) => {
  return (
    <div className="flex flex-col gap-1 pt-2">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
      >
        <span className="text-xl font-bold">&lt;</span>
        <span>{applicant.name}</span>
      </button>
      <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
        <span
          onClick={onBackToRequests}
          className="hover:underline cursor-pointer"
        >
          Requests
        </span>
        <span>&gt;</span>
        <span
          onClick={onBack}
          className="hover:underline cursor-pointer"
        >
          Assessor
        </span>
        <span>&gt;</span>
        <span className="font-semibold text-white">{applicant.name}</span>
      </div>
    </div>
  );
};

interface JobDetailHeaderProps {
  job: JobListing;
  onBack: () => void;
  onMarkAsFilled: () => void;
}

const JobDetailHeader: React.FC<JobDetailHeaderProps> = ({
  job,
  onBack,
  onMarkAsFilled,
}) => {
  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
          >
            <span className="text-xl font-bold">&lt;</span>
            <span>Assessor Request</span>
          </button>
          <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
            <span
              onClick={onBack}
              className="hover:underline cursor-pointer"
            >
              Requests
            </span>
            <span>&gt;</span>
            <span className="font-semibold text-white">Assessor</span>
          </div>
        </div>

        <Button
          type="button"
          onClick={onMarkAsFilled}
          variant="amber"
          size="md"
          rightIcon={<FiCheck className="w-4.5 h-4.5" />}
          className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
        >
          Mark As Filled
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Available Slots
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {job.slotsTotal - job.slotsFilled}/{job.slotsTotal}
              </span>
              <span className="text-xs font-normal text-white/70">
                available
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiClipboard className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Total Applicants
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {job.applicantsCount}
              </span>
              <span className="text-xs font-normal text-white/70">
                applicants
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiClipboard className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Shortlisted Applicants
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                1
              </span>
              <span className="text-xs font-normal text-white/70">
                applicants
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiClipboard className="w-5 h-5 text-white/90" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface JobListHeaderProps {
  onPostRequest: () => void;
}

const JobListHeader: React.FC<JobListHeaderProps> = ({ onPostRequest }) => {
  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Job Listing
        </h1>
        <Button
          type="button"
          onClick={onPostRequest}
          variant="amber"
          size="md"
          rightIcon={<FiPlus className="w-4.5 h-4.5" />}
          className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
        >
          Post A Request
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Total Job Listing
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                12
              </span>
              <span className="text-xs font-normal text-white/70">
                listings
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiClipboard className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Open Listing
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                8
              </span>
              <span className="text-xs font-normal text-white/70">
                listings
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiClipboard className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Filled Listing
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                4
              </span>
              <span className="text-xs font-normal text-white/70">
                listings
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiClipboard className="w-5 h-5 text-white/90" />
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
              Total Applicants
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                95
              </span>
              <span className="text-xs font-normal text-white/70">
                applicants
              </span>
            </div>
          </div>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <FiUser className="w-5 h-5 text-white/90" />
          </div>
        </div>
      </div>
    </div>
  );
};
