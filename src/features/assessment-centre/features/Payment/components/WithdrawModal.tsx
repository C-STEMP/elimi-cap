"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { ASSETS_URL } from "@/assets";

interface WithdrawModalProps {
  isOpen: boolean;
  availableBalance?: string;
  onClose: () => void;
  onWithdrawSuccess?: (amount: string) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  availableBalance = "₦3,125,000",
  onClose,
  onWithdrawSuccess,
}) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount.trim()) {
      toast({
        type: "error",
        title: "Amount Required",
        description: "Please enter amount to withdraw.",
      });
      return;
    }

    setStep("success");
    onWithdrawSuccess?.(amount);
  };

  const handleReset = () => {
    setAmount("");
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
          className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl relative flex flex-col items-center text-center"
        >
          {step === "form" && (
            <button
              type="button"
              onClick={handleReset}
              className="absolute top-6 right-6 w-11 h-11 rounded bg-primary/10 text-primary hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
              aria-label="Close modal"
            >
              <FiX className="w-6 h-6" />
            </button>
          )}

          {step === "form" ? (
            <form
              onSubmit={handleSubmit}
              className="lg:mt-8 w-full flex flex-col items-center gap-5"
            >
              <div className="flex flex-col items-center text-center gap-1">
                <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
                  Withdraw Funds
                </h3>
                <p className="text-xs lg:text-base text-neutral-secondary font-normal">
                  Request for withdrawal
                </p>
              </div>

              {/* Balance Box */}
              <div className="bg-black/10 p-5 rounded-2xl w-full flex flex-col items-start text-left border border-gray-200/50">
                <span className="text-xs lg:text-base font-semibold text-black">
                  Available
                </span>
                <span className="text-2xl font-medium text-black mt-2 tracking-tight">
                  {availableBalance}
                </span>
              </div>

              <div className="w-full text-left">
                <Input
                  label="Amount To Withdraw"
                  type="text"
                  placeholder="Type Here"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                variant="amber"
                size="lg"
                className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] transition-all shadow-lg cursor-pointer rounded-xl mt-2"
              >
                Request Withdrawal
              </Button>
            </form>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="mt-2 mb-4 w-[100px] h-[100px] relative flex items-center justify-center mx-auto">
                <Image
                  src={ASSETS_URL.successCheckmarkImg}
                  alt="Withdrawal Request Successful"
                  width={100}
                  height={100}
                  className="w-[100px] h-[100px] object-contain"
                  style={{ width: 100, height: 100 }}
                  priority
                />
              </div>

              <h3 className="text-neutral-primary font-extrabold text-xl sm:text-2xl mb-2 tracking-tight">
                Withdrawal Request Successful
              </h3>

              <p className="text-neutral-secondary text-xs sm:text-sm mb-8 leading-relaxed font-normal">
                You have successfully sent a withdrawal request
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
