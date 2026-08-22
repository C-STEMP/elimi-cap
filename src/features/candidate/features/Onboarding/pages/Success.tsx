"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";
import { PartyPopperIllustration } from "@/src/components/ui/svg-icons";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";

import { saveOnboardedStatus } from "@/src/lib/auth-storage";

export interface SuccessProps {
  onStartApplication?: () => void;
  onGoToDashboard?: () => void;
}

export const Success: React.FC<SuccessProps> = ({
  onStartApplication,
  onGoToDashboard,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const paramRole = searchParams.get("role");

  const effectiveRole = paramRole || userRole;

  const isAssessmentCentre =
    effectiveRole === "assessment-centre" ||
    effectiveRole === "assessment_centre" ||
    effectiveRole === "assessment-center";

  const isNonCandidate =
    isAssessmentCentre ||
    effectiveRole === "assessor" ||
    effectiveRole === "quality-assurance" ||
    effectiveRole === "quality_assurance" ||
    effectiveRole === "qaa" ||
    effectiveRole === "awarding-body" ||
    effectiveRole === "awarding_body";

  const handleStart = () => {
    saveOnboardedStatus(true);
    if (onStartApplication) {
      onStartApplication();
    } else {
      router.push("/onboarding/assessment-type");
    }
  };

  const handleDashboard = () => {
    saveOnboardedStatus(true);
    if (onGoToDashboard) {
      onGoToDashboard();
    } else if (isAssessmentCentre) {
      router.push("/assessment-centre/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-110 mx-auto flex flex-col items-center justify-center text-center select-text"
    >
      {/* Party Popper Icon */}
      <div className="mb-5 flex justify-center">
        <div className="w-24 h-24 flex items-center justify-center">
          <PartyPopperIllustration className="w-full h-full object-contain" />
        </div>
      </div>

      <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary">
        Success
      </h1>

      <h2 className="text-base xl:text-lg font-bold text-neutral-primary mt-1">
        Your workspace is ready.
      </h2>

      <div className="text-neutral-secondary text-sm xl:text-base leading-relaxed mt-4 mb-8 font-normal max-w-sm space-y-1">
        <p>Welcome to ELIMI.</p>
        {isNonCandidate ? (
          <p>
            Your credentials has been submitted for verification, you will get
            an update from us within 24hrs.
          </p>
        ) : (
          <p>Your dashboard has been configured based on your selected role.</p>
        )}
      </div>

      <div className="w-full flex flex-col gap-3.5">
        {isNonCandidate ? (
          <Button
            type="button"
            onClick={handleDashboard}
            variant="amber"
            size="md"
            className="w-full h-12.5 text-white font-bold text-base bg-[#f9a825]! hover:bg-[#e0931b]! transition-all shadow-md cursor-pointer rounded-xl"
          >
            Go to Dashboard
          </Button>
        ) : (
          <>
            <Button
              type="button"
              onClick={handleStart}
              variant="amber"
              size="md"
              className="w-full h-12.5 text-white! font-bold text-base bg-[#f9a825]! hover:bg-[#e0931b]! transition-all shadow-md cursor-pointer rounded-xl"
            >
              Start Application
            </Button>

            <Button
              type="button"
              onClick={handleDashboard}
              variant="outline"
              size="md"
              className="w-full h-12.5 text-[#f9a825]! border border-[#f9a825]! bg-white! hover:bg-amber-50/70! font-bold text-base transition-all shadow-xs cursor-pointer rounded-xl"
            >
              Go to Dashboard
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
};
