"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ASSETS_URL } from "@/assets";
import { PasswordRequirements } from "@/components/ui/password-requirements";
import { FiEye } from "react-icons/fi";
import { FaApple } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "@/lib/validation";
import { useRegister, useGoogleAuth } from "@/features/auth/hooks";

export const SignUpEmail: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { toast } = useToast();
  const router = useRouter();
  const { mutate: registerUser, isPending } = useRegister();
  const { loginWithGoogle, isPending: isGooglePending } = useGoogleAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirmPassword);

    if (emailErr || passErr || confirmErr) {
      setErrors({
        email: emailErr || undefined,
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
    registerUser({ email, password });
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
          Create your account
        </h1>
        <p className="text-neutral-secondary text-[14px] xl:text-[15px] leading-relaxed mt-1 max-w-sm font-normal text-center lg:text-left mx-auto lg:mx-0">
          Join artisans building verified, NSQ-certified careers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <Input
          label={
            <span>
              Email Address<span className="text-primary-solid ml-0.5">*</span>
            </span>
          }
          type="email"
          name="email"
          placeholder="chidi.umeh@email.com"
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          disabled={isPending}
        />

        <div className="w-full flex flex-col">
          <Input
            label={
              <span>
                Password<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••••"
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
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none flex items-center justify-center p-1 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FiEye className="w-5 h-5 text-text-dark/70" />
                ) : (
                  <Image
                    src={ASSETS_URL.eyeClosedIcon}
                    alt="Hide password"
                    width={20}
                    height={20}
                    className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity"
                  />
                )}
              </button>
            }
            disabled={isPending}
          />
          <PasswordRequirements password={password} />
        </div>

        <div className="flex flex-col gap-1 w-full">
          <Input
            label={
              <span>
                Confirm Password
                <span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="••••••••••"
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
            suffix={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="focus:outline-none flex items-center justify-center p-1 cursor-pointer"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <FiEye className="w-5 h-5 text-text-dark/70" />
                ) : (
                  <Image
                    src={ASSETS_URL.eyeClosedIcon}
                    alt="Hide password"
                    width={20}
                    height={20}
                    className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity"
                  />
                )}
              </button>
            }
            disabled={isPending}
          />
        </div>

        <div className="w-full flex justify-end -mt-1 select-none">
          {/* <Link
            href={`/enter-otp?email=${encodeURIComponent(email)}`}
            className="text-primary-solid font-bold text-xs xl:text-sm hover:text-primary-hover transition-colors"
          >
            Re-enter OTP
          </Link> */}
        </div>

        <div className="w-full">
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full h-12.5 text-white font-bold text-base bg-secondary hover:bg-secondary-hover focus:ring-secondary/30 transition-all shadow-sm cursor-pointer"
            loading={isPending}
          >
            Create Account
          </Button>
        </div>

        <div className="w-full flex items-center gap-4 my-1 select-none">
          <div className="flex-1 h-px bg-border-gray/70" />
          <span className="text-neutral-secondary text-xs font-normal">or</span>
          <div className="flex-1 h-px bg-border-gray/70" />
        </div>

        <div className="w-full flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => loginWithGoogle()}
            disabled={isPending || isGooglePending}
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
            {isGooglePending ? "Connecting to Google..." : "Continue with Google"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() =>
              toast({
                type: "info",
                title: "Apple Sign-In",
                description: "Connecting to Apple Authentication...",
              })
            }
            disabled={isPending}
            leftIcon={<FaApple className="w-4 h-4 sm:w-5 sm:h-5 text-black" />}
            className="w-full h-12.5 text-text-dark font-medium text-sm xl:text-base cursor-pointer"
          >
            Continue with Apple
          </Button>
        </div>

        <div className="w-full text-center mt-2 text-sm select-none">
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
    </motion.div>
  );
};
