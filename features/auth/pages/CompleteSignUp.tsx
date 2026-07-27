"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { eyeClosedIcon } from "@/assets";
import { FiEye } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusModal } from "@/components/ui/status-modal";
import { motion } from "framer-motion";
import {
  validateRequired,
  validatePassword,
  validateConfirmPassword,
} from "@/lib/validation";

export const CompleteSignUp: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const { toast } = useToast();
  const router = useRouter();
  const email = "chidi.umeh@email.com";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nameErr = validateRequired(fullName, "Full name");
    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirmPassword);

    if (nameErr || passErr || confirmErr) {
      setErrors({
        fullName: nameErr || undefined,
        password: passErr || undefined,
        confirmPassword: confirmErr || undefined,
      });
      toast({
        type: "error",
        title: "Validation Error",
        description: "Please check the highlighted fields below.",
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col justify-center select-text"
    >
      <div className="mb-8 text-center lg:text-left w-full flex flex-col items-center lg:items-start">
        <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary text-center lg:text-left">
          Create Account
        </h1>
        <p className="text-neutral-secondary text-[14px] xl:text-[15px] leading-relaxed mt-2 max-w-sm font-normal text-center lg:text-left mx-auto lg:mx-0">
          Complete your profile registration for <span className="font-semibold">{email}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        <Input
          label="Full Name"
          type="text"
          name="fullName"
          placeholder="e.g. Tunde Balogun"
          value={fullName}
          error={errors.fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
          }}
          disabled={isSubmitting}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="••••••••••••"
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none flex items-center justify-center p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <FiEye className="w-5 h-5" />
              ) : (
                <Image
                  src={eyeClosedIcon}
                  alt="Hide password"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              )}
            </button>
          }
          disabled={isSubmitting}
        />

        <Input
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="••••••••••••"
          value={confirmPassword}
          error={errors.confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword)
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
          }}
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="focus:outline-none flex items-center justify-center p-1"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <FiEye className="w-5 h-5" />
              ) : (
                <Image
                  src={eyeClosedIcon}
                  alt="Hide password"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              )}
            </button>
          }
          disabled={isSubmitting}
        />

        <div className="w-full mt-2">
          <Button
            type="submit"
            variant="secondary"
            size="normal"
            className="w-full max-w-110 h-12.5 text-white! font-bold text-base bg-secondary hover:bg-secondary-hover focus:ring-secondary/30 transition-all shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 justify-center text-neutral-burgundy font-semibold leading-tight">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>
        </div>

        <div className="w-full max-w-110 text-center mt-3 text-sm select-none">
          <span className="text-neutral-secondary font-normal">
            Already have an account?
          </span>
          <Link
            href="/signin"
            className="text-primary-solid font-bold ml-1 hover:text-primary-hover transition-colors"
          >
            Sign In
          </Link>
        </div>
      </form>

      <StatusModal
        isOpen={showSuccessModal}
        type="success"
        title="Congratulations"
        description="Your ELIMI account has been created successfully"
        actionLabel="Sign In"
        onAction={() => router.push("/signin")}
      />
    </motion.div>
  );
};
