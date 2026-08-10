"use client";

import React, { useState } from "react";
import { FiChevronRight, FiClipboard, FiPlus } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";

export interface OverviewApplicationItem {
  id: string;
  candidateName: string;
  trade: string;
  role: string;
  assessmentType: string;
  status: "Pending" | "Completed" | "In Review";
  assignedAt: string;
}

const INITIAL_APPLICATIONS: OverviewApplicationItem[] = [
  {
    id: "1",
    candidateName: "Oguntade James",
    trade: "Masonry",
    role: "Facilitator",
    assessmentType: "RPL",
    status: "Pending",
    assignedAt: "07/22/2026",
  },
  {
    id: "2",
    candidateName: "Favour Smith",
    trade: "Carpentry",
    role: "Panelist",
    assessmentType: "RPL",
    status: "Pending",
    assignedAt: "07/22/2026",
  },
  {
    id: "3",
    candidateName: "Samson David",
    trade: "Plumbing",
    role: "Assessor",
    assessmentType: "NSQ",
    status: "Pending",
    assignedAt: "07/22/2026",
  },
  {
    id: "4",
    candidateName: "Samson David",
    trade: "Plumbing",
    role: "Assessor",
    assessmentType: "NSQ",
    status: "Pending",
    assignedAt: "07/22/2026",
  },
  {
    id: "5",
    candidateName: "Samson David",
    trade: "Plumbing",
    role: "Assessor",
    assessmentType: "NSQ",
    status: "Pending",
    assignedAt: "07/22/2026",
  },
  {
    id: "6",
    candidateName: "Samson David",
    trade: "Plumbing",
    role: "Assessor",
    assessmentType: "NSQ",
    status: "Pending",
    assignedAt: "07/22/2026",
  },
  {
    id: "7",
    candidateName: "Samson David",
    trade: "Plumbing",
    role: "Assessor",
    assessmentType: "NSQ",
    status: "Pending",
    assignedAt: "07/22/2026",
  },
  {
    id: "8",
    candidateName: "Oriade Sophie",
    trade: "Painting",
    role: "Assessor",
    assessmentType: "NSQ",
    status: "Pending",
    assignedAt: "07/22/2026",
  },
];

interface AssessorOverviewViewProps {
  onViewAllApplications: () => void;
  onSelectApplication: (app: OverviewApplicationItem) => void;
  onApplyToCentre: () => void;
}

export const AssessorOverviewView: React.FC<AssessorOverviewViewProps> = ({
  onViewAllApplications,
  onSelectApplication,
  onApplyToCentre,
}) => {
  const [applications] = useState<OverviewApplicationItem[]>(INITIAL_APPLICATIONS);

  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col min-h-[420px] select-text">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <h2 className="text-lg font-bold text-neutral-primary">
          Pending Applications
        </h2>
        <button
          type="button"
          onClick={onViewAllApplications}
          className="text-xs font-semibold text-[#a31d38] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View All</span>
          <FiChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {applications.length > 0 ? (
        <div className="w-full overflow-x-auto max-w-full rounded-2xl border border-gray-100">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-gray-50/70 text-gray-500 font-semibold border-b border-gray-100">
                <th className="p-3.5 rounded-l-xl">Candidate Name</th>
                <th className="p-3.5">Trade</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Assessment Type</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Assigned at</th>
                <th className="p-3.5 rounded-r-xl text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  <td className="p-3.5 font-medium text-neutral-primary">
                    {app.candidateName}
                  </td>
                  <td className="p-3.5 text-gray-600">{app.trade}</td>
                  <td className="p-3.5 text-gray-600">{app.role}</td>
                  <td className="p-3.5 text-gray-600">{app.assessmentType}</td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706]">
                      {app.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-gray-500">{app.assignedAt}</td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectApplication(app)}
                      className="font-bold text-xs text-neutral-primary hover:text-primary-solid underline cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="my-auto flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FDF2F4] text-[#a31d38] flex items-center justify-center mb-3">
            <FiClipboard className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
            No applications yet
          </h3>
          <p className="text-xs sm:text-sm text-neutral-secondary mt-1 mb-6">
            Applications assigned to you will appear here
          </p>

          <Button
            variant="amber"
            size="md"
            rightIcon={<FiPlus className="w-4 h-4" />}
            onClick={onApplyToCentre}
            className="px-6 h-11 font-bold text-sm rounded-xl shadow-md cursor-pointer"
          >
            Apply To Centre
          </Button>
        </div>
      )}
    </div>
  );
};
