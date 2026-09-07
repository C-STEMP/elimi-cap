"use client";

import React from "react";

interface Props {
  totalCount: number;
  pendingCount: number;
  ongoingCount: number;
  completedCount: number;
  archivedCount: number;
}

export const ApplicationsStatsCards: React.FC<Props> = ({
  totalCount,
  pendingCount,
  ongoingCount,
  completedCount,
  archivedCount,
}) => {
  const cards = [
    { label: "Total Applications", count: totalCount },
    { label: "Pending", count: pendingCount },
    { label: "Ongoing", count: ongoingCount },
    { label: "Completed", count: completedCount },
    { label: "Archived", count: archivedCount },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 flex flex-col gap-1 border border-white/15 transition-all shadow-xs"
        >
          <span className="text-xs font-semibold text-white/90">{card.label}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              {card.count.toLocaleString()}
            </span>
            <span className="text-xs text-white/80 font-normal">applications</span>
          </div>
        </div>
      ))}
    </div>
  );
};
