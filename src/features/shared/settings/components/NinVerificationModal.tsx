"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Logo } from "@/src/components/ui/logo";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { FiX, FiArrowRight, FiCheck } from "react-icons/fi";
import { ASSETS_URL } from "@/assets";

import { validateNIN } from "@/src/lib/validation";
import { useToast } from "@/src/components/ui/toast";

interface NinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessComplete: () => void;
  onReviewInfo: () => void;
}

type ModalStep = "input" | "verifying" | "success" | "error";

export const NinVerificationModal: React.FC<NinVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccessComplete,
  onReviewInfo,
}) => {
  const { toast } = useToast();
  const [nin, setNin] = useState("");
  const [ninError, setNinError] = useState<string | undefined>(undefined);
  const [step, setStep] = useState<ModalStep>("input");

  if (!isOpen) return null;

  const handleSubmitNin = (e: React.FormEvent) => {
    e.preventDefault();
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
    setStep("verifying");

    setTimeout(() => {
      if (nin.trim() === "00000000000" || nin.trim().endsWith("000")) {
        setStep("error");
      } else {
        setStep("success");
      }
    }, 2000);
  };

  const handleClose = () => {
    setStep("input");
    setNin("");
    onClose();
  };

  const handleSuccessDone = () => {
    setStep("input");
    setNin("");
    onSuccessComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 lg:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl relative flex flex-col md:flex-row shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-600 bg-gray-100/80 hover:bg-gray-200 p-2 rounded-full transition-colors cursor-pointer"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="bg-[#8a1832] w-full md:w-2/5 p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10">
            <Logo theme="light" height={32} width={71} />
          </div>

          <div className="relative z-10 my-8">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-4">
              NIN Verification
            </h2>
            <p className="text-xs lg:text-sm text-white/85 leading-relaxed font-normal">
              To maintain the integrity of the National Skills Qualification
              process, every candidate must complete a one-time identity
              verification using their National Identification Number (NIN).
              Your verified identity will be used across all ELIMI services and
              future applications.
            </p>
          </div>

          <div className="relative z-10 hidden md:block text-[11px] text-white/60">
            © ELIMI. All rights reserved.
          </div>
        </div>

        <div className="w-full md:w-3/5 p-8 lg:p-10 flex flex-col justify-center text-left bg-white relative">
          <h3 className="text-xl lg:text-2xl font-bold text-[#8a1832] mb-3">
            Verify Your Identity
          </h3>

          <p className="text-xs lg:text-sm text-gray-500 mb-6 leading-relaxed">
            To maintain the integrity of the National Skills Qualification
            process, every candidate must complete a one-time identity
            verification using their National Identification Number (NIN). Your
            verified identity will be used across all ELIMI services and future
            applications.
          </p>

          <div className="flex flex-col gap-2 mb-6">
            <h4 className="text-sm lg:text-base font-bold text-text-dark">
              Before You Begin
            </h4>
            <p className="text-xs lg:text-sm text-gray-600">
              We&apos;ll compare the information you&apos;ve entered with your
              official NIN records.
            </p>
            <p className="text-xs lg:text-sm text-gray-600 font-medium mt-2">
              For your privacy:
            </p>
            <ul className="text-xs lg:text-sm text-gray-500 space-y-1 pl-1">
              <li className="flex items-start gap-1.5">
                <span className="text-gray-400">•</span>
                <span>
                  We do not display NIN information unless the details you
                  entered closely match the official record.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-gray-400">•</span>
                <span>Your NIN is encrypted and securely stored.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-gray-400">•</span>
                <span>Identity verification is required only once.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <form
              onSubmit={handleSubmitNin}
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
          </div>
        </div>

        {step === "verifying" && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs z-30 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center flex flex-col items-center shadow-2xl relative animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 relative flex items-center justify-center my-2">
                {ASSETS_URL.loadingIcon ? (
                  <Image
                    src={ASSETS_URL.loadingIcon}
                    alt="Loading"
                    width={64}
                    height={64}
                    className="animate-spin"
                  />
                ) : (
                  <div className="w-12 h-12 border-4 border-[#8a1832] border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              <h4 className="text-xl font-bold text-text-dark mt-4 mb-2">
                Verifying...
              </h4>

              <p className="text-xs text-gray-500 leading-relaxed text-center">
                We&apos;re securely verifying your identity with the National
                Identity Management Commission (NIMC).
                <br />
                Please wait...
                <br />
                This usually takes a few seconds.
              </p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-30 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center flex flex-col items-center shadow-2xl relative animate-in zoom-in-95 duration-200">
              <div className="relative w-[100px] h-[100px] mb-2 flex items-center justify-center mx-auto">
                {ASSETS_URL.successCheckmarkImg ? (
                  <Image
                    src={ASSETS_URL.successCheckmarkImg}
                    alt="Success"
                    width={100}
                    height={100}
                    className="w-[100px] h-[100px] object-contain drop-shadow-md"
                    style={{ width: 100, height: 100 }}
                  />
                ) : (
                  <div className="w-[100px] h-[100px] rounded-full bg-linear-to-b from-[#66bb6a] to-[#2e7d32] flex items-center justify-center shadow-lg shadow-green-600/30">
                    <FiCheck className="w-12 h-12 text-white stroke-3" />
                  </div>
                )}
              </div>

              <h4 className="text-2xl font-bold text-text-dark mb-2">
                Identity Confirmed
              </h4>

              <p className="text-xs lg:text-sm text-gray-500 leading-relaxed mb-6">
                Your identity has been successfully verified.
                <br />
                We&apos;ve confirmed that the information you entered matches
                your National Identity record.
                <br />
                For security reasons, only verified information is displayed.
              </p>

              <button
                type="button"
                onClick={handleSuccessDone}
                className="bg-[#fbab2a] hover:bg-[#e89b1f] active:scale-98 text-white font-semibold w-full py-3.5 rounded-xl shadow-lg transition-all text-sm cursor-pointer"
              >
                Go To Dashboard
              </button>
            </div>
          </div>
        )}

        {step === "error" && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-30 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full text-center flex flex-col items-center shadow-2xl relative animate-in zoom-in-95 duration-200">
              <div className="relative w-[100px] h-[100px] mb-2 flex items-center justify-center mx-auto">
                {ASSETS_URL.errorSymbolIcon ? (
                  <Image
                    src={ASSETS_URL.errorSymbolIcon}
                    alt="Error"
                    width={100}
                    height={100}
                    className="w-[100px] h-[100px] object-contain drop-shadow-md"
                    style={{ width: 100, height: 100 }}
                  />
                ) : (
                  <div className="w-[100px] h-[100px] rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                    <FiX className="w-12 h-12 text-white stroke-3" />
                  </div>
                )}
              </div>

              <h4 className="text-xl font-bold text-text-dark mb-2">
                We couldn&apos;t verify your identity
              </h4>

              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                The details you entered do not sufficiently match your National
                Identity record.
                <br />
                Please review your information and try again.
              </p>

              <div className="bg-neutral-burgundy border border-[#fde68a] rounded-2xl p-4 text-left font-medium text-xs mb-5 w-full space-y-1">
                <span className="text-[#92400e] font-bold block mb-1.5">
                  Before trying again, check that:
                </span>
                <p className="text-[#92400e]/90 flex items-start gap-1">
                  <span>•</span>
                  <span>
                    Your full name is entered exactly as it appears on your
                    National Identification record.
                  </span>
                </p>
                <p className="text-[#92400e]/90 flex items-start gap-1">
                  <span>•</span>
                  <span>Your date of birth is correct.</span>
                </p>
                <p className="text-[#92400e]/90 flex items-start gap-1">
                  <span>•</span>
                  <span>Your NIN is valid and entered without mistakes.</span>
                </p>
                <p className="text-[#92400e]/90 flex items-start gap-1">
                  <span>•</span>
                  <span>
                    You are using your own National Identification Number.
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("input");
                  onReviewInfo();
                }}
                className="bg-[#fbab2a] hover:bg-[#e89b1f] active:scale-98 text-white font-semibold w-full py-3.5 rounded-xl shadow-lg transition-all text-sm mb-3 cursor-pointer"
              >
                Review Personal Information
              </button>

              <button
                type="button"
                onClick={() => setStep("input")}
                className="bg-white hover:bg-amber-50 text-[#fbab2a] font-semibold w-full py-3.5 rounded-xl border border-[#fbab2a] transition-all text-sm cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
