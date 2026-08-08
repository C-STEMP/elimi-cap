"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { SelfAssessmentSidebar } from "@/features/self-assessment/components/SelfAssessmentSidebar";
import { Step1PersonalInfo } from "@/features/self-assessment/components/Step1PersonalInfo";
import { Step2Competencies } from "@/features/self-assessment/components/Step2Competencies";
import { Step3Reflection } from "@/features/self-assessment/components/Step3Reflection";
import { Step4Declaration } from "@/features/self-assessment/components/Step4Declaration";
import { SelfAssessmentSuccessModal } from "@/features/self-assessment/components/SelfAssessmentSuccessModal";

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
}

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  isOpen,
  onClose,
  applicationId,
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleClose = () => {
    setCurrentStep(1);
    setIsSubmitted(false);
    onClose();
  };

  const handleNavigateToVault = () => {
    handleClose();
    router.push(`/dashboard/applications/${applicationId}/evidence-vault`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-[28px] max-w-5xl w-full shadow-2xl relative flex flex-col lg:flex-row h-[90vh] lg:h-[82vh] overflow-hidden border border-gray-100"
        >
          <Button
            type="button"
            onClick={handleClose}
            variant="ghost"
            size="icon"
            rounded="full"
            aria-label="Close self-assessment"
            className="absolute top-5 right-5 z-20 w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black"
            leftIcon={<FiX className="w-4 h-4 stroke-[2.5]" />}
          />

          <SelfAssessmentSidebar currentStep={currentStep} />

          <div className="flex-1 flex flex-col min-w-0 bg-white relative overflow-hidden">
            {currentStep === 1 && (
              <Step1PersonalInfo
                onNext={() => setCurrentStep(2)}
                onBack={handleClose}
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
        </motion.div>

        <SelfAssessmentSuccessModal
          isOpen={isSubmitted}
          onNavigateToVault={handleNavigateToVault}
        />
      </div>
    </AnimatePresence>
  );
};
