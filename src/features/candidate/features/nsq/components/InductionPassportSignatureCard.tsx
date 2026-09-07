"use client";

import React from "react";
import { FiUploadCloud, FiEdit3 } from "react-icons/fi";

interface InductionPassportSignatureCardProps {
  passportPreview: string | null;
  onPassportUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSignatureAppended: boolean;
  signatureUrl: string;
  onAppendSignature: () => void;
}

export const InductionPassportSignatureCard: React.FC<InductionPassportSignatureCardProps> = ({
  passportPreview,
  onPassportUpload,
  isSignatureAppended,
  signatureUrl,
  onAppendSignature,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Signature Box */}
      <div className="flex flex-col gap-2">
        <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
          Append Signature<span className="text-primary-solid ml-0.5">*</span>
        </label>
        <div
          onClick={onAppendSignature}
          className={`w-full min-h-14 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer select-none py-3 px-4 ${
            isSignatureAppended
              ? "bg-amber-50/70 border-amber-400 text-amber-800"
              : "bg-[#fffaf0] border-[#fbab2a]/40 text-[#d98200] hover:bg-[#fff5e0] hover:border-[#fbab2a]"
          }`}
        >
          {isSignatureAppended && signatureUrl && !signatureUrl.startsWith("data:image/svg") ? (
            <div className="flex items-center gap-3">
              <img
                src={signatureUrl}
                alt="Signature"
                className="h-9 max-w-[120px] object-contain border border-amber-200/80 rounded-md bg-white p-1"
              />
              <div className="flex items-center gap-1.5 text-amber-800">
                <FiEdit3 className="w-4 h-4 text-amber-800" />
                <span>✓ Signature Appended (Click to update)</span>
              </div>
            </div>
          ) : (
            <>
              <FiEdit3 className="w-4 h-4" />
              <span>
                {isSignatureAppended
                  ? "✓ Signature Appended (Click to update)"
                  : "Append Signature"}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
