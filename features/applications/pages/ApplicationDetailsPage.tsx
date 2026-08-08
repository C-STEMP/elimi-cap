"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HeaderBanner } from "@/features/dashboard/components/HeaderBanner";
import { CalendarWidget } from "@/features/dashboard/components/CalendarWidget";
import { UpcomingCard } from "@/features/dashboard/components/UpcomingCard";
import {
  PaymentModal,
  PaymentModalType,
} from "@/features/applications/components/PaymentModals";
import { StatusModal } from "@/src/components/ui/status-modal";
import { useToast } from "@/src/components/ui/toast";
import { ApplicationDetailsPageProps, ApplicationFormState } from "../types";
import {
  getFolderArrangementStatus,
  getFormStatus,
  getStagesConfig,
  MOCK_FACILITATOR,
} from "../utils/constants";
import { ApplicationStageCard } from "../components/ApplicationStageCard";
import { ApplicationFormModal } from "../components/ApplicationFormModal";
import { UploadSignatureModal } from "../components/UploadSignatureModal";
import { FacilitatorCard } from "@/features/dashboard/components/FacilitatorCard";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  markPaymentComplete,
  markSelfAssessmentComplete,
  markInternalVerifierCompleted,
  markExternalVerifierCompleted,
} from "@/store/slices/applicationSlice";

const statusToFormState = (
  status: string,
  selfAssessmentCompleted: boolean,
  paymentCompleted: boolean,
): ApplicationFormState => {
  if (status === "draft") return "pending";
  if (status === "submitted") return "pending";
  if (status === "payment_pending") return "pending";
  if (status === "payment_completed" && !paymentCompleted) return "approved";
  if (status === "folder_arrangement") return "vault_3days";
  if (status === "self_assessment") return "pending";
  if (status === "evidence_upload") return "figma_screen_1"; // After evidence upload, move to interview stage
  if (status === "interview_scheduled") return "figma_screen_5";
  if (status === "interview_completed") return "figma_completed_no_events";
  if (status === "certification") return "figma_certification_competent";
  return "figma_screen_1";
};

export const ApplicationDetailsPage: React.FC<ApplicationDetailsPageProps> = ({
  id,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const reduxApp = useAppSelector((state) =>
    state.application.applications.find((a) => a.id === id),
  );

  const fallbackApp = {
    id: id || "app-1786013185522",
    title: "National Vocational Qualification in Carpentry",
    subtitle: "NSQ Level 3",
    status: "evidence_upload" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    selfAssessmentCompleted: true,
    paymentCompleted: true,
    evidenceUploaded: false,
  };

  const application = reduxApp || fallbackApp;

  const [activePaymentModal, setActivePaymentModal] =
    useState<PaymentModalType>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isInterviewCollapsed, setIsInterviewCollapsed] = useState(false);

  // Comprehensive demo state switcher for all application stages
  const [demoStage, setDemoStage] = useState<
    | "draft"
    | "payment_pending"
    | "payment_completed"
    | "folder_arrangement"
    | "evidence_upload"
    | "interview_completed"
    | "internal_verifier_completed"
    | "external_verifier_completed"
    | "certification_competent"
  >("draft");

  // Internal verifier sub-states (only relevant when in interview_completed+ stages)
  const [demoVerifierState, setDemoVerifierState] = useState<
    "under_review" | "attention_required" | "completed"
  >("under_review");

  const formState = statusToFormState(
    application.status,
    application.selfAssessmentCompleted,
    application.paymentCompleted,
  );

  // Override formState for demo purposes - comprehensive stage switcher
  const getEffectiveFormState = (): ApplicationFormState => {
    switch (demoStage) {
      case "draft":
        return "pending";
      case "payment_pending":
        return "approved";
      case "payment_completed":
        return "vault_3days";
      case "folder_arrangement":
        return "vault_3days";
      case "evidence_upload":
        return "figma_screen_3"; // Interview ongoing
      case "interview_completed":
        return "figma_completed_no_events";
      case "internal_verifier_completed":
        return "figma_completed_no_events";
      case "external_verifier_completed":
        return "figma_completed_no_events";
      case "certification_competent":
        return "figma_certification_competent";
      default:
        return formState;
    }
  };

  const effectiveFormState = getEffectiveFormState();

  const paymentStatus = application.paymentCompleted
    ? "completed"
    : "not_started";
  const isVaultActive =
    effectiveFormState.startsWith("vault_") ||
    effectiveFormState.startsWith("figma_") ||
    application.paymentCompleted;
  const folderStatus = getFolderArrangementStatus(
    isVaultActive,
    effectiveFormState,
  );
  const formStatus = getFormStatus(effectiveFormState);

  const handleMakePayment = () => {
    setActivePaymentModal("processing");
    setTimeout(() => {
      setActivePaymentModal("success");
    }, 1500);
  };

  const handleStartFolderArrangement = () => {
    setActivePaymentModal(null);
    dispatch(markPaymentComplete(application.id));
    setDemoStage("folder_arrangement");
  };

  const handleConfirmCallModal = () => {
    setIsCallRequestModalOpen(false);
    toast({
      type: "success",
      title: "Call Requested",
      description: "Facilitator will contact you soon.",
    });
  };

  const handleProceedToExternalVerifier = () => {
    dispatch(markInternalVerifierCompleted(application.id));
    toast({
      type: "success",
      title: "Internal Verification Complete",
      description: "Moving to External Verifier stage.",
    });
  };

  const handleProceedToCertification = () => {
    dispatch(markExternalVerifierCompleted(application.id));
    toast({
      type: "success",
      title: "External Verification Complete",
      description: "Moving to Certification stage.",
    });
  };

  const stages = getStagesConfig({
    formState: effectiveFormState,
    isVaultActive,
    folderStatus,
    formStatus,
    isInterviewCollapsed,
    onToggleInterviewCollapse: () =>
      setIsInterviewCollapsed(!isInterviewCollapsed),
    onOpenFormModal: () =>
      router.push(`/dashboard/applications/${application.id}/self-assessment`),
    onMakePayment: handleMakePayment,
    onDownloadReceipt: () =>
      toast({
        type: "success",
        title: "Downloading Receipt",
        description: "Your payment receipt download has started.",
      }),
    onNavigateToVault: () =>
      router.push(`/dashboard/applications/${application.id}/evidence-vault`),
    onAppeal: () =>
      toast({
        type: "info",
        title: "Appeal Submitted",
        description: "Your appeal request for the interview has been recorded.",
      }),
    onTakeCourse: () =>
      toast({
        type: "info",
        title: "Navigating to Course",
        description: "Redirecting to Advanced Joinery Finishing course...",
      }),
    onOpenSignatureModal: () => setIsSignatureModalOpen(true),
    onProceedToExternalVerifier: handleProceedToExternalVerifier,
    onProceedToCertification: handleProceedToCertification,
    demoVerifierState,
    demoStage,
  });

  const showUpcomingEvents =
    demoStage === "interview_completed" ||
    demoStage === "internal_verifier_completed" ||
    demoStage === "external_verifier_completed" ||
    demoStage === "certification_competent";

  const upcomingInterview = showUpcomingEvents
    ? {
        title: "Panel Interview",
        date: "22-07-2026",
        time: "12:00PM",
      }
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col gap-2"
    >
      <HeaderBanner
        backHref="/dashboard/applications"
        backTitle={application.title}
        breadcrumbs={[
          { label: "My Applications", href: "/dashboard/applications" },
          { label: application.title },
        ]}
        showCreateButton={true}
        createButtonText="Create Application"
      />

      {/* Comprehensive Demo Stage Switcher */}
      <div className="flex items-center gap-2 px-2 mb-2">
        <div className="flex items-center gap-2 bg-gray-200/60 p-1.5 rounded-xl text-xs flex-wrap">
          <span className="text-gray-500 font-semibold px-2">Demo Stage:</span>
          <button
            type="button"
            onClick={() => setDemoStage("draft")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              demoStage === "draft"
                ? "bg-white text-black shadow-xs"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Draft
          </button>
          <button
            type="button"
            onClick={() => setDemoStage("payment_pending")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              demoStage === "payment_pending"
                ? "bg-white text-black shadow-xs"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Payment Pending
          </button>
          <button
            type="button"
            onClick={() => setDemoStage("payment_completed")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              demoStage === "payment_completed"
                ? "bg-white text-black shadow-xs"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Payment Completed
          </button>
          <button
            type="button"
            onClick={() => setDemoStage("folder_arrangement")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              demoStage === "folder_arrangement"
                ? "bg-white text-black shadow-xs"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Folder Arrangement
          </button>
          <button
            type="button"
            onClick={() => setDemoStage("evidence_upload")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              demoStage === "evidence_upload"
                ? "bg-white text-black shadow-xs"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Evidence Upload
          </button>
          <button
            type="button"
            onClick={() => setDemoStage("interview_completed")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              demoStage === "interview_completed"
                ? "bg-white text-black shadow-xs"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Interview Completed
          </button>
          <button
            type="button"
            onClick={() => setDemoStage("internal_verifier_completed")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              demoStage === "internal_verifier_completed"
                ? "bg-white text-black shadow-xs"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Internal Verifier Done
          </button>
          <button
            type="button"
            onClick={() => setDemoStage("external_verifier_completed")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              demoStage === "external_verifier_completed"
                ? "bg-white text-black shadow-xs"
                : "text-gray-600 hover:text-black"
            }`}
          >
            External Verifier Done
          </button>
          <button
            type="button"
            onClick={() => setDemoStage("certification_competent")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              demoStage === "certification_competent"
                ? "bg-white text-black shadow-xs"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Certification Competent
          </button>
        </div>
      </div>

      {/* Internal Verifier Sub-states (only show when in interview_completed+ stages) */}
      {(demoStage === "interview_completed" ||
        demoStage === "internal_verifier_completed" ||
        demoStage === "external_verifier_completed" ||
        demoStage === "certification_competent") && (
        <div className="flex items-center gap-2 px-2 mb-2">
          <div className="flex items-center gap-2 bg-gray-200/60 p-1.5 rounded-xl text-xs flex-wrap">
            <span className="text-gray-500 font-semibold px-2">
              Internal Verifier:
            </span>
            <button
              type="button"
              onClick={() => setDemoVerifierState("under_review")}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                demoVerifierState === "under_review"
                  ? "bg-white text-black shadow-xs"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Under Review
            </button>
            <button
              type="button"
              onClick={() => setDemoVerifierState("attention_required")}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                demoVerifierState === "attention_required"
                  ? "bg-white text-black shadow-xs"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Attention Required
            </button>
            <button
              type="button"
              onClick={() => setDemoVerifierState("completed")}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                demoVerifierState === "completed"
                  ? "bg-white text-black shadow-xs"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4 bg-white rounded-2xl p-4 shadow-2xs">
          {stages.map((stage) => (
            <ApplicationStageCard key={stage.id} stage={stage} />
          ))}
        </div>

        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          <CalendarWidget />
          <UpcomingCard interview={upcomingInterview} />
          <FacilitatorCard
            facilitator={MOCK_FACILITATOR}
            onRequestCall={() => setIsCallRequestModalOpen(true)}
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
        applicationId={application.id}
      />

      <UploadSignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onUploadSuccess={() =>
          toast({
            type: "success",
            title: "Signature Uploaded",
            description: "Your signature has been attached successfully.",
          })
        }
      />
    </motion.div>
  );
};
