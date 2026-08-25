"use client";

import React from "react";
import { FiClipboard } from "react-icons/fi";
import type { AssessorApplicationStats } from "../../types/applications.types";

interface AssessorApplicationStatsCardsProps {
  stats: AssessorApplicationStats;
}

export const AssessorApplicationStatsCards: React.FC<
  AssessorApplicationStatsCardsProps
> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* Total Applications Card */}
      <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-5 flex flex-col justify-between text-white border border-white/15 transition-all shadow-xs">
        <span className="text-xs sm:text-sm font-medium text-white/80">
          Total Applications
        </span>
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {stats.total.toLocaleString()}
          </span>
          <span className="text-xs sm:text-sm font-normal text-white/80">
            applications
          </span>
        </div>
      </div>

      {/* Pending Card */}
      <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-5 flex items-start justify-between text-white border border-white/15 transition-all shadow-xs">
        <div className="flex flex-col justify-between">
          <span className="text-xs sm:text-sm font-medium text-white/80">
            Pending
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {stats.pending.toLocaleString()}
            </span>
            <span className="text-xs sm:text-sm font-normal text-white/80">
              applications
            </span>
          </div>
        </div>
        <div className="w-8 h-8 flex items-center justify-center shrink-0 text-white/70">
          <FiClipboard className="w-5 h-5" />
        </div>
      </div>

      {/* Completed Card */}
      <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-5 flex items-start justify-between text-white border border-white/15 transition-all shadow-xs">
        <div className="flex flex-col justify-between">
          <span className="text-xs sm:text-sm font-medium text-white/80">
            Completed
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {stats.completed.toLocaleString()}
            </span>
            <span className="text-xs sm:text-sm font-normal text-white/80">
              applications
            </span>
          </div>
        </div>
        <div className="w-8 h-8 flex items-center justify-center shrink-0 text-white/70">
          <FiClipboard className="w-5 h-5" />
        </div>
      </div>

      {/* Archived Card */}
      <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-5 flex items-start justify-between text-white border border-white/15 transition-all shadow-xs">
        <div className="flex flex-col justify-between">
          <span className="text-xs sm:text-sm font-medium text-white/80">
            Archived
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {stats.archived.toLocaleString()}
            </span>
            <span className="text-xs sm:text-sm font-normal text-white/80">
              applications
            </span>
          </div>
        </div>
        <div className="w-8 h-8 flex items-center justify-center shrink-0 text-white/70">
          <FiClipboard className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
