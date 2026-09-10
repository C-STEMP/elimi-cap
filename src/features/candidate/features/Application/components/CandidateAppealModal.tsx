"use client";

import React, { useState } from "react";
import { FiX, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useCreateAppeal } from "@/src/features/shared/applications/hooks";

interface CandidateAppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
}

export const CandidateAppealModal: React.FC<CandidateAppealModalProps> = ({
  isOpen,
  onClose,
  applicationId,
}) => {
  const { toast } = useToast();
  const createAppealMutation = useCreateAppeal(applicationId);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast({
        type: "error",
        title: "Reason Required",
        description: "Please provide the reason or grounds for your appeal.",
      });
      return;
    }

    try {
      await createAppealMutation.mutateAsync(comment.trim());
      setComment("");
      onClose();
    } catch {
      // Error handled by mutation onError toast
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-[28px] p-6 sm:p-8 max-w-lg w-full relative shadow-2xl flex flex-col border border-gray-100"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FDF2F4] text-[#A31D38] hover:bg-[#FCE3E7] flex items-center justify-center transition-colors cursor-pointer"
          >
            <FiX className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="w-12 h-12 rounded-full bg-[#FDF2F4] text-[#A31D38] flex items-center justify-center mx-auto mb-3">
            <FiAlertCircle className="w-6 h-6" />
          </div>

          <h3 className="text-[#1A1A1A] font-extrabold text-xl text-center mb-1 tracking-tight">
            Lodge Stage Appeal
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm text-center leading-relaxed mb-6 font-normal">
            If you disagree with the assessment panel&apos;s decision, submit your explanation. The lead panelist will review your appeal.
          </p>

          <div className="flex flex-col gap-1.5 mb-6">
            <label className="text-xs font-semibold text-gray-700">
              Grounds / Reason for Appeal <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="State your reasons, points for reconsideration, or any discrepancies..."
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={createAppealMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              loading={createAppealMutation.isPending}
              onClick={handleSubmit}
              className="bg-[#A31D38]! hover:bg-[#8A1538]! text-white! font-bold"
            >
              Submit Appeal
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
