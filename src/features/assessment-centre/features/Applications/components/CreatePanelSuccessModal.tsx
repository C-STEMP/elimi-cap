"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck } from "react-icons/fi";

interface CreatePanelSuccessModalProps {
  isOpen: boolean;
  onContinue: () => void;
}

export const CreatePanelSuccessModal: React.FC<CreatePanelSuccessModalProps> = ({
  isOpen,
  onContinue,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="bg-white rounded-[28px] p-8 sm:p-10 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative border border-gray-100"
        >
          {/* Green glossy 3D Checkmark Circle */}
          <div className="relative mb-6">
            <div className="w-22 h-22 rounded-full bg-radial from-[#7CE05A] via-[#52B836] to-[#3B9B22] flex items-center justify-center shadow-lg shadow-green-600/30">
              <div className="w-18 h-18 rounded-full bg-linear-to-b from-white/35 to-transparent absolute top-1 left-2 pointer-events-none" />
              <FiCheck className="w-11 h-11 text-white stroke-[3.5] drop-shadow-xs" />
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-2">
            Congratulations
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm font-normal leading-relaxed mb-8 max-w-xs">
            You have successfully created a panel
          </p>

          <button
            type="button"
            onClick={onContinue}
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] active:scale-[0.99] text-white font-bold text-sm sm:text-base h-12 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20"
          >
            Continue
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
