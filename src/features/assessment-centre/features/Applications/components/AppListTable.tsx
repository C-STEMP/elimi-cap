"use client";

import React from "react";
import { getStatusBadgeClass } from "../utils/appViewHelpers";

interface AppRow {
  id: string;
  candidateName: string;
  centreName: string;
  facilitatorName: string;
  trade: string;
  assessmentType: string;
  status: string;
  submittedAt: string;
}

interface Props {
  filteredApplications: AppRow[];
  isLoading: boolean;
  viewMode: "list" | "grid";
  selectedIds: string[];
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onSelectCandidate: (name: string, id?: string) => void;
}

export const AppListTable: React.FC<Props> = ({
  filteredApplications, isLoading, viewMode, selectedIds,
  onToggleSelectAll, onToggleSelect, onSelectCandidate,
}) => {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs flex flex-col gap-3 animate-pulse">
                <div className="flex items-start justify-between gap-3"><div className="w-4 h-4 bg-gray-200 rounded mt-1" /><div className="h-5 bg-gray-200 rounded-full w-20" /></div>
                <div className="flex flex-col gap-2">{Array.from({length:4}).map((_,j)=><div key={j} className="h-3 bg-gray-100 rounded w-28"/>)}</div>
              </div>
            ))
          : filteredApplications.length > 0
          ? filteredApplications.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <input type="checkbox" checked={selectedIds.includes(app.id)} onChange={() => onToggleSelect(app.id)} className="mt-1 w-4 h-4 rounded border-gray-300 text-[#a31d38] cursor-pointer" />
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadgeClass(app.status)}`}>{app.status}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span onClick={() => onSelectCandidate(app.candidateName, app.id)} className="font-bold text-sm text-black cursor-pointer hover:text-primary">{app.candidateName}</span>
                  <span className="text-xs text-gray-500">Centre: {app.centreName}</span>
                  <span className="text-xs text-gray-500">Facilitator: {app.facilitatorName}</span>
                  <span className="text-xs text-gray-500">Trade: {app.trade}</span>
                  <span className="text-xs text-gray-500">Type: {app.assessmentType}</span>
                  <span className="text-xs text-gray-400">Submitted: {app.submittedAt}</span>
                </div>
                <button type="button" onClick={() => onSelectCandidate(app.candidateName, app.id)} className="text-xs text-black font-bold underline hover:text-[#a31d38] cursor-pointer mt-auto self-start">View</button>
              </div>
            ))
          : <div className="col-span-full p-8 text-center text-gray-400">No applications found.</div>}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto no-scrollbar border border-gray-100 rounded-2xl">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-[#F8F9FA] text-gray-600 font-bold border-b border-gray-100 whitespace-nowrap">
          <tr>
            <th className="p-4 w-10"><input type="checkbox" checked={filteredApplications.length > 0 && selectedIds.length === filteredApplications.length} onChange={onToggleSelectAll} className="w-4 h-4 accent-primary rounded cursor-pointer" /></th>
            {["Candidate Name","Centre Name","Facilitator","Trade","Assessment Type","Status","Submitted at","Action"].map((h) => <th key={h} className="p-4 whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({length:9}).map((__,j)=><td key={j} className="p-4"><div className="h-3.5 bg-gray-200 rounded w-24"/></td>)}
                </tr>
              ))
            : filteredApplications.length > 0
            ? filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-4"><input type="checkbox" checked={selectedIds.includes(app.id)} onChange={() => onToggleSelect(app.id)} className="w-4 h-4 accent-primary rounded cursor-pointer" /></td>
                  <td onClick={() => onSelectCandidate(app.candidateName, app.id)} className="p-4 font-semibold text-black cursor-pointer hover:text-primary">{app.candidateName}</td>
                  <td className="p-4 text-gray-600">{app.centreName}</td>
                  <td className="p-4 text-gray-600">{app.facilitatorName}</td>
                  <td className="p-4 text-gray-600">{app.trade}</td>
                  <td className="p-4 text-gray-600">{app.assessmentType}</td>
                  <td className="p-4"><span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadgeClass(app.status)}`}>{app.status}</span></td>
                  <td className="p-4 text-gray-600">{app.submittedAt}</td>
                  <td className="p-4 text-right"><button type="button" onClick={() => onSelectCandidate(app.candidateName, app.id)} className="font-semibold text-black underline underline-offset-2 hover:text-primary cursor-pointer">View</button></td>
                </tr>
              ))
            : <tr><td colSpan={9} className="p-8 text-center text-gray-400">No applications found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};
