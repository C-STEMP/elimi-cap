"use client";

import React from "react";
import { FiChevronRight } from "react-icons/fi";

export interface QualificationUnitItem {
  id: string;
  unitNo: string;
  title: string;
  approvedCount: number;
  totalCount: number;
  hasNewUpload?: boolean;
  status?: "not_started" | "in_progress" | "approved";
  criteriaPending?: number;
  criteriaRejected?: number;
}

interface QualificationUnitsListProps {
  tradeName: string;
  level?: string;
  units: QualificationUnitItem[];
  onSelectUnit: (unit: QualificationUnitItem) => void;
  isLoading?: boolean;
}

export const QualificationUnitsList: React.FC<QualificationUnitsListProps> = ({
  tradeName,
  level,
  units,
  onSelectUnit,
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4 select-text">
      <h3 className="text-base font-extrabold text-neutral-primary tracking-tight">
        {level ? `${tradeName} ${level}` : tradeName}
      </h3>

      <div className="flex flex-col gap-3">
        {isLoading && (
          <div className="flex flex-col gap-3 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="h-3.5 bg-gray-200 rounded w-14 shrink-0" />
                  <div className="h-3.5 bg-gray-200 rounded w-48" />
                </div>
                <div className="h-5 bg-gray-200 rounded-full w-24 shrink-0" />
              </div>
            ))}
          </div>
        )}
        {!isLoading && units.length === 0 && (
          <p className="text-xs text-gray-400 font-medium py-2">
            Units will appear here once the candidate&apos;s qualification standard is loaded.
          </p>
        )}
        {!isLoading &&
          units.map((u) => {
            const isFullyApproved =
              u.status === "approved" ||
              ((u.totalCount ?? 0) > 0 &&
                (u.approvedCount ?? 0) >= (u.totalCount ?? 0));
            const hasNoEvidence =
              !isFullyApproved &&
              (u.approvedCount ?? 0) === 0 &&
              (u.criteriaPending ?? 0) === 0 &&
              u.status !== "in_progress";

            return (
              <div
                key={u.id}
                onClick={() => onSelectUnit(u)}
                className="p-4 bg-gray-50/70 hover:bg-gray-100/70 rounded-2xl border border-gray-100 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-neutral-primary shrink-0">
                    {u.unitNo}:
                  </span>
                  <span className="text-xs sm:text-sm text-neutral-secondary truncate">
                    {u.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-3 py-1 font-semibold text-[11px] sm:text-xs rounded-full shadow-2xs ${
                      isFullyApproved
                        ? "bg-[#047857] text-white"
                        : hasNoEvidence
                          ? "bg-gray-200/80 text-gray-600"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isFullyApproved
                      ? `${u.approvedCount}/${u.totalCount} Approved`
                      : hasNoEvidence
                        ? "No Evidence"
                        : `${u.approvedCount}/${u.totalCount} Approved`}
                  </span>

                  <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-neutral-primary transition-colors" />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
