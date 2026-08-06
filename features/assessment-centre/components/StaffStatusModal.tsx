"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiX, FiSlash, FiLock, FiUnlock } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ASSETS_URL } from "@/assets";

export type StaffStatusModalMode =
  | "confirm-deactivate"
  | "deactivated-success"
  | "confirm-activate"
  | "activated-success";

interface StaffStatusModalProps {
  isOpen: boolean;
  mode: StaffStatusModalMode;
  staffName?: string;
  onClose: () => void;
  onConfirmDeactivate?: () => void;
  onConfirmActivate?: () => void;
}

export const StaffStatusModal: React.FC<StaffStatusModalProps> = ({
  isOpen,
  mode,
  staffName = "Ifeoma Chukwu",
  onClose,
  onConfirmDeactivate,
  onConfirmActivate,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-300 select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl relative flex flex-col items-center text-center"
        >
          {/* Close Button X */}
          {(mode === "confirm-deactivate" || mode === "confirm-activate") && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-6 right-6 w-11 h-11 rounded bg-primary/10 text-primary hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
              aria-label="Close modal"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}

          {/* Mode 1: Confirm Deactivate (Image 3) */}
          {mode === "confirm-deactivate" && (
            <div className="w-full flex flex-col items-center">
              <div className="mt-2 mb-4 relative flex items-center justify-center">
                <Image
                  src={ASSETS_URL.deactivateStaffImg}
                  alt="Staff Deactivated Successfully"
                  width={160}
                  height={160}
                  className="w-36 h-36 object-contain"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary mb-2 tracking-tight">
                Deactivate Account
              </h3>

              <p className="text-xs sm:text-sm text-neutral-secondary font-normal mb-8 leading-relaxed">
                Are you sure you want to deactivate this account?
              </p>

              <button
                type="button"
                onClick={onConfirmDeactivate}
                className="w-full h-12.5 text-white font-bold text-base bg-[#C5221F] hover:bg-[#a81c19] transition-all shadow-lg cursor-pointer rounded-xl"
              >
                Deactivate Account
              </button>
            </div>
          )}

          {/* Mode 2: Deactivated Success (Image 5) */}
          {mode === "deactivated-success" && (
            <div className="w-full flex flex-col items-center">
              <div className="mt-2 mb-4 relative flex items-center justify-center">
                <Image
                  src={ASSETS_URL.deactivateStaffImg}
                  alt="Staff Deactivated Successfully"
                  width={160}
                  height={160}
                  className="w-36 h-36 object-contain"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>

              <h3 className="text-neutral-primary font-extrabold text-xl sm:text-2xl mb-2 tracking-tight">
                Staff Deactivated Successfully
              </h3>

              <p className="text-neutral-secondary text-xs sm:text-sm mb-8 leading-relaxed font-normal">
                You have successfully deactivated this staff account
              </p>

              <Button
                type="button"
                onClick={onClose}
                variant="amber"
                size="lg"
                className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] transition-all shadow-lg cursor-pointer rounded-xl"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Mode 3: Confirm Activate (Image 4) */}
          {mode === "confirm-activate" && (
            <div className="w-full flex flex-col items-center">
              {/* Padlock Illustration */}
              <div className="mt-2 mb-4 relative flex items-center justify-center">
                <Image
                  src={ASSETS_URL.activateStaffImg}
                  alt="Staff Activated Successfully"
                  width={160}
                  height={160}
                  className="w-36 h-36 object-contain"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary mb-2 tracking-tight">
                Activate Account
              </h3>

              <p className="text-xs sm:text-sm text-neutral-secondary font-normal mb-8 leading-relaxed">
                Are you sure you want to activate this account?
              </p>

              <Button
                type="button"
                onClick={onConfirmActivate}
                variant="amber"
                size="lg"
                className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] transition-all shadow-lg cursor-pointer rounded-xl"
              >
                Activate Account
              </Button>
            </div>
          )}

          {/* Mode 4: Activated Success (Image 2) */}
          {mode === "activated-success" && (
            <div className="w-full flex flex-col items-center">
              <div className="mt-2 mb-4 relative flex items-center justify-center">
                <Image
                  src={ASSETS_URL.activateStaffImg}
                  alt="Staff Activated Successfully"
                  width={160}
                  height={160}
                  className="w-36 h-36 object-contain"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>

              <h3 className="text-neutral-primary font-extrabold text-xl sm:text-2xl mb-2 tracking-tight">
                Staff Activated Successfully
              </h3>

              <p className="text-neutral-secondary text-xs sm:text-sm mb-8 leading-relaxed font-normal">
                You have successfully activated this staff account
              </p>

              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                size="lg"
              >
                Continue
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
