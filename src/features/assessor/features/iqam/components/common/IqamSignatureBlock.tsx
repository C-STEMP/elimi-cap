"use client";

import React from "react";
import { FiCalendar, FiEdit3 } from "react-icons/fi";

interface IqamSignatureBlockProps {
  label: string;
  required?: boolean;
  signed?: boolean;
  signedText?: string;
  dateValue?: string;
  onSign?: () => void;
  readOnly?: boolean;
}

// signedAt is stored as an ISO timestamp; show it as e.g. "24 Sep 2026".
const formatSignedDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const IqamSignatureBlock: React.FC<IqamSignatureBlockProps> = ({
  label,
  required = true,
  signed = false,
  signedText = "Signed",
  dateValue = "",
  onSign,
  readOnly = false,
}) => {
  const formattedDate = formatSignedDate(dateValue);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full">
      {/* Signature Box */}
      <div className="flex-1 flex flex-col gap-1.5">
        <label className="text-[11px] sm:text-xs font-bold text-neutral-primary">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
        <div
          onClick={!readOnly && !signed ? onSign : undefined}
          className={`h-11 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
            signed
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : readOnly
              ? "border-amber-200 bg-amber-50/50 text-amber-700/80 cursor-default"
              : "border-amber-300 bg-amber-50/80 text-amber-700 hover:bg-amber-100/70 cursor-pointer"
          }`}
        >
          <FiEdit3 className="w-3.5 h-3.5 shrink-0" />
          <span>{signed ? signedText : readOnly ? "Awaiting Signature" : "Append Signature"}</span>
        </div>
      </div>

      {/* Date Box */}
      <div className="flex-1 flex flex-col gap-1.5">
        <label className="text-[11px] sm:text-xs font-bold text-neutral-primary">
          Date
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
        {/* Filled automatically when the signature is appended. */}
        <div className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs text-neutral-primary">
          <span className={formattedDate ? "font-semibold" : "text-gray-400"}>
            {formattedDate || "Set when signed"}
          </span>
          <FiCalendar className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1.5" />
        </div>
      </div>
    </div>
  );
};
