"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
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
    <div
      suppressHydrationWarning
      className="min-h-screen w-full flex flex-col lg:flex-row bg-primary-solid lg:bg-white font-sans antialiased overflow-y-auto lg:overflow-hidden"
    >
      <div
        suppressHydrationWarning
        className="w-full bg-primary-solid pt-8 pb-10 flex items-center justify-center lg:hidden shrink-0"
      >
        <Logo theme="light" href="/" />
      </div>

      <SelfAssessmentSidebar currentStep={currentStep} />

      <div
        suppressHydrationWarning
        className="flex-1 w-full bg-white rounded-t-4xl lg:rounded-none -mt-4 lg:mt-0 p-6 sm:p-8 md:p-10 xl:p-12 flex flex-col items-center justify-start relative min-h-[calc(100vh-100px)] lg:min-h-screen lg:h-screen lg:overflow-y-auto shadow-xl lg:shadow-none"
      >
        <div
          suppressHydrationWarning
          className="w-full flex flex-col items-center my-auto py-6 sm:py-8 shrink-0"
        >
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
      </div>

      <SelfAssessmentSuccessModal
        isOpen={isSubmitted}
        onNavigateToVault={handleNavigateToVault}
      />
    </div>
  );
};

