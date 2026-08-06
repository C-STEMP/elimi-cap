"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiLogOut, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { persistor } from "@/store";
import { clearTokens } from "@/lib/auth-storage";

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
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      try {
        clearTokens();
        dispatch(logout());
        if (typeof window !== "undefined") {
          window.localStorage.clear();
          window.sessionStorage.clear();
          document.cookie = "elimi_access_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
          document.cookie = "elimi_refresh_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
          document.cookie = "elimi_onboarded=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
        }
        if (persistor && typeof persistor.purge === "function") {
          persistor.purge();
        }
      } catch (err) {
        // Fallback
      }
      onClose();
      router.push("/signin");
    }
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
            className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 z-10 select-none overflow-hidden"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <FiX className="w-4 h-4" />
            </button>

            {/* Icon Banner */}
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#a31d38]/10 text-[#a31d38] mb-5">
              <FiLogOut className="w-7 h-7" />
            </div>

            {/* Text Content */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1e1e1e] tracking-tight">
              Confirm Sign Out
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed font-normal">
              Are you sure you want to log out of your Elimi CAP account? You will need to sign in again to access your dashboard.
            </p>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-6 py-2.5 rounded-xl bg-[#a31d38] hover:bg-[#8d1830] text-white font-semibold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
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
