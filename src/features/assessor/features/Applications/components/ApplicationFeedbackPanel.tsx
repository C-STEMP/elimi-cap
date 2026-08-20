"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";

import { useGetApplicationHistory } from "@/src/features/shared/applications/hooks";

interface ApplicationFeedbackPanelProps {
  applicationId?: string;
}

export const ApplicationFeedbackPanel: React.FC<
  ApplicationFeedbackPanelProps
> = ({ applicationId }) => {
  const { toast } = useToast();
  const [feedbackComment, setFeedbackComment] = useState("");
  const [localComments, setLocalComments] = useState<string[]>([]);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const { data: history = [] } = useGetApplicationHistory(applicationId || "");

  const historyFeedbacks = history
    .filter((h) => h.feedback)
    .map((h) => ({
      text: h.feedback as string,
      date: h.createdAt ? new Date(h.createdAt).toLocaleDateString("en-GB") : undefined,
      version: h.versionNo,
    }));

  const handleSendFeedback = () => {
    if (!feedbackComment.trim()) {
      toast({
        type: "error",
        title: "Comment Required",
        description: "Please type a feedback comment before sending.",
      });
      return;
    }
    setLocalComments([feedbackComment, ...localComments]);
    setFeedbackComment("");
    setIsSuccessOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
        <h4 className="font-bold text-sm text-neutral-primary">Send Feedback</h4>
        <textarea
          rows={4}
          placeholder="Type feedback for candidate..."
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
        {localComments.length > 0 || historyFeedbacks.length > 0 ? (
          <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
            {localComments.map((cmt, idx) => (
              <div
                key={`local-${idx}`}
                className="bg-amber-50/80 rounded-xl p-3 text-xs text-neutral-primary leading-relaxed border border-amber-200"
              >
                <div className="text-[10px] text-amber-700 font-bold mb-1">New Feedback</div>
                {cmt}
              </div>
            ))}
            {historyFeedbacks.map((cmt, idx) => (
              <div
                key={`hist-${idx}`}
                className="bg-gray-50 rounded-xl p-3 text-xs text-neutral-primary leading-relaxed border border-gray-100"
              >
                <div className="text-[10px] text-gray-400 font-medium mb-1">
                  Version {cmt.version} {cmt.date ? `• ${cmt.date}` : ""}
                </div>
                {cmt.text}
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
