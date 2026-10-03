"use client";

import React, { useMemo, useState } from "react";
import { getEvidenceTypeName } from "../utils/evidenceConstants";

const ALL = "";

const toCode = (evidenceType?: string) =>
  (evidenceType || "").trim().toUpperCase();

/**
 * Groups evidence by its type so the list can be narrowed to one category.
 * Selection falls back to "All" when the chosen type no longer exists
 * (e.g. after its last item is deleted).
 */
export function useEvidenceTypeFilter<T extends { evidenceType?: string }>(
  items: T[],
) {
  const [selected, setSelected] = useState<string>(ALL);

  const types = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      const code = toCode(item.evidenceType);
      if (code) counts.set(code, (counts.get(code) || 0) + 1);
    });
    return Array.from(counts, ([code, count]) => ({
      code,
      count,
      label: getEvidenceTypeName(code),
    }));
  }, [items]);

  const activeType = types.some((t) => t.code === selected) ? selected : ALL;

  const filteredItems = useMemo(
    () =>
      activeType === ALL
        ? items
        : items.filter((item) => toCode(item.evidenceType) === activeType),
    [items, activeType],
  );

  return {
    types,
    activeType,
    setActiveType: setSelected,
    filteredItems,
    totalCount: items.length,
  };
}

interface EvidenceTypeFilterProps {
  types: { code: string; label: string; count: number }[];
  activeType: string;
  onChange: (code: string) => void;
  totalCount: number;
}

/** Category chips shown above an evidence list. Hidden when there is only one type. */
export const EvidenceTypeFilter: React.FC<EvidenceTypeFilterProps> = ({
  types,
  activeType,
  onChange,
  totalCount,
}) => {
  if (types.length < 2) return null;

  const options = [
    { code: ALL, label: "All", count: totalCount },
    ...types,
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl overflow-x-auto max-w-full w-fit">
      {options.map((option) => {
        const isActive = option.code === activeType;
        return (
          <button
            key={option.code || "all"}
            type="button"
            onClick={() => onChange(option.code)}
            aria-pressed={isActive}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              isActive
                ? "bg-[#FDF2F4] text-[#A31D38] font-bold shadow-2xs"
                : "text-gray-500 font-medium hover:text-gray-700"
            }`}
          >
            {option.label} ({option.count})
          </button>
        );
      })}
    </div>
  );
};
