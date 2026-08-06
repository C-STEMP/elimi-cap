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
        <h3 className="text-lg font-medium text-black tracking-tight">
          Pending Applications
        </h3>

        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs lg:text-base font-medium text-primary hover:underline cursor-pointer"
        >
          <span>View All</span>
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Responsive Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-150">
          <thead>
            <tr className="bg-input-bg text-black text-xs lg:text-base tracking-wider rounded-xl whitespace-nowrap">
              <th className="p-3.5 rounded-l-xl whitespace-nowrap">
                Candidate Name
              </th>
              <th className="p-3.5 whitespace-nowrap">Trade</th>
              <th className="p-3.5 whitespace-nowrap">Assessment Type</th>
              <th className="p-3.5 whitespace-nowrap">Status</th>
              <th className="p-3.5 whitespace-nowrap">Submitted at</th>
              <th className="p-3.5 text-right rounded-r-xl whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium">
            {MOCK_PENDING_APPLICATIONS.map((app) => (
              <tr
                key={app.id}
                className="hover:bg-input-bg transition-colors border-4 border-input-bg"
              >
                <td className="p-3.5 text-[#12312B]">{app.candidateName}</td>
                <td className="p-3.5 text-[#12312B]">{app.trade}</td>
                <td className="p-3.5 text-[#12312B]">{app.assessmentType}</td>
                <td className="p-3.5">
                  <span className="bg-secondary/20 text-secondary font-semibold px-3 py-1 rounded-full text-xs inline-block">
                    {app.status}
                  </span>
                </td>
                <td className="p-3.5 text-[#12312B]">{app.submittedAt}</td>
                <td className="p-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onViewApplication?.(app.id)}
                    className="text-[#12312B] text-sm underline hover:text-[#a31d38] transition-colors cursor-pointer"
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
