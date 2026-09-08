"use client";

import React from "react";
import { FiChevronLeft } from "react-icons/fi";

interface IqamHeaderBannerProps {
  title: string;
  breadcrumbChild: string;
  onBack: () => void;
  actionButtonLabel?: string;
  onActionClick?: () => void;
}

export const IqamHeaderBanner: React.FC<IqamHeaderBannerProps> = ({
  title,
  breadcrumbChild,
  onBack,
  actionButtonLabel,
  onActionClick,
}) => {
  return (
    <div className="w-full bg-[#a31d38] text-white pt-6 pb-6 px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-white/80 transition-colors text-base sm:text-lg font-bold group"
          >
            <FiChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="truncate">{title}</span>
          </button>

          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-white/70 mt-1.5 font-medium ml-7">
            <span className="hover:text-white cursor-pointer" onClick={onBack}>
              IQAM Tools
            </span>
            <span>&gt;</span>
            <span className="text-white truncate">{breadcrumbChild}</span>
          </div>
        </div>

        {actionButtonLabel && (
          <button
            type="button"
            onClick={onActionClick}
            className="h-10 px-8 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all self-start md:self-auto shrink-0 cursor-pointer"
          >
            {actionButtonLabel}
          </button>
        )}
      </div>
    </div>
  );
};
