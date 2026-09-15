"use client";

import React from "react";
import { FiEdit3, FiCheck } from "react-icons/fi";

interface ObservationSignaturesSectionProps {
  activeTab: "arf02a" | "arf04a";
  isWitnessSigned: boolean;
  onToggleWitnessSigned: () => void;
  learnerSigned: boolean;
  assessorSigned: boolean;
  canSignAsAssessor: boolean;
  onSignAsAssessor: () => void;
  isSigningAsAssessor?: boolean;
}

export const ObservationSignaturesSection: React.FC<
  ObservationSignaturesSectionProps
> = ({
  activeTab,
  isWitnessSigned,
  onToggleWitnessSigned,
  learnerSigned,
  assessorSigned,
  canSignAsAssessor,
  onSignAsAssessor,
  isSigningAsAssessor,
}) => {
  const CandidateSignatureBox = (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-neutral-primary">
        Candidate Signature<span className="text-rose-500">*</span>
      </span>
      {learnerSigned ? (
        <div className="h-11 border-2 border-emerald-500 bg-emerald-50/50 text-emerald-700 rounded-xl flex items-center justify-center gap-2 text-xs font-bold select-none">
          <FiCheck className="w-4 h-4" />
          <span>Signed</span>
        </div>
      ) : (
        <div className="h-11 border border-[#FBAB2A] bg-amber-50/30 text-[#FBAB2A] rounded-xl flex items-center justify-center gap-2 text-xs font-bold select-none">
          <FiEdit3 className="w-4 h-4" />
          <span>Awaiting Signature</span>
        </div>
      )}
    </div>
  );

  const AssessorSignatureBox = (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-neutral-primary">
        Assessor Signature<span className="text-rose-500">*</span>
      </span>
      {assessorSigned ? (
        <div className="h-11 border-2 border-emerald-500 bg-emerald-50/50 text-emerald-700 rounded-xl flex items-center justify-center gap-2 text-xs font-bold select-none">
          <FiCheck className="w-4 h-4" />
          <span>Signed</span>
        </div>
      ) : canSignAsAssessor ? (
        <button
          type="button"
          onClick={onSignAsAssessor}
          disabled={isSigningAsAssessor}
          className="h-11 border border-[#FBAB2A] bg-amber-50/30 hover:bg-amber-50 text-[#FBAB2A] rounded-xl flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-colors disabled:opacity-60"
        >
          <FiEdit3 className="w-4 h-4" />
          <span>{isSigningAsAssessor ? "Signing..." : "Append Signature"}</span>
        </button>
      ) : (
        <div className="h-11 border border-gray-200 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center gap-2 text-xs font-bold select-none">
          <span>Available once both forms are submitted</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 select-text">
      <h4 className="text-xs sm:text-sm font-bold text-neutral-primary">
        Signature
      </h4>

      {activeTab === "arf02a" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CandidateSignatureBox}
          {AssessorSignatureBox}

          {/* Work-base Witness */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-neutral-primary">
              Work-base Witness<span className="text-rose-500">*</span>
            </span>
            <button
              type="button"
              onClick={onToggleWitnessSigned}
              className={`h-11 border rounded-xl flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-colors ${
                isWitnessSigned
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-[#FBAB2A] bg-amber-50/30 text-[#FBAB2A] hover:bg-amber-50"
              }`}
            >
              {isWitnessSigned ? (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>Signed</span>
                </>
              ) : (
                <>
                  <FiEdit3 className="w-4 h-4" />
                  <span>Append Signature</span>
                </>
              )}
            </button>
          </div>

          {/* IQAM Signature */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-neutral-primary">
              IQAM Signature<span className="text-rose-500">*</span>
            </span>
            <div className="h-11 border border-[#FBAB2A] bg-amber-50/30 text-[#FBAB2A] rounded-xl flex items-center justify-center gap-2 text-xs font-bold select-none">
              <FiEdit3 className="w-4 h-4" />
              <span>Awaiting Signature</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CandidateSignatureBox}
          {AssessorSignatureBox}

          {/* IQAM Signature */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs font-semibold text-neutral-primary">
              IQAM Signature<span className="text-rose-500">*</span>
            </span>
            <div className="h-11 border border-[#FBAB2A] bg-amber-50/30 text-[#FBAB2A] rounded-xl flex items-center justify-center gap-2 text-xs font-bold select-none">
              <FiEdit3 className="w-4 h-4" />
              <span>Awaiting Signature</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
