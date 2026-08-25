"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiChevronUp, FiMoreVertical } from "react-icons/fi";
import type { ApplicationStageItem } from "../../types/applications.types";
import { AssessorPanelMembersSection } from "./AssessorPanelMembersSection";

interface AssessorApplicationStageCardProps {
  stage: ApplicationStageItem;
  onViewApplicationForm?: () => void;
  onOpenEvidenceVault?: () => void;
}

export const AssessorApplicationStageCard: React.FC<
  AssessorApplicationStageCardProps
> = ({ stage, onViewApplicationForm, onOpenEvidenceVault }) => {
  const [isCollapsed, setIsCollapsed] = useState(stage.isCollapsed ?? false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const getBadgeStyle = (badgeType?: string, statusText?: string) => {
    const s = (badgeType || statusText || "").toLowerCase();
    if (
      s.includes("approved") ||
      s.includes("successful") ||
      s.includes("completed") ||
      s.includes("complete") ||
      s.includes("competent")
    ) {
      if (s.includes("incompetent")) {
        return "bg-rose-50 text-rose-600";
      }
      return "bg-[#E8F8F0] text-[#12B76A]";
    }
    if (
      s.includes("days left") ||
      s.includes("ongoing") ||
      s.includes("in progress") ||
      s.includes("awaiting interview") ||
      s.includes("interview scheduled") ||
      s.includes("under review") ||
      s.includes("inconclusive")
    ) {
      return "bg-[#FFF4E5] text-[#FF9800]";
    }
    return "bg-gray-100 text-gray-500";
  };

  const badgeStyle = getBadgeStyle(stage.badgeType, stage.badgeText || stage.status);
  const isCollapsible =
    stage.isCollapsible && !stage.menuActions;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs flex flex-col gap-3 transition-all relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h4 className="text-base sm:text-lg font-bold text-neutral-primary">
              {stage.title}
            </h4>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-semibold ${badgeStyle}`}
            >
              {stage.badgeText || stage.status}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-secondary">
            {stage.dateText || "---"}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          {stage.actionButton && (
            <div>
              {stage.actionButton.variant === "view" ? (
                <button
                  type="button"
                  onClick={stage.actionButton.onClick || onViewApplicationForm}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-neutral-primary font-semibold text-xs sm:text-sm px-6 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  {stage.actionButton.label}
                </button>
              ) : stage.actionButton.variant === "evidence_vault" ? (
                <button
                  type="button"
                  onClick={stage.actionButton.onClick || onOpenEvidenceVault}
                  className="bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-xs sm:text-sm px-5 py-2 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  {stage.actionButton.label}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stage.actionButton.onClick}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs sm:text-sm px-5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  {stage.actionButton.label}
                </button>
              )}
            </div>
          )}

          {/* Three Dots Menu for Lead Panelist / Assessor Actions */}
          {stage.menuActions && stage.menuActions.length > 0 && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
                aria-label="Stage actions"
              >
                <FiMoreVertical className="w-5 h-5" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20 flex flex-col text-left animate-in fade-in zoom-in-95 duration-150">
                  {stage.menuActions.map((action, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        action.onClick();
                      }}
                      className="px-4 py-2 text-xs sm:text-sm text-neutral-primary hover:bg-gray-50 text-left transition-colors cursor-pointer font-medium"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isCollapsible && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle details"
            >
              {isCollapsed ? (
                <FiChevronDown className="w-5 h-5" />
              ) : (
                <FiChevronUp className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Assessors Section */}
      {!isCollapsed && stage.assessors && stage.assessors.length > 0 && (
        <AssessorPanelMembersSection assessors={stage.assessors} />
      )}

      {/* Forms to Sign (Awaiting Signature) */}
      {stage.formsToSign && stage.formsToSign.length > 0 && (
        <div className="mt-3 flex flex-col gap-3 w-full">
          {stage.formsToSign.map((form) => (
            <div
              key={form.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex flex-col min-w-0">
                <h4 className="font-extrabold text-neutral-primary text-sm sm:text-base underline underline-offset-3 cursor-pointer hover:text-[#A31D38] transition-colors truncate">
                  {form.title}
                </h4>
                {form.description && (
                  <p className="text-neutral-secondary text-xs font-normal mt-0.5">
                    {form.description}
                  </p>
                )}
              </div>

              {form.signed ? (
                <div className="bg-[#E6F4EA] border border-[#1E7F4C]/30 text-[#1E7F4C] font-bold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 select-none shadow-2xs shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-[#1E7F4C]"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Signed
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => stage.onAppendSignature?.(form.id)}
                  className="bg-[#FFF8EB] border border-[#FBAB2A] hover:bg-[#FDEED5] text-[#FBAB2A] font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-2xs shrink-0 flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-[#FBAB2A]"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Append Signature
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Inconclusive / Incompetent Feedback Section */}
      {stage.inconclusiveDetails && (
        <div className="mt-2 bg-[#FFF5F6] border border-[#FEE2E2] rounded-2xl p-4 sm:p-5 flex flex-col gap-2">
          <h5 className="text-sm font-bold text-[#A31D38]">
            {stage.inconclusiveDetails.title || "Interview Inconclusive"}
          </h5>
          <div>
            <span className="text-xs font-bold text-[#A31D38] block">Reason:</span>
            <p className="text-xs text-[#A31D38] leading-relaxed mt-0.5">
              {stage.inconclusiveDetails.reason}
            </p>
          </div>
          <div>
            <span className="text-xs font-bold text-[#A31D38] block mt-1">Recommended:</span>
            <p className="text-xs text-[#A31D38] leading-relaxed mt-0.5">
              {stage.inconclusiveDetails.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
