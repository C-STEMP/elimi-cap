"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiLogOut, FiX } from "react-icons/fi";
import { handleLogout } from "@/store/actions/authActions";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const handleConfirmLogout = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
    handleLogout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 z-10 select-none overflow-hidden text-center flex flex-col items-center"
          >
            {/* Top Centralized Cancel/Close Icon */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="mb-4 w-12 h-12 rounded-xl bg-primary/10 text-primary hover:bg-[#FBE8ED] flex items-center justify-center transition-colors cursor-pointer mx-auto"
            >
              <FiX className="w-6 h-6 stroke-[2.5]" />
            </button>

            {/* Centralized Text Content */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-text-dark tracking-tight text-center">
              Confirm Sign Out
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed font-normal text-center mx-auto max-w-xs">
              Are you sure you want to log out of your Elimi CAP account? You
              will need to sign in again to access your dashboard.
            </p>

            {/* Full Width Divided Action Buttons */}
            <div className="mt-6 w-full grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-sm sm:text-base hover:bg-gray-50 transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="w-full py-3 rounded-xl bg-[#a31d38] hover:bg-[#8d1830] active:scale-98 text-white font-bold text-sm sm:text-base shadow-lg transition-all cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <FiLogOut className="w-4 h-4" />
                Yes, Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
