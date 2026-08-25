"use client";

import React from "react";
import Image from "next/image";
import { FiArrowLeft } from "react-icons/fi";
import { ASSETS_URL } from "@/src/assets";
import { Button } from "@/src/components/ui/button";

interface AssessorAssessmentFormLayoutProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  onSubmit: () => void;
  submitLabel?: string;
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
  children,
}) => {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start select-text pb-12">
      {/* Left Maroon Banner */}
      <div className="lg:col-span-4 bg-[#8A1538] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[400px] lg:min-h-[640px] shadow-sm">
        {/* Background decorative watermark */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex flex-col gap-8 relative z-10">
          <div className="w-28 h-8 relative">
            <Image
              src={ASSETS_URL.logoIcon || ASSETS_URL.logoIcon2}
              alt="Elimi Logo"
              width={112}
              height={32}
              className="object-contain brightness-0 invert"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {title}
            </h2>
            <p className="text-white/80 text-xs sm:text-sm font-normal leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs flex flex-col gap-8">
        {children}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-primary font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <Button
            type="button"
            onClick={onSubmit}
            variant="amber"
            className="h-11 px-8 bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all"
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
