"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";

interface AwardingBodyNotifiedSuccessModalProps {
  isOpen: boolean;
  onContinue: () => void;
}

export const AwardingBodyNotifiedSuccessModal: React.FC<
  AwardingBodyNotifiedSuccessModalProps
> = ({ isOpen, onContinue }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white rounded-[28px] p-8 sm:p-10 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative border border-gray-100"
        >
          <div className="w-20 h-20 rounded-full bg-[#48C046] flex items-center justify-center text-white mb-6 shadow-md">
            <FiCheck className="w-10 h-10 stroke-[3]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight mb-2">
            Awarding Body Notified
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm font-normal leading-relaxed mb-8 max-w-xs">
            You&apos;ve successfully notify the awarding body
          </p>

          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onContinue}
            className="w-full bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-sm sm:text-base h-12.5 rounded-xl cursor-pointer"
          >
            Continue
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
