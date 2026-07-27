"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export interface SuccessProps {
  onStartApplication?: () => void;
  onGoToDashboard?: () => void;
}

export const Success: React.FC<SuccessProps> = ({
  onStartApplication,
  onGoToDashboard,
}) => {
  const router = useRouter();

  const handleStart = () => {
    if (onStartApplication) {
      onStartApplication();
    } else {
      router.push("/onboarding/start-application");
    }
  };

  const handleDashboard = () => {
    if (onGoToDashboard) {
      onGoToDashboard();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-110 mx-auto flex flex-col items-center justify-center text-center select-text"
    >
      {/* Party Popper Icon */}
      <div className="mb-5 flex justify-center">
        <div className="w-24 h-24 flex items-center justify-center">
          <svg
            width="88"
            height="88"
            viewBox="0 0 88 88"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-contain"
          >
            {/* Confetti specs */}
            <path
              d="M54 14L60 20M60 14L54 20"
              stroke="#E11D48"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="34" cy="18" r="3.5" fill="#3B82F6" />
            <circle cx="68" cy="30" r="4" fill="#8B5CF6" />
            <rect
              x="44"
              y="24"
              width="7"
              height="7"
              rx="2"
              fill="#10B981"
              transform="rotate(25 44 24)"
            />
            <path
              d="M24 30C24 30 29 25 34 29"
              stroke="#F59E0B"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M62 14C62 14 67 19 70 14"
              stroke="#EC4899"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Party Popper cone */}
            <path
              d="M28 66L48 46L56 54L36 74C33.2 76.8 28.8 76.8 26 74C23.2 71.2 23.2 66.8 26 64L28 66Z"
              fill="#FF7A59"
            />
            <path
              d="M48 46L28 66L21 59C18.2 56.2 18.2 51.8 21 49L41 29L48 46Z"
              fill="#FFC107"
            />
            <path d="M48 46L56 54L66 36L48 46Z" fill="#38BDF8" />
            <path d="M48 46L66 36L41 29L48 46Z" fill="#A855F7" />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary">
        Success
      </h1>

      <h2 className="text-base xl:text-lg font-bold text-neutral-primary mt-1">
        Your workspace is ready.
      </h2>

      <div className="text-neutral-secondary text-sm xl:text-base leading-relaxed mt-4 mb-8 font-normal max-w-sm space-y-1">
        <p>Welcome to ELIMI.</p>
        <p>Your dashboard has been configured based on your selected role.</p>
      </div>

      <div className="w-full flex flex-col gap-3">
        <Button
          type="button"
          onClick={handleStart}
          variant="secondary"
          size="normal"
          className="w-full h-12.5 text-white font-bold text-base bg-secondary hover:bg-secondary-hover focus:ring-secondary/30 transition-all shadow-sm cursor-pointer"
        >
          Start Application
        </Button>

        <button
          type="button"
          onClick={handleDashboard}
          className="w-full h-12.5 bg-white border border-secondary text-secondary hover:bg-secondary/10 font-bold text-base rounded-lg transition-all shadow-sm cursor-pointer"
        >
          Go to Dashboard
        </button>
      </div>
    </motion.div>
  );
};
