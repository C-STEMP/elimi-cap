"use client";

import { useToast } from "@/src/components/ui/toast";
import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { ASSETS_URL } from "@/src/assets";
import {
  reviewIvApi,
  reviewEvApi,
} from "@/src/features/shared/applications/api/application.api";
import { useQueryClient } from "@tanstack/react-query";
import { useModalDraft } from "@/src/lib/hooks/usePersistentModal";
import { REVIEW_VERIFIER_MODAL } from "@/src/lib/modal-keys";

interface ReviewVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  verifierType: "internal" | "external";
  verifierName?: string;
  decision?: "approve" | "reject";
  onSuccess?: () => void;
}

export const ReviewVerifierModal: React.FC<ReviewVerifierModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  verifierType,
  verifierName = "Verifier",
  decision = "approve",
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [feedback, setFeedback] = useModalDraft(REVIEW_VERIFIER_MODAL, "feedback", "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  if (!isOpen && !isSuccessOpen) return null;

  const verifierLabel =
    verifierType === "internal" ? "Internal Verification" : "External Verification";
  const isReject = decision === "reject";

  const handleConfirm = async () => {
    if (isReject && !feedback.trim()) {
      toast({
        type: "error",
        title: "Feedback Required",
        description: "Please provide a reason or remediation instructions for rejecting this stage.",
      });
      return;
    }

    setIsSubmitting(true);
    const feedbackText =
      feedback.trim() ||
      `${verifierLabel} verified and confirmed candidate competent.`;

    const stageKey =
      verifierType === "internal" ? "internal_verification" : "external_verification";

    try {
      if (verifierType === "internal") {
        await reviewIvApi(applicationId, {
          decision,
          feedback: feedbackText,
          stageKey,
        });
      } else {
        await reviewEvApi(applicationId, {
          decision,
          feedback: feedbackText,
          stageKey,
        });
      }

      await queryClient.invalidateQueries({
        queryKey: ["applications", applicationId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["applications", "stages", applicationId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["applications"],
      });

      onSuccess?.();
      setIsSuccessOpen(true);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Review Failed",
        description:
          err?.message || "Could not submit the review. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessContinue = () => {
    setIsSuccessOpen(false);
    setFeedback("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && !isSuccessOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text relative"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-pink-50 text-pink-700 hover:bg-pink-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>

            <div className="w-20 h-20 mb-4 flex items-center justify-center">
              <Image
                src={ASSETS_URL.validationWarningIcon}
                alt="Confirm"
                width={80}
                height={80}
                className="w-20 h-20 object-contain"
              />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight mb-1">
              {isReject ? `Reject ${verifierLabel}?` : "Mark as Competent?"}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-secondary font-normal mb-4">
              {isReject
                ? `Confirm rejection of ${verifierLabel} for this application. Remediation feedback is required.`
                : `Confirm that ${verifierLabel} for this application is approved and marked competent.`}
            </p>

            <div className="w-full text-left flex flex-col gap-1.5 mb-6">
              <label className="text-xs font-semibold text-gray-700">
                {isReject ? "Rejection Reason & Feedback *" : "Verification Feedback (Optional)"}
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={
                  isReject
                    ? "Explain why the application or evidence was rejected and what remediation is required..."
                    : "Candidate demonstrated all required competencies and portfolios are approved."
                }
                rows={3}
                className={`w-full text-xs p-3 rounded-xl border bg-[#F9FAFB] outline-none resize-none font-medium ${
                  isReject
                    ? "border-rose-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30"
                    : "border-gray-200 focus:border-[#fbab2a] focus:ring-1 focus:ring-[#fbab2a]/30"
                }`}
              />
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Button
                type="button"
                onClick={handleConfirm}
                variant={isReject ? "danger" : "amber"}
                loading={isSubmitting}
                fullWidth
                className={`h-12 text-white font-bold text-sm sm:text-base rounded-xl shadow-md cursor-pointer transition-all ${
                  isReject ? "bg-rose-600 hover:bg-rose-700" : "bg-[#FBAB2A] hover:bg-[#E89B1F]"
                }`}
              >
                {isReject ? "Confirm Rejection" : "Yes, Mark as Competent"}
              </Button>

              <button
                type="button"
                onClick={onClose}
                className="h-12 w-full border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-sm sm:text-base rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {isSuccessOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center text-center gap-4 shadow-2xl"
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                isReject ? "bg-rose-50 text-rose-600" : "bg-[#E6F4EA] text-[#1E7F4C]"
              }`}
            >
              {isReject ? <FiX className="w-8 h-8" /> : <FiCheck className="w-8 h-8" />}
            </div>

            <h3 className="text-xl font-extrabold text-neutral-primary">
              {verifierLabel} {isReject ? "Rejected" : "Completed!"}
            </h3>

            <p className="text-xs sm:text-sm text-neutral-secondary">
              {isReject
                ? "Feedback has been submitted and the application returned for remediation."
                : "Candidate has been successfully verified and marked competent for this stage."}
            </p>

            <Button
              type="button"
              variant={isReject ? "danger" : "amber"}
              size="md"
              onClick={handleSuccessContinue}
              className={`w-full h-12 text-white font-bold text-sm rounded-xl shadow-lg mt-2 cursor-pointer ${
                isReject ? "bg-rose-600 hover:bg-rose-700" : ""
              }`}
            >
              Done
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
