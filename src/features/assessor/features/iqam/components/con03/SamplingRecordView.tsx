"use client";

import React, { useState, useEffect } from "react";
import { FiCalendar, FiPlus } from "react-icons/fi";
import type { SamplingRecordItem } from "../../types/iqam.types";

interface SamplingRecordViewProps {
  onBack: () => void;
  onSubmit?: () => void;
  onUpdateHeader?: (config: {
    title: string;
    breadcrumb: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null) => void;
}

const INITIAL_LOGS: SamplingRecordItem[] = [
  { id: "1", assessorName: "Adegbogunmi Samson", status: "Q", assessmentSite: "3 Abbey Street, Kubwa Expressway", candidateName: "Samson David", unitsAssessed: "UNIT 1/UNIT 2/UNIT 3", process: "P/R/F/FC", method: "QA/DO/WP/PS" },
  { id: "2", assessorName: "Adegbogunmi Samson", status: "NQ", assessmentSite: "3 Abbey Street, Kubwa Expressway", candidateName: "Samson David", unitsAssessed: "UNIT 1/UNIT 2/UNIT 3", process: "P/R/F/FC", method: "QA/DO/WP/PS" },
  { id: "3", assessorName: "Adegbogunmi Samson", status: "NSQ", assessmentSite: "3 Abbey Street, Kubwa Expressway", candidateName: "Samson David", unitsAssessed: "UNIT 1/UNIT 2/UNIT 3", process: "P/R/F/FC", method: "QA/DO/WP/PS/WT" },
  { id: "4", assessorName: "Adegbogunmi Samson", status: "NS", assessmentSite: "3 Abbey Street, Kubwa Expressway", candidateName: "Samson David", unitsAssessed: "UNIT 1/UNIT 2/UNIT 3", process: "P/R/F/FC", method: "QA/DO/WP/PS/PCS" },
  { id: "5", assessorName: "Adegbogunmi Samson", status: "NSNQ", assessmentSite: "3 Abbey Street, Kubwa Expressway", candidateName: "Samson David", unitsAssessed: "UNIT 1/UNIT 2/UNIT 3", process: "P/R/F/FC", method: "QA/DO/WP/PS" },
];

export const SamplingRecordView: React.FC<SamplingRecordViewProps> = ({ onBack, onSubmit, onUpdateHeader }) => {
  const [logs] = useState<SamplingRecordItem[]>(INITIAL_LOGS);

  useEffect(() => {
    onUpdateHeader?.({
      title: "Internal Verification Sampling Record",
      breadcrumb: "Internal Verification Sampling Record",
      actionLabel: "Submit",
      onAction: onSubmit,
    });
  }, [onUpdateHeader, onSubmit]);

  return (
    <div className="w-full flex flex-col gap-6 select-text pb-12 animate-fadeIn">

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Subheader Banner */}
        <div className="bg-white border border-gray-100/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">CON/03/IQAM</span>
          <h4 className="text-base sm:text-lg font-black text-neutral-primary">
            Internal Verification Sampling Record
          </h4>
        </div>

        {/* 4 Metadata Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">FOR PERIOD</span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1">12/07/2027</h4>
          </div>

          <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">QUALIFICATION</span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">Masonry Level 2</h4>
          </div>

          <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">INTERNAL VERIFIER</span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">Ogunsakin Jacob</h4>
          </div>

          <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">NAME OF COUNTERSIGNING IV</span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1">-</h4>
          </div>
        </div>

        {/* Internal Verification Audit Log */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">
            Internal Verification Audit Log
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-220">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 font-bold text-[11px]">
                  <th className="py-3 px-2.5">Name Of Assessor</th>
                  <th className="py-3 px-2.5">Assessment Site</th>
                  <th className="py-3 px-2.5">Candidate Name</th>
                  <th className="py-3 px-2.5">Units Assessed</th>
                  <th className="py-3 px-2.5">Status</th>
                  <th className="py-3 px-2.5">Process</th>
                  <th className="py-3 px-2.5">Method</th>
                  <th className="py-3 px-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-neutral-primary">
                {logs.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-2.5 text-xs font-semibold text-neutral-primary">{row.assessorName}</td>
                    <td className="py-4 px-2.5 text-gray-600 text-xs">{row.assessmentSite}</td>
                    <td className="py-4 px-2.5 text-xs font-semibold text-neutral-primary">{row.candidateName}</td>
                    <td className="py-4 px-2.5 text-gray-600 text-xs">{row.unitsAssessed}</td>
                    <td className="py-4 px-2.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f8f9fa] border border-gray-200 rounded-lg text-xs font-semibold text-neutral-primary cursor-pointer hover:bg-gray-100">
                        <span>{row.status}</span>
                        <span className="text-gray-400 text-[10px]">▼</span>
                      </div>
                    </td>
                    <td className="py-4 px-2.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f8f9fa] border border-gray-200 rounded-lg text-xs font-semibold text-neutral-primary cursor-pointer hover:bg-gray-100">
                        <span>{row.process}</span>
                        <span className="text-gray-400 text-[10px]">▼</span>
                      </div>
                    </td>
                    <td className="py-4 px-2.5 text-gray-600 text-xs">{row.method}</td>
                    <td className="py-4 px-2.5 text-right">
                      <span className="text-xs font-bold text-gray-700 hover:text-[#900B27] cursor-pointer transition-colors">
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
