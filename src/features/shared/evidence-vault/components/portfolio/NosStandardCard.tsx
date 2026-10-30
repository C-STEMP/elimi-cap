"use client";

import React from "react";
import {
  useGetTradeDetail,
  useGetUnitsByTrade,
} from "@/src/features/shared/reference/hooks";
import type { ApplicationDetail } from "@/src/features/shared/applications/api/types";
import {
  resolveAppliedTradeLevel,
  getRplScopedUnits,
} from "@/src/features/shared/applications/utils/rplTradeLevel";

interface NosStandardCardProps {
  application?: ApplicationDetail | null;
}

/**
 * Read-only National Occupational Standard: trade, sector, applied trade level,
 * and only the units of the level the candidate is being assessed against.
 */
export const NosStandardCard: React.FC<NosStandardCardProps> = ({
  application,
}) => {
  const tradeId = application?.tradeId || application?.trade?.id || "";
  const { data: tradeDetail, isLoading: isLoadingDetail } =
    useGetTradeDetail(tradeId);

  const { levelNumber, levelLabel } = resolveAppliedTradeLevel(
    application,
    tradeDetail,
  );

  const { data: rawTradeUnits = [], isLoading: isLoadingUnits } =
    useGetUnitsByTrade(tradeId, levelNumber);

  const tradeName = application?.trade?.name || tradeDetail?.name || "Trade";
  const sectorName = application?.sector?.name || "—";

  // The units strictly belonging to the candidate's applied trade level,
  // narrowed to specific unitIds if the application recorded a selection.
  const units = React.useMemo(
    () =>
      getRplScopedUnits({
        tradeUnits: rawTradeUnits,
        tradeDetail,
        levelNumber,
        preferredUnitIds: application?.unitIds,
      }),
    [rawTradeUnits, tradeDetail, levelNumber, application?.unitIds],
  );

  const mandatoryCount = units.filter((u) => u.isMandatory).length;
  const isLoading = (isLoadingUnits || isLoadingDetail) && units.length === 0;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="self-start px-2.5 py-0.5 rounded-md bg-[#FCE7F3] text-[#BE185D] font-bold text-[10px] tracking-wide">
            NOS Document
          </span>
          <span className="self-start px-2.5 py-0.5 rounded-md bg-[#EDE9FE] text-[#6D28D9] font-bold text-[10px] tracking-wide">
            {levelLabel}
          </span>
        </div>
        <h4 className="text-base sm:text-lg font-bold text-neutral-primary">
          {tradeName} National Occupational Standard — {levelLabel}
        </h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
            Trade
          </span>
          <span className="text-xs sm:text-sm font-bold text-gray-900 truncate mt-0.5">
            {tradeName}
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
            Sector
          </span>
          <span className="text-xs sm:text-sm font-bold text-gray-900 truncate mt-0.5">
            {sectorName}
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
            Trade Level
          </span>
          <span className="text-xs sm:text-sm font-bold text-[#6D28D9] truncate mt-0.5">
            {levelLabel}
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
            Units
          </span>
          <span className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5">
            {units.length} ({mandatoryCount} mandatory)
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[#F8F9FA] flex items-center justify-between gap-4 animate-pulse"
            >
              <div className="h-3.5 bg-gray-200 rounded w-2/3" />
              <div className="h-5 bg-gray-200 rounded-full w-20 shrink-0" />
            </div>
          ))
        ) : units.length === 0 ? (
          <p className="text-xs text-gray-400 font-medium py-2">
            No units found for {levelLabel} in this trade standard yet.
          </p>
        ) : (
          units.map((unit) => (
            <div
              key={unit.id}
              className="p-4 rounded-xl bg-[#F8F9FA] flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2 min-w-0">
                {unit.referenceNumber ? (
                  <span className="font-bold text-xs sm:text-sm text-gray-900 uppercase shrink-0">
                    {unit.referenceNumber}:
                  </span>
                ) : null}
                <span
                  className="text-xs sm:text-sm text-gray-600 font-normal truncate"
                  title={unit.title}
                >
                  {unit.title}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                  unit.isMandatory
                    ? "bg-[#FCE7F3] text-[#BE185D]"
                    : "bg-gray-200/80 text-gray-600"
                }`}
              >
                {unit.isMandatory ? "Mandatory" : "Optional"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
