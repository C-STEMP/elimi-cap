"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useToast } from "@/src/components/ui/toast";
import { PasswordRequirements } from "@/src/components/ui/password-requirements";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusModal } from "@/components/status-modal";
import { motion } from "framer-motion";
import {
  validatePassword,
  validateConfirmPassword,
} from "@/src/lib/validation";
import { ApiError } from "@/src/lib/api/client";
import { useResetPassword } from "@/src/features/shared/authentication/hooks";

export const ChangePassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const otp = searchParams.get("otp") ?? "";
  const mode = searchParams.get("mode");

  const { mutate: performReset, isPending } = useResetPassword();

  useEffect(() => {
    if (mode === "reset" && !otp) {
      toast({
        type: "error",
        title: "Verification Required",
        description: "Please enter your verification code first.",
      });
      router.push(
        `/verify?email=${encodeURIComponent(email)}&purpose=password_reset`,
      );
    }
  }, [mode, otp, email, router, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirmPassword);

    if (passErr || confirmErr) {
      setErrors({
        password: passErr || undefined,
        confirmPassword: confirmErr || undefined,
      });
      toast({
        type: "error",
        title: "Validation Error",
        description: "Please check the highlighted fields.",
      });
      return;
    }

    setErrors({});
    performReset(
      { email, otp, newPassword: password },
      {
        onSuccess: () => {
          setShowSuccessModal(true);
        },
        onError: (error: Error) => {
          if (error instanceof ApiError && error.statusCode === 422) {
            setTimeout(() => {
              router.push(
                `/verify?email=${encodeURIComponent(email)}&purpose=password_reset`,
              );
            }, 1200);
          }
        },
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-110 mx-auto flex flex-col justify-center select-text"
    >
      <div className="mb-8 text-center lg:text-left w-full flex flex-col items-center lg:items-start">
        <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary text-center lg:text-left">
          Change Password
        </h1>
        <p className="text-neutral-secondary text-[14px] xl:text-[15px] leading-relaxed mt-2 max-w-sm font-normal text-center lg:text-left mx-auto lg:mx-0">
          Enter your new password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        <div className="w-full flex flex-col">
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••••••"
            value={password}
            error={errors.password}
            onChange={(e) => {
              const val = e.target.value;
              setPassword(val);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: undefined }));
              if (confirmPassword) {
                if (val !== confirmPassword) {
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: "Passwords do not match",
                  }));
                } else {
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
                }
              }
            }}
            disabled={isPending}
          />
          <PasswordRequirements password={password} />
        </div>

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="••••••••••••"
          value={confirmPassword}
          error={errors.confirmPassword}
          onChange={(e) => {
            const val = e.target.value;
            setConfirmPassword(val);
            if (val && password && val !== password) {
              setErrors((prev) => ({
                ...prev,
                confirmPassword: "Passwords do not match",
              }));
            } else {
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }
          }}
          disabled={isPending}
        />

        <div className="w-full mt-2">
          <Button
            type="submit"
            variant="secondary"
            size="md"
            className="w-full h-12.5 text-white! font-bold text-base bg-secondary hover:bg-secondary-hover focus:ring-secondary/30 transition-all shadow-lg cursor-pointer"
            loading={isPending}
          >
            Change Password
          </Button>
        </div>

        <div className="w-full text-center mt-3 text-sm select-none">
          <span className="text-neutral-secondary font-normal">Go to</span>
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
        description="Your Password has been changed successfully"
        actionLabel="Sign In"
        onAction={() => router.push("/signin")}
      />
    </motion.div>
  );
};
