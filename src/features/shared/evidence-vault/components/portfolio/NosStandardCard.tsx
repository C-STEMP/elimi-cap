"use client";

import React from "react";
import { useGetUnitsByTrade } from "@/src/features/shared/reference/hooks";
import type { ApplicationDetail } from "@/src/features/shared/applications/api/types";

interface NosStandardCardProps {
  application?: ApplicationDetail | null;
}

/**
 * Read-only National Occupational Standard: trade, sector and the units the
 * candidate is being assessed against. Mirrors the NSQ units card, without
 * the per-unit evidence uploads.
 */
export const NosStandardCard: React.FC<NosStandardCardProps> = ({ application }) => {
  const tradeId = application?.tradeId || application?.trade?.id || "";
  const { data: tradeUnits = [], isLoading } = useGetUnitsByTrade(tradeId);

  const tradeName = application?.trade?.name || "Trade";
  const sectorName = application?.sector?.name || "—";

  // The candidate's selected units; fall back to the whole trade standard
  // when the application didn't record a selection.
  const selectedIds = application?.unitIds || [];
  const units = selectedIds.length
    ? tradeUnits.filter((u) => selectedIds.includes(u.id))
    : tradeUnits;
  const mandatoryCount = units.filter((u) => u.isMandatory).length;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="self-start px-2.5 py-0.5 rounded-md bg-[#FCE7F3] text-[#BE185D] font-bold text-[10px] tracking-wide">
          NOS Document
        </span>
        <h4 className="text-base sm:text-lg font-bold text-neutral-primary">
          {tradeName} National Occupational Standard
        </h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Trade</span>
          <span className="text-xs sm:text-sm font-bold text-gray-900 truncate mt-0.5">{tradeName}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Sector</span>
          <span className="text-xs sm:text-sm font-bold text-gray-900 truncate mt-0.5">{sectorName}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Units</span>
          <span className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5">
            {units.length} ({mandatoryCount} mandatory)
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#F8F9FA] flex items-center justify-between gap-4 animate-pulse">
              <div className="h-3.5 bg-gray-200 rounded w-2/3" />
              <div className="h-5 bg-gray-200 rounded-full w-20 shrink-0" />
            </div>
          ))
        ) : units.length === 0 ? (
          <p className="text-xs text-gray-400 font-medium py-2">
            No units found for this trade standard yet.
          </p>
        ) : (
          units.map((unit) => (
            <div key={unit.id} className="p-4 rounded-xl bg-[#F8F9FA] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-xs sm:text-sm text-gray-900 uppercase shrink-0">
                  {unit.referenceNumber}:
                </span>
                <span className="text-xs sm:text-sm text-gray-600 font-normal truncate" title={unit.title}>
                  {unit.title}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                  unit.isMandatory ? "bg-[#FCE7F3] text-[#BE185D]" : "bg-gray-200/80 text-gray-600"
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
