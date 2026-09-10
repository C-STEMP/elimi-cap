"use client";

import React, { useState, useEffect } from "react";
import { FiCalendar, FiChevronDown } from "react-icons/fi";
import type { SamplingPlanItem } from "../../types/iqam.types";

interface SamplingPlanViewProps {
  onBack: () => void;
  onSubmit?: () => void;
  onUpdateHeader?: (config: {
    title: string;
    breadcrumb: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null) => void;
}

const INITIAL_ROWS: SamplingPlanItem[] = [
  { id: "1", assessorName: "Adegbogunmi Samson", candidateName: "Samson David", termType: "Interim", plannedDate: "", units: {} },
  { id: "2", assessorName: "Adegbogunmi Samson", candidateName: "Oguntade James", termType: "Formative", plannedDate: "", units: {} },
  { id: "3", assessorName: "Adegbogunmi Samson", candidateName: "Favour Smith", termType: "Summative", plannedDate: "", units: {} },
  { id: "4", assessorName: "Adegbogunmi Samson", candidateName: "Samson David", termType: "Select", plannedDate: "", units: {} },
  { id: "5", assessorName: "Adegbogunmi Samson", candidateName: "Oriade Sophie", termType: "Select", plannedDate: "", units: {} },
];

export const SamplingPlanView: React.FC<SamplingPlanViewProps> = ({ onBack, onSubmit, onUpdateHeader }) => {
  const [rows, setRows] = useState<SamplingPlanItem[]>(INITIAL_ROWS);

  useEffect(() => {
    onUpdateHeader?.({
      title: "Internal Verification Sampling Plan",
      breadcrumb: "Internal Verification Sampling Plan",
      actionLabel: "Submit",
      onAction: onSubmit,
    });
  }, [onUpdateHeader, onSubmit]);

  const toggleUnit = (rowId: string, unitKey: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, units: { ...r.units, [unitKey]: !r.units[unitKey] } } : r
      )
    );
  };

  const updateTerm = (rowId: string, term: SamplingPlanItem["termType"]) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, termType: term } : r)));
  };

  const updateDate = (rowId: string, date: string) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, plannedDate: date } : r)));
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text pb-12 animate-fadeIn">

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">NAME OF CENTRE</span>
            <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary mt-1 truncate">CSTEMP TVET Centre</h4>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">VOCATIONAL AREA / SECTOR</span>
            <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary mt-1 truncate">Painting & Decorating</h4>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">QUALIFICATION LEVEL</span>
            <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary mt-1 truncate">NSQ Level 2</h4>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">ACADEMIC / DELIVERY YEAR</span>
            <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary mt-1 truncate">2026</h4>
          </div>
        </div>

        {/* Sampling Matrix Table */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">Assessment Tools</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-220">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 font-bold text-[11px]">
                  <th className="py-3 px-2">Name Of Assessor</th>
                  <th className="py-3 px-2">Candidate Name</th>
                  <th className="py-3 px-2">Term Type</th>
                  <th className="py-3 px-2">Planned Date</th>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <th key={num} className="py-3 px-2 text-center">Unit {num}</th>
                  ))}
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors font-medium text-neutral-primary">
                    <td className="py-3.5 px-2 text-xs">{row.assessorName}</td>
                    <td className="py-3.5 px-2 text-xs">{row.candidateName}</td>
                    <td className="py-3.5 px-2">
                      <div className="relative w-28">
                        <select
                          value={row.termType}
                          onChange={(e) => updateTerm(row.id, e.target.value as any)}
                          className="w-full h-8 px-2.5 pr-6 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-gray-700 font-medium appearance-none focus:outline-none focus:border-[#a31d38]"
                        >
                          <option value="Select">Select</option>
                          <option value="Interim">Interim</option>
                          <option value="Formative">Formative</option>
                          <option value="Summative">Summative</option>
                        </select>
                        <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                      </div>
                    </td>
                    <td className="py-3.5 px-2">
                      <div className="h-8 w-32 px-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-[11px] text-gray-700 focus-within:bg-white focus-within:border-[#a31d38]">
                        <input
                          type="text"
                          placeholder="DD/MM/YYYY"
                          value={row.plannedDate}
                          onChange={(e) => updateDate(row.id, e.target.value)}
                          className="w-full bg-transparent outline-none text-[11px] placeholder:text-gray-400"
                        />
                        <FiCalendar className="w-3 h-3 text-gray-400 shrink-0 ml-1" />
                      </div>
                    </td>
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                      const uKey = `Unit ${num}`;
                      return (
                        <td key={num} className="py-3.5 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={Boolean(row.units[uKey])}
                            onChange={() => toggleUnit(row.id, uKey)}
                            className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-[#a31d38] cursor-pointer"
                          />
                        </td>
                      );
                    })}
                    <td className="py-3.5 px-2 text-right">
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
