"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ASSETS_URL } from "@/src/assets";
import type { AssessorPanelMember } from "../../types/applications.types";

export const DEFAULT_ASSESSOR_PANEL: AssessorPanelMember[] = [
  {
    id: "assessor-1",
    name: "Ngozi Eze",
    role: "Panel Member",
    avatar: ASSETS_URL.userAvatar,
    tags: ["Carpentry", "RPL Coordinator"],
    isHighlighted: false,
  },
  {
    id: "assessor-2",
    name: "Ngozi Eze",
    role: "Panel Member",
    avatar: ASSETS_URL.userAvatar,
    tags: ["Carpentry", "RPL Coordinator"],
    isHighlighted: true,
  },
  {
    id: "assessor-3",
    name: "Ngozi Eze",
    role: "Panel Member",
    avatar: ASSETS_URL.userAvatar,
    tags: ["Carpentry", "RPL Coordinator"],
    isHighlighted: false,
  },
];

interface AssessorPanelMembersSectionProps {
  assessors?: AssessorPanelMember[];
}

export const AssessorPanelMembersSection: React.FC<
  AssessorPanelMembersSectionProps
> = ({ assessors = DEFAULT_ASSESSOR_PANEL }) => {
  const [selectedId, setSelectedId] = useState<string>(
    assessors.find((a) => a.isHighlighted)?.id || assessors[1]?.id || assessors[0]?.id,
  );

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
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100">
                <Image
                  src={assessor.avatar || ASSETS_URL.userAvatar}
                  alt={assessor.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>

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
                      className="bg-[#FFF0F3] text-[#A31D38] text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0"
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
