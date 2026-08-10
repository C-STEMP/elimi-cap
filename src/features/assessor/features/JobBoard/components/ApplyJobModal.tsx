"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useApplyToJobPosting } from "../hooks";

interface ApplyJobModalProps {
  isOpen: boolean;
  jobId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  isOpen,
  jobId,
  onClose,
  onSuccess,
}) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const applyMutation = useApplyToJobPosting();

  if (!isOpen && !isSuccessOpen) return null;

  const handleConfirmApply = () => {
    applyMutation.mutate(jobId, {
      onSuccess: () => {
        setIsSuccessOpen(true);
      },
    });
  };

  const handleContinueSuccess = () => {
    setIsSuccessOpen(false);
    onSuccess();
  };

  return (
    <>
      {isOpen && !isSuccessOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center gap-4 shadow-2xl select-text"
          >
            <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-1">
              <FiAlertTriangle className="w-12 h-12 stroke-[2.2]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary">
              Are You sure?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-secondary">
              Confirm you want to apply for this job?
            </p>

            <div className="flex flex-col gap-2.5 w-full mt-2">
              <Button
                variant="amber"
                size="md"
                onClick={handleConfirmApply}
                loading={applyMutation.isPending}
                className="w-full h-11 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer"
              >
                Yes, Apply
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={onClose}
                className="w-full h-11 border-amber-500/40 text-amber-600 font-bold text-sm rounded-xl hover:bg-amber-50 cursor-pointer"
              >
                No
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {isSuccessOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center gap-4 shadow-2xl select-text"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg my-1">
              <FiCheckCircle className="w-10 h-10 stroke-[2.5]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary">
              Applied Successfully
            </h3>
            <p className="text-xs sm:text-sm text-neutral-secondary">
              You have successfully applied for this job
            </p>

            <Button
              variant="amber"
              size="md"
              onClick={handleContinueSuccess}
              className="w-full h-11 text-white font-bold text-sm rounded-xl shadow-lg mt-2 cursor-pointer"
            >
              Continue
            </Button>
          </motion.div>
        </div>
      )}
    </>
  );
};
