"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { HeaderBanner } from "@/features/dashboard/components/HeaderBanner";
import { CalendarWidget } from "@/features/dashboard/components/CalendarWidget";
import { UpcomingCard } from "@/features/dashboard/components/UpcomingCard";
import { FacilitatorCard } from "@/features/dashboard/components/FacilitatorCard";
import {
  PaymentModal,
  PaymentModalType,
} from "@/features/dashboard/components/PaymentModals";
import { StatusModal } from "@/components/ui/status-modal";
import { useToast } from "@/components/ui/toast";
import {
  ApplicationDetailsPageProps,
  ApplicationFormState,
  PaymentStatus,
} from "./types";
import {
  MOCK_FACILITATOR,
  getFolderArrangementStatus,
  getFormStatus,
  getStagesConfig,
} from "./utils/constants";
import { ApplicationStageCard } from "./components/ApplicationStageCard";
import { ApplicationFormModal } from "./components/ApplicationFormModal";
import { ApplicationDemoToolbar } from "./components/ApplicationDemoToolbar";

export const ApplicationDetailsPage: React.FC<ApplicationDetailsPageProps> = ({
  id = "carpentry-1",
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [formState, setFormState] = useState<ApplicationFormState>(
    (searchParams?.get("status") as ApplicationFormState) || "vault_3days",
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    formState.startsWith("vault_") ? "completed" : "not_started",
  );
  const [activePaymentModal, setActivePaymentModal] =
    useState<PaymentModalType>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

  const isVaultActive =
    formState.startsWith("vault_") || paymentStatus === "completed";
  const folderStatus = getFolderArrangementStatus(isVaultActive, formState);
  const formStatus = getFormStatus(formState);

  const handleMakePayment = () => {
    setActivePaymentModal("processing");
    setTimeout(() => setActivePaymentModal("success"), 1500);
  };

  const handleStartFolderArrangement = () => {
    setActivePaymentModal(null);
    setPaymentStatus("completed");
    setFormState("vault_3days");
  };

  const handleConfirmCallModal = () => {
    setIsCallRequestModalOpen(false);
    setShowCountdown(true);
    toast({
      type: "success",
      title: "Call Requested",
      description: "Facilitator will contact you soon.",
    });
  };

  const stages = getStagesConfig({
    formState,
    isVaultActive,
    folderStatus,
    formStatus,
    onOpenFormModal: () => setIsFormModalOpen(true),
    onMakePayment: handleMakePayment,
    onDownloadReceipt: () =>
      toast({
        type: "success",
        title: "Downloading Receipt",
        description: "Your payment receipt download has started.",
      }),
    onNavigateToVault: () =>
      router.push(`/dashboard/applications/${id}/evidence-vault`),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col gap-2"
    >
      <HeaderBanner
        backHref="/dashboard/applications"
        backTitle="Carpentry"
        breadcrumbs={[
          { label: "My Applications", href: "/dashboard/applications" },
          { label: "Carpentry" },
        ]}
        showCreateButton={true}
        createButtonText="Create Application"
      />

      <ApplicationDemoToolbar
        formState={formState}
        paymentStatus={paymentStatus}
        showCountdown={showCountdown}
        onSelectState={(state, pStatus) => {
          setFormState(state);
          setPaymentStatus(pStatus);
        }}
        onToggleCountdown={() => setShowCountdown(!showCountdown)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4 bg-white rounded-2xl p-4">
          {stages.map((stage) => (
            <ApplicationStageCard key={stage.id} stage={stage} />
          ))}
        </div>

        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          <CalendarWidget />
          <UpcomingCard interview={null} />
          <FacilitatorCard
            facilitator={MOCK_FACILITATOR}
            onRequestCall={() => setIsCallRequestModalOpen(true)}
            countdownTimer={showCountdown ? "01:30:20" : undefined}
          />
        </div>
      </div>

      <PaymentModal
        isOpen={!!activePaymentModal}
        type={activePaymentModal}
        onClose={() => setActivePaymentModal(null)}
        onAction={
          activePaymentModal === "success"
            ? handleStartFolderArrangement
            : activePaymentModal === "cancelled" ||
                activePaymentModal === "unsuccessful"
              ? handleMakePayment
              : undefined
        }
      />

      <StatusModal
        isOpen={isCallRequestModalOpen}
        onClose={() => setIsCallRequestModalOpen(false)}
        type="success"
        title="Call Request Sent Successfully"
        description="Your call request has been sent successfully. Your facilitator will get back to you soon."
        actionLabel="Go To Dashboard"
        onAction={handleConfirmCallModal}
      />

      <ApplicationFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
      />
    </motion.div>
  );
};
