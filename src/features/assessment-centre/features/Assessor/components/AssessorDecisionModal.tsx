"use client";

import React from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { ASSETS_URL } from "@/assets";

export type AssessorDecisionModalMode =
  | "confirm-shortlist"
  | "shortlisted-success"
  | "confirm-reject"
  | "rejected-success";

interface AssessorDecisionModalProps {
  isOpen: boolean;
  mode: AssessorDecisionModalMode;
  onClose: () => void;
  onConfirmShortlist?: () => void;
  onConfirmReject?: () => void;
}

export const AssessorDecisionModal: React.FC<AssessorDecisionModalProps> = ({
  isOpen,
  mode,
  onClose,
  onConfirmShortlist,
  onConfirmReject,
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
          {/* Close Button X in soft pink pill (Image match) */}
          {(mode === "confirm-shortlist" || mode === "confirm-reject") && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-6 right-6 w-9 h-9 rounded-xl bg-[#FCE8EC] text-[#a31d38] hover:opacity-80 flex items-center justify-center transition-all cursor-pointer focus:outline-none"
              aria-label="Close modal"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}

          {/* Mode 1: Confirm Shortlist (Image 1) */}
          {mode === "confirm-shortlist" && (
            <div className="w-full flex flex-col items-center">
              <div className="mt-2 mb-4 w-25 h-25 relative flex items-center justify-center mx-auto">
                <Image
                  src={ASSETS_URL.shortlistApplicantImg}
                  alt="Shortlist Applicant"
                  width={100}
                  height={100}
                  className="w-25 h-25 object-contain"
                  style={{ width: 100, height: 100 }}
                  priority
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary mb-2 tracking-tight">
                Shortlist Applicant
              </h3>

              <p className="text-xs sm:text-sm text-neutral-secondary font-normal mb-8 leading-relaxed">
                Are you sure you want to shortlist this candidate?
              </p>

              <Button
                type="button"
                onClick={onConfirmShortlist}
                variant="amber"
                size="lg"
                className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] transition-all shadow-lg cursor-pointer rounded-xl"
              >
                Yes, Shortlist
              </Button>
            </div>
          )}

          {/* Mode 2: Shortlisted Success (Image 2) */}
          {mode === "shortlisted-success" && (
            <div className="w-full flex flex-col items-center">
              <div className="mt-2 mb-4 w-25 h-25 relative flex items-center justify-center mx-auto">
                <Image
                  src={ASSETS_URL.successCheckmarkImg}
                  alt="Shortlisted Successfully"
                  width={100}
                  height={100}
                  className="w-25 h-25 object-contain"
                  style={{ width: 100, height: 100 }}
                  priority
                />
              </div>

              <h3 className="text-neutral-primary font-extrabold text-xl sm:text-2xl mb-2 tracking-tight">
                Shortlisted Successfully
              </h3>

              <p className="text-neutral-secondary text-xs sm:text-sm mb-8 leading-relaxed font-normal">
                You have successfully shortlisted this applicant
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

          {/* Mode 3: Confirm Reject (Image 3) */}
          {mode === "confirm-reject" && (
            <div className="w-full flex flex-col items-center">
              <div className="mt-2 mb-4 w-25 h-25 relative flex items-center justify-center mx-auto">
                <Image
                  src={ASSETS_URL.rejectApplicantImg}
                  alt="Reject Applicant"
                  width={100}
                  height={100}
                  className="w-25 h-25 object-contain"
                  style={{ width: 100, height: 100 }}
                  priority
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary mb-2 tracking-tight">
                Reject Applicant
              </h3>

              <p className="text-xs sm:text-sm text-neutral-secondary font-normal mb-8 leading-relaxed">
                Are you sure you want to reject this applicant?
              </p>

              <button
                type="button"
                onClick={onConfirmReject}
                className="w-full h-12.5 text-white font-bold text-base bg-[#C5221F] hover:bg-[#a81c19] transition-all shadow-lg cursor-pointer rounded-xl"
              >
                Yes, Reject
              </button>
            </div>
          )}

          {/* Mode 4: Rejected Success */}
          {mode === "rejected-success" && (
            <div className="w-full flex flex-col items-center">
              <div className="mt-2 mb-4 w-25 h-25 relative flex items-center justify-center mx-auto">
                <Image
                  src={ASSETS_URL.successCheckmarkImg}
                  alt="Rejected Successfully"
                  width={100}
                  height={100}
                  className="w-25 h-25 object-contain"
                  style={{ width: 100, height: 100 }}
                  priority
                />
              </div>

              <h3 className="text-neutral-primary font-extrabold text-xl sm:text-2xl mb-2 tracking-tight">
                Rejected Successfully
              </h3>

              <p className="text-neutral-secondary text-xs sm:text-sm mb-8 leading-relaxed font-normal">
                You have successfully rejected this applicant
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
