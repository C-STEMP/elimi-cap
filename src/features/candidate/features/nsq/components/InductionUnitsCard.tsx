"use client";

import React from "react";
import { FiInfo, FiCheck } from "react-icons/fi";

interface UnitItem {
  id: string;
  title: string;
  referenceNumber?: string;
  isMandatory?: boolean;
}

interface InductionUnitsCardProps {
  unitsList: UnitItem[];
  selectedUnitIds: string[];
  onToggleUnit: (uId: string) => void;
}

export const InductionUnitsCard: React.FC<InductionUnitsCardProps> = ({
  unitsList,
  selectedUnitIds,
  onToggleUnit,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
          Unit/Modules
        </h3>
        <FiInfo className="w-4 h-4 text-gray-400" />
      </div>

      <div className="flex flex-col gap-2.5">
        {unitsList.map((unit, idx) => {
          const isChecked = selectedUnitIds.includes(unit.id);
          const unitNum = unit.referenceNumber || `UNIT ${idx + 1}`;
          return (
            <div
              key={unit.id || idx}
              onClick={() => onToggleUnit(unit.id)}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all flex items-center gap-3.5 cursor-pointer select-none ${
                isChecked
                  ? "bg-[#fdf2f5] border-[#a31d38]/30 shadow-xs"
                  : "bg-[#f8f9fa] border-gray-200 hover:border-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                  isChecked
                    ? "bg-[#a31d38] border-[#a31d38] text-white"
                    : "bg-white border-gray-300"
                }`}
              >
                {isChecked && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <span className="font-extrabold text-neutral-primary shrink-0 uppercase">
                  {unitNum}:
                </span>
                <span className="text-gray-600 font-medium">{unit.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
