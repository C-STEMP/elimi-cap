"use client";

import React from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { getPasswordCriteria } from "@/lib/validation";

interface PasswordRequirementsProps {
  password?: string;
  className?: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password = "",
  className = "",
}) => {
  // Only display when the user starts typing
  if (!password || password.length === 0) {
    return null;
  }

  const criteria = getPasswordCriteria(password);
  const allValid = criteria.every((c) => c.isValid);

  // Immediately remove once user finishes typing a valid password (all requirements met)
  if (allValid) {
    return null;
  }

  return (
    <div
      className={`mt-2 p-3 rounded-xl bg-gray-50/90 border border-gray-200/80 text-xs transition-all duration-200 animate-in fade-in slide-in-from-top-1 ${className}`}
    >
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-200/60">
        <span className="font-semibold text-neutral-primary text-[11px] uppercase tracking-wide">
          Password Requirements
        </span>
        <span className="text-[11px] font-bold text-amber-600">
          Incomplete
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {criteria.map((item) => {
          const isValid = item.isValid;
          return (
            <div
              key={item.id}
              className={`flex items-center gap-2 text-[12px] transition-colors duration-150 ${
                isValid
                  ? "text-emerald-700 font-medium"
                  : "text-rose-600 font-normal"
              }`}
            >
              {isValid ? (
                <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <FiCheck className="w-2.5 h-2.5 text-emerald-700 stroke-[3]" />
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <FiX className="w-2.5 h-2.5 text-rose-600 stroke-[3]" />
                </span>
              )}
              <span className={isValid ? "line-through opacity-80" : ""}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
