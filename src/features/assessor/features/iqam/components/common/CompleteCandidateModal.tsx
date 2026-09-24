"use client";

import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";

export interface CandidateOption {
  applicationId: string;
  candidateName: string;
}

interface CompleteCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (applicationId: string, candidateName: string) => void;
  candidates: CandidateOption[];
}

export const CompleteCandidateModal: React.FC<CompleteCandidateModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  candidates,
}) => {
  const [selectedApplicationId, setSelectedApplicationId] = useState(
    candidates[0]?.applicationId || "",
  );

  useEffect(() => {
    if (isOpen && !candidates.some((c) => c.applicationId === selectedApplicationId)) {
      setSelectedApplicationId(candidates[0]?.applicationId || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, candidates]);

  if (!isOpen) return null;

  const selected = candidates.find((c) => c.applicationId === selectedApplicationId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative flex flex-col items-center text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#900B27] flex items-center justify-center transition-colors cursor-pointer"
        >
          <FiX className="w-5 h-5 stroke-[2.5]" />
        </button>

        <h3 className="text-xl sm:text-2xl font-black text-neutral-primary mt-2">
          Select Candidate
        </h3>
        <p className="text-xs sm:text-sm text-neutral-secondary mt-1">
          Pick which candidate this form applies to
        </p>

        <div className="w-full text-left mt-6">
          <Select
            label="Select Candidate"
            placeholder="Select candidate"
            value={selectedApplicationId}
            onChange={(e) => setSelectedApplicationId(e.target.value)}
            options={candidates.map((c) => ({
              label: c.candidateName,
              value: c.applicationId,
            }))}
            notFoundContent="No allocated candidates found at this centre yet."
          />
        </div>

        <button
          type="button"
          onClick={() => selected && onComplete(selected.applicationId, selected.candidateName)}
          disabled={!selected}
          className="w-full h-12 mt-6 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Complete Form
        </button>
      </div>
    </div>
  );
};
