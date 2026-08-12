"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Logo } from "@/src/components/ui/logo";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { FloatingCircles } from "@/src/features/shared/authentication/components/FloatingCircles";
import { FiArrowRight, FiCheck, FiX } from "react-icons/fi";
import { errorSymbolIcon, loadingIcon, successCheckmarkImg } from "@/assets";

import { validateNIN } from "@/src/lib/validation";
import { useToast } from "@/src/components/ui/toast";

type VerificationStep = "input" | "verifying" | "success" | "error";

export const NinVerificationPage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [nin, setNin] = useState("");
  const [ninError, setNinError] = useState<string | undefined>(undefined);
  const [step, setStep] = useState<VerificationStep>("input");

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

    // Simulate verification API check
    setTimeout(() => {
      if (nin.trim() === "00000000000" || nin.trim().endsWith("000")) {
        setStep("error");
      } else {
        setStep("success");
      }
    }, 2000);
  };

  const handleSuccessDone = () => {
    router.push("/dashboard/settings");
  };

  const handleReviewInfo = () => {
    router.push("/dashboard/settings");
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col lg:flex-row h-screen w-full overflow-hidden font-sans antialiased">
      {/* Left Sidebar - Full Height Auth Sidebar Structure */}
      <div className="hidden lg:flex lg:w-[40%] h-screen sticky top-0 shrink-0 bg-primary-solid flex-col justify-between p-12 xl:p-16 overflow-hidden select-none">
        <FloatingCircles />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex flex-col gap-8">
            <div>
              <Logo theme="light" />
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <h1 className="text-neutral-burgundy text-2xl xl:text-[34px] font-extrabold tracking-tight">
                NIN Verification
              </h1>
              <p className="text-neutral-burgundy/90 text-sm xl:text-base leading-relaxed font-normal font-work max-w-lg">
                To maintain the integrity of the National Skills Qualification
                process, every candidate must complete a one-time identity
                verification using their National Identification Number (NIN).
                Your verified identity will be used across all ELIMI services
                and future applications.
              </p>
            </div>
          </div>

          <div className="w-full">
            <div className="w-full h-px bg-white/20 mb-4" />
            <p className="text-neutral-burgundy/60 text-xs font-medium">
              © ELIMI. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Top Header (Visible on smaller screens) */}
      <div className="lg:hidden bg-primary-solid text-white p-6 flex flex-col gap-4">
        <Logo theme="light" />
        <div>
          <h1 className="text-xl font-bold">NIN Verification</h1>
          <p className="text-xs text-white/80 mt-1">
            Complete your one-time identity verification with your National
            Identification Number.
          </p>
        </div>
      </div>

      {/* Right Main Panel */}
      <div className="flex-1 h-full overflow-y-auto flex flex-col items-center p-6 md:p-10 xl:p-12 bg-white relative">
        <div className="w-full max-w-xl my-auto py-6 flex flex-col text-left">
          <h2 className="text-2xl xl:text-3xl font-bold text-primary-hover mb-3">
            Verify Your Identity
          </h2>

          <p className="text-neutral-secondary text-xs xl:text-sm leading-relaxed mb-6 font-normal">
            To maintain the integrity of the National Skills Qualification
            process, every candidate must complete a one-time identity
            verification using their National Identification Number (NIN). Your
            verified identity will be used across all ELIMI services and future
            applications.
          </p>

          <h3 className="text-base xl:text-lg font-bold text-text-dark mb-2">
            Before You Begin
          </h3>

          <p className="text-neutral-secondary text-xs xl:text-sm mb-4">
            We&apos;ll compare the information you&apos;ve entered with your
            official NIN records.
          </p>

          <p className="text-neutral-secondary text-xs xl:text-sm font-medium mb-2">
            For your privacy:
          </p>

          <ul className="text-neutral-secondary text-xs xl:text-sm space-y-2 mb-8 pl-1">
            <li className="flex items-start gap-2">
              <span className="text-neutral-secondary/60">•</span>
              <span>
                We do not display NIN information unless the details you entered
                closely match the official record.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-secondary/60">•</span>
              <span>Your NIN is encrypted and securely stored.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-secondary/60">•</span>
              <span>Identity verification is required only once.</span>
            </li>
          </ul>

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
        </div>
      </div>

      {/* --- STATUS MODALS ON TOP OF PAGE --- */}

      {/* 1. Verifying... Loader Modal */}
      {step === "verifying" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center flex flex-col items-center shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 relative flex items-center justify-center my-2">
              {loadingIcon ? (
                <Image
                  src={loadingIcon}
                  alt="Loading"
                  width={64}
                  height={64}
                  className="animate-spin"
                />
              ) : (
                <div className="w-12 h-12 border-4 border-primary-solid border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            <h3 className="text-xl font-bold text-text-dark mt-4 mb-2">
              Verifying...
            </h3>

            <p className="text-xs text-neutral-secondary leading-relaxed text-center">
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

      {/* 2. Identity Confirmed Modal */}
      {step === "success" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center flex flex-col items-center shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
              {successCheckmarkImg ? (
                <Image
                  src={successCheckmarkImg}
                  alt="Success"
                  width={96}
                  height={96}
                  className="object-contain drop-shadow-md w-auto h-auto"
                  style={{ width: "auto", height: "auto" }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-linear-to-b from-[#66bb6a] to-[#2e7d32] flex items-center justify-center shadow-lg shadow-green-600/30">
                  <FiCheck className="w-10 h-10 text-white stroke-3" />
                </div>
              )}
            </div>

            <h3 className="text-2xl font-bold text-text-dark mb-2">
              Identity Confirmed
            </h3>

            <p className="text-xs lg:text-sm text-neutral-secondary leading-relaxed mb-6">
              Your identity has been successfully verified.
              <br />
              We&apos;ve confirmed that the information you entered matches your
              National Identity record.
              <br />
              For security reasons, only verified information is displayed.
            </p>

            <button
              type="button"
              onClick={handleSuccessDone}
              className="bg-secondary hover:bg-secondary-hover active:scale-98 text-white font-semibold w-full py-3.5 rounded-xl shadow-lg transition-all text-sm cursor-pointer"
            >
              Go To Dashboard
            </button>
          </div>
        </div>
      )}

      {/* 3. Error Modal */}
      {step === "error" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full text-center flex flex-col items-center shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
              {errorSymbolIcon ? (
                <Image
                  src={errorSymbolIcon}
                  alt="Error"
                  width={96}
                  height={96}
                  className="object-contain drop-shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <FiX className="w-10 h-10 text-white stroke-3" />
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-text-dark mb-2">
              We couldn&apos;t verify your identity
            </h3>

            <p className="text-xs text-neutral-secondary leading-relaxed mb-4">
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
              onClick={handleReviewInfo}
              className="bg-secondary hover:bg-secondary-hover active:scale-98 text-white font-semibold w-full py-3.5 rounded-xl shadow-lg transition-all text-sm mb-3 cursor-pointer"
            >
              Review Personal Information
            </button>

            <button
              type="button"
              onClick={() => setStep("input")}
              className="bg-white hover:bg-amber-50 text-secondary font-semibold w-full py-3.5 rounded-xl border border-secondary transition-all text-sm cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
