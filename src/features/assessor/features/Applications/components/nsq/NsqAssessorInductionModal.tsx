"use client";

import React from "react";
import { FiX, FiCheck } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";

interface NsqAssessorInductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  tradeName: string;
  inductionData?: Record<string, any>;
}

export const NsqAssessorInductionModal: React.FC<
  NsqAssessorInductionModalProps
> = ({ isOpen, onClose, candidateName, tradeName, inductionData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 select-text">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <FiX className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-left mb-5">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            National Skills Qualification (NSQ)
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight mt-0.5">
            Candidate Induction Form
          </h3>
          <p className="text-xs text-neutral-secondary font-normal mt-0.5">
            Verified candidate registration details, selected trade units, and self-declaration
          </p>
        </div>

        <div className="flex flex-col gap-4 text-xs">
          {/* Candidate Profile Box */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                CANDIDATE NAME
              </span>
              <span className="font-bold text-neutral-primary text-xs mt-0.5 block">
                {candidateName}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                REGISTERED TRADE
              </span>
              <span className="font-bold text-neutral-primary text-xs mt-0.5 block">
                {tradeName}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                REGISTRATION STATUS
              </span>
              <span className="text-emerald-700 font-bold text-xs mt-0.5 inline-flex items-center gap-1">
                <FiCheck className="w-3.5 h-3.5" /> Induction Completed
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                SUBMISSION DATE
              </span>
              <span className="font-medium text-neutral-primary text-xs mt-0.5 block">
                {inductionData?.submittedAt ? new Date(inductionData.submittedAt).toLocaleDateString("en-GB") : "22/03/2026"}
              </span>
            </div>
          </div>

          {/* Units Selected */}
          <div className="border border-gray-200 rounded-2xl p-4 flex flex-col gap-2.5">
            <span className="font-bold text-xs text-neutral-primary">
              Registered Qualification Units
            </span>
            <div className="flex flex-wrap gap-2">
              {["UNIT 1: Health & Safety Protocols", "UNIT 2: Foundation & Wall Alignment", "UNIT 3: Structural Masonry Finishing"].map((u, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-rose-50 border border-rose-100 text-[#a31d38] font-bold text-[11px] rounded-xl"
                >
                  {u}
                </span>
              ))}
            </div>
          </div>

          {/* Candidate Strengths & Weaknesses */}
          <div className="border border-gray-200 rounded-2xl p-4 flex flex-col gap-3">
            <div>
              <span className="font-bold text-xs text-neutral-primary block">
                Identified Strengths
              </span>
              <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                Strong practical masonry experience, hands-on wall tiling, tool maintenance, and workplace safety compliance.
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <span className="font-bold text-xs text-neutral-primary block">
                Areas for Development / Training Focus
              </span>
              <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                Advanced architectural blueprint interpretation, structural load-bearing calculation, and laser level calibration.
              </p>
            </div>
          </div>

          {/* Declaration & Signature */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-xs text-emerald-900 block">
                Candidate Declaration & Verification
              </span>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Candidate confirmed agreement to NOS assessment requirements and code of conduct.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-xl shrink-0">
              Signed
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            onClick={onClose}
            variant="amber"
            className="h-11 px-6 bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
