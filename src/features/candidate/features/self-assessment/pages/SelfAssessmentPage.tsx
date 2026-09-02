"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/src/components/ui/logo";
import { SelfAssessmentSidebar } from "../components/SelfAssessmentSidebar";
import { Step1PersonalInfo } from "../components/Step1PersonalInfo";
import { Step2Competencies } from "../components/Step2Competencies";
import { Step3Reflection } from "../components/Step3Reflection";
import { Step4Declaration } from "../components/Step4Declaration";
import { SelfAssessmentSuccessModal } from "../components/SelfAssessmentSuccessModal";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { markSelfAssessmentComplete } from "@/store/slices/applicationSlice";
import {
  useGetApplicationById,
  useGetSelfAssessment,
  useSaveSelfAssessment,
} from "@/src/features/shared/applications/hooks";

interface SelfAssessmentPageProps {
  id?: string;
}

export const SelfAssessmentPage: React.FC<SelfAssessmentPageProps> = ({
  id = "",
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: apiApp } = useGetApplicationById(id);
  const { data: savedSelfAssessment } = useGetSelfAssessment(id);
  const saveSelfAssessmentMutation = useSaveSelfAssessment(id);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [competenciesData, setCompetenciesData] = useState<any[]>(
    (savedSelfAssessment?.competencies as any) || [],
  );
  const [reflectionData, setReflectionData] = useState<any>(
    savedSelfAssessment?.reflection || {},
  );

  const handleNavigateToVault = () => {
    if (id) {
      dispatch(markSelfAssessmentComplete(id));
    }
    router.push(`/dashboard/applications/${id}/evidence-vault`);
  };

  const handleSubmitSelfAssessment = (finalDeclaration?: any) => {
    const payload = {
      competencies: competenciesData.length
        ? competenciesData
        : (savedSelfAssessment?.competencies as any) || [],
      reflection:
        reflectionData && Object.keys(reflectionData).length
          ? reflectionData
          : savedSelfAssessment?.reflection || {},
      declaration: finalDeclaration ||
        savedSelfAssessment?.declaration || { allConfirmed: true },
      submit: true,
    };

    saveSelfAssessmentMutation.mutate(payload, {
      onSuccess: () => {
        if (id) {
          dispatch(markSelfAssessmentComplete(id));
        }
        setIsSubmitted(true);
      },
      onError: () => {
        if (id) {
          dispatch(markSelfAssessmentComplete(id));
        }
        setIsSubmitted(true);
      },
    });
  };

  const initialCompetencies = React.useMemo(() => {
    if (!savedSelfAssessment?.competencies || !Array.isArray(savedSelfAssessment.competencies)) {
      return undefined;
    }
    return savedSelfAssessment.competencies.reduce((acc: any, item: any, idx: number) => {
      const index = item.index !== undefined ? item.index : idx;
      acc[index] = {
        confidence: item.confidence || "",
        evidence: item.evidence || "",
        experience: item.experience || "",
      };
      return acc;
    }, {});
  }, [savedSelfAssessment?.competencies]);

  return (
    <div
      suppressHydrationWarning
      className="h-screen w-full flex flex-col lg:flex-row bg-primary-solid lg:bg-white font-sans antialiased overflow-hidden"
    >
      <div
        suppressHydrationWarning
        className="w-full bg-primary-solid py-4 flex items-center justify-center lg:hidden shrink-0"
      >
        <Logo theme="light" href="/" />
      </div>

      <SelfAssessmentSidebar currentStep={currentStep} />

      <div
        suppressHydrationWarning
        className="flex-1 w-full h-screen overflow-y-auto bg-white rounded-t-4xl lg:rounded-none -mt-8 lg:mt-0 px-6 xl:px-12 flex flex-col items-center justify-start relative shadow-md lg:shadow-none"
      >
        <div
          suppressHydrationWarning
          className="w-full flex flex-col items-center my-auto py-6 shrink-0"
        >
          {currentStep === 1 && (
            <Step1PersonalInfo
              application={apiApp}
              onNext={() => setCurrentStep(2)}
              onBack={() => router.push(`/dashboard/applications/${id}`)}
            />
          )}

          {currentStep === 2 && (
            <Step2Competencies
              initialData={initialCompetencies}
              onNext={(data) => {
                if (data) setCompetenciesData(data);
                setCurrentStep(3);
              }}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3Reflection
              initialData={savedSelfAssessment?.reflection}
              onNext={(data) => {
                if (data) setReflectionData(data);
                setCurrentStep(4);
              }}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <Step4Declaration
              initialData={savedSelfAssessment?.declaration}
              onSubmit={(decl) => handleSubmitSelfAssessment(decl)}
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
