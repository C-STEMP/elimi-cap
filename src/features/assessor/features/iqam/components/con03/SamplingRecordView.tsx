"use client";

import React, { useEffect } from "react";
import {
  useGetIqamSamplingRecord,
  usePatchIqamSamplingRecord,
  useSubmitIqamSamplingRecord,
} from "../../hooks/useIqam";

interface SamplingRecordViewProps {
  centreId: string;
  tradeId: string;
  qualificationLevelId: string;
  onBack: () => void;
  onUpdateHeader?: (config: {
    title: string;
    breadcrumb: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null) => void;
}

const AUDIT_STATUSES = ["Q", "NQ", "NSQ", "NS", "NSNQ"];
const PROCESSES = ["P", "R", "F", "FC"];

export const SamplingRecordView: React.FC<SamplingRecordViewProps> = ({
  centreId,
  tradeId,
  qualificationLevelId,
  onBack,
  onUpdateHeader,
}) => {
  const hasContext = Boolean(centreId && tradeId && qualificationLevelId);

  const { data: matrix, isLoading } = useGetIqamSamplingRecord(
    centreId,
    tradeId,
    qualificationLevelId,
    { enabled: hasContext },
  );
  const patchRow = usePatchIqamSamplingRecord(centreId, tradeId, qualificationLevelId);
  const submitRecord = useSubmitIqamSamplingRecord(centreId);

  const handleSubmit = () => {
    if (!hasContext) return;
    submitRecord.mutate({ tradeId, qualificationLevelId });
  };

  // Once every candidate row in this record has already been submitted,
  // there's nothing left to submit — don't offer the action again.
  const allSubmitted = Boolean(
    matrix?.data && matrix.data.length > 0 && matrix.data.every((r) => r.status === "submitted"),
  );

  useEffect(() => {
    onUpdateHeader?.({
      title: "Internal Verification Sampling Record",
      breadcrumb: "Internal Verification Sampling Record",
      actionLabel: allSubmitted ? undefined : "Submit",
      onAction: allSubmitted ? undefined : handleSubmit,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onUpdateHeader, hasContext, centreId, tradeId, qualificationLevelId, allSubmitted]);

  if (!hasContext) {
    return (
      <div className="w-full flex flex-col gap-6 select-text pb-12 animate-fadeIn">
        <div className="w-full max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2">
            <p className="text-sm font-bold text-neutral-primary">Select a candidate first</p>
            <p className="text-xs text-gray-400 max-w-xs">
              Open the IQA Allocation Form (CON/01) and pick a candidate — the sampling record for
              their trade and qualification level will load here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 select-text pb-12 animate-fadeIn">

      <div className="w-full max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Subheader Banner */}
        <div className="bg-white border border-gray-100/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">CON/03/IQAM</span>
          <h4 className="text-base sm:text-lg font-black text-neutral-primary">
            Internal Verification Sampling Record
          </h4>
        </div>

        {/* Metadata Cards Grid */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">CENTRE</span>
              <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">{matrix?.centre.name || "—"}</h4>
            </div>

            <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">QUALIFICATION</span>
              <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">
                {matrix ? `${matrix.trade.name} Level ${matrix.qualificationLevel.level}` : "—"}
              </h4>
            </div>

            <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">INTERNAL VERIFIER</span>
              <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">
                {matrix?.internalVerifier.name || "—"}
              </h4>
            </div>

            <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">EVIDENCE METHODS</span>
              <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">
                {matrix?.methods?.length ? matrix.methods.join("/") : "—"}
              </h4>
            </div>
          </div>
        </div>

        {/* Internal Verification Audit Log */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">
            Internal Verification Audit Log
          </h3>

          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-220">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-bold text-[11px]">
                    <th className="py-3 px-2.5">Candidate Name</th>
                    <th className="py-3 px-2.5">Unit Assessor</th>
                    <th className="py-3 px-2.5">Assessment Site</th>
                    <th className="py-3 px-2.5">Status</th>
                    <th className="py-3 px-2.5">Process</th>
                    <th className="py-3 px-2.5 text-right">Submission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="py-4 px-2.5">
                          <div className="h-3 bg-gray-200 rounded w-16" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !matrix || matrix.data.length === 0 ? (
            <p className="text-xs text-gray-400 py-4">No candidates found for this trade and level.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-220">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-bold text-[11px]">
                    <th className="py-3 px-2.5">Candidate Name</th>
                    <th className="py-3 px-2.5">Unit Assessor</th>
                    <th className="py-3 px-2.5">Assessment Site</th>
                    <th className="py-3 px-2.5">Status</th>
                    <th className="py-3 px-2.5">Process</th>
                    <th className="py-3 px-2.5 text-right">Submission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium text-neutral-primary">
                  {matrix.data.map((row) => (
                    <tr key={row.applicationId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-2.5 text-xs font-semibold text-neutral-primary">{row.candidate.name}</td>
                      <td className="py-4 px-2.5 text-gray-600 text-xs">{row.unitAssessor?.name || "—"}</td>
                      <td className="py-4 px-2.5 text-gray-600 text-xs">{row.assessmentSite || "—"}</td>
                      <td className="py-4 px-2.5">
                        <select
                          defaultValue={row.auditStatus || ""}
                          onChange={(e) =>
                            patchRow.mutate({
                              applicationId: row.applicationId,
                              payload: { auditStatus: e.target.value || null },
                            })
                          }
                          disabled={row.status === "submitted"}
                          className="h-8 px-2.5 pr-2 bg-[#f8f9fa] border border-gray-200 rounded-lg text-xs font-semibold text-neutral-primary appearance-none cursor-pointer disabled:opacity-60"
                        >
                          <option value="">—</option>
                          {AUDIT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-2.5">
                        <select
                          defaultValue={row.process || ""}
                          onChange={(e) =>
                            patchRow.mutate({
                              applicationId: row.applicationId,
                              payload: { process: e.target.value || null },
                            })
                          }
                          disabled={row.status === "submitted"}
                          className="h-8 px-2.5 pr-2 bg-[#f8f9fa] border border-gray-200 rounded-lg text-xs font-semibold text-neutral-primary appearance-none cursor-pointer disabled:opacity-60"
                        >
                          <option value="">—</option>
                          {PROCESSES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-2.5 text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            row.status === "submitted"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {row.status === "submitted" ? "Submitted" : "Draft"}
                        </span>
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
