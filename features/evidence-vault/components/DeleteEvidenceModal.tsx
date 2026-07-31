"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiTrash2 } from "react-icons/fi";

interface DeleteEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export const DeleteEvidenceModal: React.FC<DeleteEvidenceModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="bg-white rounded-[28px] p-8 sm:p-10 max-w-sm w-full flex flex-col items-center text-center shadow-2xl relative"
        >
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 bg-[#fdf2f4] hover:bg-[#fce3e7] rounded-xl flex items-center justify-center text-[#a31d38] cursor-pointer absolute top-6 right-6 transition-colors"
          >
            <FiX className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="w-24 h-24 rounded-full bg-[#fee2e2] flex items-center justify-center mb-6 text-[#dc2626]">
            <FiTrash2 className="w-14 h-14" />
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight mb-2">
            Delete Evidence
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm font-normal leading-relaxed mb-6 max-w-[260px]">
            Are you sure you want to delete this evidence? This action cannot be reversed.
          </p>

          <button
            type="button"
            onClick={onConfirmDelete}
            className="w-full bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold text-sm sm:text-base py-3.5 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Delete Evidence
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
