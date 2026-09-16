"use client";

import React, { useMemo, useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiCheckSquare,
  FiSquare,
} from "react-icons/fi";

export interface Arf02CriteriaState {
  fulfilled: boolean;
  comment: string;
}

export interface ObservationCriterionDef {
  id?: string;
  code: string;
  desc: string;
  unitId?: string;
  unitTitle?: string;
  unitReference?: string;
  learningObjectiveCode?: string;
  learningObjectiveText?: string;
}

interface GroupedLo {
  key: string;
  label: string;
  criteria: ObservationCriterionDef[];
}

interface GroupedUnit {
  key: string;
  label: string;
  los: GroupedLo[];
}

// Groups the flat criteria list into UNIT -> LO -> PC, driven entirely by
// the real catalogue data (unitId/learningObjectiveCode) instead of a fixed
// Unit 1/LO 1 mockup — a session can carry any number of units and LOs
// depending on what the candidate selected for this observation.
function groupCriteria(criteriaDefs: ObservationCriterionDef[]): GroupedUnit[] {
  const units: Record<string, GroupedUnit> = {};
  const unitOrder: string[] = [];

  criteriaDefs.forEach((pc, idx) => {
    const unitKey = pc.unitId || pc.unitReference || "unit-1";
    if (!units[unitKey]) {
      units[unitKey] = {
        key: unitKey,
        label: `UNIT ${unitOrder.length + 1}: ${pc.unitTitle || pc.unitReference || "Unassigned Unit"}`,
        los: [],
      };
      unitOrder.push(unitKey);
    }

    const loKey = pc.learningObjectiveCode || "lo-1";
    let lo = units[unitKey].los.find((l) => l.key === loKey);
    if (!lo) {
      const loIndex = units[unitKey].los.length + 1;
      lo = {
        key: loKey,
        label: pc.learningObjectiveText
          ? `LO ${loIndex}: ${pc.learningObjectiveText}`
          : `LO ${loIndex}`,
        criteria: [],
      };
      units[unitKey].los.push(lo);
    }
    lo.criteria.push(pc);
    void idx;
  });

  return unitOrder.map((key) => units[key]);
}

interface Arf02MatrixLogProps {
  criteriaDefs: ObservationCriterionDef[];
  criteriaState: Record<string, Arf02CriteriaState>;
  onToggleFulfilled: (code: string) => void;
  onChangeComment: (code: string, comment: string) => void;
  readOnly?: boolean;
}

export const Arf02MatrixLog: React.FC<Arf02MatrixLogProps> = ({
  criteriaDefs,
  criteriaState,
  onToggleFulfilled,
  onChangeComment,
  readOnly = false,
}) => {
  const groupedUnits = useMemo(() => groupCriteria(criteriaDefs), [criteriaDefs]);

  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [expandedLos, setExpandedLos] = useState<Record<string, boolean>>({});

  const isUnitOpen = (unitIdx: number, unitKey: string) =>
    expandedUnits[unitKey] ?? unitIdx === 0;
  const isLoOpen = (unitIdx: number, loIdx: number, loKey: string) =>
    expandedLos[loKey] ?? (unitIdx === 0 && loIdx === 0);

  const toggleUnit = (unitIdx: number, unitKey: string) =>
    setExpandedUnits((prev) => ({ ...prev, [unitKey]: !isUnitOpen(unitIdx, unitKey) }));
  const toggleLo = (unitIdx: number, loIdx: number, loKey: string) =>
    setExpandedLos((prev) => ({ ...prev, [loKey]: !isLoOpen(unitIdx, loIdx, loKey) }));

  return (
    <div className="flex flex-col gap-4">
      {groupedUnits.map((unit, unitIdx) => {
        const unitOpen = isUnitOpen(unitIdx, unit.key);
        return (
          <div
            key={unit.key}
            className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col"
          >
            <button
              type="button"
              onClick={() => toggleUnit(unitIdx, unit.key)}
              className="w-full flex items-center justify-between p-4 bg-gray-50/70 hover:bg-gray-50 transition-colors text-left font-bold text-xs sm:text-sm text-neutral-primary cursor-pointer"
            >
              <span>{unit.label}</span>
              {unitOpen ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
            </button>

            {unitOpen && (
              <div className="p-4 sm:p-5 flex flex-col gap-4">
                {unit.los.map((lo, loIdx) => {
                  const loOpen = isLoOpen(unitIdx, loIdx, lo.key);
                  return (
                    <div key={lo.key} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleLo(unitIdx, loIdx, lo.key)}
                        className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/60 transition-colors text-left font-bold text-xs sm:text-sm text-neutral-primary cursor-pointer"
                      >
                        <span>{lo.label}</span>
                        {loOpen ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                      </button>

                      {loOpen && (
                        <div className="p-4 flex flex-col gap-4">
                          {lo.criteria.map((pc, idx) => {
                            const criterionKey = pc.id || pc.code;
                            const isFulfilled =
                              criteriaState[criterionKey]?.fulfilled ??
                              criteriaState[pc.code]?.fulfilled;
                            return (
                              <div
                                key={pc.id || `${pc.code}-${idx}`}
                                className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 bg-white"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-center gap-2">
                                    {pc.unitReference && (
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-bold text-[10px] rounded-md shrink-0">
                                        {pc.unitReference}
                                      </span>
                                    )}
                                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold text-[10px] rounded-md border border-rose-100 shrink-0">
                                      {pc.code}
                                    </span>
                                    <span className="text-xs font-semibold text-neutral-primary">
                                      {pc.desc}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={readOnly ? undefined : () => onToggleFulfilled(criterionKey)}
                                    disabled={readOnly}
                                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors shrink-0 ${
                                      readOnly ? "cursor-default" : "cursor-pointer"
                                    } ${
                                      isFulfilled ? "text-[#1E7F4C]" : "text-gray-400 hover:text-gray-600"
                                    }`}
                                  >
                                    {isFulfilled ? (
                                      <FiCheckSquare className="w-4 h-4 text-[#1E7F4C]" />
                                    ) : (
                                      <FiSquare className="w-4 h-4 text-gray-300" />
                                    )}
                                    <span className={isFulfilled ? "text-[#1E7F4C]" : ""}>Fulfilled</span>
                                  </button>
                                </div>

                                <textarea
                                  value={
                                    criteriaState[criterionKey]?.comment ??
                                    criteriaState[pc.code]?.comment ??
                                    ""
                                  }
                                  onChange={readOnly ? undefined : (e) => onChangeComment(criterionKey, e.target.value)}
                                  readOnly={readOnly}
                                  placeholder={readOnly ? "No comments provided" : "Type Comments Here"}
                                  rows={2}
                                  className={`w-full p-3 border border-gray-200 rounded-xl text-xs text-neutral-primary resize-none ${
                                    readOnly
                                      ? "bg-input-bg cursor-default focus:outline-none"
                                      : "bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FBAB2A]/40"
                                  }`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
