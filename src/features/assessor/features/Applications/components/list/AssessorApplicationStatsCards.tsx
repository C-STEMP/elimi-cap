"use client";

import React from "react";
import {
  FiClipboard,
  FiClock,
  FiCheckCircle,
  FiArchive,
} from "react-icons/fi";
import type { AssessorApplicationStats } from "../../types/applications.types";

const isAllFilter = (value?: string | null) => !value || value.toLowerCase() === "all";

interface AssessorApplicationStatsCardsProps {
  stats: AssessorApplicationStats;
  activeFilterTab?: string;
  onSelectFilterTab?: (filter: string) => void;
}

export const AssessorApplicationStatsCards: React.FC<
  AssessorApplicationStatsCardsProps
> = ({ stats, activeFilterTab, onSelectFilterTab }) => {
  const cards = [
    {
      label: "Total Applications",
      value: stats.total,
      unit: "applications",
      icon: <FiClipboard className="w-5 h-5 text-white/90" />,
      filter: "all",
    },
    {
      label: "Pending",
      value: stats.pending,
      unit: "applications",
      icon: <FiClock className="w-5 h-5 text-white/90" />,
      filter: "pending",
    },
    {
      label: "Completed",
      value: stats.completed,
      unit: "applications",
      icon: <FiCheckCircle className="w-5 h-5 text-white/90" />,
      filter: "completed",
    },
    {
      label: "Archived",
      value: stats.archived,
      unit: "applications",
      icon: <FiArchive className="w-5 h-5 text-white/90" />,
      filter: "archived",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
      {cards.map((card) => {
        // The "all" card is the default selection when no filter is set.
        const isActive = isAllFilter(activeFilterTab)
          ? card.filter === "all"
          : activeFilterTab === card.filter;
        return (
          <button
            key={card.label}
            type="button"
            onClick={() => onSelectFilterTab?.(card.filter)}
            className={[
              "backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border transition-all shadow-xs text-left cursor-pointer active:scale-[0.98]",
              isActive
                ? "bg-white/20 ring-2 ring-white/60 border-white/40"
                : "bg-white/10 hover:bg-white/15 border-white/15",
            ].join(" ")}
          >
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-white/80">
                {card.label}
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  {card.value.toLocaleString()}
                </span>
                <span className="text-xs font-normal text-white/70">
                  {card.unit}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              {card.icon}
            </div>
          </button>
        );
      })}
    </div>
  );
};
