"use client";

import React from "react";
// import { FiShieldCheck } from "react-icons/fi";
import { VerificationStatus } from "../types/settings.types";

interface VerificationStatusCardProps {
  status: VerificationStatus;
  onVerifyNow?: () => void;
}

export const VerificationStatusCard: React.FC<VerificationStatusCardProps> = ({
  status,
  onVerifyNow,
}) => {
  const isVerified = status === "verified";

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg lg:text-2xl font-extrabold text-neutral-primary">
        Verification Status
      </h2>

      {isVerified ? (
        /* Verified State (Green Banner) */
        <div className="bg-[#edf7ee] border border-[#c8e6c9] rounded-xl p-4 flex items-center justify-between transition-all">
          <div className="flex flex-col">
            <span className="font-semibold text-[#2e7d32] text-sm lg:text-base">
              NIN Verification
            </span>
            <span className="text-xs text-[#388e3c] mt-0.5">
              Verification Complete
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[#2e7d32] font-semibold text-sm">
            {/* <FiShieldCheck className="w-5 h-5 stroke-[2.5]" /> */}
            <span>Verified</span>
          </div>
        </div>
      ) : (
        /* Not Verified State (Pink/Red Banner) */
        <div className="bg-[#fbebee] border border-[#f5c6cb]/40 rounded-xl p-4 flex items-center justify-between transition-all">
          <div className="flex flex-col">
            <span className="font-medium text-border-secondary text-sm lg:text-base">
              NIN Verification
            </span>
            <span className="text-xs text-[#B3261EB2] mt-0.5">
              Not Verified
            </span>
          </div>

          <button
            type="button"
            onClick={onVerifyNow}
            className="bg-white text-border-secondary hover:bg-[#8a1832] hover:text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Verify Now
          </button>
        </div>
      )}
    </div>
  );
};
