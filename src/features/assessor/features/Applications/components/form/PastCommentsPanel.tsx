"use client";

import React from "react";

interface PastCommentsPanelProps {
  comments?: Array<{ text: string; date?: string; version?: number }>;
}

export const PastCommentsPanel: React.FC<PastCommentsPanelProps> = ({
  comments = [],
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4 w-full">
      <h4 className="text-base font-bold text-neutral-primary">
        Past Comments
      </h4>

      {comments.length > 0 ? (
        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
          {comments.map((c, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-2xl p-3.5 text-xs text-neutral-primary border border-gray-100 flex flex-col gap-1"
            >
              {c.date && (
                <span className="text-[10px] text-gray-400 font-medium">
                  {c.version ? `Version ${c.version} • ` : ""}
                  {c.date}
                </span>
              )}
              <p className="leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-gray-400 font-normal">
          No feedback sent yet
        </p>
      )}
    </div>
  );
};
