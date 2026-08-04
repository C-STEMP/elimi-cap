"use client";

import React from "react";
import { FiCheck } from "react-icons/fi";
import { Logo } from "@/components/ui/logo";
import { FloatingCircles } from "@/features/auth/components/FloatingCircles";

interface SelfAssessmentSidebarProps {
  currentStep: number;
}

const STEPS = [
  { id: 1, label: "Personal Information" },
  { id: 2, label: "Competencies" },
  { id: 3, label: "Reflection" },
  { id: 4, label: "Declaration" },
];

export const SelfAssessmentSidebar: React.FC<SelfAssessmentSidebarProps> = ({
  currentStep,
}) => {
  return (
    <div
      suppressHydrationWarning
      className="hidden lg:flex lg:w-[40%] h-full min-h-screen lg:min-h-0 sticky top-0 shrink-0 bg-primary-solid flex-col justify-between p-8 xl:p-12 overflow-hidden select-none"
    >
      <FloatingCircles />

      <div
        suppressHydrationWarning
        className="relative z-10 flex flex-col h-full justify-between"
      >
        <div suppressHydrationWarning className="flex flex-col gap-8">
          <div suppressHydrationWarning>
            <Logo theme="light" />
          </div>

          <div suppressHydrationWarning className="flex flex-col gap-6 mt-4">
            <h2 className="text-neutral-burgundy text-2xl xl:text-[34px] font-extrabold tracking-tight">
              Self-Assessment of Competency
            </h2>

            <div
              suppressHydrationWarning
              className="flex flex-col gap-0 mt-4"
            >
              {STEPS.map((step, idx) => {
                const isActive = currentStep === step.id;
                const isPast = currentStep > step.id;
                const isLast = idx === STEPS.length - 1;

                return (
                  <div key={step.id} className="flex flex-col gap-5">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div
                        className={`w-8 h-8 rounded-full border flex items-center justify-center font-semibold text-xs transition-all ${
                          isPast
                            ? "border-white bg-white text-primary font-bold"
                            : isActive
                              ? "border-white bg-transparent text-white font-bold"
                              : "border-white/40 text-white/50"
                        }`}
                      >
                        {isPast ? (
                          <FiCheck className="w-4 h-4 text-primary stroke-3" />
                        ) : (
                          step.id
                        )}
                      </div>

                      <span
                        className={`text-base xl:text-2xl font-medium transition-colors ${
                          isActive || isPast
                            ? "text-neutral-burgundy font-semibold"
                            : "text-neutral-burgundy/60"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>

                    {!isLast && (
                      <div
                        className={`w-1.25 h-8 rounded-[10px] border border-white ml-3.5 mb-5 ${
                          isPast ? "bg-white" : "bg-inherit"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

