"use client";

import React, { useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "@/components/ui/info-icon";
import { StatusModal } from "@/components/ui/status-modal";
import { useToast } from "@/components/ui/toast";
import { ASSETS_URL } from "@/assets";
import { MOCK_EVIDENCE_OPTIONS } from "../utils/constants";

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
}

export const Step3Reflection: React.FC<Step3Props> = ({ onNext, onBack }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [showConfirmDraftModal, setShowConfirmDraftModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    tasks: "",
    skills: "",
    otherEvidenceText: "",
  });
  const [selectedEvidences, setSelectedEvidences] = useState<string[]>([]);

  const toggleEvidence = (option: string) => {
    if (selectedEvidences.includes(option)) {
      setSelectedEvidences(selectedEvidences.filter((item) => item !== option));
    } else {
      setSelectedEvidences([...selectedEvidences, option]);
    }
    if (errors.evidences) {
      setErrors((prev) => ({ ...prev, evidences: "" }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors: Record<string, string> = {};

    if (!formData.tasks.trim()) {
      newErrors.tasks =
        "Please describe the tasks you are most confident performing";
      valid = false;
    }
    if (!formData.skills.trim()) {
      newErrors.skills = "Please describe the skills you would like to improve";
      valid = false;
    }
    if (selectedEvidences.length === 0) {
      newErrors.evidences = "Please select at least one evidence option";
      valid = false;
    }

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
          "Please complete all reflection questions and select at least one evidence option.",
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
          Step 3 of 4: Reflect on Your Experience
        </h1>
        <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-1">
          Tell us more about your practical experience, the skills you're most
          confident in, and the evidence you can provide to support your
          competency claims.
        </p>

        <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-neutral-primary mt-4 flex items-center gap-1.5">
          Reflection Question <InfoIcon sectionName="Reflection Question" />
        </h2>
      </div>

      <form onSubmit={handleContinue} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none">
            Which tasks are you most confident performing?{" "}
            <span className="text-primary-solid ml-0.5">*</span>
          </label>
          <textarea
            name="tasks"
            rows={3}
            value={formData.tasks}
            onChange={handleChange}
            placeholder="Tell us about the work you perform confidently and the responsibilities you usually handle."
            className={`w-full bg-input-bg border ${
              errors.tasks
                ? "border-red-500 focus:border-red-500"
                : "border-transparent focus:border-primary"
            } rounded-xl p-3.5 text-xs sm:text-sm text-neutral-primary outline-none resize-none transition-colors`}
          />
          {errors.tasks && (
            <span className="text-red-500 text-xs font-normal">
              {errors.tasks}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none">
            Which skills would you like to improve?{" "}
            <span className="text-primary-solid ml-0.5">*</span>
          </label>
          <textarea
            name="skills"
            rows={3}
            value={formData.skills}
            onChange={handleChange}
            placeholder="Mention any areas where you would like additional experience, coaching, or training."
            className={`w-full bg-input-bg border ${
              errors.skills
                ? "border-red-500 focus:border-red-500"
                : "border-transparent focus:border-primary"
            } rounded-xl p-3.5 text-xs sm:text-sm text-neutral-primary outline-none resize-none transition-colors`}
          />
          {errors.skills && (
            <span className="text-red-500 text-xs font-normal">
              {errors.skills}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-neutral-primary flex items-center gap-1.5">
            Evidence Summary <InfoIcon sectionName="Evidence Summary" />
          </h2>
          <p className="text-neutral-secondary text-xs sm:text-sm font-normal">
            Which evidence can you provide? (Multiple Selection){" "}
            <span className="text-primary-solid ml-0.5">*</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MOCK_EVIDENCE_OPTIONS.map((option) => {
              const isSelected = selectedEvidences.includes(option);
              return (
                <div
                  key={option}
                  onClick={() => toggleEvidence(option)}
                  className={`
                    flex items-center justify-between p-3.5 h-20
                    bg-input-bg rounded-xl border cursor-pointer select-none transition-all duration-200
                    ${
                      isSelected
                        ? "border-secondary bg-white ring-1 ring-secondary/40 shadow-xs"
                        : errors.evidences
                          ? "border-red-500"
                          : "border-[#D9D9D980] hover:border-gray-300"
                    }
                  `}
                >
                  <span className="text-xs xl:text-sm font-medium text-text-dark leading-tight pr-2">
                    {option}
                  </span>
                  <div
                    className={`
                      w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0
                      ${
                        isSelected
                          ? "bg-secondary border-secondary text-white"
                          : "border-border-gray bg-inherit"
                      }
                    `}
                  >
                    {isSelected && <FiCheck className="w-3 h-3 stroke-3" />}
                  </div>
                </div>
              );
            })}
          </div>
          {selectedEvidences.includes("Other") && (
            <div className="mt-3 w-full animate-fadeIn">
              <Input
                label="Specify Other Evidence"
                type="text"
                placeholder="Type details of your other evidence..."
                value={formData.otherEvidenceText}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    otherEvidenceText: e.target.value,
                  }))
                }
              />
            </div>
          )}
          {errors.evidences && (
            <span className="text-red-500 text-xs font-normal mt-1">
              {errors.evidences}
            </span>
          )}
        </div>

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
