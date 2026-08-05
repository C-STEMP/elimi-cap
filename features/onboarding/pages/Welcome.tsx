"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export interface WelcomeProps {
  onGetStarted?: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onGetStarted }) => {
  const router = useRouter();

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      router.push("/onboarding/role-selection");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-110 mx-auto flex flex-col justify-center select-text"
    >
      <div className="mb-6 text-left w-full">
        <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary">
          Welcome to ELIMI
        </h1>
        <h2 className="text-neutral-primary font-semibold text-base mt-2 mb-4">
          Build skills. Get certified. Grow your career.
        </h2>

        <p className="text-neutral-primary text-[14px] xl:text-[14.5px] leading-relaxed font-normal">
          ELIMI is Nigeria's digital TVET ecosystem for competency-based
          learning, skills assessment, certification, and employment.
        </p>

        <p className="text-neutral-primary text-[14px] xl:text-[14.5px] leading-relaxed mb-6 mt-2 font-normal">
          We'll ask you a few questions to personalize your experience.
        </p>

        <p className="text-neutral-primary text-sm xl:text-base mb-6">
          Estimated time: 2–3 minutes.
        </p>
      </div>

      <div className="w-full">
        <Button
          type="button"
          onClick={handleGetStarted}
          variant="secondary"
          size="md"
          className="w-full h-12.5 text-white font-bold text-base bg-secondary hover:bg-secondary-hover focus:ring-secondary/30 transition-all shadow-lg cursor-pointer"
        >
          Get Started
        </Button>
      </div>
    </motion.div>
  );
};
