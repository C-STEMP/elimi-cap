"use client";

import React from "react";
import { Avatar } from "@/src/components/ui/avatar";

interface AssessorInfo {
  name: string;
  email: string;
  avatar?: string;
  photoUrl?: string;
}

interface Props {
  leadAssessor: AssessorInfo;
  memberAssessor: AssessorInfo;
  ivAssessor: AssessorInfo;
}

export const SittingAssessorsRow: React.FC<Props> = ({
  leadAssessor,
  memberAssessor,
  ivAssessor,
}) => {
  const cards = [
    {
      title: "Lead Panelist",
      data: leadAssessor,
    },
    {
      title: "Panel Member",
      data: memberAssessor,
    },
    {
      title: "Internal Verifier",
      data: ivAssessor,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs flex items-center gap-4"
        >
          <Avatar
            src={(card.data as any)?.photo?.url || card.data.photoUrl || card.data.avatar}
            name={card.data.name}
            className="w-13 h-13 rounded-full shrink-0 border border-gray-100 shadow-2xs"
          />
          <div className="flex flex-col min-w-0">
            <h4 className="font-bold text-sm text-gray-900 truncate">{card.data.name}</h4>
            <span className="text-xs text-gray-500 font-medium">{card.title}</span>
            <span className="text-[11px] text-gray-400 truncate">{card.data.email || "—"}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
