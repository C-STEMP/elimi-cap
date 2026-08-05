"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ASSETS_URL } from "@/assets";

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendSuccess?: (message: string, recipient: string) => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  onSendSuccess,
}) => {
  const { toast } = useToast();
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");

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

    setStep("success");
    onSendSuccess?.(message, recipient);
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
          {/* Close X Button */}
          {step === "form" && (
            <button
              type="button"
              onClick={handleReset}
              className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
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
                <p className="text-xs sm:text-sm text-gray-400 font-normal">
                  Send a broadcast message
                </p>
              </div>

              <div className="w-full flex flex-col gap-4 mt-2">
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

                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Type Here"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-input-bg border border-transparent focus:border-primary rounded-xl p-3.5 text-xs sm:text-sm text-neutral-primary outline-none resize-none transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="amber"
                size="lg"
                className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] mt-4 transition-all shadow-lg cursor-pointer rounded-xl"
              >
                Send Message
              </Button>
            </form>
          ) : (
            <div className="w-full flex flex-col items-center text-center">
              <div className="mt-2 mb-4 relative flex items-center justify-center">
                <Image
                  src={ASSETS_URL.successCheckmarkImg}
                  alt="Broadcast Sent"
                  width={160}
                  height={160}
                  className="w-36 h-36 object-contain"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>

              <h3 className="text-neutral-primary font-extrabold text-xl sm:text-2xl mb-2 tracking-tight">
                Broadcast Sent
              </h3>

              <p className="text-neutral-secondary text-xs sm:text-sm mb-8 leading-relaxed font-normal">
                Broadcast Message sent successfully
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
