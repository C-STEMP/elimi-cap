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
  onDateChange?: (date: string) => void;
  readOnly?: boolean;
}

export const IqamSignatureBlock: React.FC<IqamSignatureBlockProps> = ({
  label,
  required = true,
  signed = false,
  signedText = "Signed",
  dateValue = "",
  onSign,
  onDateChange,
  readOnly = false,
}) => {
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
      <div className="w-full sm:w-48 md:w-56 flex flex-col gap-1.5">
        <label className="text-[11px] sm:text-xs font-bold text-neutral-primary">
          Date
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
        <div className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs text-neutral-primary focus-within:border-[#a31d38] focus-within:bg-white transition-all">
          <input
            type="text"
            placeholder="Type here"
            value={dateValue}
            onChange={(e) => onDateChange?.(e.target.value)}
            className="w-full bg-transparent outline-none text-xs text-neutral-primary placeholder:text-gray-400"
          />
          <FiCalendar className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1.5" />
        </div>
      </div>
    </div>
  );
};
