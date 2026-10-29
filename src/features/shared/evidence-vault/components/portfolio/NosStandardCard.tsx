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
    </div>
  );
};
