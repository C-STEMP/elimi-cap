"use client";

import React, { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { MOCK_EVIDENCE_OPTIONS } from "../utils/constants";

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
}

export const Step3Reflection: React.FC<Step3Props> = ({ onNext, onBack }) => {
  const [selectedEvidences, setSelectedEvidences] = useState<string[]>([]);

  const toggleEvidence = (option: string) => {
    if (selectedEvidences.includes(option)) {
      setSelectedEvidences(selectedEvidences.filter((item) => item !== option));
    } else {
      setSelectedEvidences([...selectedEvidences, option]);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-6 sm:p-8 overflow-y-auto">
      <div className="flex flex-col max-w-xl mb-6">
        <h3 className="text-[#A31D38] font-bold text-xl sm:text-2xl mb-1.5">
          Step 3 of 4: Reflect on Your Experience
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
          Tell us more about your practical experience, the skills you're most
          confident in, and the evidence you can provide to support your
          competency claims.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <h4 className="font-bold text-black text-sm sm:text-base">
          Reflection Question
        </h4>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Which tasks are you most confident performing?
          </label>
          <textarea
            rows={3}
            placeholder="Tell us about the work you perform confidently and the responsibilities you usually handle."
            className="w-full bg-input-bg border border-transparent focus:border-[#A31D38] rounded-xl p-3.5 text-xs sm:text-sm text-black outline-none resize-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Which skills would you like to improve?
          </label>
          <textarea
            rows={3}
            placeholder="Mention any areas where you would like additional experience, coaching, or training."
            className="w-full bg-input-bg border border-transparent focus:border-[#A31D38] rounded-xl p-3.5 text-xs sm:text-sm text-black outline-none resize-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Which evidence can you provide? (Multiple Selection)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MOCK_EVIDENCE_OPTIONS.map((option) => {
              const isSelected = selectedEvidences.includes(option);
              return (
                <div
                  key={option}
                  onClick={() => toggleEvidence(option)}
                  className={`bg-input-bg rounded-xl p-3.5 flex items-center justify-between cursor-pointer border transition-colors ${
                    isSelected ? "border-[#A31D38]" : "border-transparent"
                  }`}
                >
                  <span className="text-xs font-medium text-gray-800 leading-snug">
                    {option}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-[#A31D38] border-[#A31D38] text-white"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <span className="text-[10px] font-bold">✓</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
