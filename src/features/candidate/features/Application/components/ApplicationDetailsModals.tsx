"use client";

import React from "react";
import { StatusModal } from "@/components/status-modal";
import { PaymentModal, PaymentModalType } from "./PaymentModals";
import { ApplicationFormModal } from "./ApplicationFormModal";
import { UploadSignatureModal } from "./UploadSignatureModal";
import { TransactionReceiptModal } from "@/features/assessment-centre/features/Payment/components/TransactionReceiptModal";

interface ApplicationDetailsModalsProps {
  activePaymentModal: PaymentModalType;
  paymentErrorInfo: { title?: string; description?: string };
  onClosePaymentModal: () => void;
  onPaymentAction?: () => void;
  isCallRequestModalOpen: boolean;
  onCloseCallModal: () => void;
  onConfirmCallModal: () => void;
  isFormModalOpen: boolean;
  onCloseFormModal: () => void;
  applicationId: string;
  isSignatureModalOpen: boolean;
  onCloseSignatureModal: () => void;
  onSignatureSuccess: () => void;
  isReceiptModalOpen: boolean;
  onCloseReceiptModal: () => void;
  transactionReceipt: {
    id: string;
    candidateName: string;
    assessmentType: string;
    description: string;
    amountPaid: string;
    date: string;
    paymentMethod: string;
    status: "Paid";
    transactionId: string;
  };
}

export const ApplicationDetailsModals: React.FC<ApplicationDetailsModalsProps> = ({
  activePaymentModal,
  paymentErrorInfo,
  onClosePaymentModal,
  onPaymentAction,
  isCallRequestModalOpen,
  onCloseCallModal,
  onConfirmCallModal,
  isFormModalOpen,
  onCloseFormModal,
  applicationId,
  isSignatureModalOpen,
  onCloseSignatureModal,
  onSignatureSuccess,
  isReceiptModalOpen,
  onCloseReceiptModal,
  transactionReceipt,
}) => {
  return (
    <>
      <PaymentModal
        isOpen={!!activePaymentModal}
        type={activePaymentModal}
        title={paymentErrorInfo.title}
        description={paymentErrorInfo.description}
        onClose={onClosePaymentModal}
        onAction={onPaymentAction}
      />

      <StatusModal
        isOpen={isCallRequestModalOpen}
        onClose={onCloseCallModal}
        type="success"
        title="Call Request Sent Successfully"
        description="Your call request has been sent successfully. Your facilitator will get back to you soon."
        actionLabel="Go To Dashboard"
        onAction={onConfirmCallModal}
      />

      <ApplicationFormModal
        isOpen={isFormModalOpen}
        onClose={onCloseFormModal}
        applicationId={applicationId}
      />

      <UploadSignatureModal
        isOpen={isSignatureModalOpen}
        onClose={onCloseSignatureModal}
        onUploadSuccess={onSignatureSuccess}
      />

      <TransactionReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={onCloseReceiptModal}
        transaction={transactionReceipt}
      />
    </>
  );
};
