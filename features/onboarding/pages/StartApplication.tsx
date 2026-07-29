"use client";

import React, { useState } from "react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { StatusModal } from "@/components/ui/status-modal";

import {
  startApplicationSchema,
  extractZodErrors,
} from "@/lib/validation";

export interface StartApplicationProps {
  onBack?: () => void;
  onContinue?: () => void;
}

const ASSESSMENT_CENTERS = [
  "Abuja Vocational & Technical Center",
  "Lagos Skill Assessment Hub",
  "Ibadan TVET Center of Excellence",
  "Port Harcourt Trade Center",
  "Enugu Vocational Institute",
  "Kano Competency Assessment Center",
];

const SECTORS = [
  "Construction & Building Services",
  "Automotive & Mechanical",
  "Electrical & Energy",
  "Hospitality & Tourism",
  "Information Technology",
  "Agriculture & Food",
];

const TRADES = [
  "Carpentry & Joinery",
  "Electrical Installation",
  "Plumbing & Pipefitting",
  "Welding & Metal Fabrication",
  "Masonry & Construction",
  "Automotive Mechanics",
  "Solar PV Installation",
  "Air Conditioning & Refrigeration",
];

export const StartApplication: React.FC<StartApplicationProps> = ({
  onBack,
  onContinue,
}) => {
  const [assessmentCenter, setAssessmentCenter] = useState("");
  const [sector, setSector] = useState("");
  const [trade, setTrade] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<{
    assessmentCenter?: string;
    sector?: string;
    trade?: string;
  }>({});

  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!assessmentCenter || !sector || !trade) {
      setErrors({
        assessmentCenter: !assessmentCenter ? "Assessment centre is required" : undefined,
        sector: !sector ? "Sector is required" : undefined,
        trade: !trade ? "Trade is required" : undefined,
      });
      toast({
        type: "error",
        title: "Selection Required",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onContinue) {
        onContinue();
      } else {
        router.push("/rpl/personal-info");
      }
    }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-110 mx-auto flex flex-col justify-center select-text"
    >
      <div className="mb-6 text-left w-full">
        <h1 className="text-2xl xl:text-[28px] font-extrabold tracking-tight text-primary">
          Start Application
        </h1>
        <p className="text-neutral-secondary text-xs xl:text-sm font-normal mt-1">
          Your journey is about to start
        </p>

        <h2 className="text-xl xl:text-2xl font-extrabold tracking-tight text-neutral-primary mt-6">
          Centre Information
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        <Select
          label={
            <span>
              Assessment Centre
              <span className="text-primary-solid ml-0.5">*</span>
            </span>
          }
          placeholder="Select"
          options={ASSESSMENT_CENTERS}
          value={assessmentCenter}
          error={errors.assessmentCenter}
          onChange={(e) => {
            setAssessmentCenter(e.target.value);
            if (errors.assessmentCenter)
              setErrors((prev) => ({ ...prev, assessmentCenter: undefined }));
          }}
        />

        <Select
          label={
            <span>
              Sector<span className="text-primary-solid ml-0.5">*</span>
            </span>
          }
          placeholder="Select"
          options={SECTORS}
          value={sector}
          error={errors.sector}
          onChange={(e) => {
            setSector(e.target.value);
            if (errors.sector)
              setErrors((prev) => ({ ...prev, sector: undefined }));
          }}
        />

        <Select
          label={
            <span>
              Trade<span className="text-primary-solid ml-0.5">*</span>
            </span>
          }
          placeholder="Select"
          options={TRADES}
          value={trade}
          error={errors.trade}
          onChange={(e) => {
            setTrade(e.target.value);
            if (errors.trade)
              setErrors((prev) => ({ ...prev, trade: undefined }));
          }}
        />

        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={onBack || (() => router.back())}
            className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-primary font-semibold text-sm transition-colors cursor-pointer select-none focus:outline-none"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={isSubmitting}
            className="px-8 h-11 bg-secondary hover:bg-secondary-hover text-white font-bold text-sm rounded-lg flex items-center gap-2 shadow-sm cursor-pointer"
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : (
              <>
                Continue
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </form>

      <StatusModal
        isOpen={showSuccessModal}
        type="success"
        title="Application Submitted"
        description="Your assessment center and trade selections have been recorded!"
        actionLabel="Go to Dashboard"
        onAction={() => router.push("/dashboard?status=submitted")}
      />
    </motion.div>
  );
};
