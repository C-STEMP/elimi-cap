"use client";

import React from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

interface PortfolioSectionProps {
  number: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

/** One numbered heading of the candidate portfolio (Induction, Profile, …). */
export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  number,
  title,
  description,
  children,
  isOpen = true,
  onToggle,
}) => {
  const isAccordion = typeof onToggle === "function";

  return (
    <section
      className={
        isAccordion
          ? "bg-[#F8F9FA] rounded-[20px] p-4 sm:p-6 border border-gray-100/70 shadow-2xs flex flex-col gap-4 w-full transition-all"
          : "flex flex-col gap-4 w-full"
      }
    >
      <div
        onClick={isAccordion ? onToggle : undefined}
        className={`flex items-center justify-between gap-3 w-full ${
          isAccordion ? "cursor-pointer select-none" : ""
        }`}
      >
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <h2 className="text-black font-bold text-base sm:text-xl lg:text-2xl tracking-tight wrap-break-word">
            {number}. {title}
          </h2>
          {description && (
            <p className="text-gray-400 text-xs sm:text-sm font-normal mt-0.5 wrap-break-word">{description}</p>
          )}
        </div>

        {isAccordion && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            aria-expanded={isOpen}
            aria-label={`Toggle ${title}`}
            className="p-1 sm:p-2 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer rounded-lg hover:bg-gray-200/50 shrink-0"
          >
            {isOpen ? (
              <FiChevronUp className="w-5 h-5" />
            ) : (
              <FiChevronDown className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {(!isAccordion || isOpen) && (
        <div
          className={`flex flex-col gap-3.5 ${
            isAccordion ? "pt-3 border-t border-gray-200/60" : ""
          }`}
        >
          {children}
        </div>
      )}
    </section>
  );
};

