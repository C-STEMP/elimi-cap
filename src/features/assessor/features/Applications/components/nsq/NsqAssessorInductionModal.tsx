"use client";

import React from "react";
import { FiX, FiCheck } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import type { InductionForm } from "@/src/features/shared/applications/api/types";

interface NsqAssessorInductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  tradeName: string;
  inductionData?: InductionForm;
}

export const NsqAssessorInductionModal: React.FC<
  NsqAssessorInductionModalProps
> = ({ isOpen, onClose, candidateName, tradeName, inductionData }) => {
  if (!isOpen) return null;

  const displayCandidateName = inductionData?.data?.firstName
    ? `${inductionData.data.firstName} ${inductionData.data.lastName || ""}`.trim()
    : candidateName;
  const registeredUnits = inductionData?.units?.length
    ? inductionData.units.map((u) => `${u.referenceNumber}: ${u.title}`)
    : [];
  const strengths = inductionData?.data?.learningStrengths?.filter(Boolean) || [];
  const weaknesses = inductionData?.data?.learningWeaknesses?.filter(Boolean) || [];

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
                {displayCandidateName}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                REGISTERED TRADE
              </span>
              <span className="font-bold text-neutral-primary text-xs mt-0.5 block">
                {inductionData?.trade?.name || tradeName}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                REGISTRATION STATUS
              </span>
              {inductionData?.submittedAt ? (
                <span className="text-emerald-700 font-bold text-xs mt-0.5 inline-flex items-center gap-1">
                  <FiCheck className="w-3.5 h-3.5" /> Induction Completed
                </span>
              ) : (
                <span className="text-amber-700 font-bold text-xs mt-0.5 inline-flex items-center gap-1">
                  Induction Pending
                </span>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                SUBMISSION DATE
              </span>
              <span className="font-medium text-neutral-primary text-xs mt-0.5 block">
                {inductionData?.submittedAt
                  ? new Date(inductionData.submittedAt).toLocaleDateString("en-GB")
                  : "—"}
              </span>
            </div>
          </div>

          {/* Units Selected */}
          <div className="border border-gray-200 rounded-2xl p-4 flex flex-col gap-2.5">
            <span className="font-bold text-xs text-neutral-primary">
              Registered Qualification Units
            </span>
            {registeredUnits.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {registeredUnits.map((u, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-rose-50 border border-rose-100 text-[#a31d38] font-bold text-[11px] rounded-xl"
                  >
                    {u}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-xs italic">No units registered yet.</p>
            )}
          </div>

          {/* Candidate Strengths & Weaknesses */}
          {(strengths.length > 0 || weaknesses.length > 0) && (
            <div className="border border-gray-200 rounded-2xl p-4 flex flex-col gap-3">
              {strengths.length > 0 && (
                <div>
                  <span className="font-bold text-xs text-neutral-primary block">
                    Identified Strengths
                  </span>
                  <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                    {strengths.join(", ")}
                  </p>
                </div>
              )}
              {weaknesses.length > 0 && (
                <div className={strengths.length > 0 ? "pt-2 border-t border-gray-100" : undefined}>
                  <span className="font-bold text-xs text-neutral-primary block">
                    Areas for Development / Training Focus
                  </span>
                  <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                    {weaknesses.join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}

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
            <span
              className={`px-3 py-1 font-bold text-xs rounded-xl shrink-0 ${
                inductionData?.signature
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {inductionData?.signature ? "Signed" : "Not Signed"}
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
