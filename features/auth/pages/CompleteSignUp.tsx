"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ASSETS_URL } from "@/assets";
import { PasswordRequirements } from "@/components/ui/password-requirements";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "user@email.com";

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
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              if (confirmPassword) {
                if (val !== confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
                } else {
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }
            }}
            disabled={isSubmitting}
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
              setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
            } else {
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }
          }}
          disabled={isSubmitting}
        />

        <div className="w-full mt-2">
          <Button
            type="submit"
            variant="secondary"
            size="md"
            className="w-full max-w-110 h-12.5 text-white! font-bold text-base bg-secondary hover:bg-secondary-hover focus:ring-secondary/30 transition-all shadow-sm"
            loading={isSubmitting}
          >
            Create Account
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
