"use client";

import React from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import {
  PerformanceCriteriaAccordionItem,
  type UnitPerformanceCriteria,
} from "./PerformanceCriteriaAccordionItem";

export interface UnitLearningOutcome {
  id: string;
  title: string;
  hasNewUpload?: boolean;
  criteria: UnitPerformanceCriteria[];
}

interface LearningOutcomeAccordionItemProps {
  learningOutcome: UnitLearningOutcome;
  isExpanded: boolean;
  onToggle: () => void;
  expandedPcs: Record<string, boolean>;
  onTogglePc: (pcId: string) => void;
  onApproveEvidence: (loId: string, pcId: string, evidenceId: string) => void;
  onRejectEvidence: (loId: string, pcId: string, evidenceId: string) => void;
}

export const LearningOutcomeAccordionItem: React.FC<
  LearningOutcomeAccordionItemProps
> = ({
  learningOutcome,
  isExpanded,
  onToggle,
  expandedPcs,
  onTogglePc,
  onApproveEvidence,
  onRejectEvidence,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
      {/* LO Header */}
      <div
        onClick={onToggle}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">
            {learningOutcome.title}
          </h3>
          {learningOutcome.hasNewUpload && (
            <span className="px-2.5 py-0.5 bg-rose-50 text-[#a31d38] font-bold text-[10px] rounded-md border border-rose-100">
              New Upload
            </span>
          )}
        </div>
        {isExpanded ? (
          <FiChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <FiChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </div>

      {/* LO Body (Performance Criteria) */}
      {isExpanded && learningOutcome.criteria.length > 0 && (
        <div className="flex flex-col gap-3 pt-2">
          {learningOutcome.criteria.map((pc) => (
            <PerformanceCriteriaAccordionItem
              key={pc.id}
              criterion={pc}
              isExpanded={Boolean(expandedPcs[pc.id])}
              onToggle={() => onTogglePc(pc.id)}
              onApproveEvidence={(evidenceId) =>
                onApproveEvidence(learningOutcome.id, pc.id, evidenceId)
              }
              onRejectEvidence={(evidenceId) =>
                onRejectEvidence(learningOutcome.id, pc.id, evidenceId)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
