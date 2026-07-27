"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  setRole,
  setAssessmentType,
  setSidebarVariant,
  setRplStep,
} from "@/store/slices/authSlice";
import { Welcome } from "@/features/onboarding/pages/Welcome";
import { RoleSelection } from "@/features/onboarding/pages/RoleSelection";
import { AssessmentType } from "@/features/onboarding/pages/AssessmentType";
import { PersonalInfo } from "@/features/onboarding/pages/PersonalInfo";
import { Success } from "@/features/onboarding/pages/Success";
import { StartApplication } from "@/features/onboarding/pages/StartApplication";
import { RPLPersonalInfo } from "@/features/rpl/pages/PersonalInfo";
import { RPLExperienceTrade } from "@/features/rpl/pages/ExperienceTrade";
import { RPLVerifyIdentity } from "@/features/rpl/pages/VerifyIdentity";
import { RPLReviewSubmit } from "@/features/rpl/pages/ReviewSubmit";
import { AnimatePresence, motion } from "framer-motion";

type WizardStep =
  | "welcome"
  | "role-selection"
  | "assessment-type"
  | "complete-profile"
  | "success"
  | "start-application"
  | "rpl-personal-info"
  | "rpl-experience-trade"
  | "rpl-verify-identity"
  | "rpl-review-submit";

export const OnboardingWizard: React.FC = () => {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<WizardStep>("welcome");

  useEffect(() => {
    if (step === "rpl-personal-info") {
      dispatch(setSidebarVariant("rpl-form"));
      dispatch(setRplStep(1));
    } else if (step === "rpl-experience-trade") {
      dispatch(setSidebarVariant("rpl-form"));
      dispatch(setRplStep(2));
    } else if (step === "rpl-verify-identity") {
      dispatch(setSidebarVariant("rpl-form"));
      dispatch(setRplStep(3));
    } else if (step === "rpl-review-submit") {
      dispatch(setSidebarVariant("rpl-form"));
      dispatch(setRplStep(4));
    } else {
      dispatch(setSidebarVariant("default"));
    }
  }, [step, dispatch]);

  const handleSelectRole = (roleId: string) => {
    dispatch(setRole(roleId));
    if (roleId === "candidate") {
      setTimeout(() => setStep("assessment-type"), 150);
    }
  };

  const handleSelectAssessmentType = (typeId: string) => {
    dispatch(setAssessmentType(typeId));
    setTimeout(() => setStep("complete-profile"), 150);
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            <Welcome onGetStarted={() => setStep("role-selection")} />
          </motion.div>
        )}

        {step === "role-selection" && (
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            <RoleSelection
              onSelectRole={handleSelectRole}
              onBack={() => setStep("welcome")}
            />
          </motion.div>
        )}

        {step === "assessment-type" && (
          <motion.div
            key="assessment-type"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            <AssessmentType
              onSelectType={handleSelectAssessmentType}
              onBack={() => setStep("role-selection")}
            />
          </motion.div>
        )}

        {step === "complete-profile" && (
          <motion.div
            key="complete-profile"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            <PersonalInfo
              onBack={() => setStep("assessment-type")}
              onSuccess={() => setStep("success")}
            />
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            <Success onStartApplication={() => setStep("start-application")} />
          </motion.div>
        )}

        {step === "start-application" && (
          <motion.div
            key="start-application"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            <StartApplication
              onBack={() => setStep("success")}
              onContinue={() => setStep("rpl-personal-info")}
            />
          </motion.div>
        )}

        {step === "rpl-personal-info" && (
          <motion.div
            key="rpl-personal-info"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            <RPLPersonalInfo
              onBack={() => setStep("start-application")}
              onSuccess={() => setStep("rpl-experience-trade")}
            />
          </motion.div>
        )}

        {step === "rpl-experience-trade" && (
          <motion.div
            key="rpl-experience-trade"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            <RPLExperienceTrade
              onBack={() => setStep("rpl-personal-info")}
              onContinue={() => setStep("rpl-verify-identity")}
            />
          </motion.div>
        )}

        {step === "rpl-verify-identity" && (
          <motion.div
            key="rpl-verify-identity"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            <RPLVerifyIdentity
              onBack={() => setStep("rpl-experience-trade")}
              onContinue={() => setStep("rpl-review-submit")}
              onReviewPersonalInfo={() => setStep("rpl-personal-info")}
            />
          </motion.div>
        )}

        {step === "rpl-review-submit" && (
          <motion.div
            key="rpl-review-submit"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            <RPLReviewSubmit
              onBack={() => setStep("rpl-verify-identity")}
              onSubmit={() => setStep("success")}
              onEditStep={(s) => {
                if (s === 1) setStep("rpl-personal-info");
                else if (s === 2) setStep("rpl-experience-trade");
                else if (s === 3) setStep("rpl-verify-identity");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
