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
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 sm:p-7 shadow-2xl relative flex flex-col items-center text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#a31d38] flex items-center justify-center transition-colors"
        >
          <FiX className="w-4 h-4" />
        </button>

        <h3 className="text-lg sm:text-xl font-black text-neutral-primary mt-2">
          Complete Form
        </h3>
        <p className="text-xs text-neutral-secondary mt-1">
          Select candidate to complete form
        </p>

        <div className="w-full text-left mt-6 flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-primary">
            Select Candidate
          </label>
          <div className="relative w-full">
            <select
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              className="w-full h-11 px-3.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs text-neutral-primary font-medium appearance-none focus:outline-none focus:border-[#a31d38] transition-all cursor-pointer"
            >
              {candidates.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onComplete(selectedCandidate)}
          className="w-full h-11 mt-6 bg-[#fbc77b] hover:bg-[#fbab2a] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center"
        >
          Complete Form
        </button>
      </div>
    </div>
  );
};
