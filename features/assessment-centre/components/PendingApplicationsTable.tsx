"use client";

import React from "react";
import { FiChevronRight } from "react-icons/fi";
import { MOCK_PENDING_APPLICATIONS } from "../utils/constants";

interface TableProps {
  onViewAll?: () => void;
  onViewApplication?: (id: string) => void;
}

export const PendingApplicationsTable: React.FC<TableProps> = ({
  onViewAll,
  onViewApplication,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-bold text-neutral-primary tracking-tight">
          Pending Applications
        </h3>

        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-bold text-[#a31d38] hover:underline cursor-pointer"
        >
          <span>View All</span>
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Responsive Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#F8F9FA] text-gray-500 text-xs font-semibold uppercase tracking-wider rounded-xl">
              <th className="p-3.5 rounded-l-xl">Candidate Name</th>
              <th className="p-3.5">Trade</th>
              <th className="p-3.5">Assessment Type</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Submitted at</th>
              <th className="p-3.5 text-right rounded-r-xl">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium text-neutral-primary">
            {MOCK_PENDING_APPLICATIONS.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-3.5 font-bold text-neutral-primary">
                  {app.candidateName}
                </td>
                <td className="p-3.5 text-neutral-secondary">{app.trade}</td>
                <td className="p-3.5 text-neutral-secondary">{app.assessmentType}</td>
                <td className="p-3.5">
                  <span className="bg-[#FEF3C7] text-[#D97706] font-semibold px-3 py-1 rounded-full text-xs inline-block">
                    {app.status}
                  </span>
                </td>
                <td className="p-3.5 text-neutral-secondary">{app.submittedAt}</td>
                <td className="p-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onViewApplication?.(app.id)}
                    className="text-neutral-primary font-bold text-xs underline hover:text-[#a31d38] transition-colors cursor-pointer"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
