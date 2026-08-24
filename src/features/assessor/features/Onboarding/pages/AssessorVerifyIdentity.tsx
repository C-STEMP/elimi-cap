"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { ASSETS_URL } from "@/assets";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setSidebarVariant, markVerified } from "@/src/store/slices/authSlice";
import { setAssessorIdentity } from "@/src/store/slices/onboardingSlice";
import { saveOnboardedStatus } from "@/src/lib/auth-storage";
import { ASSESSOR_ROUTES } from "@/src/features/assessor/utils/assessorRoutes";
import { useAssessorOnboarding } from "../hooks/useOnboarding";
import { verifyIdentityApi } from "@/src/features/shared/onboarding/api";
import { validateNIN } from "@/src/lib/validation";

export const AssessorVerifyIdentity: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { saveOnboarding, submitOnboarding } = useAssessorOnboarding();
  const saved = useAppSelector((s) => s.onboarding.assessorIdentity);

  const [nin, setNin] = useState(saved.nin || "");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isVerified, setIsVerified] = useState(saved.isVerified || false);
  const [modalState, setModalState] = useState<
    "none" | "verifying" | "success" | "error"
  >("none");
  const [showConfirmDraftModal, setShowConfirmDraftModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);

  useEffect(() => {
    dispatch(setSidebarVariant("default"));
  }, [dispatch]);

  useEffect(() => {
    if (saved.nin) setNin(saved.nin);
    if (typeof saved.isVerified === "boolean") {
      setIsVerified(saved.isVerified);
    }
  }, [saved]);

  const handleStartVerification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const valError = validateNIN(nin);
    if (valError) {
      setError(valError);
      toast({
        type: "error",
        title: "NIN Validation Error",
        description: valError,
      });
      return;
    }

    setError(undefined);
    setModalState("verifying");

    try {
      await verifyIdentityApi({
        type: "nin",
        identificationNumber: nin.trim(),
      });

      setModalState("success");
      setIsVerified(true);
      dispatch(setAssessorIdentity({ nin: nin.trim(), isVerified: true }));
      dispatch(markVerified());
    } catch (err: any) {
      setModalState("error");
      toast({
        type: "error",
        title: "Verification Failed",
        description:
          err?.message ||
          "Your NIN could not be verified. Please check your details and try again.",
      });
    }
  };

  const handleConfirmSaveDraft = () => {
    setShowConfirmDraftModal(false);
    saveOnboarding.mutate(
      {},
      {
        onSuccess: () => {
          setShowDraftModal(true);
        },
        onError: () => {
          setShowDraftModal(true);
        },
      },
    );
  };

  const handleContinue = () => {
    submitOnboarding.mutate(undefined, {
      onSuccess: () => {
        saveOnboardedStatus(true);
        router.push(ASSESSOR_ROUTES.dashboard);
      },
      onError: (err: any) => {
        toast({
          type: "error",
          title: "Submission Error",
          description:
            err.message || "Failed to complete onboarding. Please try again.",
        });
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col gap-6 select-text max-w-2xl mx-auto pb-10"
    >
      {/* Progress Bar */}
      <div className="w-full max-w-109.75 flex justify-start mb-2">
        <div className="w-46.5 h-2.5 bg-primary-solid/15 rounded-[10px] overflow-hidden">
          <div className="w-full h-full bg-primary-solid rounded-[10px] transition-all duration-300" />
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1.5 text-left">
        <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary">
          Verify Identity
        </h1>
        <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-1 leading-relaxed">
          To maintain the integrity of the National Skills Qualification
          process, every candidate must complete a one-time identity
          verification using their National Identification Number (NIN). Your
          verified identity will be used across all ELIMI services and future
          applications.
        </p>
      </div>

      {/* Before You Begin */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xl xl:text-2xl font-extrabold tracking-tight text-neutral-primary">
          Before You Begin
        </h2>
        <p className="text-text-dark text-xs xl:text-sm font-normal">
          We&apos;ll compare the information you&apos;ve entered with your
          official NIN records.
        </p>

        <div className="flex flex-col gap-1.5 text-xs xl:text-sm text-text-dark font-normal">
          <p className="text-neutral-primary font-medium">For your privacy:</p>
          <ul className="list-disc list-outside pl-5 flex flex-col gap-1 text-neutral-secondary">
            <li>
              We do not display NIN information unless the details you entered
              closely match the official record.
            </li>
            <li>Your NIN is encrypted and securely stored.</li>
            <li>Identity verification is required only once.</li>
          </ul>
        </div>
      </div>

      {/* NIN Input / Inline Verification Form */}
      <div className="flex flex-col gap-2 mt-2">
        <label className="text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none">
          National Identification Number
        </label>

        {isVerified ? (
          <div className="w-full p-4 bg-[#E8F5E9] border border-[#A5D6A7] rounded-radius-200 flex items-center justify-between transition-all">
            <span className="text-sm xl:text-base font-semibold text-[#2E7D32]">
              Identity Verified
            </span>
            <FiCheckCircle className="w-5 h-5 text-[#2E7D32]" />
          </div>
        ) : (
          <form
            onSubmit={handleStartVerification}
            className="flex items-center gap-2.5 w-full"
          >
            <Input
              type="text"
              placeholder="0000000000"
              maxLength={11}
              value={nin}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9]/g, "");
                setNin(cleaned);
                if (error) setError(undefined);
              }}
              error={error}
              className="flex-1 font-mono tracking-wider h-11! xl:h-12! text-sm! xl:text-base!"
              containerClassName="flex-1 [&>div]:!h-11 xl:[&>div]:!h-12"
            />
            <Button
              type="submit"
              variant="amber"
              size="icon"
              className="h-11! xl:h-12! w-11! xl:w-12! shrink-0 rounded-2xl flex items-center justify-center cursor-pointer"
              title="Verify NIN"
            >
              <FiArrowRight className="w-5 h-5 text-white stroke-[2.5]" />
            </Button>
          </form>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-8 pt-4 border-t border-gray-100 gap-4">
        <button
          type="button"
          onClick={() => router.push(ASSESSOR_ROUTES.onboarding.assessorInfo)}
          className="flex items-center justify-center gap-2 text-sm font-medium text-black hover:text-text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => setShowConfirmDraftModal(true)}
            className="px-5 h-11 bg-white border border-secondary text-secondary hover:bg-secondary/10 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer whitespace-nowrap"
          >
            <span>Save As Draft</span>
            <Image
              src={ASSETS_URL.saveIcon}
              alt="Save icon"
              width={20}
              height={20}
              className="w-5 h-5 shrink-0"
            />
          </button>

          <Button
            type="button"
            onClick={handleContinue}
            disabled={!isVerified}
            variant="amber"
            size="md"
            rightIcon={<FiArrowRight className="w-4.5 h-4.5" />}
            className="px-8 h-11 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
          >
            Continue
          </Button>
        </div>
      </div>

      {/* Verification Modals */}
      <AnimatePresence>
        {modalState !== "none" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalState("none")}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-lg w-full flex flex-col items-center text-center shadow-md relative overflow-hidden"
            >
              {modalState === "verifying" && (
                <div className="flex flex-col items-center py-4">
                  <div className="w-25 h-25 mb-6 relative flex items-center justify-center mx-auto">
                    <Image
                      src={ASSETS_URL.loadingIcon}
                      alt="Verifying..."
                      width={100}
                      height={100}
                      className="w-25 h-25 object-contain animate-spin"
                      style={{ width: 100, height: 100 }}
                    />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary mb-3">
                    Verifying...
                  </h3>
                  <div className="text-xs sm:text-sm text-neutral-secondary space-y-1 max-w-xs font-normal">
                    <p>
                      We&apos;re securely verifying your identity with the
                      National Identity Management Commission (NIMC).
                    </p>
                    <p>Please wait...</p>
                    <p>This usually takes a few seconds.</p>
                  </div>
                </div>
              )}

              {modalState === "success" && (
                <div className="flex flex-col items-center py-2 w-full">
                  <div className="w-25 h-25 mb-6 relative flex items-center justify-center mx-auto">
                    <Image
                      src={ASSETS_URL.successCheckmarkImg}
                      alt="Identity Confirmed"
                      width={100}
                      height={100}
                      className="w-25 h-25 object-contain"
                      style={{ width: 100, height: 100 }}
                      priority
                    />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary mb-3">
                    Identity Confirmed
                  </h3>
                  <div className="text-xs sm:text-sm text-neutral-secondary space-y-2 font-normal mb-6">
                    <p>Your identity has been successfully verified.</p>
                    <p>
                      We&apos;ve confirmed that the information you entered
                      matches your National Identity record.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      setModalState("none");
                      handleContinue();
                    }}
                    variant="amber"
                    size="lg"
                    className="w-full cursor-pointer"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {modalState === "error" && (
                <div className="flex flex-col items-center py-2 w-full">
                  <div className="w-25 h-25 mb-6 relative flex items-center justify-center mx-auto">
                    <Image
                      src={ASSETS_URL.errorSymbolIcon}
                      alt="Verification Failed"
                      width={100}
                      height={100}
                      className="w-25 h-25 object-contain"
                      style={{ width: 100, height: 100 }}
                    />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary mb-2">
                    We couldn&apos;t verify your identity
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-secondary mb-1 max-w-md font-normal">
                    The details you entered do not sufficiently match your
                    National Identity record.
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-secondary mb-5 max-w-md font-normal">
                    Please review your information and try again.
                  </p>

                  <div className="bg-neutral-burgundy border border-[#F19108]/10 rounded-xl p-4 text-left w-full mb-6">
                    <p className="text-xs sm:text-base font-bold text-[#F19108] mb-2">
                      Before trying again, check that:
                    </p>
                    <ul className="list-disc list-outside pl-5 text-xs sm:text-sm text-[#F19108] flex flex-col gap-1.5 font-normal">
                      <li>
                        Your full name is entered exactly as it appears on your
                        National Identification record.
                      </li>
                      <li>Your date of birth is correct.</li>
                      <li>Your NIN is valid and entered without mistakes.</li>
                      <li>
                        You are using your own National Identification Number.
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2.5 w-full">
                    <Button
                      type="button"
                      onClick={() => {
                        setModalState("none");
                        router.push(ASSESSOR_ROUTES.onboarding.personalInfo);
                      }}
                      variant="amber"
                      size="lg"
                      className="w-full cursor-pointer"
                    >
                      Review Personal Information
                    </Button>
                    <button
                      type="button"
                      onClick={() => setModalState("none")}
                      className="text-neutral-secondary text-sm font-semibold hover:text-text-dark transition-colors py-2 cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save draft confirmation modal */}
      {showConfirmDraftModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-lg">
            <h3 className="text-xl font-bold text-neutral-primary mb-2">
              Save Draft?
            </h3>
            <p className="text-sm text-neutral-secondary mb-6">
              Your progress will be saved and you can return to complete your
              onboarding at any time.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDraftModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="amber"
                onClick={handleConfirmSaveDraft}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Draft saved modal */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-lg">
            <FiCheckCircle className="w-12 h-12 text-[#2E7D32] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-primary mb-2">
              Draft Saved
            </h3>
            <p className="text-sm text-neutral-secondary mb-6">
              Your onboarding draft has been saved.
            </p>
            <Button
              variant="amber"
              className="w-full"
              onClick={() => {
                setShowDraftModal(false);
                router.push(ASSESSOR_ROUTES.dashboard);
              }}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
