"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiCheckCircle } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";

interface NotifyAwardingBodyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NotifyAwardingBodyModal: React.FC<
  NotifyAwardingBodyModalProps
> = ({ isOpen, onClose, onSuccess }) => {
  const [awardingBody, setAwardingBody] = useState("NBTE");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  if (!isOpen && !isSuccessOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccessOpen(true);
  };

  const handleContinueSuccess = () => {
    setIsSuccessOpen(false);
    onSuccess();
  };

  return (
    <>
      {/* Form Modal */}
      {isOpen && !isSuccessOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full flex flex-col gap-6 shadow-2xl relative select-text"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-pink-50 text-pink-700 hover:bg-pink-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>

            <div className="text-center flex flex-col gap-1 pr-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-primary">
                Notify Awarding Body
              </h2>
              <p className="text-xs sm:text-sm text-neutral-secondary">
                Send a notification to awarding Body
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Select
                label="Select Awarding Body"
                placeholder="Select"
                value={awardingBody}
                onChange={(e) => setAwardingBody(e.target.value)}
                options={["NBTE", "NABTEB", "CITY & GUILDS"]}
              />

              {awardingBody === "NBTE" && (
                <div className="bg-[#FFFBEB] border border-[#FDE68A] p-4 rounded-xl flex flex-col gap-1.5 text-xs">
                  <h4 className="font-bold text-[#D97706]">
                    National Board for Technical Education (NBTE)
                  </h4>
                  <p className="text-[#B45309] leading-relaxed">
                    The National Board for Technical Education (NBTE) is responsible for regulating Technical and Vocational Education and Training (TVET) programmes in Nigeria. It oversees the implementation of the National Skills Qualification Framework (NSQF), accredits Assessment Centres, approves Awarding Bodies, and ensures that assessments and certifications meet national quality standards.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="amber"
                size="md"
                className="w-full h-12 text-white font-bold text-sm rounded-xl shadow-lg mt-2 cursor-pointer"
              >
                Notify Awarding Body
              </Button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Success Modal */}
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
              Awarding Body Notified
            </h3>
            <p className="text-xs sm:text-sm text-neutral-secondary">
              You&apos;ve successfully notify the awarding body
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
