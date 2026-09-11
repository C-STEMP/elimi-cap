"use client";

import React from "react";
import { FiVideo, FiMapPin } from "react-icons/fi";
import type { InterviewRowData } from "./ViewInterviewDetailModal";

interface Props {
  filteredInterviews: InterviewRowData[];
  isLoadingInterviews: boolean;
  viewMode: "list" | "grid";
  selectedInterviewIds: string[];
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onSelectInterview?: (item: InterviewRowData) => void;
  onSetViewing: (item: InterviewRowData) => void;
}

export const InterviewListTable: React.FC<Props> = ({
  filteredInterviews, isLoadingInterviews, viewMode,
  selectedInterviewIds, onToggleSelectAll, onToggleSelect,
  onSelectInterview, onSetViewing,
}) => {
  const handleView = (item: InterviewRowData) =>
    onSelectInterview ? onSelectInterview(item) : onSetViewing(item);

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoadingInterviews
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs flex flex-col gap-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-100 rounded w-36" />
              </div>
            ))
          : filteredInterviews.length > 0
          ? filteredInterviews.map((item) => (
              <div
                key={item.id}
                onClick={() => handleView(item)}
                className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-3 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <input
                    type="checkbox"
                    checked={selectedInterviewIds.includes(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => onToggleSelect(item.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#a31d38] cursor-pointer"
                  />
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{item.mode}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-sm text-black group-hover:text-primary transition-colors">{item.title}</span>
                  <span className="text-xs text-gray-500">Lead: {item.leadPanelist}</span>
                  <span className="text-xs text-gray-500">Member: {item.panelMember}</span>
                  <span className="text-xs text-gray-500">IV: {item.internalVerifier}</span>
                  <span className="text-xs text-gray-400">Created: {item.createdAt}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleView(item);
                  }}
                  className="text-xs text-black font-bold underline hover:text-[#a31d38] cursor-pointer mt-auto self-start"
                >
                  View
                </button>
              </div>
            ))
          : <div className="col-span-full p-8 text-center text-gray-400">No interviews found.</div>}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto no-scrollbar border border-gray-100 rounded-2xl">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-[#F8F9FA] text-gray-600 font-bold border-b border-gray-100 whitespace-nowrap">
          <tr>
            <th className="p-4 w-10"><input type="checkbox" checked={filteredInterviews.length > 0 && selectedInterviewIds.length === filteredInterviews.length} onChange={onToggleSelectAll} className="w-4 h-4 accent-primary rounded cursor-pointer" /></th>
            {["Title","Lead Panelist","Panel Member","Internal Verifier","Interview Mode","Created At","Action"].map((h) => <th key={h} className="p-4 whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoadingInterviews
            ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 8 }).map((__, j) => <td key={j} className="p-4"><div className="h-3.5 bg-gray-200 rounded w-24" /></td>)}
                </tr>
              ))
            : filteredInterviews.length > 0
            ? filteredInterviews.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleView(item)}
                  className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedInterviewIds.includes(item.id)}
                      onChange={() => onToggleSelect(item.id)}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                  </td>
                  <td className="p-4 font-semibold text-black group-hover:text-primary transition-colors">{item.title}</td>
                  <td className="p-4 text-gray-600">{item.leadPanelist}</td>
                  <td className="p-4 text-gray-600">{item.panelMember}</td>
                  <td className="p-4 text-gray-600">{item.internalVerifier}</td>
                  <td className="p-4 text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      {item.mode.toLowerCase() === "online" ? <FiVideo className="w-3.5 h-3.5 text-[#A31D38]" /> : <FiMapPin className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>{item.mode}</span>
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{item.createdAt}</td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(item);
                      }}
                      className="font-semibold text-black underline underline-offset-2 hover:text-primary cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            : <tr><td colSpan={8} className="p-8 text-center text-gray-400">No interviews found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};
