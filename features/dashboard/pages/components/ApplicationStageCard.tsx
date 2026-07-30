"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { StageConfig } from "../types";

interface ApplicationStageCardProps {
  stage: StageConfig;
}

export const ApplicationStageCard: React.FC<ApplicationStageCardProps> = ({
  stage,
}) => {
  const isOutline = stage.actionVariant === "outline";

  return (
    <div className="bg-[#F8F9FA] rounded-[20px] p-5 sm:p-6 shadow-2xs border border-gray-100/70 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-gray-900 font-bold text-lg sm:text-xl lg:text-2xl tracking-tight">
              {stage.title}
            </h3>
            <span
              className={`${stage.statusBg} ${stage.statusText} text-xs font-semibold px-3 py-1 rounded-full shadow-2xs`}
            >
              {stage.status}
            </span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-normal mt-1.5">
            {stage.subtext}
          </p>
        </div>

        {stage.actionText && (
          <Button
            type="button"
            onClick={stage.onActionClick}
            size={stage.actionSize || "sm"}
            leftIcon={stage.actionLeftIcon}
            rightIcon={stage.actionRightIcon}
            loading={stage.actionLoading}
            className={`shrink-0 w-37.25 font-semibold text-sm sm:text-base px-6 py-2.5 rounded-md transition-all cursor-pointer ${
              isOutline
                ? "bg-white! hover:bg-gray-50 text-secondary! border border-gray-100/80"
                : "bg-secondary! text-white!"
            }`}
          >
            {stage.actionText}
          </Button>
        )}
      </div>

      {stage.showPaymentDetails && (
        <div className="mt-4 bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between border border-gray-100 shadow-2xs">
          <span className="text-gray-900 font-semibold text-xs sm:text-base">
            RPL Assessment Fee — Carpentry (Level 3)
          </span>
          <span className="text-[#a31d38] font-extrabold text-base sm:text-xl">
            ₦45,000
          </span>
        </div>
      )}

      {stage.alertMessage && (
        <div className="mt-4 bg-[#fce8eb] border border-[#f87171]/20 rounded-xl p-4 text-[#991b1b] text-xs sm:text-sm font-normal leading-relaxed">
          {stage.alertMessage}
        </div>
      )}

      {stage.delayedMessage && (
        <div className="mt-4 bg-[#F19108]/10 border border-[#F19108]/30 rounded-xl p-4 text-[#F19108] text-xs sm:text-sm font-normal leading-relaxed">
          {stage.delayedMessage}
        </div>
      )}
    </div>
  );
};
