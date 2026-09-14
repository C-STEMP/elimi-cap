"use client";

import React from "react";

const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`bg-white rounded-3xl p-5 sm:p-6 border border-gray-100/80 shadow-2xs animate-pulse flex flex-col gap-4 ${className}`}
  >
    <div className="h-4 bg-gray-200 rounded w-32" />
    <div className="h-40 bg-gray-100 rounded-2xl w-full" />
  </div>
);

export const AssessmentCentreOverviewSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 select-none" aria-busy="true" aria-live="polite">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <SkeletonCard className="min-h-60" />
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100/80 shadow-2xs animate-pulse flex flex-col gap-4 min-h-60">
          <div className="h-4 bg-gray-200 rounded w-40" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-3 bg-gray-200 rounded w-3/5" />
                <div className="h-2.5 bg-gray-100 rounded w-2/5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100/80 shadow-2xs animate-pulse flex flex-col gap-4">
        <div className="h-4 bg-gray-200 rounded w-48" />
        <div className="flex flex-col divide-y divide-gray-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3.5">
              <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-100 rounded w-1/6 hidden sm:block" />
              <div className="h-3 bg-gray-100 rounded w-1/6 hidden md:block" />
              <div className="ml-auto h-6 w-16 bg-gray-200 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
