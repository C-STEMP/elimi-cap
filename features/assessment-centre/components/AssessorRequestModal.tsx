"use client";

import React from "react";
import Image from "next/image";
import { FiX, FiAlertTriangle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ASSETS_URL } from "@/assets";

export type AssessorRequestModalMode =
  | "confirm-accept"
  | "accepted-success"
  | "declined-success";

interface AssessorRequestModalProps {
  isOpen: boolean;
  mode: AssessorRequestModalMode;
  onClose: () => void;
  onConfirmAccept?: () => void;
}

export const AssessorRequestModal: React.FC<AssessorRequestModalProps> = ({
  isOpen,
  mode,
  onClose,
  onConfirmAccept,
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
          {/* Mode 1: Confirm Accept Request (Image 1) */}
          {mode === "confirm-accept" && (
            <div className="w-full flex flex-col items-center">
              <div className="w-28 h-28 rounded-3xl bg-amber-50 border-4 border-amber-100 flex items-center justify-center mb-4 text-[#fbab2a] shadow-2xs">
                <FiAlertTriangle className="w-16 h-16 stroke-[1.8]" />
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary mb-2 tracking-tight">
                Are You sure?
              </h3>

              <p className="text-xs sm:text-sm text-neutral-secondary font-normal mb-8 leading-relaxed">
                Confirm you want to accept this assessor request?
              </p>

              <div className="flex flex-col gap-3 w-full">
                <Button
                  type="button"
                  onClick={onConfirmAccept}
                  variant="amber"
                  size="lg"
                  className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] transition-all shadow-sm cursor-pointer rounded-xl"
                >
                  Yes, Accept Request
                </Button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full h-12.5 bg-white border border-[#fbab2a] text-[#fbab2a] hover:bg-amber-50 font-bold text-base rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  No
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Accepted Success (Image 5) */}
          {mode === "accepted-success" && (
            <div className="w-full flex flex-col items-center">
              <div className="mt-2 mb-4 relative flex items-center justify-center">
                <Image
                  src={ASSETS_URL.successCheckmarkImg}
                  alt="Accepted Successfully"
                  width={160}
                  height={160}
                  className="w-36 h-36 object-contain"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>

              <h3 className="text-neutral-primary font-extrabold text-xl sm:text-2xl mb-2 tracking-tight">
                Accepted Successfully
              </h3>

              <p className="text-neutral-secondary text-xs sm:text-sm mb-8 leading-relaxed font-normal">
                You have successfully accepted this request
              </p>

              <Button
                type="button"
                onClick={onClose}
                variant="amber"
                size="lg"
                className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] transition-all shadow-sm cursor-pointer rounded-xl"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Mode 3: Declined Success (Image 4) */}
          {mode === "declined-success" && (
            <div className="w-full flex flex-col items-center">
              <div className="mt-2 mb-4 relative flex items-center justify-center">
                <Image
                  src={ASSETS_URL.successCheckmarkImg}
                  alt="Declined Successfully"
                  width={160}
                  height={160}
                  className="w-36 h-36 object-contain"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>

              <h3 className="text-neutral-primary font-extrabold text-xl sm:text-2xl mb-2 tracking-tight">
                Declined Successfully
              </h3>

              <p className="text-neutral-secondary text-xs sm:text-sm mb-8 leading-relaxed font-normal">
                You have successfully declined this request
              </p>

              <Button
                type="button"
                onClick={onClose}
                variant="amber"
                size="lg"
                className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] transition-all shadow-sm cursor-pointer rounded-xl"
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
