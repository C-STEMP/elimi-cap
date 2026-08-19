"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import { UpcomingCard } from "@/features/candidate/features/Dashboard/components/UpcomingCard";

import { StatusModal } from "@/components/status-modal";
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
import { FacilitatorCard } from "@/features/candidate/features/Dashboard/components/FacilitatorCard";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  markPaymentComplete,
  markInternalVerifierCompleted,
  markExternalVerifierCompleted,
} from "@/store/slices/applicationSlice";
import { PaymentModal, PaymentModalType } from "@/features/candidate/features/Application/components/PaymentModals";
import { useApplication, useGetApplicationById } from "@/src/features/candidate/features/Application/hooks";
import { Loader } from "@/src/components/ui/loader";

const statusToFormState = (
  status: string,
  selfAssessmentCompleted: boolean,
  paymentCompleted: boolean,
): ApplicationFormState => {
  if (status === "draft") return "pending";
  if (status === "submitted") return "pending";
  if (status === "payment_pending") return "approved";
  if (status === "payment_completed" && !paymentCompleted) return "approved";
  if (status === "folder_arrangement") return "vault_3days";
  if (status === "self_assessment") return "pending";
  if (status === "evidence_upload") return "figma_screen_1";
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
  const { initiatePayment } = useApplication();

  // Real API data
  const { data: apiApp, isLoading } = useGetApplicationById(id || "");

  // Redux cached data as secondary source
  const reduxApp = useAppSelector((state) =>
    state.application.applications.find((a) => a.id === id),
  );

  const application = apiApp
    ? {
        id: apiApp.id,
        title: (apiApp as any).trade?.name
          ? `${(apiApp as any).trade.name} (${apiApp.type ?? "RPL"})`
          : `${apiApp.type ?? "RPL"} Application`,
        subtitle: (apiApp as any).sector?.name
          ? `${(apiApp as any).sector.name} • Status: ${apiApp.currentStageKey || apiApp.status}`
          : `Status: ${apiApp.currentStageKey || apiApp.status}`,
        status: apiApp.status as string,
        createdAt: apiApp.createdAt,
        updatedAt: apiApp.updatedAt ?? apiApp.createdAt,
        selfAssessmentCompleted: reduxApp?.selfAssessmentCompleted ?? false,
        paymentCompleted: reduxApp?.paymentCompleted ?? false,
        evidenceUploaded: reduxApp?.evidenceUploaded ?? false,
      }
    : reduxApp
      ? {
          id: reduxApp.id,
          title: reduxApp.title ?? "Application",
          subtitle: `Status: ${reduxApp.status}`,
          status: reduxApp.status,
          createdAt: reduxApp.createdAt,
          updatedAt: reduxApp.updatedAt,
          selfAssessmentCompleted: reduxApp.selfAssessmentCompleted,
          paymentCompleted: reduxApp.paymentCompleted,
          evidenceUploaded: reduxApp.evidenceUploaded,
        }
      : null;

  const [activePaymentModal, setActivePaymentModal] =
    useState<PaymentModalType>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isInterviewCollapsed, setIsInterviewCollapsed] = useState(false);

  const formState: ApplicationFormState = application
    ? statusToFormState(
        application.status,
        application.selfAssessmentCompleted,
        application.paymentCompleted,
      )
    : "pending";

  const isVaultActive =
    formState.startsWith("vault_") ||
    formState.startsWith("figma_") ||
    (application?.paymentCompleted ?? false);
  const folderStatus = getFolderArrangementStatus(isVaultActive, formState);
  const formStatus = getFormStatus(formState);

  const handleMakePayment = () => {
    if (!application) return;
    setActivePaymentModal("processing");
    initiatePayment.mutate(application.id, {
      onSuccess: () => {
        setTimeout(() => {
          setActivePaymentModal("success");
        }, 800);
      },
    });
  };

  const handleStartFolderArrangement = () => {
    if (!application) return;
    setActivePaymentModal(null);
    dispatch(markPaymentComplete(application.id));
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
    if (!application) return;
    dispatch(markInternalVerifierCompleted(application.id));
    toast({
      type: "success",
      title: "Internal Verification Complete",
      description: "Moving to External Verifier stage.",
    });
  };

  const handleProceedToCertification = () => {
    if (!application) return;
    dispatch(markExternalVerifierCompleted(application.id));
    toast({
      type: "success",
      title: "External Verification Complete",
      description: "Moving to Certification stage.",
    });
  };

  const stages = application
    ? getStagesConfig({
        formState,
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
            description: "Redirecting to course...",
          }),
        onOpenSignatureModal: () => setIsSignatureModalOpen(true),
        onProceedToExternalVerifier: handleProceedToExternalVerifier,
        onProceedToCertification: handleProceedToCertification,
        submittedDate: (application as any).submittedAt || application.createdAt,
        demoVerifierState: "under_review",
        demoStage: (application.status as any) ?? "draft",
      })
    : [];

  if (isLoading) {
    return <Loader fullscreen={false} tip="Loading application details..." className="min-h-[60vh]" />;
  }

  if (!application) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-3">
        <p className="text-gray-500 text-lg font-semibold">Application not found</p>
        <p className="text-gray-400 text-sm">This application may have been removed or the link is invalid.</p>
      </div>
    );
  }

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4 bg-white rounded-2xl p-4 shadow-2xs">
          {stages.map((stage) => (
            <ApplicationStageCard key={stage.id} stage={stage} />
          ))}
        </div>

        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          <CalendarWidget />
          <UpcomingCard interview={null} />
          <FacilitatorCard
            facilitator={null}
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

