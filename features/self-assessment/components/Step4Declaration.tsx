"use client";

import React, { useState } from "react";
import { FiCheck, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "@/components/ui/info-icon";
import { StatusModal } from "@/components/ui/status-modal";
import { useToast } from "@/components/ui/toast";
import { ASSETS_URL } from "@/assets";

interface Step4Props {
  onSubmit: () => void;
  onBack: () => void;
}

export const Step4Declaration: React.FC<Step4Props> = ({ onSubmit, onBack }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  const toggleCheck = (id: number) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
    if (showErrorAlert) {
      setShowErrorAlert(false);
    }
  };

  const allChecked =
    checkedItems[1] && checkedItems[2] && checkedItems[3] && checkedItems[4];

  const handleSubmitForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!allChecked) {
      setShowErrorAlert(true);
      toast({
        type: "error",
        title: "Declaration Required",
        description: "Please confirm all declarations before submitting your self-assessment.",
      });
      return;
    }
    onSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col gap-6 select-text max-w-2xl mx-auto pb-12"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl xl:text-[26px] font-extrabold tracking-tight text-primary">
          Step 4 of 4: Candidate Declaration
        </h1>
        <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-1">
          Please confirm the information below before submitting your self-assessment.
        </p>

        <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-neutral-primary mt-4 flex items-center gap-1.5">
          Declaration <InfoIcon sectionName="Declaration" />
        </h2>
      </div>

      <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
        <label
          onClick={() => toggleCheck(1)}
          className="flex items-start gap-3 cursor-pointer group select-none"
        >
          <div
            className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-all shrink-0 ${
              checkedItems[1]
                ? "bg-primary border-primary text-white"
                : showErrorAlert
                ? "bg-white border-red-500"
                : "bg-white border-gray-300 group-hover:border-gray-400"
            }`}
          >
            {checkedItems[1] && <FiCheck className="w-3.5 h-3.5 stroke-3" />}
          </div>
          <span className="text-sm xl:text-base text-neutral-primary font-medium leading-6">
            I confirm that the information provided in this self-assessment is true and
            based on my own knowledge, skills, and work experience. <span className="text-primary-solid ml-0.5">*</span>
          </span>
        </label>

        <label
          onClick={() => toggleCheck(2)}
          className="flex items-start gap-3 cursor-pointer group select-none"
        >
          <div
            className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-all shrink-0 ${
              checkedItems[2]
                ? "bg-primary border-primary text-white"
                : showErrorAlert
                ? "bg-white border-red-500"
                : "bg-white border-gray-300 group-hover:border-gray-400"
            }`}
          >
            {checkedItems[2] && <FiCheck className="w-3.5 h-3.5 stroke-3" />}
          </div>
          <span className="text-sm xl:text-base text-neutral-primary font-medium leading-6">
            I understand that this self-assessment will be reviewed as part of my RPL
            application. <span className="text-primary-solid ml-0.5">*</span>
          </span>
        </label>

        <label
          onClick={() => toggleCheck(3)}
          className="flex items-start gap-3 cursor-pointer group select-none"
        >
          <div
            className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-all shrink-0 ${
              checkedItems[3]
                ? "bg-primary border-primary text-white"
                : showErrorAlert
                ? "bg-white border-red-500"
                : "bg-white border-gray-300 group-hover:border-gray-400"
            }`}
          >
            {checkedItems[3] && <FiCheck className="w-3.5 h-3.5 stroke-3" />}
          </div>
          <span className="text-sm xl:text-base text-neutral-primary font-medium leading-6">
            I understand that additional evidence may be requested during the
            assessment process. <span className="text-primary-solid ml-0.5">*</span>
          </span>
        </label>

        <label
          onClick={() => toggleCheck(4)}
          className="flex items-start gap-3 cursor-pointer group select-none"
        >
          <div
            className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-all shrink-0 ${
              checkedItems[4]
                ? "bg-primary border-primary text-white"
                : showErrorAlert
                ? "bg-white border-red-500"
                : "bg-white border-gray-300 group-hover:border-gray-400"
            }`}
          >
            {checkedItems[4] && <FiCheck className="w-3.5 h-3.5 stroke-3" />}
          </div>
          <span className="text-sm xl:text-base text-neutral-primary font-medium leading-6">
            I agree to the ELIMI{" "}
            <span className="text-primary font-bold underline cursor-pointer">
              Terms & Conditions
            </span>{" "}
            and{" "}
            <span className="text-primary font-bold underline cursor-pointer">
              Privacy Policy
            </span>
            . <span className="text-primary-solid ml-0.5">*</span>
          </span>
        </label>

        {showErrorAlert && !allChecked && (
          <span className="text-red-500 text-xs font-normal mt-1">
            Please check all declaration boxes to complete submission.
          </span>
        )}

        <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100 gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-primary font-semibold text-sm transition-colors cursor-pointer select-none focus:outline-none"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowDraftModal(true)}
              className="px-5 h-11 bg-white border border-secondary text-secondary hover:bg-secondary/10 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <span>Save As Draft</span>
              <Image
                src={ASSETS_URL.saveIcon}
                alt="Save icon"
                width={20}
                height={20}
                className="w-5 h-5 shrink-0"
                style={{ width: "auto", height: "auto" }}
              />
            </button>

            <Button
              type="submit"
              variant="amber"
              size="md"
              rightIcon={<FiArrowRight className="w-4.5 h-4.5" />}
              className="px-8 h-11 text-white font-bold text-sm rounded-xl shadow-sm cursor-pointer whitespace-nowrap"
            >
              Submit
            </Button>
          </div>
        </div>
      </form>

      <StatusModal
        isOpen={showDraftModal}
        variant="draft-saved"
        onClose={() => setShowDraftModal(false)}
        onAction={() => router.push("/dashboard")}
      />
    </motion.div>
  );
};


