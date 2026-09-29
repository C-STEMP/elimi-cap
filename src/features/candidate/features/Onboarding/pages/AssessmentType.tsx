"use client";

import React, { useState, useMemo } from "react";
import { RoleCard } from "@/src/components/ui/role-card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAssessmentType } from "@/store/slices/authSlice";
import { setOnboardingAssessmentType } from "@/store/slices/onboardingSlice";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiInfo } from "react-icons/fi";
import { motion } from "framer-motion";
import { useToast } from "@/src/components/ui/toast";
import { useGetApplications } from "@/src/features/candidate/features/Application/hooks";

export interface AssessmentOption {
  id: string;
  title: string;
  description: string;
  badge?: string;
  disabled?: boolean;
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
  const { toast } = useToast();
  const { data: applications = [] } = useGetApplications();

  const isTerminalStatus = (status?: string) => {
    const s = status?.toLowerCase();
    return s === "certified" || s === "rejected" || s === "withdrawn";
  };

  const activeRplApp = useMemo(() => {
    return applications.find(
      (a) => (a.type || "").toUpperCase() === "RPL" && !isTerminalStatus(a.status),
    );
  }, [applications]);

  const activeNsqApp = useMemo(() => {
    return applications.find(
      (a) => (a.type || "").toUpperCase() === "NSQ" && !isTerminalStatus(a.status),
    );
  }, [applications]);

  const hasActiveRpl = Boolean(activeRplApp);
  const hasActiveNsq = Boolean(activeNsqApp);

  const assessmentOptions = useMemo(() => {
    return ASSESSMENT_OPTIONS.map((option) => {
      if (option.id === "rpl" && hasActiveRpl) {
        return {
          ...option,
          badge: "Ongoing Application",
          disabled: true,
        };
      }
      if (option.id === "nsq" && hasActiveNsq) {
        return {
          ...option,
          badge: "Ongoing Application",
          disabled: true,
        };
      }
      return {
        ...option,
        disabled: false,
      };
    });
  }, [hasActiveRpl, hasActiveNsq]);

  const savedAssessmentType = useAppSelector(
    (state) =>
      state.onboarding.assessmentType || state.auth.user?.assessmentType || "",
  );
  const [selectedType, setSelectedType] = useState<string | null>(
    savedAssessmentType || null,
  );

  const handleSelectType = (id: string) => {
    if (id === "rpl" && hasActiveRpl) {
      const tradeTitle =
        activeRplApp?.trade?.name ||
        (typeof activeRplApp?.trade === "string" ? activeRplApp.trade : "");
      toast({
        type: "info",
        title: "Ongoing Application",
        description: `You already have an ongoing RPL application${tradeTitle ? ` for ${tradeTitle}` : ""}. You can view its progress in My Applications.`,
      });
      return;
    }

    if (id === "nsq" && hasActiveNsq) {
      const tradeTitle =
        activeNsqApp?.trade?.name ||
        (typeof activeNsqApp?.trade === "string" ? activeNsqApp.trade : "");
      toast({
        type: "info",
        title: "Ongoing Application",
        description: `You already have an ongoing NSQ application${tradeTitle ? ` for ${tradeTitle}` : ""}. You can view its progress in My Applications.`,
      });
      return;
    }

    setSelectedType(id);
    dispatch(setAssessmentType(id));
    dispatch(setOnboardingAssessmentType(id));

    if (onSelectType) {
      onSelectType(id);
      return;
    }

    if (id === "nsq") {
      router.push("/nsq/centre-info");
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

      {/* Informative Ongoing Application Reminder */}
      {(hasActiveRpl || hasActiveNsq) && (
        <div className="mb-6 bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-2xs">
          <FiInfo className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-bold text-amber-900 text-sm">
              Ongoing Application Reminder
            </span>
            <p className="text-amber-800 leading-relaxed font-normal">
              {hasActiveRpl && !hasActiveNsq && (
                <>
                  You currently have an ongoing <strong>RPL</strong> application. You may only maintain one active RPL assessment at a time, but you are eligible to apply for an <strong>NSQ</strong> qualification below.
                </>
              )}
              {!hasActiveRpl && hasActiveNsq && (
                <>
                  You currently have an ongoing <strong>NSQ</strong> application. You may only maintain one active NSQ qualification at a time, but you are eligible to apply for an <strong>RPL</strong> assessment below.
                </>
              )}
              {hasActiveRpl && hasActiveNsq && (
                <>
                  You currently have ongoing applications for both <strong>RPL</strong> and <strong>NSQ</strong>. Candidates may hold one ongoing application per pathway. Please track their progress in My Applications.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex flex-col gap-4">
        {assessmentOptions.map((option, idx) => (
          <RoleCard
            key={option.id}
            id={option.id}
            index={idx}
            title={option.title}
            description={option.description}
            badge={option.badge}
            disabled={option.disabled}
            isSelected={selectedType === option.id}
            onSelect={handleSelectType}
          />
        ))}
      </div>
    </motion.div>
  );
};
