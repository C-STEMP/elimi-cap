"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";

export const ApplicationFeedbackPanel: React.FC = () => {
  const { toast } = useToast();
  const [feedbackComment, setFeedbackComment] = useState("");
  const [comments, setComments] = useState<string[]>([
    "Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor",
    "Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor",
  ]);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleSendFeedback = () => {
    if (!feedbackComment.trim()) {
      toast({
        type: "error",
        title: "Comment Required",
        description: "Please type a feedback comment before sending.",
      });
      return;
    }
    setComments([feedbackComment, ...comments]);
    setFeedbackComment("");
    setIsSuccessOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
        <h4 className="font-bold text-sm text-neutral-primary">Send Feedback</h4>
        <textarea
          rows={4}
          placeholder="Type Here"
          value={feedbackComment}
          onChange={(e) => setFeedbackComment(e.target.value)}
          className="w-full bg-gray-50/70 border border-gray-200 rounded-xl p-3 text-xs text-neutral-primary focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
        <Button
          variant="amber"
          size="sm"
          onClick={handleSendFeedback}
          className="w-full h-10 font-bold text-xs rounded-xl shadow-md cursor-pointer"
        >
          Send Feedback
        </Button>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
        <h4 className="font-bold text-sm text-neutral-primary">Past Comments</h4>
        {comments.length > 0 ? (
          <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
            {comments.map((cmt, idx) => (
              <div
                key={idx}
                className="bg-gray-100/80 rounded-xl p-3 text-xs text-neutral-primary leading-relaxed border border-gray-100"
              >
                {cmt}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No feedback sent yet</p>
        )}
      </div>

      {isSuccessOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center gap-4 shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg my-1">
              <FiCheckCircle className="w-10 h-10 stroke-[2.5]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary">
              Feedback Sent Successfully
            </h3>
            <p className="text-xs sm:text-sm text-neutral-secondary">
              Your feedback to candidate was sent successfully
            </p>

            <Button
              variant="amber"
              size="md"
              onClick={() => setIsSuccessOpen(false)}
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
