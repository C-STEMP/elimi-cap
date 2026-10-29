"use client";

import { Logo } from "@/src/components/ui/logo";
import {
  useGetApplicationById,
  useGetSelfAssessment,
  useSaveSelfAssessment,
} from "@/src/features/shared/applications/hooks";
import {
  getRplScopedUnits,
  resolveAppliedTradeLevel,
} from "@/src/features/shared/applications/utils/rplTradeLevel";
import { EVIDENCE_TYPE_LABELS } from "@/src/features/shared/evidence-vault/utils/evidenceConstants";
import {
  useGetEvidenceTypesByTrade,
  useGetTradeDetail,
  useGetUnitsByTrade,
} from "@/src/features/shared/reference/hooks";
import { useAppDispatch } from "@/store/hooks";
import { markSelfAssessmentComplete } from "@/store/slices/applicationSlice";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { SelfAssessmentSidebar } from "../components/SelfAssessmentSidebar";
import { SelfAssessmentSuccessModal } from "../components/SelfAssessmentSuccessModal";
import { Step1PersonalInfo } from "../components/Step1PersonalInfo";
import { Step2Competencies } from "../components/Step2Competencies";
import { Step3Reflection } from "../components/Step3Reflection";
import { Step4Declaration } from "../components/Step4Declaration";

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

  const tradeId = apiApp?.tradeId || (apiApp?.trade as any)?.id || "";
  const { data: tradeDetail, isLoading: isLoadingTradeDetail } =
    useGetTradeDetail(tradeId);

  const { levelNumber, levelLabel } = resolveAppliedTradeLevel(
    apiApp,
    tradeDetail,
  );

  const { data: rawTradeUnits = [], isLoading: isLoadingUnits } =
    useGetUnitsByTrade(tradeId, levelNumber);
  const { data: tradeEvidenceTypes = [] } = useGetEvidenceTypesByTrade(tradeId);

  const scopedUnits = React.useMemo(
    () =>
      getRplScopedUnits({
        tradeUnits: rawTradeUnits,
        tradeDetail,
        levelNumber,
        preferredUnitIds: apiApp?.unitIds,
      }),
    [rawTradeUnits, tradeDetail, levelNumber, apiApp?.unitIds],
  );

  const competencyTitles = React.useMemo(() => {
    if (scopedUnits.length > 0) {
      return scopedUnits.map((u) =>
        u.referenceNumber ? `${u.referenceNumber}: ${u.title}` : u.title,
      );
    }
    return [];
  }, [scopedUnits]);

  const evidenceOptions = React.useMemo(
    () => [
      ...tradeEvidenceTypes.map((code) => EVIDENCE_TYPE_LABELS[code] || code),
      "Other",
    ],
    [tradeEvidenceTypes],
  );

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
    router.push(`/dashboard/applications/${id}#evidence-vault-section`);
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
    if (
      !savedSelfAssessment?.competencies ||
      !Array.isArray(savedSelfAssessment.competencies)
    ) {
      return undefined;
    }
    const savedList = savedSelfAssessment.competencies as any[];
    const result: Record<
      number,
      { confidence: string; evidence: string; experience: string }
    > = {};

    competencyTitles.forEach((title, idx) => {
      const unit = scopedUnits[idx];
      const matched =
        savedList.find((s) => {
          if (!s) return false;
          if (s.title === title) return true;
          if (
            unit?.referenceNumber &&
            s.title?.includes(unit.referenceNumber)
          ) {
            return true;
          }
          if (
            unit?.title &&
            s.title?.toLowerCase().includes(unit.title.toLowerCase())
          ) {
            return true;
          }
          return false;
        }) || (savedList[idx]?.title === title ? savedList[idx] : undefined);

      if (matched) {
        result[idx] = {
          confidence: matched.confidence || "",
          evidence: matched.evidence || "",
          experience: matched.experience || "",
        };
      }
    });

    return Object.keys(result).length > 0 ? result : undefined;
  }, [savedSelfAssessment?.competencies, competencyTitles, scopedUnits]);

  return (
    <div
      suppressHydrationWarning
      className="h-screen w-full flex flex-col lg:flex-row bg-primary-solid lg:bg-white font-sans antialiased overflow-hidden"
    >
      <div
        suppressHydrationWarning
        className="w-full bg-primary-solid pt-3 pb-5 flex items-center justify-center lg:hidden shrink-0"
      >
        <Logo theme="light" href="/" />
      </div>

      <SelfAssessmentSidebar currentStep={currentStep} />

      <div
        suppressHydrationWarning
        className="flex-1 w-full max-w-full h-screen overflow-y-auto bg-white rounded-t-4xl lg:rounded-none -mt-4 lg:mt-0 p-4 sm:p-8 md:p-10 xl:p-12 flex flex-col items-center justify-start relative shadow-md lg:shadow-none"
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
              competencies={competencyTitles}
              levelLabel={levelLabel}
              tradeName={apiApp?.trade?.name || tradeDetail?.name}
              isLoading={
                Boolean(tradeId) &&
                (isLoadingUnits || isLoadingTradeDetail) &&
                competencyTitles.length === 0
              }
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
              evidenceOptions={evidenceOptions}
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
