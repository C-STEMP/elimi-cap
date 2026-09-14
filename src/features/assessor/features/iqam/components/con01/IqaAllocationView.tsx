"use client";

import React, { useEffect } from "react";
import { useGetIqamCentre, useGetIqamAllocations } from "../../hooks/useIqam";

interface IqaAllocationViewProps {
  centreId: string;
  onBack: () => void;
  onOpenCandidateForm?: (applicationId: string, candidateName: string) => void;
  onUpdateHeader?: (config: {
    title: string;
    breadcrumb: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null) => void;
}

export const IqaAllocationView: React.FC<IqaAllocationViewProps> = ({
  centreId,
  onBack,
  onOpenCandidateForm,
  onUpdateHeader,
}) => {
  const { data: centre } = useGetIqamCentre(centreId, { enabled: Boolean(centreId) });
  const { data: allocations = [], isLoading } = useGetIqamAllocations(centreId, {
    enabled: Boolean(centreId),
  });

  useEffect(() => {
    onUpdateHeader?.({
      title: "IQA Allocation Form of Candidates to Assessor",
      breadcrumb: "IQA Allocation Form",
    });
  }, [onUpdateHeader]);

  return (
    <div className="w-full flex flex-col gap-6 select-text pb-12 animate-fadeIn">

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
            <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
              NAME OF CENTRE
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-neutral-primary mt-1">
              {centre?.centreName || "—"}
            </h4>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
            <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
              TOTAL NO. OF ASSIGNED CANDIDATE
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-neutral-primary mt-1">
              {centre?.assignedCount ?? allocations.length}
            </h4>
          </div>
        </div>

        {/* Assessment Tools Table */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">
            Assessment Tools
          </h3>

          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-150">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-bold text-[11px]">
                    <th className="py-3 px-3">Candidate Name</th>
                    <th className="py-3 px-3">Unit Assessor (QAA)</th>
                    <th className="py-3 px-3">Level</th>
                    <th className="py-3 px-3">Units</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="py-3.5 px-3">
                          <div className="h-3 bg-gray-200 rounded w-20" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : allocations.length === 0 ? (
            <p className="text-xs text-gray-400 py-4">
              No in-progress NSQ candidates are currently allocated to you at this centre.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-150">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-bold text-[11px]">
                    <th className="py-3 px-3">Candidate Name</th>
                    <th className="py-3 px-3">Unit Assessor (QAA)</th>
                    <th className="py-3 px-3">Level</th>
                    <th className="py-3 px-3">Units</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allocations.map((row) => (
                    <tr
                      key={row.applicationId}
                      onClick={() => onOpenCandidateForm?.(row.applicationId, row.candidate.name)}
                      className="hover:bg-gray-50/50 transition-colors font-medium text-neutral-primary cursor-pointer group"
                    >
                      <td className="py-3.5 px-3 font-semibold group-hover:text-primary transition-colors">
                        {row.candidate.name}
                      </td>
                      <td className="py-3.5 px-3 text-gray-600">
                        {row.unitAssessor?.name || "Not yet assigned"}
                      </td>
                      <td className="py-3.5 px-3 text-gray-600">
                        {row.wishedQualificationLevel ? `Level ${row.wishedQualificationLevel.level}` : "—"}
                      </td>
                      <td className="py-3.5 px-3 text-gray-600">
                        {row.wishedUnits.length > 0
                          ? row.wishedUnits.map((u) => u.referenceNumber).join("/")
                          : "—"}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCandidateForm?.(row.applicationId, row.candidate.name);
                          }}
                          className="text-xs font-bold text-gray-600 hover:text-[#a31d38] underline transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
