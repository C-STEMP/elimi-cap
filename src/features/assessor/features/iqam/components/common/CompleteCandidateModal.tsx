"use client";

import React, { useState } from "react";
import { FiX, FiChevronDown } from "react-icons/fi";

interface CompleteCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (candidateName: string) => void;
  candidates?: string[];
}

export const CompleteCandidateModal: React.FC<CompleteCandidateModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  candidates = [
    "Samson David",
    "Oguntade James",
    "Favour Smith",
    "Oriade Sophie",
    "Chidi Okonkwo",
  ],
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState(candidates[0] || "");

  if (!isOpen) return null;

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
          Complete Form
        </h3>
        <p className="text-xs sm:text-sm text-neutral-secondary mt-1">
          Lorem ipsum dolor
        </p>

        <div className="w-full text-left mt-6 flex flex-col gap-2">
          <label className="text-xs font-bold text-neutral-primary">
            Select Candidate
          </label>
          <div className="relative w-full">
            <select
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              className="w-full h-12 px-4 pr-10 bg-[#f8f9fa] border border-slate-200/80 rounded-xl text-xs sm:text-sm text-neutral-primary font-medium appearance-none focus:outline-none focus:border-[#900B27] transition-all cursor-pointer"
            >
              {candidates.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none stroke-[2.5]" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onComplete(selectedCandidate)}
          className="w-full h-12 mt-6 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center"
        >
          Complete Form
        </button>
      </div>
    </div>
  );
};
