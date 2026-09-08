"use client";

import React, { useState } from "react";
import { IqamHeaderBanner } from "../common/IqamHeaderBanner";
import { CompleteCandidateModal } from "../common/CompleteCandidateModal";
import type { CandidateAllocationItem } from "../../types/iqam.types";

interface IqaAllocationViewProps {
  onBack: () => void;
  onOpenCandidateForm?: (candidateName: string) => void;
}

const DEFAULT_ALLOCATIONS: CandidateAllocationItem[] = [
  { id: "1", assessorName: "Adegbogunmi Samson", candidateName: "Samson David", level: "Level 1", units: "UNIT 1/UNIT 2/UNIT 3" },
  { id: "2", assessorName: "Adegbogunmi Samson", candidateName: "Oguntade James", level: "Level 3", units: "UNIT 1/UNIT 2/UNIT 3" },
  { id: "3", assessorName: "Adegbogunmi Samson", candidateName: "Favour Smith", level: "Level 4", units: "UNIT 1/UNIT 2/UNIT 3" },
  { id: "4", assessorName: "Adegbogunmi Samson", candidateName: "Samson David", level: "Level 2", units: "UNIT 1/UNIT 2/UNIT 3" },
  { id: "5", assessorName: "Adegbogunmi Samson", candidateName: "Oriade Sophie", level: "Level 1", units: "UNIT 1/UNIT 2/UNIT 3" },
];

export const IqaAllocationView: React.FC<IqaAllocationViewProps> = ({
  onBack,
  onOpenCandidateForm,
}) => {
  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState<string | null>(null);

  return (
    <div className="w-full flex flex-col gap-6 select-text pb-12 animate-fadeIn">
      <IqamHeaderBanner
        title="IQA Allocation Form of Candidates to Assessor"
        breadcrumbChild="IQA Allocation Form"
        onBack={onBack}
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
            <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
              NAME OF CENTRE
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-neutral-primary mt-1">
              CSTEMP TVET Centre
            </h4>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
            <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
              TOTAL NO. OF ASSIGNED CANDIDATE
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-neutral-primary mt-1">
              10
            </h4>
          </div>
        </div>

        {/* Assessment Tools Table */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">
            Assessment Tools
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-150">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 font-bold text-[11px]">
                  <th className="py-3 px-3">Name Of Assessor</th>
                  <th className="py-3 px-3">Candidate Name</th>
                  <th className="py-3 px-3">Level</th>
                  <th className="py-3 px-3">Units</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {DEFAULT_ALLOCATIONS.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors font-medium text-neutral-primary">
                    <td className="py-3.5 px-3">{row.assessorName}</td>
                    <td className="py-3.5 px-3">{row.candidateName}</td>
                    <td className="py-3.5 px-3 text-gray-600">{row.level}</td>
                    <td className="py-3.5 px-3 text-gray-600">{row.units}</td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCandidateForModal(row.candidateName)}
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
        </div>
      </div>

      <CompleteCandidateModal
        isOpen={Boolean(selectedCandidateForModal)}
        onClose={() => setSelectedCandidateForModal(null)}
        onComplete={(cand) => {
          setSelectedCandidateForModal(null);
          onOpenCandidateForm?.(cand);
        }}
      />
    </div>
  );
};
