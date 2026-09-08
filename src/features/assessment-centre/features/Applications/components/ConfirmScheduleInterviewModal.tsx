"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle } from "react-icons/fi";

interface ConfirmScheduleInterviewModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  candidateCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmScheduleInterviewModal: React.FC<ConfirmScheduleInterviewModalProps> = ({
  isOpen,
  isSubmitting = false,
  candidateCount,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-[28px] p-8 sm:p-10 max-w-md w-full flex flex-col items-center text-center shadow-2xl border border-gray-100"
        >
          <div className="relative mb-5 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-b from-[#F59E0B] via-[#D97706] to-[#B45309] flex items-center justify-center shadow-lg shadow-amber-500/30 text-white">
                <FiAlertTriangle className="w-9 h-9 stroke-[2.5]" />
              </div>
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-2">Are you sure?</h3>
          <p className="text-gray-500 text-xs sm:text-sm mb-8 max-w-xs">
            Confirm you want to schedule interview for {candidateCount} candidate(s).
          </p>
          <div className="flex flex-col gap-3 w-full">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onConfirm}
              className="w-full bg-[#8B182E] hover:bg-[#701224] text-white font-bold h-12 rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Scheduling..." : "Yes, Schedule"}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onCancel}
              className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold h-12 rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
