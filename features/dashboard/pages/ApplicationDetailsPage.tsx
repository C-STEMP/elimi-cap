"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiFileText, FiDownload } from "react-icons/fi";
import { HeaderBanner } from "@/features/dashboard/components/HeaderBanner";
import { CalendarWidget } from "@/features/dashboard/components/CalendarWidget";
import { UpcomingCard } from "@/features/dashboard/components/UpcomingCard";
import { FacilitatorCard } from "@/features/dashboard/components/FacilitatorCard";
import {
  PaymentModal,
  PaymentModalType,
} from "@/features/dashboard/components/PaymentModals";
import { StatusModal } from "@/components/ui/status-modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  ApplicationDetailsPageProps,
  ApplicationFormState,
  PaymentStatus,
  StageConfig,
} from "./types";
import {
  MOCK_FACILITATOR,
  getFolderArrangementStatus,
  getFormStatus,
} from "./utils/constants";

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

  const handleRequestCallClick = () => setIsCallRequestModalOpen(true);

  const handleConfirmCallModal = () => {
    setIsCallRequestModalOpen(false);
    setShowCountdown(true);
    toast({
      type: "success",
      title: "Call Requested",
      description: "Facilitator will contact you soon.",
    });
  };

  const stages: StageConfig[] = [
    {
      id: "app-form",
      title: "Application Form",
      status: formStatus.status,
      statusBg: formStatus.statusBg,
      statusText: formStatus.statusText,
      subtext: "Submitted on: 7/21/2026",
      actionText:
        formState === "pending" || formState === "approved" || isVaultActive
          ? "View"
          : "Edit",
      actionVariant:
        formState === "pending" || formState === "approved" || isVaultActive
          ? "outline"
          : "amber",
      actionSize: "sm",
      alertMessage:
        formState === "attention"
          ? "Lorem Ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor"
          : null,
      onActionClick: () => setIsFormModalOpen(true),
    },
    {
      id: "payment",
      title: "Payment",
      status: isVaultActive ? "Successful" : "Not Started",
      statusBg: isVaultActive ? "bg-[#D1FAE5]" : "bg-[#E5E7EB]",
      statusText: isVaultActive ? "text-[#047857]" : "text-[#6B7280]",
      subtext: isVaultActive ? "Paid On: 7/22/2026" : "--",
      showPaymentDetails: formState === "approved" && !isVaultActive,
      actionText: isVaultActive ? "Receipt" : "Make Payement",
      actionVariant: isVaultActive ? "outline" : "amber",
      actionSize: "sm",
      actionLeftIcon: isVaultActive ? <FiDownload className="w-4 h-4" /> : undefined,
      onActionClick: isVaultActive
        ? () =>
            toast({
              type: "success",
              title: "Downloading Receipt",
              description: "Your payment receipt download has started.",
            })
        : handleMakePayment,
    },
    {
      id: "folder-arrangement",
      title: "Folder Arrangement",
      status: folderStatus.text,
      statusBg: folderStatus.bg,
      statusText: folderStatus.textColor,
      subtext: isVaultActive ? "Started on: 7/23/2026" : "---",
      actionText: isVaultActive ? "Evidence Vault" : undefined,
      actionVariant: "amber",
      actionSize: "sm",
      onActionClick: () =>
        router.push(`/dashboard/applications/${id}/evidence-vault`),
    },
    {
      id: "interview-stage",
      title: "Interview Stage",
      status: "Not Started",
      statusBg: "bg-[#E5E7EB]",
      statusText: "text-[#6B7280]",
      subtext: "---",
      delayedMessage:
        formState === "vault_delayed"
          ? "Your interview has been delayed as your folder arrangement was not completed within the required 14-day timeframe. Please complete the necessary arrangements to proceed with the next interview schedule."
          : null,
    },
    {
      id: "internal-verifier",
      title: "Internal Verifier",
      status: "Not Started",
      statusBg: "bg-[#E5E7EB]",
      statusText: "text-[#6B7280]",
      subtext: "---",
    },
    {
      id: "external-verifier",
      title: "External Verifier",
      status: "Not Started",
      statusBg: "bg-[#E5E7EB]",
      statusText: "text-[#6B7280]",
      subtext: "---",
    },
    {
      id: "certification",
      title: "Certification",
      status: "Not Started",
      statusBg: "bg-[#E5E7EB]",
      statusText: "text-[#6B7280]",
      subtext: "---",
    },
  ];

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

      <div className="flex flex-wrap items-center justify-between gap-2 px-2 mb-2">
        <div className="flex items-center gap-2 bg-gray-200/60 p-1.5 rounded-xl text-xs flex-wrap">
          <span className="text-gray-500 font-semibold px-2">
            Folder Arrangement State:
          </span>
          <button
            type="button"
            onClick={() => {
              setFormState("vault_3days");
              setPaymentStatus("completed");
            }}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              formState === "vault_3days"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            3 Days Left (Image 1)
          </button>
          <button
            type="button"
            onClick={() => {
              setFormState("vault_ongoing");
              setPaymentStatus("completed");
            }}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              formState === "vault_ongoing"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Ongoing (Image 4)
          </button>
          <button
            type="button"
            onClick={() => {
              setFormState("vault_delayed");
              setPaymentStatus("completed");
            }}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              formState === "vault_delayed"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            23 Days Gone (Image 5)
          </button>
          <button
            type="button"
            onClick={() => {
              setFormState("approved");
              setPaymentStatus("not_started");
            }}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              formState === "approved" && paymentStatus === "not_started"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Approved & Pay Fee
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-200/60 p-1.5 rounded-xl text-xs flex-wrap">
          <span className="text-gray-500 font-semibold px-2">
            Facilitator Card:
          </span>
          <button
            type="button"
            onClick={() => setShowCountdown(!showCountdown)}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              showCountdown
                ? "bg-white text-amber-700 font-bold shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {showCountdown
              ? "Show Request Call Button"
              : "Show Countdown Timer 01:30:20 (Image 1)"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="bg-input-bg rounded-[20px] p-6 shadow-2xs border border-gray-100/70 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-[#191918] font-bold text-lg lg:text-2xl tracking-tight">
                    {stage.title}
                  </h3>
                  <span
                    className={`${stage.statusBg} ${stage.statusText} text-xs font-semibold px-3 py-1 rounded-full shadow-2xs`}
                  >
                    {stage.status}
                  </span>
                </div>

                {stage.actionText && (
                  <Button
                    type="button"
                    onClick={stage.onActionClick}
                    variant={stage.actionVariant || "amber"}
                    size={stage.actionSize || "sm"}
                    leftIcon={stage.actionLeftIcon}
                    rightIcon={stage.actionRightIcon}
                    loading={stage.actionLoading}
                    className="shrink-0"
                  >
                    {stage.actionText}
                  </Button>
                )}
              </div>

              <p className="text-gray-400 text-xs sm:text-sm font-normal mt-1.5">
                {stage.subtext}
              </p>

              {stage.showPaymentDetails && (
                <div className="mt-4 bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between border border-gray-100 shadow-2xs">
                  <span className="text-gray-900 font-semibold text-xs sm:text-base">
                    RPL Assessment Fee — Carpentry (Level 3)
                  </span>
                  <span className="text-[#a31d38] font-extrabold text-base sm:text-xl">
                    ₦45,000
                  </span>
                </div>
              )}

              {stage.alertMessage && (
                <div className="mt-4 bg-[#fce8eb] border border-[#f87171]/20 rounded-xl p-4 text-[#991b1b] text-xs sm:text-sm font-normal leading-relaxed">
                  {stage.alertMessage}
                </div>
              )}

              {stage.delayedMessage && (
                <div className="mt-4 bg-[#fff8eb] border border-[#fcd34d]/40 rounded-xl p-4 text-[#b45309] text-xs sm:text-sm font-normal leading-relaxed">
                  {stage.delayedMessage}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          <CalendarWidget />

          <UpcomingCard interview={null} />

          <FacilitatorCard
            facilitator={MOCK_FACILITATOR}
            onRequestCall={handleRequestCallClick}
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

      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl border border-gray-100 relative max-h-[90vh] overflow-y-auto"
            >
              <Button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                variant="ghost"
                size="icon"
                leftIcon={<FiX className="w-5 h-5" />}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                aria-label="Close modal"
              />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#fdf2f4] text-[#a31d38] flex items-center justify-center">
                  <FiFileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Application Form Details
                  </h3>
                  <span className="text-xs text-gray-400">
                    Carpentry (Level 3)
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-gray-600 mb-6">
                <div className="bg-input-bg p-3.5 rounded-xl flex justify-between">
                  <span className="text-gray-400">Trade:</span>
                  <span className="font-semibold text-gray-900">Carpentry</span>
                </div>
                <div className="bg-input-bg p-3.5 rounded-xl flex justify-between">
                  <span className="text-gray-400">Submitted Date:</span>
                  <span className="font-semibold text-gray-900">7/21/2026</span>
                </div>
                <div className="bg-input-bg p-3.5 rounded-xl flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="font-semibold text-[#047857]">Approved</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  variant="danger"
                  size="sm"
                >
                  OK
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
