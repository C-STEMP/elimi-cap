import React from "react";
import { Avatar } from "@/src/components/ui/avatar";
import { getStatusBadgeClass } from "../utils/appViewHelpers";

interface AppRow {
  id: string;
  candidateName: string;
  photoUrl?: string | null;
  centreName?: string;
  facilitatorName?: string;
  assessorName?: string;
  internalVerifierName?: string;
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
  filteredApplications,
  isLoading,
  viewMode,
  selectedIds,
  onToggleSelectAll,
  onToggleSelect,
  onSelectCandidate,
}) => {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs flex flex-col gap-3 animate-pulse"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded mt-1" />
                  <div className="h-5 bg-gray-200 rounded-full w-20" />
                </div>
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-3 bg-gray-100 rounded w-28" />
                  ))}
                </div>
              </div>
            ))
          : filteredApplications.length > 0
          ? filteredApplications.map((app) => (
              <div
                key={app.id}
                onClick={() => onSelectCandidate(app.candidateName, app.id)}
                className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-3 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(app.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => onToggleSelect(app.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#a31d38] cursor-pointer shrink-0"
                    />
                    <Avatar
                      src={app.photoUrl}
                      name={app.candidateName}
                      className="w-10 h-10 rounded-full border border-gray-100 shrink-0"
                    />
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadgeClass(
                      app.status,
                    )}`}
                  >
                    {app.status}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-sm text-black group-hover:text-primary transition-colors">
                    {app.candidateName}
                  </span>
                  <span className="text-xs text-gray-500">
                    Assessor: {app.assessorName && app.assessorName !== "—" ? app.assessorName : "-"}
                  </span>
                  <span className="text-xs text-gray-500">
                    Internal Verifier: {app.internalVerifierName && app.internalVerifierName !== "—" ? app.internalVerifierName : "-"}
                  </span>
                  <span className="text-xs text-gray-500">Trade: {app.trade}</span>
                  <span className="text-xs text-gray-500">
                    Type: {app.assessmentType}
                  </span>
                  <span className="text-xs text-gray-400">
                    Submitted: {app.submittedAt}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCandidate(app.candidateName, app.id);
                  }}
                  className="text-xs text-black font-bold underline hover:text-[#a31d38] cursor-pointer mt-auto self-start"
                >
                  View
                </button>
              </div>
            ))
          : (
            <div className="col-span-full p-8 text-center text-gray-400">
              No applications found.
            </div>
          )}
      </div>
    );
  }

  const tableHeaders = [
    "Candidate Name",
    "Assessor",
    "Internal Verifier",
    "Trade",
    "Assessment Type",
    "Status",
    "Submitted at",
    "Action",
  ];

  return (
    <div className="overflow-x-auto no-scrollbar border border-gray-100 rounded-2xl bg-white">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-[#F8F9FA] text-gray-600 font-bold border-b border-gray-100 whitespace-nowrap">
          <tr>
            <th className="p-4 w-10">
              <input
                type="checkbox"
                checked={
                  filteredApplications.length > 0 &&
                  selectedIds.length === filteredApplications.length
                }
                onChange={onToggleSelectAll}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </th>
            {tableHeaders.map((h) => (
              <th key={h} className="p-4 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 9 }).map((__, j) => (
                    <td key={j} className="p-4">
                      <div className="h-3.5 bg-gray-200 rounded w-24" />
                    </td>
                  ))}
                </tr>
              ))
            : filteredApplications.length > 0
            ? filteredApplications.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => onSelectCandidate(app.candidateName, app.id)}
                  className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(app.id)}
                      onChange={() => onToggleSelect(app.id)}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                  </td>
                  <td className="p-4 font-semibold text-black group-hover:text-primary transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        src={app.photoUrl}
                        name={app.candidateName}
                        className="w-8 h-8 rounded-full border border-gray-100 shrink-0"
                      />
                      <span className="truncate">{app.candidateName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">
                    {app.assessorName && app.assessorName !== "—"
                      ? app.assessorName
                      : "-"}
                  </td>
                  <td className="p-4 text-gray-600">
                    {app.internalVerifierName && app.internalVerifierName !== "—"
                      ? app.internalVerifierName
                      : "-"}
                  </td>
                  <td className="p-4 text-gray-600">
                    {app.trade && app.trade !== "—" ? app.trade : "-"}
                  </td>
                  <td className="p-4 text-gray-600">{app.assessmentType}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadgeClass(
                        app.status,
                      )}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{app.submittedAt}</td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCandidate(app.candidateName, app.id);
                      }}
                      className="font-semibold text-black underline underline-offset-2 hover:text-primary cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            : (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400">
                  No applications found.
                </td>
              </tr>
            )}
        </tbody>
      </table>
    </div>
  );
};
