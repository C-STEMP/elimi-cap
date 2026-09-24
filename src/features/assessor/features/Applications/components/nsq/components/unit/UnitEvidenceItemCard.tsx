"use client";

import React from "react";
import { FiExternalLink, FiFileText } from "react-icons/fi";

export type EvidenceItemStatus = "in_review" | "approved" | "rejected";

export interface UnitEvidenceRecord {
  id: string;
  name: string;
  type: string;
  status: EvidenceItemStatus;
  feedback?: string;
  /** Signed/resolved URL of the uploaded file; null when it couldn't be resolved. */
  url?: string | null;
  refPage?: string | null;
}

const ViewEvidenceLink: React.FC<{ evidence: UnitEvidenceRecord }> = ({ evidence }) =>
  evidence.url ? (
    <a
      href={evidence.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 text-[#a31d38] hover:underline font-bold text-xs shrink-0"
    >
      View <FiExternalLink className="w-3 h-3" />
    </a>
  ) : (
    <span className="text-[11px] text-gray-400 font-medium shrink-0">File unavailable</span>
  );

const EvidenceName: React.FC<{ evidence: UnitEvidenceRecord }> = ({ evidence }) => (
  <span className="truncate">
    {evidence.name}
    {evidence.refPage && (
      <span className="font-medium opacity-70"> · p. {evidence.refPage}</span>
    )}
  </span>
);

interface UnitEvidenceItemCardProps {
  evidence: UnitEvidenceRecord;
  onApprove: () => void;
  onReject: () => void;
}

export const UnitEvidenceItemCard: React.FC<UnitEvidenceItemCardProps> = ({
  evidence,
  onApprove,
  onReject,
}) => {
  if (evidence.status === "approved") {
    return (
      <div className="border border-emerald-400 bg-white rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
          <FiFileText className="w-4 h-4 text-emerald-600 shrink-0" />
          <EvidenceName evidence={evidence} />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <ViewEvidenceLink evidence={evidence} />
          <span className="px-2.5 py-0.5 bg-emerald-700 text-white font-bold text-[10px] rounded-md">
            Approved
          </span>
        </div>
      </div>
    );
  }

  if (evidence.status === "rejected") {
    return (
      <div className="border border-rose-400 bg-white rounded-xl p-3.5 flex flex-col gap-2 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
            <FiFileText className="w-4 h-4 text-rose-600 shrink-0" />
            <EvidenceName evidence={evidence} />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <ViewEvidenceLink evidence={evidence} />
            <span className="px-2.5 py-0.5 bg-rose-700 text-white font-bold text-[10px] rounded-md">
              Rejected
            </span>
          </div>
        </div>
        {evidence.feedback && (
          <p className="text-[11px] text-rose-600 font-medium leading-relaxed pt-1 border-t border-rose-100">
            {evidence.feedback}
          </p>
        )}
      </div>
    );
  }

  // In Review (Default)
  return (
    <div className="border border-amber-300 bg-white rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-900 min-w-0">
        <FiFileText className="w-4 h-4 text-amber-600 shrink-0" />
        <EvidenceName evidence={evidence} />
        <span className="px-2 py-0.5 bg-amber-500 text-white font-bold text-[10px] rounded-md shrink-0">
          In Review
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs font-bold shrink-0">
        <ViewEvidenceLink evidence={evidence} />
        <button
          type="button"
          onClick={onApprove}
          className="text-neutral-primary hover:text-emerald-600 transition-colors cursor-pointer"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={onReject}
          className="text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
        >
          Reject
        </button>
      </div>
    </div>
  );
};
