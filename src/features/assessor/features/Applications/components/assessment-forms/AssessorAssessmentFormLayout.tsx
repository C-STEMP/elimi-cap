"use client";

import { Button } from "@/src/components/ui/button";
import { Logo } from "@/src/components/ui/logo";
import { FloatingCircles } from "@/src/features/shared/authentication/components/FloatingCircles";
import React from "react";
import { FiArrowLeft } from "react-icons/fi";

interface AssessorAssessmentFormLayoutProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  isReadOnly?: boolean;
  children: React.ReactNode;
}

export const AssessorAssessmentFormLayout: React.FC<
  AssessorAssessmentFormLayoutProps
> = ({
  title,
  subtitle,
  onBack,
  onSubmit,
  submitLabel = "Submit",
  isReadOnly = false,
  children,
}) => {
  return (
    <div
      suppressHydrationWarning
      className="min-h-screen w-full flex flex-col lg:flex-row bg-primary-solid lg:bg-white font-sans antialiased overflow-hidden select-text"
    >
      {/* Mobile Top Header */}
      <div
        suppressHydrationWarning
        className="w-full bg-primary-solid pt-4 pb-6 px-6 flex flex-col gap-3 lg:hidden shrink-0 text-white relative overflow-hidden"
      >
        <FloatingCircles />
        <div className="relative z-10 flex items-center justify-between">
          <Logo theme="light" href="/" />
          <button
            type="button"
            onClick={onBack}
            className="text-white/80 hover:text-white flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <div className="relative z-10 flex flex-col gap-1 mt-2">
          <h2 className="text-xl font-extrabold tracking-tight text-white leading-tight">
            {title}
          </h2>
          <p className="text-white/80 text-xs font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Desktop Fixed Maroon Sidebar (RPL Style) */}
      <div
        suppressHydrationWarning
        className="hidden lg:flex lg:w-[35%] h-screen sticky top-0 shrink-0 bg-primary-solid flex-col justify-between p-10 xl:p-14 overflow-hidden select-none text-white"
      >
        <FloatingCircles />

        <div className="relative z-10 flex flex-col gap-6">
          <div>
            <Logo theme="light" href="/" />
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {title}
            </h1>
            <p className="text-neutral-burgundy text-xs sm:text-sm font-normal leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="relative z-10 text-white/50 text-xs">
          Elimi Competency Assessment Platform
        </div>
      </div>

      {/* Right Scrollable Form Body */}
      <div
        suppressHydrationWarning
        className="flex-1 w-full max-w-full h-screen overflow-y-auto bg-white rounded-t-4xl lg:rounded-none -mt-4 lg:mt-0 p-6 sm:p-10 md:p-12 xl:p-16 flex flex-col justify-between relative shadow-md lg:shadow-none"
      >
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 sm:gap-10 pb-12">
          {isReadOnly && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-900 text-xs sm:text-sm font-medium">
              <span>
                👁️ <strong>Read-Only View:</strong> Assessment forms are to be
                filled by the Lead Panelist.
              </span>
              <span className="bg-amber-200/80 text-amber-900 px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
                Internal Verifier View
              </span>
            </div>
          )}

          <div
            className={`flex flex-col gap-8 sm:gap-10 ${
              isReadOnly ? "pointer-events-none opacity-90 select-text" : ""
            }`}
          >
            {children}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-primary font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back
            </button>

            {!isReadOnly && (
              <Button
                type="button"
                onClick={onSubmit}
                variant="amber"
                className="h-11 px-8 bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
              >
                {submitLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
