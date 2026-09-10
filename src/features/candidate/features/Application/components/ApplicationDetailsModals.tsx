"use client";

import React from "react";
import { StatusModal } from "@/components/status-modal";
import { PaymentModal, PaymentModalType } from "./PaymentModals";
import { ApplicationFormModal } from "./ApplicationFormModal";
import { UploadSignatureModal } from "./UploadSignatureModal";
import { TransactionReceiptModal } from "@/features/assessment-centre/features/Payment/components/TransactionReceiptModal";

import { CandidateInterviewFormModal } from "./CandidateInterviewFormModal";
import { CandidateAppealModal } from "./CandidateAppealModal";
import type { InterviewForm } from "@/src/features/shared/applications/api/types";

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
  isInterviewFormModalOpen?: boolean;
  onCloseInterviewFormModal?: () => void;
  selectedInterviewFormType?: "records" | "assessment_grid" | "practical_observation" | "skill_demonstration" | null;
  interviewForms?: InterviewForm[];
  candidateName?: string;
  isAppealModalOpen?: boolean;
  onCloseAppealModal?: () => void;
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
  isInterviewFormModalOpen = false,
  onCloseInterviewFormModal,
  selectedInterviewFormType,
  interviewForms,
  candidateName,
  isAppealModalOpen = false,
  onCloseAppealModal,
  transactionReceipt,
}) => {
  const activeFormRecord = interviewForms?.find(
    (f) => f.formType === selectedInterviewFormType,
  );

  const FORM_TITLES: Record<string, string> = {
    records: "Interview Record Form",
    assessment_grid: "Assessment Grid/Mapping Form",
    practical_observation: "Practical Observation Checklist Form",
    skill_demonstration: "Skills Demonstration Form",
  };

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

      {selectedInterviewFormType && (
        <CandidateInterviewFormModal
          isOpen={isInterviewFormModalOpen}
          onClose={onCloseInterviewFormModal || (() => {})}
          applicationId={applicationId}
          formType={selectedInterviewFormType}
          formTitle={FORM_TITLES[selectedInterviewFormType] || "Assessment Form"}
          formRecord={activeFormRecord}
          candidateName={candidateName}
        />
      )}

      <CandidateAppealModal
        isOpen={isAppealModalOpen}
        onClose={onCloseAppealModal || (() => {})}
        applicationId={applicationId}
      />

      <TransactionReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={onCloseReceiptModal}
        transaction={transactionReceipt}
      />
    </>
  );
};
