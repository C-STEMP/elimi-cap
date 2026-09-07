"use client";

import React from "react";

interface AssessorInfo {
  name: string;
  email: string;
  avatar: string;
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
      fallbackAvatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    },
    {
      title: "Panel Member",
      data: memberAssessor,
      fallbackAvatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
    },
    {
      title: "Internal Verifier",
      data: ivAssessor,
      fallbackAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs flex items-center gap-4"
        >
          <img
            src={(card.data as any)?.avatarUrl || card.data.avatar || "/images/facilitator_ngozi.jpg"}
            alt={card.data.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = card.fallbackAvatar;
            }}
            className="w-13 h-13 rounded-full object-cover shrink-0 border border-gray-100 shadow-2xs"
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
