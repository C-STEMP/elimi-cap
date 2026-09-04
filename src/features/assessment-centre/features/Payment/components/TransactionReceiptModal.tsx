"use client";

import React from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { PaymentTransaction } from "@/features/assessment-centre/types";
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

  const handleDownloadOrPrint = () => {
    const el = document.getElementById("transaction-receipt-content");
    if (!el) {
      window.print();
      return;
    }

    // Create a hidden iframe for dedicated clean printing/downloading
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const styles = Array.from(
      document.querySelectorAll("style, link[rel='stylesheet']")
    )
      .map((s) => s.outerHTML)
      .join("\n");

    doc.open();
    doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Transaction Receipt - ${transaction.transactionId}</title>
  ${styles}
  <style>
    @page { margin: 12mm; size: auto; }
    body {
      background: #ffffff !important;
      margin: 0;
      padding: 24px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      justify-content: center;
      color: #1f2937;
    }
    .receipt-print-wrapper {
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      padding: 24px;
    }
    @media print {
      body { padding: 0 !important; }
      .receipt-print-wrapper { border: none !important; padding: 0 !important; }
      button, .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="receipt-print-wrapper">
    ${el.innerHTML}
  </div>
</body>
</html>`);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }
    }, 400);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 transition-opacity duration-300 select-none overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative flex flex-col items-center my-8 max-h-[90vh] overflow-y-auto scrollbar-thin"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 w-11 h-11 rounded-lg bg-primary/10 text-primary hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
            aria-label="Close modal"
          >
            <FiX className="w-6 h-6" />
          </button>

          <div
            id="transaction-receipt-content"
            className="w-full flex flex-col items-center gap-4 mt-4 lg:mt-14"
          >
            <div className="bg-red-50/60 p-6 rounded-2xl w-full flex flex-col items-center justify-center gap-3 text-center border border-red-100/60">
              <div className="relative w-28 h-8">
                <Image
                  src={ASSETS_URL.logoIcon2}
                  alt="Elimi Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl lg:text-2xl font-extrabold text-primary tracking-tight">
                Transaction Reciept
              </h3>
            </div>

            <div className="bg-[#F8F9FA] p-2.5 rounded-2xl w-full grid grid-cols-2 gap-3 text-xs text-left border border-gray-100">
              <div className="flex flex-col">
                <span className="text-[10px] text-black">Date</span>
                <span className="font-bold text-neutral-primary mt-0.5">
                  {transaction.date}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-black">Transaction ID</span>
                <span className="font-bold text-neutral-primary mt-0.5 truncate">
                  {transaction.transactionId}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-black">Payment Method</span>
                <span className="font-medium text-black mt-0.5">
                  {transaction.paymentMethod}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-black">Status</span>
                <span className="font-bold text-neutral-primary mt-0.5">
                  {transaction.status === "Paid" ? "Completed" : "Pending"}
                </span>
              </div>
            </div>

            <div className="bg-[#F8F9FA] p-4 rounded-2xl w-full flex items-center justify-between gap-4 text-xs border border-gray-100">
              <div className="flex flex-col text-left">
                <span className="font-bold text-neutral-primary">
                  {transaction.assessmentType} Assessment
                </span>
                <span className="text-[10px] text-black font-medium mt-0.5">
                  {transaction.description}
                </span>
              </div>
              <span className="font-extrabold text-[#333333] text-sm">
                {transaction.amountPaid}
              </span>
            </div>

            <div className="w-full flex flex-col gap-2.5 text-xs lg:text-sm text-left px-1">
              <div className="flex items-center justify-between text-[#333333]">
                <span>Name</span>
                <span className="font-medium">{transaction.candidateName}</span>
              </div>

              <div className="flex items-center justify-between text-[#333333]">
                <span>Vat</span>
                <span className="font-medium text-[#333333]">-</span>
              </div>

              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                <span className="text-base lg:text-xl font-semibold text-[#333333]">
                  TOTAL
                </span>
                <span className="text-xl font-semibold text-[#333333]">
                  {transaction.amountPaid}
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleDownloadOrPrint}
              variant="secondary"
              className="w-full!"
              size="lg"
            >
              Download
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
