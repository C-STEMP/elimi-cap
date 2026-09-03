"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ASSETS_URL } from "@/src/assets";
import { Avatar } from "@/src/components/ui/avatar";
import type { AssessorPanelMember } from "../../types/applications.types";

interface AssessorPanelMembersSectionProps {
  assessors?: AssessorPanelMember[];
}

export const AssessorPanelMembersSection: React.FC<
  AssessorPanelMembersSectionProps
> = ({ assessors = [] }) => {
  const [selectedId, setSelectedId] = useState<string>(
    assessors.find((a) => a.isHighlighted)?.id || assessors[0]?.id || "",
  );

  if (assessors.length === 0) {
    return (
      <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 w-full mt-2">
        <span className="text-[11px] font-bold text-neutral-primary uppercase tracking-wider">
          YOUR ASSESSORS
        </span>
        <p className="text-xs text-neutral-secondary font-medium">
          No panel members assigned yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pt-3 border-t border-gray-100 w-full mt-2">
      <span className="text-[11px] font-bold text-neutral-primary uppercase tracking-wider">
        YOUR ASSESSORS
      </span>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full">
        {assessors.map((assessor) => {
          const isSelected = selectedId === assessor.id;
          return (
            <div
              key={assessor.id}
              onClick={() => setSelectedId(assessor.id)}
              className={`bg-white rounded-2xl p-4 flex items-center gap-3.5 border transition-all cursor-pointer ${
                isSelected
                  ? "border-[#FBAB2A] shadow-xs ring-1 ring-[#FBAB2A]/20"
                  : "border-gray-100 shadow-2xs hover:border-gray-200"
              }`}
            >
              <Avatar
                src={assessor.avatar}
                name={assessor.name}
                className="w-12 h-12 border border-gray-100 shrink-0"
                alt={assessor.name}
              />

              <div className="flex flex-col min-w-0">
                <h5 className="text-neutral-primary font-bold text-sm leading-snug truncate">
                  {assessor.name}
                </h5>
                <p className="text-neutral-secondary text-xs font-normal truncate mt-0.5">
                  {assessor.role}
                </p>

                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {assessor.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-[#FCE8EB] text-[#A31D38] text-[9px] font-medium px-2 py-0.5 rounded-full shrink-0"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
