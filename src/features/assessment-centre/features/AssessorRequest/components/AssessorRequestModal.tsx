"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { ASSETS_URL } from "@/assets";

export type AssessorRequestModalMode =
  | "confirm-accept"
  | "accepted-success"
  | "confirm-decline"
  | "declined-success";

interface AssessorRequestModalProps {
  isOpen: boolean;
  mode: AssessorRequestModalMode;
  onClose: () => void;
  onConfirmAccept?: () => void;
  onConfirmDecline?: (reason?: string) => void;
  isLoading?: boolean;
}

export const AssessorRequestModal: React.FC<AssessorRequestModalProps> = ({
  isOpen,
  mode,
  onClose,
  onConfirmAccept,
  onConfirmDecline,
  isLoading = false,
}) => {
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!isOpen || mode !== "confirm-decline") {
      setRejectionReason("");
    }
  }, [isOpen, mode]);

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
          {/* Mode 1: Confirm Accept Request (Image 2 match) */}
          {mode === "confirm-accept" && (
            <div className="w-full flex flex-col items-center">
              <div className="mt-2 mb-4 w-25 h-25 relative flex items-center justify-center mx-auto">
                <Image
                  src={ASSETS_URL.warningIcon}
                  alt="Warning"
                  width={100}
                  height={100}
                  className="w-25 h-25 object-contain"
                  style={{ width: 100, height: 100 }}
                  priority
                />
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
                  loading={isLoading}
                  disabled={isLoading}
                  variant="amber"
                  size="lg"
                  className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] transition-all shadow-lg cursor-pointer rounded-xl"
                >
                  Yes, Accept Request
                </Button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full h-12.5 bg-white border border-[#fbab2a] text-[#fbab2a] hover:bg-amber-50 font-bold text-base rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-50"
                >
                  No
                </button>
              </div>
            </div>
          )}

          {/* Mode 1.5: Confirm Decline Request (Image 2 match) */}
          {mode === "confirm-decline" && (
            <div className="w-full flex flex-col items-center">
              <div className="mt-2 mb-4 w-25 h-25 relative flex items-center justify-center mx-auto">
                <Image
                  src={ASSETS_URL.warningIcon}
                  alt="Warning"
                  width={100}
                  height={100}
                  className="w-25 h-25 object-contain"
                  style={{ width: 100, height: 100 }}
                  priority
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary mb-2 tracking-tight">
                Are You sure?
              </h3>

              <p className="text-xs sm:text-sm text-neutral-secondary font-normal mb-4 leading-relaxed">
                Confirm you want to decline this assessor request?
              </p>

              <div className="w-full mb-6 text-left">
                <label
                  htmlFor="rejection-reason"
                  className="block text-xs font-semibold text-neutral-primary mb-1.5"
                >
                  Reason for rejection <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="rejection-reason"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Specify why this request is being rejected..."
                  maxLength={2000}
                  disabled={isLoading}
                  className="w-full bg-[#F4F5F7] border border-gray-200 rounded-xl p-3 text-xs text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none text-left disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-3 w-full">
                <Button
                  type="button"
                  onClick={() =>
                    onConfirmDecline?.(rejectionReason.trim() || undefined)
                  }
                  loading={isLoading}
                  disabled={isLoading}
                  variant="amber"
                  size="lg"
                  className="w-full h-12.5 text-white font-bold text-base bg-[#C5221F] hover:bg-[#a81c19] transition-all shadow-lg cursor-pointer rounded-xl"
                >
                  Yes, Decline Request
                </Button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full h-12.5 bg-white border border-[#fbab2a] text-[#fbab2a] hover:bg-amber-50 font-bold text-base rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-50"
                >
                  No
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Accepted Success */}
          {mode === "accepted-success" && (
            <div className="w-full flex flex-col items-center">
              <div className="mt-2 mb-4 w-25 h-25 relative flex items-center justify-center mx-auto">
                <Image
                  src={ASSETS_URL.successCheckmarkImg}
                  alt="Accepted Successfully"
                  width={100}
                  height={100}
                  className="w-25 h-25 object-contain"
                  style={{ width: 100, height: 100 }}
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
                className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] transition-all shadow-lg cursor-pointer rounded-xl"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Mode 3: Declined Success */}
          {mode === "declined-success" && (
            <div className="w-full flex flex-col items-center">
              <div className="mt-2 mb-4 w-25 h-25 relative flex items-center justify-center mx-auto">
                <Image
                  src={ASSETS_URL.successCheckmarkImg}
                  alt="Declined Successfully"
                  width={100}
                  height={100}
                  className="w-25 h-25 object-contain"
                  style={{ width: 100, height: 100 }}
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
                className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] transition-all shadow-lg cursor-pointer rounded-xl"
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
