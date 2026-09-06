"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUsers, FiX } from "react-icons/fi";

interface PromptCreatePanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePanel: () => void;
}

export const PromptCreatePanelModal: React.FC<PromptCreatePanelModalProps> = ({
  isOpen,
  onClose,
  onCreatePanel,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white rounded-[28px] p-8 sm:p-10 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative border border-gray-100"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 bg-[#FCE8EC] hover:bg-[#FAD1D8] rounded-xl flex items-center justify-center text-[#A31D38] cursor-pointer absolute top-6 right-6 transition-colors select-none"
          >
            <FiX className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Glowing Users Icon container */}
          <div className="relative mb-5 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center relative">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-b from-[#F59E0B] via-[#D97706] to-[#B45309] flex items-center justify-center shadow-lg shadow-amber-500/30 text-white">
                <FiUsers className="w-8 h-8 stroke-[2.2]" />
              </div>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-2">
            Create Panel First
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm font-normal mb-8 max-w-xs leading-relaxed">
            You haven't created an interview panel yet. Please create a panel before scheduling an interview.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              type="button"
              onClick={onCreatePanel}
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] active:scale-[0.99] text-white font-bold text-sm sm:text-base h-12 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              Create Panel +
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-sm sm:text-base h-12 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
