"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SelfAssessmentSidebar } from "../components/SelfAssessmentSidebar";
import { Step1PersonalInfo } from "../components/Step1PersonalInfo";
import { Step2Competencies } from "../components/Step2Competencies";
import { Step3Reflection } from "../components/Step3Reflection";
import { Step4Declaration } from "../components/Step4Declaration";
import { SelfAssessmentSuccessModal } from "../components/SelfAssessmentSuccessModal";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { markSelfAssessmentComplete } from "@/store/slices/applicationSlice";

interface SelfAssessmentPageProps {
  id?: string;
}

export const SelfAssessmentPage: React.FC<SelfAssessmentPageProps> = ({
  id,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const application = useAppSelector((state) =>
    state.application.applications.find((a) => a.id === id),
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNavigateToVault = () => {
    if (application) {
      dispatch(markSelfAssessmentComplete(application.id));
    }
    router.push(`/dashboard/applications/${id}/evidence-vault`);
  };

  if (!application) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-bold text-black mb-2">
          Application not found
        </h2>
        <button
          onClick={() => router.push("/dashboard/applications")}
          className="text-primary font-semibold hover:underline"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full min-h-screen flex flex-col lg:flex-row"
    >
      <SelfAssessmentSidebar currentStep={currentStep} />

      <div className="flex-1 flex flex-col min-w-0 bg-white relative overflow-hidden min-h-screen lg:min-h-screen lg:h-screen lg:overflow-y-auto">
        {currentStep === 1 && (
          <Step1PersonalInfo
            onNext={() => setCurrentStep(2)}
            onBack={() => router.push(`/dashboard/applications/${id}`)}
          />
        )}

        {currentStep === 2 && (
          <Step2Competencies
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3Reflection
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4Declaration
            onSubmit={() => setIsSubmitted(true)}
            onBack={() => setCurrentStep(3)}
          />
        )}
      </div>

      <SelfAssessmentSuccessModal
        isOpen={isSubmitted}
        onNavigateToVault={handleNavigateToVault}
      />
    </motion.div>
  );
};
