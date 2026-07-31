"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiFileText } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { EvidenceRecord } from "../utils/evidenceConstants";

interface PreviewEvidenceModalProps {
  item: EvidenceRecord | null;
  onClose: () => void;
}

export const PreviewEvidenceModal: React.FC<PreviewEvidenceModalProps> = ({
  item,
  onClose,
}) => {
  if (!item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#fdf2f4] text-[#a31d38] flex items-center justify-center">
              <FiFileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-black">{item.name}</h4>
              <span className="text-xs text-gray-400">{item.size}</span>
            </div>
          </div>

          <div className="bg-input-bg p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-gray-100 mb-6">
            <FiFileText className="w-12 h-12 text-[#a31d38] mb-2" />
            <span className="text-xs text-gray-500">Document Preview</span>
          </div>

          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
