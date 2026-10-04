"use client";

import React from "react";
import Image from "next/image";
import { ASSETS_URL } from "@/src/assets";

export type PortfolioBadgeTone = "success" | "warning" | "neutral";

const BADGE_TONES: Record<PortfolioBadgeTone, string> = {
  success: "bg-[#E8F5E9] text-[#2E7D32]",
  warning: "bg-[#FEF3C7] text-[#D97706]",
  neutral: "bg-black/10 text-black",
};

interface PortfolioDocCardProps {
  title: string;
  subtitle?: React.ReactNode;
  badge?: { label: string; tone: PortfolioBadgeTone };
  icon?: React.ReactNode;
  /** Buttons on the right — use PortfolioActionButton for consistency. */
  actions?: React.ReactNode;
}

export const PortfolioDocCard: React.FC<PortfolioDocCardProps> = ({
  title,
  subtitle,
  badge,
  icon,
  actions,
}) => (
  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1 w-full">
      <div className="w-11 sm:w-12 h-11 sm:h-12 rounded-xl bg-[#FFF5F6] border border-rose-100 flex items-center justify-center shrink-0">
        {icon ?? (
          <Image
            src={ASSETS_URL.pdfImg}
            alt=""
            width={24}
            height={24}
            className="w-5 sm:w-6 h-5 sm:h-6 object-contain"
          />
        )}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm sm:text-base md:text-lg font-bold text-neutral-primary tracking-tight">
            {title}
          </h4>
          {badge && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${BADGE_TONES[badge.tone]}`}
            >
              {badge.label}
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-xs text-gray-400 font-normal">{subtitle}</span>
        )}
      </div>
    </div>

    {actions && (
      <div className="flex items-center justify-end sm:justify-start gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100/70 sm:border-transparent shrink-0">
        {actions}
      </div>
    )}
  </div>
);

interface PortfolioActionButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  "aria-label"?: string;
}

export const PortfolioActionButton: React.FC<PortfolioActionButtonProps> = ({
  onClick,
  disabled,
  variant = "primary",
  children,
  ...rest
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={rest["aria-label"]}
    className={`flex-1 sm:flex-initial justify-center inline-flex items-center gap-2 text-center border border-gray-200 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-2xs shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
      variant === "primary"
        ? "bg-white text-[#FBAB2A] hover:bg-orange-50/50"
        : "bg-[#F8F9FA] text-gray-700 hover:bg-gray-100 font-semibold"
    }`}
  >
    {children}
  </button>
);
