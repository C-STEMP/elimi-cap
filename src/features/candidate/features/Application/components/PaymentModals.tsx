"use client";

import React from "react";
import {
  StatusModal,
  StatusModalVariant,
} from "@/components/status-modal";

export type PaymentModalType =
  | "success"
  | "cancelled"
  | "unsuccessful"
  | "processing"
  | null;

interface PaymentModalProps {
  isOpen: boolean;
  type: PaymentModalType;
  title?: string;
  description?: string;
  onClose: () => void;
  onAction?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  type,
  title,
  description,
  onClose,
  onAction,
}) => {
  // Automatically close and redirect/proceed after a few seconds when payment is successful
  React.useEffect(() => {
    if (isOpen && type === "success") {
      const timer = setTimeout(() => {
        if (onAction) {
          onAction();
        } else {
          onClose();
        }
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [isOpen, type, onAction, onClose]);

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
      title={title}
      description={description}
      onAction={onAction}
    />
  );
};
