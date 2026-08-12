"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiChevronLeft, FiCheckCircle, FiEdit3 } from "react-icons/fi";
import { ASSETS_URL } from "@/assets";
import { Button } from "@/src/components/ui/button";
import { ApplyJobModal } from "./ApplyJobModal";
import type { AssessorJobRecord } from "./AssessorJobBoardView";

interface AssessorJobDetailViewProps {
  job: AssessorJobRecord;
  onBack: () => void;
}

export const AssessorJobDetailView: React.FC<AssessorJobDetailViewProps> = ({
  job,
  onBack,
}) => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Header Banner Row matching Images 1, 3, 4 */}
      <div className="flex flex-col gap-1 bg-[#a31d38] text-white p-6 rounded-3xl shadow-md">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-white font-bold text-2xl sm:text-3xl hover:opacity-90 transition-opacity w-fit cursor-pointer"
        >
          <FiChevronLeft className="w-6 h-6 stroke-[2.5]" />
          <span>Assessor</span>
        </button>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-white/90 font-normal">
          <span onClick={onBack} className="hover:underline cursor-pointer">
            Job Board
          </span>
          <span>&gt;</span>
          <span className="font-semibold text-white">{job.title}</span>
        </div>
      </div>

      {/* Top Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center shrink-0">
            <Image
              src={ASSETS_URL.faviconIcon}
              alt={job.company}
              width={48}
              height={48}
              className="w-10 h-10 object-contain"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              {job.company}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-primary">
              {job.title}
            </h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 w-fit mt-0.5">
              {job.trade}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">Duration</span>
            <span className="text-base sm:text-lg font-extrabold text-neutral-primary mt-0.5">
              {job.duration}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">Deadline</span>
            <span className="text-base sm:text-lg font-extrabold text-neutral-primary mt-0.5">
              {job.deadline}
            </span>
          </div>
        </div>

        <Button
          variant="amber"
          size="md"
          onClick={() => setIsApplyModalOpen(true)}
          rightIcon={<FiEdit3 className="w-4 h-4 stroke-[2]" />}
          className="bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-sm px-8 py-3 rounded-xl shadow-md shrink-0 cursor-pointer self-start md:self-center"
        >
          Apply
        </Button>
      </div>

      {/* Description Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col gap-3">
        <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
          Description
        </h3>
        <p className="text-xs sm:text-sm text-neutral-secondary leading-relaxed">
          {job.description}
        </p>
      </div>

      {/* Requirement Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col gap-4">
        <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
          Requirement
        </h3>
        <div className="flex flex-col gap-3">
          {job.requirements.map((req, idx) => (
            <div
              key={idx}
              className="bg-gray-50/70 rounded-2xl p-4 flex items-center gap-3 border border-gray-100"
            >
              <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <FiCheckCircle className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
                {req}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyJobModal
        isOpen={isApplyModalOpen}
        jobId={job.id}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
};
