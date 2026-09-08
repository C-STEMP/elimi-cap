"use client";

import React, { useState } from "react";
import { IqamHeaderBanner } from "../common/IqamHeaderBanner";
import { FiCalendar, FiPlus } from "react-icons/fi";
import type { SamplingRecordItem } from "../../types/iqam.types";

interface SamplingRecordViewProps {
  onBack: () => void;
  onSubmit?: () => void;
}

const INITIAL_LOGS: SamplingRecordItem[] = [
  { id: "1", assessorName: "Adegbogunmi Samson", status: "Q", assessmentSite: "3 Abbey Street, Kubwa Expressway", candidateName: "Samson David", unitsAssessed: "UNIT 1/UNIT 2/UNIT 3", process: "P/R/F/FC", method: "QA/DO/WP/PS" },
  { id: "2", assessorName: "Adegbogunmi Samson", status: "NQ", assessmentSite: "3 Abbey Street, Kubwa Expressway", candidateName: "Samson David", unitsAssessed: "UNIT 1/UNIT 2/UNIT 3", process: "P/R/F/FC", method: "QA/DO/WP/PS" },
  { id: "3", assessorName: "Adegbogunmi Samson", status: "NSQ", assessmentSite: "3 Abbey Street, Kubwa Expressway", candidateName: "Samson David", unitsAssessed: "UNIT 1/UNIT 2/UNIT 3", process: "P/R/F/FC", method: "QA/DO/WP/PS/WT" },
  { id: "4", assessorName: "Adegbogunmi Samson", status: "NS", assessmentSite: "3 Abbey Street, Kubwa Expressway", candidateName: "Samson David", unitsAssessed: "UNIT 1/UNIT 2/UNIT 3", process: "P/R/F/FC", method: "QA/DO/WP/PS/PCS" },
  { id: "5", assessorName: "Adegbogunmi Samson", status: "NSNQ", assessmentSite: "3 Abbey Street, Kubwa Expressway", candidateName: "Samson David", unitsAssessed: "UNIT 1/UNIT 2/UNIT 3", process: "P/R/F/FC", method: "QA/DO/WP/PS" },
];

export const SamplingRecordView: React.FC<SamplingRecordViewProps> = ({ onBack, onSubmit }) => {
  const [logs] = useState<SamplingRecordItem[]>(INITIAL_LOGS);

  return (
    <div className="w-full flex flex-col gap-6 select-text pb-12 animate-fadeIn">
      <IqamHeaderBanner
        title="Internal Verification Sampling Record"
        breadcrumbChild="Internal Verification Sampling Record"
        onBack={onBack}
        actionButtonLabel="Submit"
        onActionClick={onSubmit}
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Subheader Banner */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5">
          <span className="text-[10px] font-bold text-gray-500 uppercase">CON/03/IQAM</span>
          <h4 className="text-sm sm:text-base font-extrabold text-neutral-primary mt-0.5">
            Internal Verification Sampling Record
          </h4>
        </div>

        {/* Input Fields */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-primary">
              For period<span className="text-rose-500">*</span>
            </label>
            <div className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs text-neutral-primary">
              <input type="text" placeholder="Select" className="w-full bg-transparent outline-none" />
              <FiCalendar className="w-4 h-4 text-gray-400 shrink-0 ml-1.5" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-primary">
              Qualification<span className="text-rose-500">*</span>
            </label>
            <input type="text" placeholder="Type here" className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-primary">
              Name of Internal Verifier<span className="text-rose-500">*</span>
            </label>
            <input type="text" placeholder="Type here" className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-primary">
              Name of countersigning IV (if appropriate)<span className="text-rose-500">*</span>
            </label>
            <input type="text" placeholder="Type here" className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none" />
          </div>
        </div>

        {/* Internal Verification Audit Log */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">
              Internal Verification Audit Log
            </h3>
            <button
              type="button"
              className="h-9 px-4 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span>Add Log</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-220">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 font-bold text-[11px]">
                  <th className="py-3 px-2.5">Name Of Assessor</th>
                  <th className="py-3 px-2.5">Status</th>
                  <th className="py-3 px-2.5">Assessment Site</th>
                  <th className="py-3 px-2.5">Candidate Name</th>
                  <th className="py-3 px-2.5">Units Assessed</th>
                  <th className="py-3 px-2.5">Process</th>
                  <th className="py-3 px-2.5">Method</th>
                  <th className="py-3 px-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-neutral-primary">
                {logs.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-2.5 text-xs">{row.assessorName}</td>
                    <td className="py-3.5 px-2.5">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-bold text-[10px] rounded-md">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2.5 text-gray-600 text-xs">{row.assessmentSite}</td>
                    <td className="py-3.5 px-2.5 text-xs">{row.candidateName}</td>
                    <td className="py-3.5 px-2.5 text-gray-600 text-xs">{row.unitsAssessed}</td>
                    <td className="py-3.5 px-2.5 text-gray-600 text-xs">{row.process}</td>
                    <td className="py-3.5 px-2.5 text-gray-600 text-xs">{row.method}</td>
                    <td className="py-3.5 px-2.5 text-right">
                      <span className="text-xs font-bold text-gray-600 hover:text-[#a31d38] underline transition-colors cursor-pointer">
                        View
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
