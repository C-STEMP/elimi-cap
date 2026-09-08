"use client";

import React, { useState } from "react";
import { FiTrash2, FiPlus } from "react-icons/fi";
import { IqamSignatureBlock } from "../../common/IqamSignatureBlock";
import type { AgreedActionItem } from "../../../types/iqam.types";

const INITIAL_ACTIONS: AgreedActionItem[] = [
  { id: "1", actionRequired: "Ensure candidate signs bottom of ARF 02A continuation sheet (3)", byWho: "Chidi Okonkwo", timeline: "Within 48 hours", achieved: "yes" },
  { id: "2", actionRequired: "Cross-reference photographic evidence with physical specimen tag", byWho: "Chidi Okonkwo", timeline: "Before final IQA signoff", achieved: "no" },
  { id: "3", actionRequired: "Ensure candidate signs bottom of observation sheet for Unit 02.", byWho: "Chidi Okonkwo", timeline: "2 weeks", achieved: "yes" },
];

export const Section04BMethodsQuality: React.FC = () => {
  const [actions, setActions] = useState<AgreedActionItem[]>(INITIAL_ACTIONS);
  const [consistentPractice, setConsistentPractice] = useState<"yes" | "no">("yes");
  const [countersignedAssessor, setCountersignedAssessor] = useState<"yes" | "no">("yes");

  return (
    <div className="flex flex-col gap-6">
      {/* Methods Sampled */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">
          Methods of Assessment & Evidence Sources Sampled (please tick):
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["Direct Observation", "Witness Testimony", "Questions / Discussion", "Work Products", "Simulation", "Assignment / Project / Case Study", "APL / Prior Learning / Experience", "Otherss"].map((m) => (
            <label key={m} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-neutral-primary cursor-pointer hover:bg-gray-100/70">
              <span className="truncate pr-2 font-medium">{m}</span>
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-[#a31d38]" />
            </label>
          ))}
        </div>
      </div>

      {/* Evidence Quality (VACSR Verification) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Evidence Quality (VACSR Verification):</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["Valid", "Sufficient", "Current", "Authentic"].map((q) => (
            <label key={q} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-neutral-primary cursor-pointer hover:bg-gray-100/70">
              <span className="font-medium">{q}</span>
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-[#a31d38]" />
            </label>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs font-bold text-neutral-primary">Is there evidence of consistent practice?</span>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setConsistentPractice("yes")} className={`px-3 py-1 rounded-lg text-xs font-bold ${consistentPractice === "yes" ? "bg-[#a31d38] text-white" : "bg-gray-100 text-gray-700"}`}>Yes</button>
            <button type="button" onClick={() => setConsistentPractice("no")} className={`px-3 py-1 rounded-lg text-xs font-bold ${consistentPractice === "no" ? "bg-[#a31d38] text-white" : "bg-gray-100 text-gray-700"}`}>No</button>
          </div>
        </div>
      </div>

      {/* Part of Assessment Process Checked */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Part of Assessment Process Checked (tick √):</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["Planning", "Reviewing / Feedback", "Recording", "Judgement"].map((p) => (
            <label key={p} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-neutral-primary cursor-pointer hover:bg-gray-100/70">
              <span className="font-medium">{p}</span>
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-[#a31d38]" />
            </label>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs font-bold text-neutral-primary">Checked and countersigned by qualified assessor (where necessary):</span>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setCountersignedAssessor("yes")} className={`px-3 py-1 rounded-lg text-xs font-bold ${countersignedAssessor === "yes" ? "bg-[#a31d38] text-white" : "bg-gray-100 text-gray-700"}`}>Yes</button>
            <button type="button" onClick={() => setCountersignedAssessor("no")} className={`px-3 py-1 rounded-lg text-xs font-bold ${countersignedAssessor === "no" ? "bg-[#a31d38] text-white" : "bg-gray-100 text-gray-700"}`}>No</button>
          </div>
        </div>
      </div>

      {/* IV Detailed Summary */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">IV Detailed Summary & Assessor Feedback</h4>
        <textarea rows={4} placeholder="Type here" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none" />
      </div>

      {/* Agreed Action Plan */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Agreed Action Plan & Deadlines:</h4>
          <button type="button" className="h-8 px-3.5 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs cursor-pointer">
            <FiPlus className="w-3.5 h-3.5" />
            <span>Add Action</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-160">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 font-bold text-[11px]">
                <th className="py-2.5 px-2">Action Required</th>
                <th className="py-2.5 px-2">By Who</th>
                <th className="py-2.5 px-2">Timeline</th>
                <th className="py-2.5 px-2">Achieved</th>
                <th className="py-2.5 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {actions.map((act) => (
                <tr key={act.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-2 text-xs font-medium text-neutral-primary">{act.actionRequired}</td>
                  <td className="py-3 px-2 text-xs text-gray-600">{act.byWho}</td>
                  <td className="py-3 px-2 text-xs text-gray-600">{act.timeline}</td>
                  <td className="py-3 px-2 text-xs font-bold capitalize">{act.achieved}</td>
                  <td className="py-3 px-2 text-right">
                    <button type="button" onClick={() => setActions(actions.filter((a) => a.id !== act.id))} className="text-rose-500 hover:text-rose-700 p-1">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation of Identified Action */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Confirmation of Identified Action Being Achieved:</h4>
        <textarea rows={3} placeholder="Type here" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none" />
      </div>

      {/* IV Signature */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">IV Signature & Date</h4>
        <IqamSignatureBlock label="IV Signature" readOnly />
      </div>
    </div>
  );
};
