"use client";

import React from "react";
import { FiCheck } from "react-icons/fi";
import { Logo } from "@/components/ui/logo";

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
    <div className="bg-[#75152B] p-6 sm:p-8 text-white w-full lg:w-84 shrink-0 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative z-10 flex flex-col">
        <div className="mb-6">
          <Logo theme="light" width={85} />
        </div>

        <h2 className="text-white font-extrabold text-xl sm:text-2xl leading-tight mb-3">
          Self-Assessment of Competency
        </h2>
        <p className="text-white/80 text-xs leading-relaxed mb-2 font-normal">
          Please answer honestly. Your responses help us identify your strengths,
          determine any learning gaps, and guide your assessment journey.
        </p>
        <span className="text-white/60 text-[11px] font-medium block mb-8">
          Estimated time: 5–10 minutes
        </span>

        <div className="flex flex-col gap-6">
          {STEPS.map((step, idx) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <div key={step.id} className="flex flex-col">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isCompleted
                        ? "bg-white text-[#75152B]"
                        : isActive
                          ? "border-2 border-white text-white bg-transparent"
                          : "border border-white/40 text-white/60 bg-transparent"
                    }`}
                  >
                    {isCompleted ? (
                      <FiCheck className="w-4 h-4 stroke-[3]" />
                    ) : (
                      step.id
                    )}
                  </div>

                  <span
                    className={`text-xs sm:text-sm font-bold transition-colors ${
                      isActive || isCompleted ? "text-white" : "text-white/50"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < STEPS.length - 1 && (
                  <div className="w-0.5 h-6 bg-white/20 ml-3.5 my-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
