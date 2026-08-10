"use client";

import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useToast } from "@/src/components/ui/toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { validateEmail } from "@/src/lib/validation";

export const EnterOtpEmail: React.FC = () => {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "chidi.umeh@email.com";
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      toast({
        type: "error",
        title: "Email Required",
        description: emailErr,
      });
      return;
    }

    setError(undefined);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        type: "success",
        title: "Code Sent",
        description: "A verification code has been sent to your email address.",
      });
      setTimeout(() => {
        router.push("/verify");
      }, 800);
    }, 600);
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
          Enter Your Email
        </h1>
        <p className="text-neutral-secondary text-[14px] xl:text-[15px] leading-relaxed mt-2 max-w-sm font-normal text-center lg:text-left mx-auto lg:mx-0">
          Enter the email address you used to create an account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="chidi.umeh@email.com"
          value={email}
          error={error}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(undefined);
          }}
          disabled={isSubmitting}
        />

        <div className="w-full mt-2">
          <Button
            type="submit"
            variant="secondary"
            size="md"
            className="w-full h-12.5 text-white font-bold text-base bg-secondary hover:bg-secondary-hover focus:ring-secondary/30 transition-all shadow-lg cursor-pointer"
            loading={isSubmitting}
          >
            Send Verification Code
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
    </motion.div>
  );
};
