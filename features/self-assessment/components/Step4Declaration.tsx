"use client";

import React, { useState } from "react";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface Step4Props {
  onSubmit: () => void;
  onBack: () => void;
}

export const Step4Declaration: React.FC<Step4Props> = ({ onSubmit, onBack }) => {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
    4: false,
  });

  const toggleCheck = (id: number) => {
    setCheckedItems({ ...checkedItems, [id]: !checkedItems[id] });
  };

  return (
    <div className="flex flex-col flex-1 p-6 sm:p-8 overflow-y-auto">
      <div className="flex flex-col max-w-xl mb-6">
        <h3 className="text-[#A31D38] font-bold text-xl sm:text-2xl mb-1.5">
          Step 4 of 4: Candidate Declaration
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
          Please confirm the information below before submitting your self-assessment.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <h4 className="font-bold text-black text-sm sm:text-base">
          Declaration
        </h4>

        <div
          onClick={() => toggleCheck(1)}
          className="flex items-start gap-3 cursor-pointer select-none"
        >
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
              checkedItems[1]
                ? "bg-[#A31D38] text-white"
                : "border border-gray-300 bg-white"
            }`}
          >
            {checkedItems[1] && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <span className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed">
            I confirm that the information provided in this self-assessment is true and
            based on my own knowledge, skills, and work experience.
          </span>
        </div>

        <div
          onClick={() => toggleCheck(2)}
          className="flex items-start gap-3 cursor-pointer select-none"
        >
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
              checkedItems[2]
                ? "bg-[#A31D38] text-white"
                : "border border-gray-300 bg-white"
            }`}
          >
            {checkedItems[2] && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <span className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed">
            I understand that this self-assessment will be reviewed as part of my RPL
            application.
          </span>
        </div>

        <div
          onClick={() => toggleCheck(3)}
          className="flex items-start gap-3 cursor-pointer select-none"
        >
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
              checkedItems[3]
                ? "bg-[#A31D38] text-white"
                : "border border-gray-300 bg-white"
            }`}
          >
            {checkedItems[3] && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <span className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed">
            I understand that additional evidence may be requested during the
            assessment process.
          </span>
        </div>

        <div
          onClick={() => toggleCheck(4)}
          className="flex items-start gap-3 cursor-pointer select-none"
        >
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
              checkedItems[4]
                ? "bg-[#A31D38] text-white"
                : "border border-gray-300 bg-white"
            }`}
          >
            {checkedItems[4] && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <span className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed">
            I agree to the ELIMI{" "}
            <span className="text-[#A31D38] font-bold underline cursor-pointer">
              Terms & Conditions
            </span>{" "}
            and{" "}
            <span className="text-[#A31D38] font-bold underline cursor-pointer">
              Privacy Policy
            </span>
            .
          </span>
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
          onClick={onSubmit}
          variant="amber"
          size="lg"
          rounded="xl"
          rightIcon={<FiArrowRight className="w-4 h-4 stroke-[2.5]" />}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};
