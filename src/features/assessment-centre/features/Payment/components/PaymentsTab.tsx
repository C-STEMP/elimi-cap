"use client";

import React from "react";
import { motion } from "framer-motion";
import { PaymentsView } from "./PaymentsView";
import { PaymentTransaction } from "../../../types";

interface PaymentsTabProps {
  onWithdrawFunds: () => void;
  onSelectReceipt: (tx: PaymentTransaction) => void;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({
  onWithdrawFunds,
  onSelectReceipt,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <PaymentsView
        onWithdrawFunds={onWithdrawFunds}
        onSelectReceipt={onSelectReceipt}
      />
    </motion.div>
  );
};
