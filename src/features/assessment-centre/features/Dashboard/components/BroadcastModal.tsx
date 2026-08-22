"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { ASSETS_URL } from "@/assets";
import { useSendBroadcastMessage } from "@/src/features/shared/messages/hooks";

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendSuccess?: (message: string, recipient: string) => void;
}

const RECIPIENT_MAP: Record<string, string> = {
  "All Candidates": "all_candidates",
  "All Assessors": "all_assessors",
  "All Staff": "all_staff",
  "Specific Trade Group": "trade_group",
};

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  onSendSuccess,
}) => {
  const { toast } = useToast();
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");

  const sendBroadcastMutation = useSendBroadcastMessage();

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) {
      toast({
        type: "error",
        title: "Selection Required",
        description:
          "Please select a recipient group for the broadcast message.",
      });
      return;
    }
    if (!message.trim()) {
      toast({
        type: "error",
        title: "Message Required",
        description: "Please type your broadcast message.",
      });
      return;
    }

    const recipientGroup = RECIPIENT_MAP[recipient] || recipient;

    sendBroadcastMutation.mutate(
      {
        recipientGroup,
        message: message.trim(),
        subject: `Broadcast to ${recipient}`,
      },
      {
        onSuccess: () => {
          setStep("success");
          onSendSuccess?.(message, recipient);
        },
      },
    );
  };

  const handleReset = () => {
    setRecipient("");
    setMessage("");
    setStep("form");
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-300 select-none"
        onClick={handleReset}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl relative flex flex-col items-center"
        >
          {/* Close X Button in soft pink pill */}
          {step === "form" && (
            <button
              type="button"
              onClick={handleReset}
              className="absolute top-6 right-6 w-9 h-9 rounded-xl bg-[#FCE8EC] text-[#a31d38] hover:opacity-80 flex items-center justify-center transition-all cursor-pointer focus:outline-none z-10"
              aria-label="Close modal"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}

          {step === "form" ? (
            <form
              onSubmit={handleSend}
              className="w-full flex flex-col items-center gap-5"
            >
              <div className="flex flex-col items-center text-center gap-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
                  Send Broadcast Message
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 font-normal">
                  Dispatch a broadcast notification to your centre network
                </p>
              </div>

              <div className="w-full flex flex-col gap-4 mt-2">
                {/* Send To Field using codebase Select component */}
                <Select
                  label="Send To"
                  placeholder="Select"
                  options={[
                    "All Candidates",
                    "All Assessors",
                    "All Staff",
                    "Specific Trade Group",
                  ]}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />

                {/* Your Message Field */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs sm:text-sm font-semibold text-neutral-primary select-none">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-gray-200/80 focus:border-gray-400 rounded-2xl p-4 text-xs sm:text-sm text-neutral-primary outline-none resize-none transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="amber"
                size="lg"
                loading={sendBroadcastMutation.isPending}
                className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] mt-4 transition-all shadow-lg cursor-pointer rounded-xl"
              >
                Send Message
              </Button>
            </form>
          ) : (
            <div className="w-full flex flex-col items-center text-center">
              <div className="mt-2 mb-4 w-[100px] h-[100px] relative flex items-center justify-center mx-auto">
                <Image
                  src={ASSETS_URL.successCheckmarkImg}
                  alt="Broadcast Sent"
                  width={100}
                  height={100}
                  className="w-[100px] h-[100px] object-contain"
                  style={{ width: 100, height: 100 }}
                  priority
                />
              </div>

              <h3 className="text-neutral-primary font-extrabold text-xl sm:text-2xl mb-2 tracking-tight">
                Broadcast Sent
              </h3>

              <p className="text-neutral-secondary text-xs sm:text-sm mb-8 leading-relaxed font-normal">
                Broadcast message has been dispatched successfully.
              </p>

              <Button
                type="button"
                onClick={handleReset}
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
