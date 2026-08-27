"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";

interface SendFeedbackPanelProps {
  comment: string;
  onCommentChange: (value: string) => void;
  onSubmit: () => void;
}

export const SendFeedbackPanel: React.FC<SendFeedbackPanelProps> = ({
  comment,
  onCommentChange,
  onSubmit,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmit();
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4 w-full">
      <h4 className="text-base font-bold text-neutral-primary">
        Send Feedback
      </h4>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-neutral-primary">
            Comment
          </label>
          <textarea
            rows={5}
            placeholder="Type Here"
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl p-4 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-[#FBAB2A]/30 placeholder:text-gray-400 resize-none"
          />
        </div>

        <Button
          type="submit"
          variant="amber"
          fullWidth
          disabled={!comment.trim()}
          className="h-11 bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send Feedback
        </Button>
      </form>
    </div>
  );
};
