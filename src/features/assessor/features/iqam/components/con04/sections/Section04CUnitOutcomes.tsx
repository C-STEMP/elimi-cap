"use client";

import React, { useState } from "react";
import { FiCalendar } from "react-icons/fi";
import { IqamSignatureBlock } from "../../common/IqamSignatureBlock";

export const Section04CUnitOutcomes: React.FC = () => {
  const [ivSigned, setIvSigned] = useState(false);
  const [countersigningIvaSigned, setCountersigningIvaSigned] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Units Achieved & Verified Grid */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Units Achieved & Verified:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((unitNum) => (
            <label key={unitNum} className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-neutral-primary cursor-pointer hover:bg-gray-100/70">
              <span className="font-bold text-gray-700">UNIT {unitNum}</span>
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-[#a31d38]" />
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-1.5 pt-2">
          <label className="text-xs font-bold text-neutral-primary">Date if full qualification achieved<span className="text-rose-500">*</span></label>
          <div className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs text-neutral-primary">
            <input type="text" placeholder="Type here" className="w-full bg-transparent outline-none" />
            <FiCalendar className="w-4 h-4 text-gray-400 shrink-0 ml-1.5" />
          </div>
        </div>
      </div>

      {/* Details of Problems */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Details of any problems regarding candidate access to the assessment process</h4>
        <textarea rows={3} placeholder="Type here" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none" />
      </div>

      {/* Details of Disagreements */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Details of any disagreements / Appeals and outcome of action taken</h4>
        <textarea rows={3} placeholder="Type here" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none" />
      </div>

      {/* Second Line IV Feedback */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Second Line Internal Verifier Feedback on IQA Process Used and Any Necessary Action Required:</h4>
        <textarea rows={3} placeholder="Type here" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none" />
        <IqamSignatureBlock label="Second Line IQA Signature" readOnly />
      </div>

      {/* 4-Party Signatures */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Signature & Date</h4>
        <IqamSignatureBlock label="IV Signature" signed={ivSigned} onSign={() => setIvSigned(true)} />
        <IqamSignatureBlock label="Countersigning IQA (Lead)" signed={countersigningIvaSigned} onSign={() => setCountersigningIvaSigned(true)} />
        <IqamSignatureBlock label="Assessor Signature" readOnly />
        <IqamSignatureBlock label="Countersigning Assessor" readOnly />
      </div>
    </div>
  );
};
