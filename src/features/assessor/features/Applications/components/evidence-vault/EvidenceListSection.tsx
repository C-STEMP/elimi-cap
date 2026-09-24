"use client";

import React from "react";
import { EvidenceItemCard, type EvidenceItem } from "./EvidenceItemCard";

interface EvidenceListSectionProps {
  items: EvidenceItem[];
  onView: (item: EvidenceItem) => void;
  isLoading?: boolean;
}

export const EvidenceListSection: React.FC<EvidenceListSectionProps> = ({
  items,
  onView,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="text-lg font-bold text-neutral-primary">
        Evidence
      </h3>

      {isLoading ? (
        <div className="flex flex-col gap-3.5 w-full animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-4 bg-gray-200 rounded w-40" />
                  <div className="h-5 bg-gray-100 rounded-full w-20" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-24" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gray-100" />
                <div className="w-9 h-9 rounded-xl bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="flex flex-col gap-3.5 w-full">
          {items.map((item) => (
            <EvidenceItemCard
              key={item.id}
              item={item}
              onView={onView}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-center text-center py-8">
          <p className="text-xs sm:text-sm text-neutral-secondary font-medium">
            No evidence documents uploaded yet.
          </p>
        </div>
      )}
    </div>
  );
};
