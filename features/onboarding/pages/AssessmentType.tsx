"use client";

import React from "react";
import { RoleCard } from "@/components/ui/role-card";
import { useAppDispatch } from "@/store/hooks";
import { setAssessmentType } from "@/store/slices/authSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";

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
    title: "NSQ",
    description: "National Skills Qualification",
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
  const searchParams = useSearchParams();
  const fromSource = searchParams?.get("from");

  const [selectedType, setSelectedType] = React.useState<string | null>(null);

  const handleSelectType = (id: string) => {
    setSelectedType(id);
    dispatch(setAssessmentType(id));

    if (onSelectType) {
      onSelectType(id);
    } else {
      setTimeout(() => {
        if (fromSource === "role") {
          router.push("/onboarding/personal-info");
        } else {
          router.push("/onboarding/start-application");
        }
      }, 200);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col justify-center select-text max-w-110"
    >
      <div className="w-full flex justify-start mb-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-primary font-semibold text-sm transition-colors cursor-pointer select-none focus:outline-none"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="w-full max-w-109.75 flex justify-start mb-6">
        <div className="w-46.5 h-2.5 bg-primary-solid/15 rounded-[10px] overflow-hidden">
          <div className="w-2/3 h-full bg-primary-solid rounded-[10px] transition-all duration-300" />
        </div>
      </div>

      <div className="mb-6 text-left">
        <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary">
          Select Assessment Type
        </h1>
        <p className="text-neutral-secondary text-sm leading-relaxed mt-1 font-normal">
          Choose the assessment you are interested in
        </p>
      </div>

      <div className="w-full flex flex-col gap-3 xl:gap-6">
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
    </motion.div>
  );
};
