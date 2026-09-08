"use client";

import React from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import {
  UnitEvidenceItemCard,
  type UnitEvidenceRecord,
} from "./UnitEvidenceItemCard";

export interface UnitPerformanceCriteria {
  id: string;
  code: string;
  description: string;
  hasNewUpload?: boolean;
  evidences: UnitEvidenceRecord[];
}

interface PerformanceCriteriaAccordionItemProps {
  criterion: UnitPerformanceCriteria;
  isExpanded: boolean;
  onToggle: () => void;
  onApproveEvidence: (evidenceId: string) => void;
  onRejectEvidence: (evidenceId: string) => void;
}

export const PerformanceCriteriaAccordionItem: React.FC<
  PerformanceCriteriaAccordionItemProps
> = ({
  criterion,
  isExpanded,
  onToggle,
  onApproveEvidence,
  onRejectEvidence,
}) => {
  return (
    <div className="border border-gray-100 bg-[#fbfcfd] rounded-2xl p-4 flex flex-col gap-3">
      {/* PC Header */}
      <div
        onClick={onToggle}
        className="flex items-center justify-between cursor-pointer select-none gap-2"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold text-[10px] rounded-md border border-rose-100 shrink-0">
            {criterion.code}
          </span>
          <span className="text-xs font-semibold text-neutral-primary truncate">
            {criterion.description}
          </span>
          {criterion.hasNewUpload && (
            <span className="px-2 py-0.5 bg-rose-50 text-[#a31d38] font-bold text-[9px] rounded-md shrink-0">
              New Upload
            </span>
          )}
        </div>
        {isExpanded ? (
          <FiChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
        ) : (
          <FiChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        )}
      </div>

      {/* Evidence Items for this PC */}
      {isExpanded && criterion.evidences && criterion.evidences.length > 0 && (
        <div className="flex flex-col gap-2.5 pt-1">
          {criterion.evidences.map((ev) => (
            <UnitEvidenceItemCard
              key={ev.id}
              evidence={ev}
              onApprove={() => onApproveEvidence(ev.id)}
              onReject={() => onRejectEvidence(ev.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
