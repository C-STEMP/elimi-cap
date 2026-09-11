"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";

interface GenerateLinkSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyLink: () => void;
}

export const GenerateLinkSuccessModal: React.FC<
  GenerateLinkSuccessModalProps
> = ({ isOpen, onClose, onCopyLink }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-text"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-8 sm:p-9 max-w-md w-full shadow-2xl relative border border-gray-100 flex flex-col items-center text-center gap-4"
        >
          {/* Glowing Green Circular Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#10B981] to-[#34D399] flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white mb-1">
            <FiCheck className="w-10 h-10 stroke-[3]" />
          </div>

          <div className="flex flex-col items-center gap-1">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              Congratulations
            </h3>
            <p className="text-xs text-gray-400 font-normal">
              Link was generated successfully
            </p>
          </div>

          <div className="w-full mt-3">
            <Button
              type="button"
              onClick={onCopyLink}
              variant="amber"
              className="w-full py-3.5 bg-[#fbab2a] hover:bg-[#e89b1f] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md cursor-pointer border-none"
            >
              Copy Link
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
