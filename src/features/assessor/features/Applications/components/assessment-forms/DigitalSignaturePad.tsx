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
  isLoading?: boolean;
  buttonText?: string;
  waitingText?: string;
  onAppendSignature: () => void;
  onClearSignature?: () => void;
  onChangeSignature?: () => void;
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
  isLoading = false,
  buttonText,
  waitingText: customWaitingText,
  onAppendSignature,
  onClearSignature,
  onChangeSignature,
  className = "",
}) => {
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [signatureUrl]);

  const defaultWaitingText = React.useMemo(() => {
    if (customWaitingText) return customWaitingText;
    const l = label.toLowerCase();
    if (l.includes("candidate")) return "Awaiting Candidate";
    if (l.includes("panel")) return "Awaiting Panel Member";
    if (l.includes("internal") || l.includes("iv") || l.includes("verifier")) return "Awaiting Internal Verifier";
    if (l.includes("lead")) return "Awaiting Lead Assessor";
    return "Awaiting Assessor";
  }, [customWaitingText, label]);

  const showImage = Boolean(signatureUrl && !imageError);

  const formattedDate = React.useMemo(() => {
    if (!signedAt) return null;
    try {
      const d = new Date(signedAt);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString("en-GB");
    } catch {
      return null;
    }
  }, [signedAt]);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-neutral-primary">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
        {isSigned && formattedDate && (
          <span className="text-[10px] text-gray-400 font-medium">
            Signed on {formattedDate}
          </span>
        )}
      </div>

      {isSigned ? (
        <div className="h-11 sm:h-12 bg-[#E6F4EA] border border-[#1E7F4C]/30 text-[#1E7F4C] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-between px-3.5 select-none shadow-2xs transition-all">
          <div className="flex items-center gap-2.5 min-w-0">
            {showImage ? (
              <img
                src={signatureUrl!}
                alt={label}
                onError={() => setImageError(true)}
                className="h-7 max-w-[120px] object-contain"
              />
            ) : (
              <FiCheckCircle className="w-4 h-4 text-[#1E7F4C] shrink-0" />
            )}
            <span className="truncate">
              Signed{signerName ? ` · ${signerName}` : ""}
            </span>
          </div>

          {!isReadOnly && (
            <div className="flex items-center gap-2 shrink-0">
              {onChangeSignature && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeSignature();
                  }}
                  className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline transition-colors cursor-pointer"
                >
                  Change
                </button>
              )}
              {onClearSignature && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearSignature();
                  }}
                  className="text-[11px] font-normal text-emerald-700/80 hover:text-rose-600 underline transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      ) : isReadOnly ? (
        <div className="h-11 sm:h-12 bg-[#FFF8EB] border border-[#FBAB2A]/60 text-[#FBAB2A] font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 select-none px-3">
          <FiEdit3 className="w-4 h-4 text-[#FBAB2A] shrink-0" />
          <span className="truncate">{defaultWaitingText}</span>
        </div>
      ) : (
        <button
          type="button"
          disabled={isLoading}
          onClick={onAppendSignature}
          className="h-11 sm:h-12 bg-[#FFF8EB] border border-[#FBAB2A] hover:bg-[#FDEED5] text-[#FBAB2A] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.99] disabled:opacity-50"
        >
          <FiEdit3 className="w-4 h-4 text-[#FBAB2A] shrink-0" />
          <span>{isLoading ? "Signing..." : (buttonText || "Append Signature")}</span>
        </button>
      )}
    </div>
  );
};
