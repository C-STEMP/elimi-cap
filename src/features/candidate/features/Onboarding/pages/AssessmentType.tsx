"use client";

import React, { useState } from "react";
import { RoleCard } from "@/src/components/ui/role-card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAssessmentType } from "@/store/slices/authSlice";
import { setOnboardingAssessmentType } from "@/store/slices/onboardingSlice";
import { createApplication as createApplicationSlice } from "@/store/slices/applicationSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";
import { useToast } from "@/src/components/ui/toast";
import { useApplication } from "@/src/features/candidate/features/Application/hooks";

export interface AssessmentOption {
  id: string;
  title: string;
  description: string;
}

const ASSESSMENT_OPTIONS: AssessmentOption[] = [
  {
    id: "rpl",
    title: "RPL",
    description: "Recognition of Prior Learning",
  },
  {
    id: "nsq",
    title: "Standard Assessment",
    description: "Standard Assessment (National Skills Qualification)",
  },
];

export interface AssessmentTypeProps {
  onSelectType?: (typeId: string) => void;
  onBack?: () => void;
}

export const AssessmentType: React.FC<AssessmentTypeProps> = ({
  onSelectType,
  onBack,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const fromSource = searchParams?.get("from");

  const { createApplication } = useApplication();
  const savedStartApplication = useAppSelector(
    (s) => s.onboarding.startApplication,
  );

  const savedAssessmentType = useAppSelector(
    (state) =>
      state.onboarding.assessmentType || state.auth.user?.assessmentType || "",
  );
  const [selectedType, setSelectedType] = useState<string | null>(
    savedAssessmentType || null,
  );
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectType = (id: string) => {
    setSelectedType(id);
    dispatch(setAssessmentType(id));
    dispatch(setOnboardingAssessmentType(id));

    if (onSelectType) {
      onSelectType(id);
      return;
    }

    // Check if centre/sector/trade are selected
    if (
      !savedStartApplication?.assessmentCenter ||
      !savedStartApplication?.sector ||
      !savedStartApplication?.trade
    ) {
      toast({
        type: "info",
        title: "Application Details Needed",
        description:
          "Please select your Assessment Centre, Sector, and Trade first.",
      });
      router.push("/dashboard/start-application");
      return;
    }

    setIsCreating(true);
    const appType = id === "rpl" ? "RPL" : "NSQ";

    createApplication.mutate(
      {
        type: appType,
        centreId: savedStartApplication.assessmentCenter,
        sectorId: savedStartApplication.sector,
        tradeId: savedStartApplication.trade,
        unitIds: [],
      },
      {
        onSuccess: (res: any) => {
          setIsCreating(false);
          const createdApp = res?.data || res;
          dispatch(
            createApplicationSlice({
              title: savedStartApplication.trade,
              subtitle: savedStartApplication.sector,
            }),
          );

          toast({
            type: "success",
            title: "Application Created",
            description: `Your ${id === "rpl" ? "RPL" : "Standard"} assessment application has been initialized.`,
          });

          if (id === "rpl") {
            router.push(
              createdApp?.id
                ? `/dashboard/applications/${createdApp.id}`
                : "/rpl/personal-info",
            );
          } else {
            router.push(
              createdApp?.id
                ? `/dashboard/applications/${createdApp.id}`
                : "/dashboard/applications",
            );
          }
        },
        onError: (err: any) => {
          setIsCreating(false);
          const errorMsg = err?.message?.toLowerCase() || "";
          const isConflict =
            errorMsg.includes("already has a draft") ||
            errorMsg.includes("in-progress application") ||
            errorMsg.includes("already exists") ||
            err?.statusCode === 409;

          if (isConflict) {
            dispatch(
              createApplicationSlice({
                title: savedStartApplication.trade,
                subtitle: savedStartApplication.sector,
              }),
            );
            toast({
              type: "info",
              title: "Existing Application Found",
              description: "Resuming your active application...",
            });
            if (id === "rpl") {
              router.push("/rpl/personal-info");
            } else {
              router.push("/dashboard/applications");
            }
          } else {
            toast({
              type: "error",
              title: "Application Error",
              description:
                err.message ||
                "Failed to create application. Please try again.",
            });
          }
        },
      },
    );
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/dashboard/start-application");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col justify-center select-text max-w-110 mx-auto"
    >
      <div className="w-full flex justify-start mb-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-primary font-semibold text-sm transition-colors cursor-pointer select-none focus:outline-none"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Create Application
        </button>
      </div>

      <div className="mb-6 text-left">
        <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary">
          Select Assessment Type
        </h1>
        <p className="text-neutral-secondary text-sm leading-relaxed mt-1 font-normal">
          Choose the assessment type you are applying for
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        {ASSESSMENT_OPTIONS.map((option, idx) => (
          <RoleCard
            key={option.id}
            id={option.id}
            index={idx}
            title={option.title}
            description={option.description}
            isSelected={selectedType === option.id}
            onSelect={handleSelectType}
          />
        ))}
      </div>

      {isCreating && (
        <div className="mt-4 text-center text-xs font-semibold text-[#a31d38] animate-pulse">
          Initializing application...
        </div>
      )}
    </motion.div>
  );
};
