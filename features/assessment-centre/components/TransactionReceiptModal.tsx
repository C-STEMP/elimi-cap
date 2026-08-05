"use client";

import React from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PaymentTransaction } from "../types";
import { ASSETS_URL } from "@/assets";

interface TransactionReceiptModalProps {
  isOpen: boolean;
  transaction: PaymentTransaction | null;
  onClose: () => void;
}

export const TransactionReceiptModal: React.FC<
  TransactionReceiptModalProps
> = ({ isOpen, transaction, onClose }) => {
  if (!isOpen || !transaction) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-300 select-none overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative flex flex-col items-center my-8 max-h-[90vh] overflow-y-auto scrollbar-thin"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>

          <div className="w-full flex flex-col items-center gap-4">
            {/* Header Banner Box */}
            <div className="bg-red-50/60 p-6 rounded-2xl w-full flex flex-col items-center justify-center gap-2 text-center border border-red-100/60">
              <div className="relative w-28 h-8">
                <Image
                  src={ASSETS_URL.logoIcon}
                  alt="Elimi Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-extrabold text-[#a31d38] tracking-tight">
                Transaction Reciept
              </h3>
            </div>

            {/* Transaction Metadata Box */}
            <div className="bg-[#F8F9FA] p-4 rounded-2xl w-full grid grid-cols-2 gap-3 text-xs text-left border border-gray-100">
              <div className="flex flex-col">
                <span className="text-[11px] text-gray-400 font-medium">
                  Date
                </span>
                <span className="font-bold text-neutral-primary mt-0.5">
                  {transaction.date}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-gray-400 font-medium">
                  Transaction ID
                </span>
                <span className="font-bold text-neutral-primary mt-0.5 truncate">
                  {transaction.transactionId}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-gray-400 font-medium">
                  Payment Method
                </span>
                <span className="font-bold text-neutral-primary mt-0.5">
                  {transaction.paymentMethod}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-gray-400 font-medium">
                  Status
                </span>
                <span className="font-bold text-neutral-primary mt-0.5">
                  {transaction.status === "Paid" ? "Completed" : "Pending"}
                </span>
              </div>
            </div>

            {/* Itemized Line Item */}
            <div className="bg-[#F8F9FA] p-4 rounded-2xl w-full flex items-center justify-between gap-4 text-xs border border-gray-100">
              <div className="flex flex-col text-left">
                <span className="font-bold text-neutral-primary">
                  {transaction.assessmentType} Assessment
                </span>
                <span className="text-[11px] text-gray-400 font-medium mt-0.5">
                  {transaction.description}
                </span>
              </div>
              <span className="font-extrabold text-neutral-primary text-sm">
                {transaction.amountPaid}
              </span>
            </div>

            {/* Summary Breakdown */}
            <div className="w-full flex flex-col gap-2.5 text-xs text-left px-1">
              <div className="flex items-center justify-between text-neutral-secondary">
                <span>Name</span>
                <span className="font-bold text-neutral-primary">
                  {transaction.candidateName}
                </span>
              </div>

              <div className="flex items-center justify-between text-neutral-secondary">
                <span>Vat</span>
                <span className="font-bold text-neutral-primary">-</span>
              </div>

              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                <span className="text-base font-extrabold text-neutral-primary">
                  TOTAL
                </span>
                <span className="text-xl font-extrabold text-neutral-primary">
                  {transaction.amountPaid}
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={onClose}
              variant="amber"
              size="lg"
              className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] transition-all shadow-lg cursor-pointer rounded-xl mt-2"
            >
              Download
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
