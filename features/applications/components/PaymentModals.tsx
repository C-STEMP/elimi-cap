"use client";

import React from "react";
import {
  StatusModal,
  StatusModalVariant,
} from "@/src/components/ui/status-modal";

export type PaymentModalType =
  | "success"
  | "cancelled"
  | "unsuccessful"
  | "processing"
  | null;

interface PaymentModalProps {
  isOpen: boolean;
  type: PaymentModalType;
  onClose: () => void;
  onAction?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  type,
  onClose,
  onAction,
}) => {
  if (!isOpen || !type) return null;

  const variantMap: Record<string, StatusModalVariant> = {
    success: "payment-successful",
    cancelled: "payment-cancelled",
    unsuccessful: "payment-unsuccessful",
    processing: "processing-payment",
  };

  return (
    <StatusModal
      isOpen={isOpen}
      onClose={onClose}
      variant={variantMap[type]}
      onAction={onAction}
    />
  );
};
