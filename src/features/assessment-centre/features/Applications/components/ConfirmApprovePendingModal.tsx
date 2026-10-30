"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiX } from "react-icons/fi";

export interface ConfirmApprovePendingModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  count?: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmApprovePendingModal: React.FC<
  ConfirmApprovePendingModalProps
> = ({
  isOpen,
  isSubmitting = false,
  count = 1,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isMultiple = count > 1;
  const title = isMultiple
    ? `Approve ${count} Pending Applications?`
    : "Approve Pending Application?";

  const description = isMultiple
    ? `Are you sure you want to approve these ${count} pending applications? This will accept the candidate applications and advance them to the next stage.`
    : "Are you sure you want to approve this pending application? This will accept the candidate application and advance it to the next stage.";

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
          {/* Top-right close button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Close"
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-800 cursor-pointer absolute top-6 right-6 transition-colors disabled:opacity-40"
          >
            <FiX className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Success / Approve Icon */}
          <div className="relative mb-5 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#1E7F4C]/10 flex items-center justify-center text-[#1E7F4C]">
              <FiCheckCircle className="w-9 h-9 stroke-[2]" />
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm font-normal mb-8 max-w-sm leading-relaxed">
            {description}
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onConfirm}
              className="w-full bg-[#1E7F4C] hover:bg-[#1E7F4C]/90 active:scale-[0.99] text-white font-bold text-sm sm:text-base h-12 rounded-xl transition-all cursor-pointer shadow-md shadow-[#1E7F4C]/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiCheckCircle className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Approving..."
                  : isMultiple
                  ? `Yes, Approve All (${count})`
                  : "Yes, Approve Application"}
              </span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={onCancel}
              className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-sm sm:text-base h-12 rounded-xl transition-all cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
