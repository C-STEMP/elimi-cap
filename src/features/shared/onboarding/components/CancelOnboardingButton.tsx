"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiArrowLeft, FiRefreshCw, FiX } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useAppDispatch } from "@/store/hooks";
import { setCentreId, setCentreRole, setRole } from "@/store/slices/authSlice";
import { resetOnboarding } from "@/store/slices/onboardingSlice";
import {
  saveCentreId,
  saveCentreRole,
  saveOnboardedStatus,
  savePersona,
} from "@/src/lib/auth-storage";
import {
  useCancelOnboarding,
} from "@/src/features/shared/onboarding/hooks";
import type { PersonaType } from "@/src/features/shared/onboarding/api";

interface CancelOnboardingActionProps {
  persona: PersonaType;
  label?: string;
  modalTitle?: string;
  modalDescription?: string;
  confirmLabel?: string;
  variant?: "bar" | "banner-button";
}

export const CancelOnboardingAction: React.FC<CancelOnboardingActionProps> = ({
  persona,
  label = "Cancel Onboarding",
  modalTitle = "Cancel onboarding & change role?",
  modalDescription = "Your current onboarding progress for this role will be cancelled and you'll be taken back to role selection to choose a different persona.",
  confirmLabel = "Yes, Change Role",
  variant = "bar",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const cancelMutation = useCancelOnboarding();

  const handleConfirm = () => {
    cancelMutation.mutate(persona, {
      onSuccess: () => {
        savePersona("");
        saveOnboardedStatus(false);
        saveCentreId("");
        saveCentreRole("");
        dispatch(setRole(""));
        dispatch(setCentreId(""));
        dispatch(setCentreRole(""));
        dispatch(resetOnboarding());

        setIsModalOpen(false);
        toast({
          type: "success",
          title: "Onboarding Cancelled",
          description: "You can now select a different role.",
        });
        router.replace("/onboarding/role-selection");
      },
    });
  };

  return (
    <>
      {variant === "bar" ? (
        <div className="w-full max-w-2xl flex items-center justify-end mb-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-secondary hover:text-primary-solid px-3 py-1.5 rounded-lg hover:bg-rose-50/70 transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#92400E] hover:text-primary-solid bg-white hover:bg-amber-50 border border-[#F59E0B]/40 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
        >
          <FiRefreshCw className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !cancelMutation.isPending) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-100 relative flex flex-col gap-4">
            <button
              type="button"
              onClick={() => !cancelMutation.isPending && setIsModalOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>

            <div className="flex flex-col gap-1.5 pr-6">
              <h3 className="text-lg font-bold text-neutral-primary">
                {modalTitle}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-secondary leading-relaxed">
                {modalDescription}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={cancelMutation.isPending}
                onClick={() => setIsModalOpen(false)}
              >
                Keep Current Role
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={cancelMutation.isPending}
                onClick={handleConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function inferOnboardingPersona(pathname: string): PersonaType | null {
  if (!pathname.startsWith("/onboarding/")) return null;
  if (
    pathname.startsWith("/onboarding/welcome") ||
    pathname.startsWith("/onboarding/role-selection") ||
    pathname.startsWith("/onboarding/success") ||
    pathname.startsWith("/onboarding/assessment-type") ||
    pathname.startsWith("/onboarding/start-application")
  ) {
    return null;
  }
  if (pathname.startsWith("/onboarding/assessor")) return "assessor";
  if (pathname.startsWith("/onboarding/assessment-centre")) return "centre";
  if (
    pathname.startsWith("/onboarding/personal-info") ||
    pathname.startsWith("/onboarding/verify-identity")
  ) {
    return "candidate";
  }
  return null;
}

export const CancelOnboardingBar: React.FC = () => {
  const pathname = usePathname();
  const persona = inferOnboardingPersona(pathname || "");
  if (!persona) return null;

  return (
    <CancelOnboardingAction
      persona={persona}
      label="Cancel Onboarding / Change Role"
      variant="bar"
    />
  );
};
