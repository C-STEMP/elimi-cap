"use client";

import React, { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { MOCK_COMPETENCIES } from "../utils/constants";

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

const CONFIDENCE_OPTIONS = [
  { label: "Highly Confident", value: "high" },
  { label: "Moderately Confident", value: "moderate" },
  { label: "Developing Skill", value: "developing" },
];

const EVIDENCE_OPTIONS = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

export const Step2Competencies: React.FC<Step2Props> = ({ onNext, onBack }) => {
  const [competencyAnswers, setCompetencyAnswers] = useState<
    Record<number, { confidence: string; evidence: string; experience: string }>
  >({});

  const handleConfidenceChange = (idx: number, val: string) => {
    setCompetencyAnswers((prev) => ({
      ...prev,
      [idx]: { ...prev[idx], confidence: val },
    }));
  };

  const handleEvidenceChange = (idx: number, val: string) => {
    setCompetencyAnswers((prev) => ({
      ...prev,
      [idx]: { ...prev[idx], evidence: val },
    }));
  };

  return (
    <div className="flex flex-col flex-1 p-6 sm:p-8 overflow-y-auto">
      <div className="flex flex-col max-w-xl mb-6">
        <h3 className="text-[#A31D38] font-bold text-xl sm:text-2xl mb-1.5">
          Step 2 of 4: Assess Your Competencies
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
          Review each competency below and honestly assess your current level of
          experience. Your responses help us understand your strengths, identify
          any learning gaps, and prepare you for the RPL assessment.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {MOCK_COMPETENCIES.map((title, idx) => (
          <div key={idx} className="space-y-3 pb-4 border-b border-gray-100/80">
            <h4 className="font-bold text-black text-sm sm:text-base">
              {title}
            </h4>

            <Select
              label={
                <span>
                  How confident are you performing this competency?
                  <span className="text-red-500">*</span>
                </span>
              }
              options={CONFIDENCE_OPTIONS}
              placeholder="Select"
              value={competencyAnswers[idx]?.confidence || ""}
              onChange={(e) => handleConfidenceChange(idx, e.target.value)}
            />

            <Select
              label={
                <span>
                  Can you provide evidence for this competency?
                  <span className="text-red-500">*</span>
                </span>
              }
              options={EVIDENCE_OPTIONS}
              placeholder="Select"
              value={competencyAnswers[idx]?.evidence || ""}
              onChange={(e) => handleEvidenceChange(idx, e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Tell us about your experience
              </label>
              <textarea
                rows={2}
                placeholder="Describe a real situation where you demonstrated this competency."
                className="w-full bg-input-bg border border-transparent focus:border-[#A31D38] rounded-xl p-3.5 text-xs sm:text-sm text-black outline-none resize-none transition-colors"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <Button
          type="button"
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-800 font-semibold"
        >
          &larr; Back
        </Button>

        <Button
          type="button"
          onClick={onNext}
          variant="amber"
          size="lg"
          rounded="xl"
          rightIcon={<FiArrowRight className="w-4 h-4 stroke-[2.5]" />}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
