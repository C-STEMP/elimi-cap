"use client";

import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter?: (filters: {
    assessmentType: string;
    stage: string;
    status: string;
  }) => void;
}

export const AssessmentCentreFilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilter,
}) => {
  const [assessmentType, setAssessmentType] = useState("");
  const [stage, setStage] = useState("");
  const [status, setStatus] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilter?.({ assessmentType, stage, status });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center flex flex-col items-center select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Right Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#fde8ec] text-[#b3261e] hover:bg-[#fbd0d7] flex items-center justify-center transition-colors cursor-pointer"
        >
          <FiX className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary mb-1 tracking-tight text-center">
          Filter
        </h3>
        <p className="text-xs sm:text-sm text-neutral-secondary mb-6 font-normal text-center">
          Filter applications.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full text-left flex flex-col gap-4"
        >
          <Select
            label="Assessment Type"
            placeholder="Select"
            value={assessmentType}
            onChange={(e) => setAssessmentType(e.target.value)}
            options={["RPL", "NSQ"]}
          />

          <Select
            label="Stage"
            placeholder="Select"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            options={[
              "Application Form",
              "Payment",
              "Folder Arrangement",
              "Interview Stage",
              "Internal Verifier",
              "External Verifier",
              "Certification",
            ]}
          />

          <Select
            label="Status"
            placeholder="Select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={["Pending", "Ongoing", "Completed", "Archived"]}
          />

          <Button
            type="submit"
            variant="amber"
            size="lg"
            fullWidth
            className="h-12 text-white font-bold text-sm sm:text-base bg-[#fbab2a] hover:bg-[#e89b1f] mt-4 transition-all shadow-md cursor-pointer rounded-xl"
          >
            Filter Application
          </Button>
        </form>
      </div>
    </div>
  );
};
