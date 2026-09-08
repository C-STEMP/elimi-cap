"use client";

import React, { useState } from "react";
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
  code: string;
  desc: string;
}

interface Arf02MatrixLogProps {
  criteriaDefs: ObservationCriterionDef[];
  criteriaState: Record<string, Arf02CriteriaState>;
  onToggleFulfilled: (code: string) => void;
  onChangeComment: (code: string, comment: string) => void;
}

export const Arf02MatrixLog: React.FC<Arf02MatrixLogProps> = ({
  criteriaDefs,
  criteriaState,
  onToggleFulfilled,
  onChangeComment,
}) => {
  const [isUnit1Open, setIsUnit1Open] = useState(true);
  const [isLo1Open, setIsLo1Open] = useState(true);
  const [isLo2Open, setIsLo2Open] = useState(false);
  const [isLo3Open, setIsLo3Open] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Unit 1 Accordion */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
        <button
          type="button"
          onClick={() => setIsUnit1Open(!isUnit1Open)}
          className="w-full flex items-center justify-between p-4 bg-gray-50/70 hover:bg-gray-50 transition-colors text-left font-bold text-xs sm:text-sm text-neutral-primary cursor-pointer"
        >
          <span>UNIT 1: Maintain core occupational standards and workplace protocol</span>
          {isUnit1Open ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
        </button>

        {isUnit1Open && (
          <div className="p-4 sm:p-5 flex flex-col gap-4">
            {/* LO 1 */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setIsLo1Open(!isLo1Open)}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/60 transition-colors text-left font-bold text-xs sm:text-sm text-neutral-primary cursor-pointer"
              >
                <span>LO 1: Maintain personal health and hygiene</span>
                {isLo1Open ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>

              {isLo1Open && (
                <div className="p-4 flex flex-col gap-4">
                  {criteriaDefs.map((pc) => {
                    const isFulfilled = criteriaState[pc.code]?.fulfilled;
                    return (
                      <div
                        key={pc.code}
                        className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 bg-white"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold text-[10px] rounded-md border border-rose-100 shrink-0">
                              {pc.code}
                            </span>
                            <span className="text-xs font-semibold text-neutral-primary">
                              {pc.desc}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onToggleFulfilled(pc.code)}
                            className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                              isFulfilled ? "text-rose-600" : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            {isFulfilled ? (
                              <FiCheckSquare className="w-4 h-4 text-rose-600" />
                            ) : (
                              <FiSquare className="w-4 h-4" />
                            )}
                            <span>Fulfilled</span>
                          </button>
                        </div>

                        <textarea
                          value={criteriaState[pc.code]?.comment || ""}
                          onChange={(e) => onChangeComment(pc.code, e.target.value)}
                          placeholder="Type Comments Here"
                          rows={2}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FBAB2A]/40 resize-none"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Collapsed LO 2 */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setIsLo2Open(!isLo2Open)}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/60 transition-colors text-left font-bold text-xs sm:text-sm text-neutral-primary cursor-pointer"
              >
                <span>LO 2: Maintain a hygienic, safe and hazard free workplace.</span>
                {isLo2Open ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Collapsed LO 3 */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setIsLo3Open(!isLo3Open)}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/60 transition-colors text-left font-bold text-xs sm:text-sm text-neutral-primary cursor-pointer"
              >
                <span>LO 3: Maintain a hygienic, safe and secure workplace</span>
                {isLo3Open ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Unit 2 Collapsed */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-4 bg-gray-50/70 text-xs sm:text-sm font-bold text-neutral-primary flex items-center justify-between">
          <span>UNIT 2: Core trade operations and equipment safety</span>
          <FiChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Unit 3 Collapsed */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-4 bg-gray-50/70 text-xs sm:text-sm font-bold text-neutral-primary flex items-center justify-between">
          <span>UNIT 3: Quality inspection and finishing criteria</span>
          <FiChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};
