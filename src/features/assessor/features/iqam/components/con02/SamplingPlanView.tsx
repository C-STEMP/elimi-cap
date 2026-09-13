"use client";

import React, { useEffect } from "react";
import { FiCalendar } from "react-icons/fi";
import {
  useGetIqamSamplingPlan,
  usePatchIqamSamplingPlan,
  usePutIqamSamplingPlanUnits,
  useSubmitIqamSamplingPlan,
} from "../../hooks/useIqam";

interface SamplingPlanViewProps {
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

const TERM_TYPES = ["interim", "formative", "summative"] as const;

export const SamplingPlanView: React.FC<SamplingPlanViewProps> = ({
  centreId,
  tradeId,
  qualificationLevelId,
  onBack,
  onUpdateHeader,
}) => {
  const hasContext = Boolean(centreId && tradeId && qualificationLevelId);

  const { data: matrix, isLoading } = useGetIqamSamplingPlan(centreId, tradeId, qualificationLevelId, {
    enabled: hasContext,
  });
  const patchRow = usePatchIqamSamplingPlan(centreId, tradeId, qualificationLevelId);
  const putUnits = usePutIqamSamplingPlanUnits(centreId, tradeId, qualificationLevelId);
  const submitPlan = useSubmitIqamSamplingPlan(centreId);

  const handleSubmit = () => {
    if (!hasContext) return;
    submitPlan.mutate({ tradeId, qualificationLevelId });
  };

  useEffect(() => {
    onUpdateHeader?.({
      title: "Internal Verification Sampling Plan",
      breadcrumb: "Internal Verification Sampling Plan",
      actionLabel: "Submit",
      onAction: handleSubmit,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onUpdateHeader, hasContext, centreId, tradeId, qualificationLevelId]);

  if (!hasContext) {
    return (
      <div className="w-full flex flex-col gap-6 select-text pb-12 animate-fadeIn">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2">
            <p className="text-sm font-bold text-neutral-primary">Select a candidate first</p>
            <p className="text-xs text-gray-400 max-w-xs">
              Open the IQA Allocation Form (CON/01) and pick a candidate — the sampling matrix for
              their trade and qualification level will load here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const toggleUnit = (row: NonNullable<typeof matrix>["data"][number], unitId: string) => {
    const current = new Set(row.sampledUnitIds);
    if (current.has(unitId)) current.delete(unitId);
    else current.add(unitId);
    putUnits.mutate({ applicationId: row.applicationId, unitIds: Array.from(current) });
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text pb-12 animate-fadeIn">

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">NAME OF CENTRE</span>
            <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary mt-1 truncate">{matrix?.centre.name || "—"}</h4>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">TRADE</span>
            <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary mt-1 truncate">{matrix?.trade.name || "—"}</h4>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">QUALIFICATION LEVEL</span>
            <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary mt-1 truncate">
              {matrix ? `Level ${matrix.qualificationLevel.level}` : "—"}
            </h4>
          </div>
        </div>

        {/* Sampling Matrix Table */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">Assessment Tools</h3>

          {isLoading ? (
            <p className="text-xs text-gray-400 py-4">Loading sampling plan…</p>
          ) : !matrix || matrix.data.length === 0 ? (
            <p className="text-xs text-gray-400 py-4">No candidates found for this trade and level.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-220">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-bold text-[11px]">
                    <th className="py-3 px-2">Candidate Name</th>
                    <th className="py-3 px-2">Unit Assessor</th>
                    <th className="py-3 px-2">Term Type</th>
                    <th className="py-3 px-2">Planned Date</th>
                    {matrix.units.map((u) => (
                      <th key={u.id} className="py-3 px-2 text-center" title={u.title}>
                        {u.referenceNumber}
                      </th>
                    ))}
                    <th className="py-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {matrix.data.map((row) => (
                    <tr key={row.applicationId} className="hover:bg-gray-50/50 transition-colors font-medium text-neutral-primary">
                      <td className="py-3.5 px-2 text-xs">{row.candidate.name}</td>
                      <td className="py-3.5 px-2 text-xs text-gray-600">{row.unitAssessor?.name || "—"}</td>
                      <td className="py-3.5 px-2">
                        <select
                          defaultValue={row.termType || ""}
                          onChange={(e) =>
                            patchRow.mutate({
                              applicationId: row.applicationId,
                              payload: { termType: e.target.value || null },
                            })
                          }
                          disabled={row.status === "submitted"}
                          className="w-28 h-8 px-2.5 pr-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-gray-700 font-medium appearance-none focus:outline-none focus:border-[#a31d38] disabled:opacity-60"
                        >
                          <option value="">Select</option>
                          {TERM_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="h-8 w-36 px-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-[11px] text-gray-700 focus-within:bg-white focus-within:border-[#a31d38]">
                          <input
                            type="date"
                            defaultValue={row.plannedDate || ""}
                            onBlur={(e) =>
                              patchRow.mutate({
                                applicationId: row.applicationId,
                                payload: { plannedDate: e.target.value || null },
                              })
                            }
                            disabled={row.status === "submitted"}
                            className="w-full bg-transparent outline-none text-[11px] disabled:opacity-60"
                          />
                          <FiCalendar className="w-3 h-3 text-gray-400 shrink-0 ml-1" />
                        </div>
                      </td>
                      {matrix.units.map((u) => (
                        <td key={u.id} className="py-3.5 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={row.sampledUnitIds.includes(u.id)}
                            onChange={() => toggleUnit(row, u.id)}
                            disabled={row.status === "submitted"}
                            className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-[#a31d38] cursor-pointer disabled:opacity-60"
                          />
                        </td>
                      ))}
                      <td className="py-3.5 px-2 text-right">
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
