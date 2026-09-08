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
}

interface QualificationUnitsListProps {
  tradeName: string;
  level?: string;
  units: QualificationUnitItem[];
  onSelectUnit: (unit: QualificationUnitItem) => void;
}

export const QualificationUnitsList: React.FC<QualificationUnitsListProps> = ({
  tradeName,
  level = "Level 3",
  units,
  onSelectUnit,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4 select-text">
      <h3 className="text-base font-extrabold text-neutral-primary tracking-tight">
        {tradeName} {level}
      </h3>

      <div className="flex flex-col gap-3">
        {units.map((u) => (
          <div
            key={u.id}
            onClick={() => onSelectUnit(u)}
            className="p-4 bg-gray-50/70 hover:bg-gray-100/70 rounded-2xl border border-gray-100 transition-all cursor-pointer flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs font-bold text-neutral-primary shrink-0">
                {u.unitNo}:
              </span>
              <span className="text-xs text-neutral-secondary truncate">
                {u.title}
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="px-2.5 py-1 bg-gray-200/70 text-gray-700 font-bold text-[11px] rounded-lg">
                {u.approvedCount}/{u.totalCount} Approved
              </span>

              {u.hasNewUpload && (
                <span className="px-2.5 py-1 bg-rose-600 text-white font-bold text-[11px] rounded-lg shadow-2xs">
                  New Upload
                </span>
              )}

              <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-neutral-primary transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
