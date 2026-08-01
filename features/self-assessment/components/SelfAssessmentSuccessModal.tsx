"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ASSETS_URL } from "@/assets";

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl relative flex flex-col items-center"
        >
          <div className="mt-2 mb-4 relative flex items-center justify-center">
            <Image
              src={ASSETS_URL.successCheckmarkImg}
              alt="Success Checkmark"
              width={160}
              height={160}
              className="w-36 h-36 object-contain"
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </div>

          <h3 className="text-neutral-primary font-extrabold text-xl sm:text-2xl mb-2 tracking-tight">
            Self-Assessment Complete
          </h3>

          <p className="text-neutral-secondary text-xs sm:text-sm mb-8 leading-relaxed max-w-xs font-normal">
            You have successfully submitted your self assessment form
          </p>

          <Button
            type="button"
            onClick={onNavigateToVault}
            variant="amber"
            size="lg"
            className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] transition-all shadow-sm cursor-pointer rounded-xl"
          >
            Go To Evidence Vault
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

