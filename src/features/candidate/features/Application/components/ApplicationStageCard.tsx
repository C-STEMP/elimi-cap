"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { StageConfig } from "../types";

interface ApplicationStageCardProps {
  stage: StageConfig;
}

export const ApplicationStageCard: React.FC<ApplicationStageCardProps> = ({
  stage,
}) => {
  const isOutline = stage.actionVariant === "outline";
  const [isCollapsed, setIsCollapsed] = useState(stage.isCollapsed ?? true);

  React.useEffect(() => {
    if (stage.isCollapsed !== undefined) {
      setIsCollapsed(stage.isCollapsed);
    }
  }, [stage.isCollapsed]);

  const handleToggle = () => {
    setIsCollapsed((prev: boolean) => !prev);
    stage.onToggleCollapse?.();
  };

  const isCollapsible = stage.isCollapsible ?? true;

  return (
    <div className="bg-[#F8F9FA] rounded-[20px] p-4 sm:p-6 shadow-2xs border border-gray-100/70 flex flex-col justify-between transition-all w-full overflow-hidden">
      {/* Mobile Layout (< sm) */}
      <div className="flex flex-col gap-2.5 sm:hidden w-full">
        {/* Top Row: Title + Badge on left, Chevron on right */}
        <div
          onClick={isCollapsible ? handleToggle : undefined}
          className={`flex items-center justify-between gap-2 w-full ${
            isCollapsible ? "cursor-pointer select-none" : ""
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h3 className="text-black font-bold text-base tracking-tight break-words">
              {stage.title}
            </h3>
            <span
              className={`${stage.statusBg} ${stage.statusText} text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs shrink-0`}
            >
              {stage.status}
            </span>
          </div>

          {isCollapsible && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
              className="p-1 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer rounded-lg hover:bg-gray-200/50 shrink-0"
              aria-label="Toggle section"
            >
              {isCollapsed ? (
                <FiChevronDown className="w-5 h-5" />
              ) : (
                <FiChevronUp className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Bottom Row: Subtext on left, Action Button on right */}
        <div className="flex items-center justify-between gap-2.5 w-full pt-0.5">
          <p className="text-gray-400 text-xs font-normal break-words flex-1 min-w-0">
            {stage.subtext}
          </p>

          {stage.actionText && (
            <Button
              type="button"
              onClick={stage.onActionClick}
              size="sm"
              leftIcon={stage.actionLeftIcon}
              rightIcon={stage.actionRightIcon}
              loading={stage.actionLoading}
              className={`shrink-0 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-none! focus:outline-none focus:ring-0 focus:ring-transparent focus-visible:outline-none focus-visible:ring-0 active:outline-none outline-none whitespace-nowrap ${
                stage.actionText === "View"
                  ? "bg-white! text-secondary! border border-gray-200! hover:bg-gray-50! shadow-none!"
                  : stage.actionText === "Make Payment"
                    ? "bg-white! text-[#FBAB2A]! border border-gray-200! hover:bg-gray-50! shadow-none!"
                    : isOutline
                      ? "bg-white! text-secondary! border border-gray-200! hover:bg-gray-50! shadow-none!"
                      : "bg-[#FBAB2A]! text-white! hover:bg-[#E89B1F]! shadow-none!"
              }`}
            >
              {stage.actionText}
            </Button>
          )}
        </div>
      </div>

      {/* Desktop / Tablet Layout (>= sm) */}
      <div className="hidden sm:flex sm:items-center justify-between gap-4 w-full">
        <div
          onClick={isCollapsible ? handleToggle : undefined}
          className={`flex flex-col flex-1 min-w-0 ${
            isCollapsible ? "cursor-pointer select-none" : ""
          }`}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-black font-bold text-xl lg:text-2xl tracking-tight break-words">
              {stage.title}
            </h3>
            <span
              className={`${stage.statusBg} ${stage.statusText} text-xs font-semibold px-3 py-1 rounded-full shadow-2xs shrink-0`}
            >
              {stage.status}
            </span>
          </div>
          <p className="text-gray-400 text-sm font-normal mt-1 break-words">
            {stage.subtext}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isCollapsible && (
            <button
              type="button"
              onClick={handleToggle}
              className="p-2 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer rounded-lg hover:bg-gray-200/50"
              aria-label="Toggle section"
            >
              {isCollapsed ? (
                <FiChevronDown className="w-5 h-5" />
              ) : (
                <FiChevronUp className="w-5 h-5" />
              )}
            </button>
          )}

          {stage.actionText && (
            <Button
              type="button"
              onClick={stage.onActionClick}
              size={stage.actionSize || "sm"}
              leftIcon={stage.actionLeftIcon}
              rightIcon={stage.actionRightIcon}
              loading={stage.actionLoading}
              className={`shrink-0 font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-none! focus:outline-none focus:ring-0 focus:ring-transparent focus-visible:outline-none focus-visible:ring-0 active:outline-none outline-none whitespace-nowrap ${
                stage.actionText === "View"
                  ? "bg-white! text-secondary! border border-gray-200! hover:bg-gray-50! shadow-none!"
                  : stage.actionText === "Make Payment"
                    ? "bg-white! text-[#FBAB2A]! border border-gray-200! hover:bg-gray-50! shadow-none!"
                    : isOutline
                      ? "bg-white! text-secondary! border border-gray-200! hover:bg-gray-50! shadow-none!"
                      : "bg-[#FBAB2A]! text-white! hover:bg-[#E89B1F]! shadow-none!"
              }`}
            >
              {stage.actionText}
            </Button>
          )}
        </div>
      </div>

      {!isCollapsed && stage.assessors && stage.assessors.length > 0 && (
        <div className="mt-5 pt-3 border-t border-gray-200/40">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-3">
            YOUR ASSESSORS
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {stage.assessors.map((assessor) => (
              <div
                key={assessor.id}
                className={`bg-white rounded-2xl p-4 flex items-center gap-3.5 border transition-all ${
                  assessor.isHighlighted
                    ? "border-2 border-[#FBAB2A] shadow-xs"
                    : "border-gray-100 shadow-2xs"
                }`}
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100">
                  <Image
                    src={assessor.avatar}
                    alt={assessor.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <h4 className="text-black font-bold text-sm leading-snug truncate">
                    {assessor.name}
                  </h4>
                  <p className="text-gray-400 text-xs font-normal truncate mt-0.5">
                    {assessor.role}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {assessor.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#FDF2F4] text-[#A31D38] text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isCollapsed && stage.inconclusiveBanner && (
        <div className="mt-4 bg-primary/5 border border-primary/20 rounded-2xl p-5 flex flex-col gap-3">
          <div>
            <h4 className="text-primary font-bold text-sm sm:text-base">
              {stage.inconclusiveBanner.title}
            </h4>
            <p className="text-primary text-xs sm:text-sm font-normal leading-relaxed mt-1">
              {stage.inconclusiveBanner.description}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <button
              type="button"
              onClick={stage.inconclusiveBanner.onAppeal}
              className="bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Appeal
            </button>
            <button
              type="button"
              onClick={stage.inconclusiveBanner.onTakeCourse}
              className="bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Take Course
            </button>
          </div>
        </div>
      )}

      {!isCollapsed && stage.formsBannerMessage && (
        <div className="mt-4 bg-[#E5E7EB]/60 rounded-2xl p-4 sm:p-5 text-gray-800 text-xs sm:text-sm font-normal leading-relaxed">
          {stage.formsBannerMessage}
        </div>
      )}

      {!isCollapsed && stage.formsToSign && stage.formsToSign.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          {stage.formsToSign.map((form) => (
            <div
              key={form.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex flex-col">
                <h4 className="font-extrabold text-black text-sm sm:text-base underline underline-offset-3 cursor-pointer hover:text-[#A31D38] transition-colors">
                  {form.title}
                </h4>
                {form.description && (
                  <p className="text-gray-400 text-xs font-normal mt-1">
                    {form.description}
                  </p>
                )}
              </div>

              {form.signed ? (
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="bg-[#E6F4EA] border border-[#1E7F4C]/30 text-[#1E7F4C] font-bold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 select-none shadow-2xs">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-[#1E7F4C]"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    Signed
                  </div>
                  <Button
                    type="button"
                    onClick={() => stage.onOpenSignatureModal?.(form.id)}
                    variant="ghost"
                    size="icon"
                    rounded="lg"
                    aria-label="Edit signature"
                    className="text-gray-500 hover:text-black hover:bg-gray-100"
                    leftIcon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                    }
                  />
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={() => stage.onOpenSignatureModal?.(form.id)}
                  variant="outline"
                  size="sm"
                  rounded="xl"
                  className="shrink-0 border-[#FBAB2A] text-[#FBAB2A] hover:bg-amber-50/50 font-bold"
                  leftIcon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-[#FBAB2A]"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  }
                >
                  Append Signature
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {!isCollapsed && stage.competentBanner && (
        <div className="mt-4 bg-secondary rounded-lg p-6 sm:p-8 text-center text-white flex flex-col items-center justify-center shadow-xs">
          <h3 className="font-semibold text-2xl sm:text-3xl text-white mb-1.5">
            {stage.competentBanner.title}
          </h3>
          <p className="font-medium text-white text-sm sm:text-base lg:text-2xl mb-3">
            {stage.competentBanner.subtitle}
          </p>
          <p className="font-normal text-white text-xs sm:text-sm lg:text-lg leading-relaxed max-w-xl mx-auto">
            {stage.competentBanner.description}
          </p>
        </div>
      )}

      {stage.showPaymentDetails && (
        <div className="mt-4 bg-white rounded-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 border border-gray-100 shadow-2xs">
          <span className="text-black font-semibold text-xs sm:text-base break-words">
            {stage.paymentDetailsText || "Assessment Fee"}
          </span>
          <span className="text-[#a31d38] font-extrabold text-sm sm:text-xl shrink-0">
            {stage.paymentAmountText || "₦45,000"}
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
