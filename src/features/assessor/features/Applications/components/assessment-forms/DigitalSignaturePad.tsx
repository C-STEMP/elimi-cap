"use client";

import React from "react";
import { FiCheckCircle, FiClock, FiEdit3 } from "react-icons/fi";

interface DigitalSignaturePadProps {
  label: string;
  required?: boolean;
  isSigned: boolean;
  signerName?: string;
  signedAt?: string;
  signatureUrl?: string | null;
  isReadOnly?: boolean;
  onAppendSignature: () => void;
  onChangeSignature?: () => void;
  onClearSignature?: () => void;
  className?: string;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  label,
  required = true,
  isSigned,
  signerName,
  signedAt,
  signatureUrl,
  isReadOnly = false,
  onAppendSignature,
  onChangeSignature,
  onClearSignature,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-medium text-neutral-primary">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>

      {isSigned ? (
        <div
          onClick={!isReadOnly && onChangeSignature ? onChangeSignature : undefined}
          className={`h-11 sm:h-12 bg-[#E6F4EA] border border-[#1E7F4C]/30 text-[#1E7F4C] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2.5 px-3.5 select-none shadow-2xs transition-all ${
            !isReadOnly && onChangeSignature
              ? "cursor-pointer hover:bg-[#DCF0E2]"
              : ""
          }`}
          title={!isReadOnly && onChangeSignature ? "Click to change signature" : undefined}
        >
          {signatureUrl ? (
            <img
              src={signatureUrl}
              alt={label}
              className="h-7 max-w-[120px] object-contain"
            />
          ) : (
            <FiCheckCircle className="w-4 h-4 text-[#1E7F4C] shrink-0" />
          )}
          <span>Signed</span>
          {!isReadOnly && onChangeSignature && (
            <span className="text-[11px] font-normal text-emerald-700/80 underline ml-1 hover:text-emerald-800">
              (Change)
            </span>
          )}
        </div>
      ) : isReadOnly ? (
        <div className="h-11 sm:h-12 bg-[#FFF8EB] border border-[#FBAB2A]/60 text-[#FBAB2A] font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 select-none">
          <FiClock className="w-4 h-4 text-[#FBAB2A] shrink-0" />
          <span>Awaiting Signature</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onAppendSignature}
          className="h-11 sm:h-12 bg-[#FFF8EB] border border-[#FBAB2A] hover:bg-[#FDEED5] text-[#FBAB2A] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
        >
          <FiEdit3 className="w-4 h-4 text-[#FBAB2A] shrink-0" />
          <span>Append Signature</span>
        </button>
      )}
    </div>
  );
};
