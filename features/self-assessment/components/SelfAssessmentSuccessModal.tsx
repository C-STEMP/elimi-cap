"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  isOpen: boolean;
  onNavigateToVault: () => void;
}

export const SelfAssessmentSuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onNavigateToVault,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-[28px] p-8 max-w-md w-full text-center shadow-2xl relative flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#34D399] to-[#10B981] p-1 flex items-center justify-center shadow-lg mb-6 ring-8 ring-[#10B981]/15">
            <div className="w-20 h-20 rounded-full bg-[#10B981] flex items-center justify-center border-2 border-white/40">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-white stroke-[3]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h3 className="text-black font-extrabold text-xl sm:text-2xl mb-2 tracking-tight">
            Self-Assessment Complete
          </h3>

          <p className="text-gray-400 text-xs sm:text-sm mb-6 leading-relaxed">
            You have successfully submitted your self assessment form
          </p>

          <Button
            type="button"
            onClick={onNavigateToVault}
            variant="amber"
            size="lg"
            fullWidth
            rounded="xl"
          >
            Go To Evidence Vault
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
