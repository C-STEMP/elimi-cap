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

import { useGetApplications } from "@/src/features/candidate/features/Application/hooks";

export interface AssessmentOption {
  id: string;
  title: string;
  description: string;
  badge?: string;
}

const ASSESSMENT_OPTIONS: AssessmentOption[] = [
  {
    id: "rpl",
    title: "RPL",
    description: "Recognition of Prior Learning",
  },
  {
    id: "nsq",
    title: "NSQ",
    description: "National Skills Qualification",
    badge: "Coming Soon",
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
  const { data: applications = [] } = useGetApplications();

  const savedAssessmentType = useAppSelector(
    (state) =>
      state.onboarding.assessmentType || state.auth.user?.assessmentType || "",
  );
  const [selectedType, setSelectedType] = useState<string | null>(
    savedAssessmentType || null,
  );

  const handleSelectType = (id: string) => {
    if (id === "nsq") {
      toast({
        type: "info",
        title: "Coming Soon",
        description: "National Skills Qualification (NSQ) assessment is coming soon.",
      });
      return;
    }

    if (id === "rpl") {
      const existingRpl = applications.find(
        (a) => a.type === "RPL" || !a.type,
      );

      if (existingRpl) {
        if (existingRpl.status !== "draft") {
          toast({
            type: "info",
            title: "RPL Application Already Submitted",
            description:
              "You have already submitted an RPL application. You can only have one RPL application.",
          });
          router.push(`/dashboard/applications/${existingRpl.id}`);
          return;
        }

        toast({
          type: "info",
          title: "Draft Application Found",
          description:
            "You have a saved draft application. You can continue and edit your application.",
        });
        router.push("/rpl/personal-info");
        return;
      }
    }

    setSelectedType(id);
    dispatch(setAssessmentType(id));
    dispatch(setOnboardingAssessmentType(id));

    if (onSelectType) {
      onSelectType(id);
      return;
    }

    router.push("/onboarding/start-application");
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col justify-center select-text max-w-110 mx-auto"
    >
      <div className="w-full flex justify-start mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-primary font-semibold text-sm transition-colors cursor-pointer select-none focus:outline-none"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="mb-6 text-left">
        <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary">
          Select Assessment Type
        </h1>
        <p className="text-neutral-secondary text-sm leading-relaxed mt-1 font-normal">
          Choose the assessment you are interested in
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
            badge={option.badge}
            isSelected={selectedType === option.id}
            onSelect={handleSelectType}
          />
        ))}
      </div>
    </motion.div>
  );
};
