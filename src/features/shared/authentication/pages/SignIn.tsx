"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ASSETS_URL } from "@/assets";
import { useToast } from "@/src/components/ui/toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { StatusModal } from "@/components/status-modal";
import { useAppDispatch } from "@/store/hooks";
import { setSidebarVariant } from "@/store/slices/authSlice";
import { validateEmail } from "@/src/lib/validation";
import { ApiError } from "@/src/lib/api/client";
import { GoogleLogin } from "@react-oauth/google";
import Image from "next/image";
import {
  useLogin,
  useGoogleAuth,
} from "@/src/features/shared/authentication/hooks";

export const SignIn: React.FC = () => {
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<
    "signin" | "enter-email" | "verify-email"
  >("signin");

  useEffect(() => {
    dispatch(setSidebarVariant("default"));
  }, [dispatch]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    otpEmail?: string;
    otpCode?: string;
  }>({});

  const { mutate: loginUser, isPending: isLoggingIn } = useLogin();
  const { handleGoogleSuccess, handleGoogleError, isPending: isGooglePending } =
    useGoogleAuth();

  const [otpEmail, setOtpEmail] = useState("chidi.umeh@email.com");
  const [otpCode, setOtpCode] = useState<string[]>(["4", "8", "2", ""]);
  const [timeLeft, setTimeLeft] = useState(47);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (viewMode !== "verify-email" || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [viewMode, timeLeft]);

  useEffect(() => {
    if (viewMode === "verify-email") {
      const firstEmptyIndex = otpCode.findIndex((val) => val === "");
      const focusIndex = firstEmptyIndex !== -1 ? firstEmptyIndex : 0;
      setTimeout(() => {
        inputsRef.current[focusIndex]?.focus();
      }, 100);
    }
  }, [viewMode]);

  const maskEmail = (emailStr: string) => {
    if (!emailStr) return "chidi******@email.com";
    const parts = emailStr.split("@");
    if (parts.length !== 2) return emailStr;
    const [name, domain] = parts;
    const prefix = name.length > 5 ? name.slice(0, 5) : name.slice(0, 2);
    return `${prefix}******@${domain}`;
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passErr = !password.trim() ? "Password is required" : null;

    if (emailErr || passErr) {
      setErrors({
        email: emailErr || undefined,
        password: passErr || undefined,
      });
      toast({
        type: "error",
        title: "Input Required",
        description: "Please check the highlighted fields.",
      });
      return;
    }

    setErrors({});
    loginUser(
      { email, password },
      {
        onError: (error: Error) => {
          if (error instanceof ApiError) {
            const code = (error.code || "").toUpperCase();
            const msg = (error.message || "").toLowerCase();
            const isUnregistered =
              code.includes("NOT_FOUND") ||
              code.includes("NOT_REGISTERED") ||
              code.includes("NO_USER") ||
              msg.includes("not found") ||
              msg.includes("not registered") ||
              msg.includes("no account") ||
              msg.includes("does not exist") ||
              msg.includes("doesn't exist");
            if (isUnregistered) {
              setErrors({
                email: "This email is not registered. Please sign up.",
              });
            }
          }
        },
      },
    );
  };

  const handleSendCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(otpEmail);
    if (emailErr) {
      setErrors({ otpEmail: emailErr });
      toast({
        type: "error",
        title: "Email Required",
        description: emailErr,
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTimeLeft(47);
      setViewMode("verify-email");
    }, 800);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newCode = [...otpCode];
    newCode[index] = val.slice(-1);
    setOtpCode(newCode);

    if (val && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (!otpCode[index] && index > 0) {
        const newCode = [...otpCode];
        newCode[index - 1] = "";
        setOtpCode(newCode);
        inputsRef.current[index - 1]?.focus();
      } else {
        const newCode = [...otpCode];
        newCode[index] = "";
        setOtpCode(newCode);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    if (pastedData) {
      const newCode = [...otpCode];
      for (let i = 0; i < 4; i++) {
        newCode[i] = pastedData[i] || "";
      }
      setOtpCode(newCode);
      const nextFocusIndex = Math.min(pastedData.length, 3);
      inputsRef.current[nextFocusIndex]?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResend = () => {
    setTimeLeft(60);
    toast({
      type: "success",
      title: "Code Resent",
      description:
        "A new verification code has been sent to your email address.",
    });
  };

  const handleVerifyEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpCode.join("");

    if (fullCode.length < 4) {
      toast({
        type: "error",
        title: "Incomplete Code",
        description: "Please enter the complete 4-digit verification code.",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 1000);
  };

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        router.push("/onboarding");
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, router]);

  return (
    <div
      suppressHydrationWarning
      className="w-full max-w-110 mx-auto flex flex-col justify-center select-text"
    >
      <AnimatePresence mode="wait">
        {/* VIEW 1: Standard Sign In */}
        {viewMode === "signin" && (
          <motion.div
            suppressHydrationWarning
            key="signin"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full"
          >
            <div
              suppressHydrationWarning
              className="mb-8 text-center lg:text-left w-full flex flex-col items-center lg:items-start"
            >
              <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary text-center lg:text-left">
                Sign in to ELIMI
              </h1>
              <p className="text-neutral-secondary text-[14px] xl:text-[15px] leading-relaxed mt-2 max-w-sm font-normal text-center lg:text-left mx-auto lg:mx-0">
                Access Elimi learning, your NSQ assessments, and WorkMaster
                profile.
              </p>
            </div>

            <form
              onSubmit={handleSignInSubmit}
              className="w-full flex flex-col gap-6"
            >
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="yourname@email.com"
                value={email}
                error={errors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                disabled={isLoggingIn}
              />

              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••••••"
                value={password}
                error={errors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                disabled={isLoggingIn}
              />

              <div
                suppressHydrationWarning
                className="flex justify-between items-center w-full text-sm -mt-1 select-none"
              >
                {/* <Link
                  href="/enter-otp"
                  className="text-primary-solid font-bold text-xs xl:text-sm hover:text-primary-hover transition-colors"
                >
                  Enter OTP
                </Link> */}
                <Link
                  href="/forgot-password"
                  className="text-primary-solid font-bold text-xs xl:text-sm hover:text-primary-hover transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <div suppressHydrationWarning className="w-full mt-2">
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  className="w-full h-12.5 text-white font-bold text-base bg-secondary hover:bg-secondary-hover focus:ring-secondary/30 transition-all shadow-lg cursor-pointer"
                  loading={isLoggingIn}
                >
                  Sign In
                </Button>
              </div>

              <div
                suppressHydrationWarning
                className="w-full flex items-center gap-4 my-3 select-none"
              >
                <div
                  suppressHydrationWarning
                  className="flex-1 h-[1.5px] bg-border-gray"
                />
                <span className="text-neutral-secondary text-xs xl:text-sm font-medium whitespace-nowrap">
                  or continue with
                </span>
                <div
                  suppressHydrationWarning
                  className="flex-1 h-[1.5px] bg-border-gray"
                />
              </div>

              <div className="relative w-full overflow-hidden rounded-lg">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={isSubmitting || isLoggingIn || isGooglePending}
                  leftIcon={
                    <Image
                      src={ASSETS_URL.googleIcon}
                      alt="Google"
                      width={20}
                      height={20}
                      className="w-4 h-4 sm:w-5 sm:h-5"
                    />
                  }
                  className="w-full h-12.5 text-text-dark font-medium text-sm xl:text-base cursor-pointer"
                >
                  {isGooglePending
                    ? "Connecting to Google..."
                    : "Continue with Google"}
                </Button>
                <div className="absolute inset-0 opacity-0 overflow-hidden cursor-pointer [&>div]:w-full! [&>div>iframe]:w-full! [&>div>iframe]:h-full! [&>div>iframe]:scale-150!">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    width="100%"
                    shape="rectangular"
                    size="large"
                  />
                </div>
              </div>

              <div
                suppressHydrationWarning
                className="w-full text-center mt-3 text-sm select-none"
              >
                <span className="text-neutral-secondary font-normal">
                  Don&apos;t have an account?
                </span>
                <Link
                  href="/signup"
                  className="text-primary-solid font-bold ml-1 hover:text-primary-hover transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </form>
          </motion.div>
        )}

        {/* VIEW 2: Enter Your Email (Image 1) */}
        {viewMode === "enter-email" && (
          <motion.div
            suppressHydrationWarning
            key="enter-email"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full"
          >
            <div
              suppressHydrationWarning
              className="mb-8 text-center lg:text-left w-full flex flex-col items-center lg:items-start"
            >
              <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary text-center lg:text-left">
                Enter Your Email
              </h1>
              <p className="text-neutral-secondary text-[14px] xl:text-[15px] leading-relaxed mt-2 max-w-sm font-normal text-center lg:text-left mx-auto lg:mx-0">
                Enter the email address you used to create an account.
              </p>
            </div>

            <form
              onSubmit={handleSendCodeSubmit}
              className="w-full flex flex-col gap-6"
            >
              <Input
                label="Email Address"
                type="email"
                name="otpEmail"
                placeholder="chidi.umeh@email.com"
                value={otpEmail}
                error={errors.otpEmail}
                onChange={(e) => {
                  setOtpEmail(e.target.value);
                  if (errors.otpEmail)
                    setErrors((prev) => ({ ...prev, otpEmail: undefined }));
                }}
                disabled={isSubmitting}
              />

              <div suppressHydrationWarning className="w-full mt-2">
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  className="w-full h-12.5 text-white font-bold text-base bg-secondary hover:bg-secondary-hover focus:ring-secondary/30 transition-all shadow-lg cursor-pointer"
                  loading={isSubmitting}
                >
                  Send Verification Code
                </Button>
              </div>

              <div
                suppressHydrationWarning
                className="w-full text-center mt-3 text-sm select-none"
              >
                <span className="text-neutral-secondary font-normal">
                  Go to
                </span>
                <button
                  type="button"
                  onClick={() => setViewMode("signin")}
                  className="text-primary-solid font-bold ml-1 hover:text-primary-hover transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* VIEW 3: Verify your Email (Image 2) */}
        {viewMode === "verify-email" && (
          <motion.div
            suppressHydrationWarning
            key="verify-email"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full"
          >
            <div
              suppressHydrationWarning
              className="mb-6 text-center lg:text-left w-full flex flex-col items-center lg:items-start"
            >
              <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary text-center lg:text-left">
                Verify your Email
              </h1>
              <p className="text-neutral-secondary text-[14px] xl:text-[15px] leading-relaxed mt-1.5 max-w-sm font-normal text-center lg:text-left mx-auto lg:mx-0">
                We sent a 4-digit code to{" "}
                <span className="font-semibold text-neutral-primary">
                  {maskEmail(otpEmail)}
                </span>
                . It expires in 10 minutes.
              </p>
            </div>

            <form
              onSubmit={handleVerifyEmailSubmit}
              className="w-full flex flex-col gap-6"
            >
              <div
                suppressHydrationWarning
                className="flex justify-center gap-3 w-full"
              >
                {otpCode.map((val, index) => {
                  const firstEmptyIndex = otpCode.findIndex((v) => v === "");
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
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      disabled={isSubmitting}
                      className={`w-12 h-14 md:w-13 md:h-15 rounded-xl border text-center text-xl font-bold outline-none transition-all duration-200
                        ${val ? "bg-input-bg text-text-dark border-transparent font-extrabold" : "bg-white border-gray-200"}
                        ${isFocused ? "border-secondary! ring-2! ring-secondary/20! bg-white!" : ""}
                        focus:border-secondary focus:ring-2 focus:ring-secondary/20 focus:bg-white
                      `}
                    />
                  );
                })}
              </div>

              <div suppressHydrationWarning className="w-full">
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  className="w-full h-12.5 text-white font-bold text-base bg-secondary hover:bg-secondary-hover focus:ring-secondary/30 transition-all shadow-lg cursor-pointer"
                  loading={isSubmitting}
                >
                  Verify Email
                </Button>
              </div>

              <div
                suppressHydrationWarning
                className="text-center text-sm font-semibold text-neutral-secondary -mt-2 select-none"
              >
                {formatTime(timeLeft)}
              </div>

              <div
                suppressHydrationWarning
                className="w-full text-center text-sm select-none -mt-2"
              >
                <span className="text-neutral-secondary font-normal">
                  Didn&apos;t get a code?
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-primary-solid font-bold ml-1 hover:text-primary-hover transition-colors focus:outline-none cursor-pointer"
                >
                  Resend
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW 4: Congratulations Modal (Image 3) */}
      <StatusModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/onboarding");
        }}
        type="success"
        title="Congratulations"
        description="Your Account was created successfully"
      />
    </div>
  );
};
