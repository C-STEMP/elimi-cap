"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { StatusModal } from "@/src/components/ui/status-modal";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  useVerifyAccount,
  useResendOtp,
} from "@/src/features/shared/authentication/hooks";

export const VerifyEmail: React.FC = () => {
  const [code, setCode] = useState<string[]>(["", "", "", ""]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const { mutate: verifyCode, isPending: isVerifying } = useVerifyAccount();
  const { mutate: resendCode, isPending: isResending } = useResendOtp();

  const rawEmail = searchParams.get("email") || "user@email.com";

  const maskEmail = (emailStr: string) => {
    if (!emailStr) return "chidi*****@email.com";
    const parts = emailStr.split("@");
    if (parts.length !== 2) return emailStr;
    const [name, domain] = parts;
    const prefix = name.slice(0, 5);
    return `${prefix}*****@${domain}`;
  };

  const formattedEmail = maskEmail(rawEmail);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newCode = [...code];
    newCode[index] = val.slice(-1);
    setCode(newCode);

    if (val && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        inputsRef.current[index - 1]?.focus();
      } else {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < 4; i++) {
        newCode[i] = pastedData[i] || "";
      }
      setCode(newCode);

      const nextFocusIndex = Math.min(pastedData.length, 3);
      inputsRef.current[nextFocusIndex]?.focus();
    }
  };

  const handleResend = () => {
    if (isResending) return;
    resendCode(
      { email: rawEmail, purpose: "account_verify" },
      {
        onSuccess: () => {
          toast({
            type: "success",
            title: "Code Resent",
            description: "A new verification code has been sent to your email.",
          });
        },
      },
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");

    if (fullCode.length < 4) {
      toast({
        type: "error",
        title: "Incomplete Code",
        description: "Please enter the complete 4-digit verification code.",
      });
      return;
    }

    verifyCode(
      { email: rawEmail, otp: fullCode },
      {
        onSuccess: () => {
          setShowSuccessModal(true);
        },
        onError: () => {
          setCode(["", "", "", ""]);
          setTimeout(() => inputsRef.current[0]?.focus(), 50);
        },
      },
    );
  };

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        router.push("/onboarding/welcome");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, router]);

  const handleModalAction = () => {
    setShowSuccessModal(false);
    router.push("/onboarding/welcome");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-110 mx-auto flex flex-col justify-center select-text"
    >
      <div className="mb-6 text-center lg:text-left w-full flex flex-col items-center lg:items-start">
        <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary text-center lg:text-left">
          Verify your Email
        </h1>
        <p className="text-neutral-secondary text-[14px] xl:text-[15px] leading-relaxed mt-1.5 max-w-md font-normal text-center lg:text-left mx-auto lg:mx-0">
          We sent a 4-digit code to{" "}
          <span className="font-semibold text-neutral-primary">
            {formattedEmail}
          </span>
          . It expires in 10 minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        <div className="flex justify-center gap-3 w-full">
          {code.map((val, index) => {
            const firstEmptyIndex = code.findIndex((v) => v === "");
            const isFocused =
              firstEmptyIndex === index ||
              (firstEmptyIndex === -1 && index === 3);
            return (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={val}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isVerifying}
                className={`w-12 h-14 md:w-13 md:h-15 rounded-radius-200 border text-center text-xl font-bold outline-none transition-all duration-200
                  ${val ? "bg-input-bg text-text-dark border-transparent" : "bg-white border-border-gray/60"}
                  ${isFocused ? "border-secondary! ring-2! ring-secondary/30! bg-white!" : ""}
                  focus:border-secondary focus:ring-2 focus:ring-secondary/30 focus:bg-white
                `}
              />
            );
          })}
        </div>

        <div className="w-full">
          <Button
            type="submit"
            variant="secondary"
            size="md"
            className="w-full h-12.5 text-white font-bold text-base bg-secondary hover:bg-secondary-hover focus:ring-secondary/30 transition-all shadow-lg cursor-pointer"
            loading={isVerifying}
          >
            Verify Email
          </Button>
        </div>

        <div className="w-full text-center text-sm select-none">
          <span className="text-neutral-secondary font-normal">
            Didn't get a code?
          </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-primary-solid font-bold ml-1 hover:text-primary-hover transition-colors focus:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isResending ? "Sending..." : "Resend"}
          </button>
        </div>
      </form>

      <StatusModal
        isOpen={showSuccessModal}
        onClose={handleModalAction}
        type="success"
        title="Congratulations"
        description="Your Account was created successfully"
        actionLabel=""
      />
    </motion.div>
  );
};
