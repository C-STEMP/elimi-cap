"use client";

import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import type { EvidenceItem } from "./EvidenceItemCard";

interface SendEvidenceFeedbackModalProps {
  isOpen: boolean;
  item: EvidenceItem | null;
  onClose: () => void;
  onSubmit: (comment: string) => void;
}

export const SendEvidenceFeedbackModal: React.FC<
  SendEvidenceFeedbackModalProps
> = ({ isOpen, item, onClose, onSubmit }) => {
  const [comment, setComment] = useState("");

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmit(comment.trim());
    setComment("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-5 relative animate-in zoom-in-95 duration-200 select-text">
        {/* Close Button in top right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 w-8 h-8 rounded-full bg-[#FFF5F6] text-[#A31D38] hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <FiX className="w-4 h-4" />
        </button>

        {/* Modal Title & Subtitle */}
        <div className="flex flex-col gap-1 pr-8">
          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
            Send Feedback
          </h3>
          <p className="text-xs sm:text-sm text-neutral-secondary font-normal">
            Send a feedback on this evidence
          </p>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-neutral-primary">
              Comment
            </label>
            <textarea
              rows={6}
              placeholder="Type Here"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl p-4 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-[#FBAB2A]/30 placeholder:text-gray-400 resize-none"
            />
          </div>

          <Button
            type="submit"
            variant="amber"
            fullWidth
            disabled={!comment.trim()}
            className="h-12 bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-sm rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Feedback
          </Button>
        </form>
      </div>
    </div>
  );
};
