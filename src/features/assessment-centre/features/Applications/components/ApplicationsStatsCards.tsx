"use client";

import React from "react";
import {
  FiClipboard,
  FiClock,
  FiActivity,
  FiCheckCircle,
  FiArchive,
} from "react-icons/fi";

interface Props {
  totalCount: number;
  pendingCount: number;
  ongoingCount: number;
  completedCount: number;
  archivedCount: number;
  activeFilterTab?: string;
  onSelectFilterTab?: (tab: string) => void;
}

export const ApplicationsStatsCards: React.FC<Props> = ({
  totalCount,
  pendingCount,
  ongoingCount,
  completedCount,
  archivedCount,
  activeFilterTab,
  onSelectFilterTab,
}) => {
  const cards = [
    {
      label: "Total Applications",
      count: totalCount,
      unit: "applications",
      filterValue: "All",
      icon: FiClipboard,
    },
    {
      label: "Pending",
      count: pendingCount,
      unit: "applications",
      filterValue: "Pending",
      icon: FiClock,
    },
    {
      label: "Ongoing",
      count: ongoingCount,
      unit: "applications",
      filterValue: "Ongoing",
      icon: FiActivity,
    },
    {
      label: "Completed",
      count: completedCount,
      unit: "applications",
      filterValue: "Completed",
      icon: FiCheckCircle,
    },
    {
      label: "Archived",
      count: archivedCount,
      unit: "applications",
      filterValue: "Archived",
      icon: FiArchive,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card, index) => {
        const isActive =
          activeFilterTab !== undefined &&
          (activeFilterTab === card.filterValue ||
            (card.filterValue === "All" &&
              (activeFilterTab === "All" || !activeFilterTab)));
        const isClickable = Boolean(onSelectFilterTab);

        return (
          <button
            key={card.label}
            type="button"
            onClick={
              isClickable ? () => onSelectFilterTab?.(card.filterValue) : undefined
            }
            className={`bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border transition-all shadow-xs text-left w-full ${
              index === 0 ? "col-span-2 sm:col-span-1" : ""
            } ${
              isClickable
                ? "cursor-pointer active:scale-[0.98]"
                : "cursor-default"
            } ${
              isActive
                ? "ring-2 ring-white/60 bg-white/20 border-white/40 shadow-md"
                : "border-white/15"
            }`}
          >
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80 truncate">
                {card.label}
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  {card.count.toLocaleString()}
                </span>
                <span className="text-xs lg:text-sm font-normal text-white/90">
                  {card.unit}
                </span>
              </div>
            </div>

            <div className="w-9 h-9 flex items-center justify-center shrink-0 ml-2">
              <card.icon className="w-5 h-5 text-white/90" />
            </div>
          </button>
        );
      })}
    </div>
  );
};
