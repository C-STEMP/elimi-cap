"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { FiArrowLeft, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ASSETS_URL } from "@/assets";
import { useAppDispatch } from "@/store/hooks";
import { setSidebarVariant, setRplStep } from "@/store/slices/authSlice";
import { validateNIN } from "@/lib/validation";

import { StatusModal } from "@/components/ui/status-modal";

export interface RPLVerifyIdentityProps {
  onBack?: () => void;
  onContinue?: () => void;
  onReviewPersonalInfo?: () => void;
}

export const RPLVerifyIdentity: React.FC<RPLVerifyIdentityProps> = ({
  onBack,
  onContinue,
  onReviewPersonalInfo,
}) => {
  const dispatch = useAppDispatch();
  const [nin, setNin] = useState("");
  const [ninError, setNinError] = useState<string | undefined>(undefined);
  const [isVerified, setIsVerified] = useState(false);
  const [modalState, setModalState] = useState<
    "none" | "verifying" | "success" | "error"
  >("none");

  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    dispatch(setSidebarVariant("rpl-form"));
    dispatch(setRplStep(3));
  }, [dispatch]);

  const handleStartVerification = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const error = validateNIN(nin);
    if (error) {
      setNinError(error);
      toast({
        type: "error",
        title: "NIN Validation Error",
        description: error,
      });
      return;
    }

    setNinError(undefined);
    setModalState("verifying");

    setTimeout(() => {
      if (nin.trim() === "00000000000" || nin.trim().endsWith("000")) {
        setModalState("error");
      } else {
        setModalState("success");
        setIsVerified(true);
      }
    }, 2200);
  };

  const [showConfirmDraftModal, setShowConfirmDraftModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);

  const handleSaveDraft = () => {
    setShowConfirmDraftModal(true);
  };

  const handleConfirmSaveDraft = () => {
    setShowConfirmDraftModal(false);
    setShowDraftModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col gap-6 select-text max-w-2xl mx-auto pb-10"
    >
      {/* Title section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl xl:text-[26px] font-extrabold tracking-tight text-primary">
          Step 3 of 4: Verify Your Identity
        </h1>
        <div className="flex flex-col gap-1 text-xs xl:text-sm text-neutral-secondary">
          <p>
            To maintain the integrity of the National Skills Qualification
            process, every RPL candidate <br /> must complete a one-time
            identity verification using their National Identification Number{" "}
            <br /> (NIN).
          </p>
          <p>
            Your verified identity will be used across all ELIMI services and
            future applications.
          </p>
        </div>
      </div>

      {/* Before You Begin */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xl xl:text-2xl font-extrabold tracking-tight text-neutral-primary">
          Before You Begin
        </h2>
        <p className="text-text-dark text-xs xl:text-base font-normal">
          We&apos;ll compare the information you&apos;ve entered with your
          official NIN records.
        </p>

        <div className="flex flex-col gap-1.5 text-xs xl:text-base text-text-dark font-normal">
          <p className="text-neutral-primary">For your privacy:</p>
          <ul className="list-disc list-outside pl-5 flex flex-col gap-1 text-neutral-primary">
            <li>
              We do not display NIN information unless the details you entered
              closely match the official record.
            </li>
            <li>Your NIN is encrypted and securely stored.</li>
            <li>Identity verification is required only once.</li>
          </ul>
        </div>
      </div>

      {/* NIN Input / Verification Box */}
      <div className="flex flex-col gap-2 mt-2">
        <label className="text-text-dark font-medium text-xs xl:text-base leading-[1.4] select-none">
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
          <div className="flex flex-col gap-1.5 w-full">
            <form
              onSubmit={handleStartVerification}
              className="flex items-center gap-2.5 w-full"
            >
              <Input
                type="text"
                placeholder="00000000000"
                maxLength={11}
                value={nin}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, "");
                  setNin(cleaned);
                  if (ninError) setNinError(undefined);
                }}
                error={ninError}
                className="flex-1 font-mono tracking-wider !h-11 xl:!h-12 !text-sm xl:!text-base"
                containerClassName="flex-1 [&>div]:!h-11 xl:[&>div]:!h-12"
              />
              <Button
                type="submit"
                variant="amber"
                size="icon"
                className="!h-11 xl:!h-12 !w-11 xl:!w-12 shrink-0 rounded-2xl flex items-center justify-center cursor-pointer"
                title="Verify NIN"
              >
                <FiArrowRight className="w-5 h-5 text-white stroke-[2.5]" />
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-8 pt-4 border-t border-gray-100 gap-4">
        <button
          type="button"
          onClick={onBack || (() => router.back())}
          className="flex items-center justify-center gap-2 text-sm font-medium text-black hover:text-text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
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
            onClick={onContinue || (() => router.push("/rpl/review-submit"))}
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
                  <Image
                    src={ASSETS_URL.loadingIcon}
                    alt="Verifying..."
                    width={96}
                    height={96}
                    className="w-24 h-auto mb-6 animate-spin"
                    style={{ width: "auto", height: "auto" }}
                  />
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
                  <Image
                    src={ASSETS_URL.successCheckmarkImg}
                    alt="Identity Confirmed"
                    width={144}
                    height={144}
                    className="w-32 h-auto sm:w-36 sm:h-auto mb-6 object-contain"
                    style={{ width: "auto", height: "auto" }}
                    priority
                  />
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
                      if (onContinue) {
                        onContinue();
                      } else {
                        router.push("/rpl/review-submit");
                      }
                    }}
                    variant="amber"
                    size="lg"
                    className="w-full"
                  >
                    Continue to Step 4
                  </Button>
                </div>
              )}

              {modalState === "error" && (
                <div className="flex flex-col items-center py-2 w-full">
                  <Image
                    src={ASSETS_URL.errorSymbolIcon}
                    alt="Verification Failed"
                    width={112}
                    height={112}
                    className="w-28 h-auto mb-6"
                    style={{ width: "auto", height: "auto" }}
                  />
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
                        if (onReviewPersonalInfo) {
                          onReviewPersonalInfo();
                        } else {
                          router.push("/rpl/personal-info");
                        }
                      }}
                      className="w-full h-11 bg-secondary hover:bg-secondary-hover text-white font-semibold text-sm rounded-lg shadow-lg cursor-pointer"
                    >
                      Review Personal Information
                    </Button>
                    <button
                      type="button"
                      onClick={() => setModalState("none")}
                      className="w-full h-11 bg-white border border-secondary text-secondary hover:bg-secondary/10 font-semibold text-sm rounded-lg transition-all shadow-lg cursor-pointer"
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
      <StatusModal
        isOpen={showConfirmDraftModal}
        variant="save-draft-confirm"
        onClose={() => setShowConfirmDraftModal(false)}
        onAction={handleConfirmSaveDraft}
      />
      <StatusModal
        isOpen={showDraftModal}
        variant="draft-saved"
        onClose={() => setShowDraftModal(false)}
        onAction={() => router.push("/dashboard")}
      />
    </motion.div>
  );
};
