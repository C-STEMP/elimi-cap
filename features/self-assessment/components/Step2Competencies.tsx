"use client";

import React, { useState } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Select } from "@/src/components/ui/select";
import { InfoIcon } from "@/src/components/ui/info-icon";
import { StatusModal } from "@/src/components/ui/status-modal";
import { useToast } from "@/src/components/ui/toast";
import { ASSETS_URL } from "@/assets";
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
  const router = useRouter();
  const { toast } = useToast();
  const [showConfirmDraftModal, setShowConfirmDraftModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [competencyAnswers, setCompetencyAnswers] = useState<
    Record<number, { confidence: string; evidence: string; experience: string }>
  >({});

  const handleConfidenceChange = (idx: number, val: string) => {
    setCompetencyAnswers((prev) => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        confidence: val,
        experience: prev[idx]?.experience || "",
      },
    }));
    if (errors[`confidence_${idx}`]) {
      setErrors((prev) => ({ ...prev, [`confidence_${idx}`]: "" }));
    }
  };

  const handleEvidenceChange = (idx: number, val: string) => {
    setCompetencyAnswers((prev) => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        evidence: val,
        experience: prev[idx]?.experience || "",
      },
    }));
    if (errors[`evidence_${idx}`]) {
      setErrors((prev) => ({ ...prev, [`evidence_${idx}`]: "" }));
    }
  };

  const handleExperienceChange = (idx: number, val: string) => {
    setCompetencyAnswers((prev) => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        confidence: prev[idx]?.confidence || "",
        evidence: prev[idx]?.evidence || "",
        experience: val,
      },
    }));
    if (errors[`experience_${idx}`]) {
      setErrors((prev) => ({ ...prev, [`experience_${idx}`]: "" }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors: Record<string, string> = {};

    MOCK_COMPETENCIES.forEach((_, idx) => {
      const ans = competencyAnswers[idx];
      if (!ans?.confidence) {
        newErrors[`confidence_${idx}`] = "Please select your confidence level";
        valid = false;
      }
      if (!ans?.evidence) {
        newErrors[`evidence_${idx}`] = "Please select an evidence option";
        valid = false;
      }
      if (!ans?.experience || !ans.experience.trim()) {
        newErrors[`experience_${idx}`] = "Please describe your experience";
        valid = false;
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast({
        type: "error",
        title: "Input Required",
        description:
          "Please complete all competency questions before continuing.",
      });
      return;
    }
    onNext();
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
          Step 2 of 4: Assess Your Competencies
        </h1>
        <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-1">
          Review each competency below and honestly assess your current level of
          experience. Your responses help us understand your strengths, identify
          any learning gaps, and prepare you for the RPL assessment.
        </p>

        <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-neutral-primary mt-4 flex items-center gap-1.5">
          Competency Assessment <InfoIcon sectionName="Competency Assessment" />
        </h2>
      </div>

      <form onSubmit={handleContinue} className="flex flex-col gap-6">
        {MOCK_COMPETENCIES.map((title, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-4 pb-6 border-b border-gray-100/80"
          >
            <h3 className="font-extrabold text-neutral-primary text-base xl:text-lg">
              {title}
            </h3>

            <Select
              label={
                <span>
                  How confident are you performing this competency?
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              options={CONFIDENCE_OPTIONS}
              placeholder="Select"
              value={competencyAnswers[idx]?.confidence || ""}
              error={errors[`confidence_${idx}`]}
              onChange={(e) => handleConfidenceChange(idx, e.target.value)}
            />

            <Select
              label={
                <span>
                  Can you provide evidence for this competency?
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              options={EVIDENCE_OPTIONS}
              placeholder="Select"
              value={competencyAnswers[idx]?.evidence || ""}
              error={errors[`evidence_${idx}`]}
              onChange={(e) => handleEvidenceChange(idx, e.target.value)}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none">
                Tell us about your experience{" "}
                <span className="text-primary-solid ml-0.5">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Describe a real situation where you demonstrated this competency."
                value={competencyAnswers[idx]?.experience || ""}
                onChange={(e) => handleExperienceChange(idx, e.target.value)}
                className={`w-full bg-input-bg border ${
                  errors[`experience_${idx}`]
                    ? "border-red-500 focus:border-red-500"
                    : "border-transparent focus:border-primary"
                } rounded-xl p-3.5 text-xs sm:text-sm text-neutral-primary outline-none resize-none transition-colors`}
              />
              {errors[`experience_${idx}`] && (
                <span className="text-red-500 text-xs font-normal">
                  {errors[`experience_${idx}`]}
                </span>
              )}
            </div>
          </div>
        ))}

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
              onClick={() => setShowConfirmDraftModal(true)}
              className="px-5 h-11 bg-white border border-secondary text-secondary hover:bg-secondary/10 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer whitespace-nowrap"
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
              className="px-8 h-11 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
            >
              Continue
            </Button>
          </div>
        </div>
      </form>

      <StatusModal
        isOpen={showConfirmDraftModal}
        variant="save-draft-confirm"
        onClose={() => setShowConfirmDraftModal(false)}
        onAction={() => {
          setShowConfirmDraftModal(false);
          setShowDraftModal(true);
        }}
      />

      <StatusModal
        isOpen={showDraftModal}
        variant="draft-saved"
        onClose={() => setShowDraftModal(false)}
        onAction={() => router.push("/dashboard")}
      />
    </motion.div>
  );
};
