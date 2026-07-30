"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiFileText } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl border border-gray-100 relative max-h-[90vh] overflow-y-auto"
          >
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              size="icon"
              leftIcon={<FiX className="w-5 h-5" />}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Close modal"
            />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#fdf2f4] text-[#a31d38] flex items-center justify-center">
                <FiFileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Application Form Details
                </h3>
                <span className="text-xs text-gray-400">
                  Carpentry (Level 3)
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-gray-600 mb-6">
              <div className="bg-input-bg p-3.5 rounded-xl flex justify-between">
                <span className="text-gray-400">Trade:</span>
                <span className="font-semibold text-gray-900">Carpentry</span>
              </div>
              <div className="bg-input-bg p-3.5 rounded-xl flex justify-between">
                <span className="text-gray-400">Submitted Date:</span>
                <span className="font-semibold text-gray-900">7/21/2026</span>
              </div>
              <div className="bg-input-bg p-3.5 rounded-xl flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="font-semibold text-[#047857]">Approved</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="danger"
                size="sm"
              >
                OK
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
