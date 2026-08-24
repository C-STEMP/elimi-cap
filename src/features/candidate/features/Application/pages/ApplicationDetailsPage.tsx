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
import { FiEdit2, FiLock, FiFileText } from "react-icons/fi";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  setCurrentApplication,
  markPaymentComplete,
  markInternalVerifierCompleted,
  markExternalVerifierCompleted,
} from "@/store/slices/applicationSlice";
import {
  setPersonalInfo,
  setRPLExperienceTrade,
} from "@/store/slices/onboardingSlice";
import { PaymentModal, PaymentModalType } from "@/features/candidate/features/Application/components/PaymentModals";
import { useApplication, useGetApplicationById } from "@/src/features/candidate/features/Application/hooks";
import type { ApplicationDetail } from "@/src/features/shared/applications/api";
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

  const isRawId = (str?: string) => {
    if (!str) return false;
    if (/^[0-9A-Z]{20,}$/.test(str) || /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(str))
      return true;
    return false;
  };

  // Real API data
  const { data: apiApp, isLoading } = useGetApplicationById(id || "");

  // Redux cached data as secondary source
  const reduxApp = useAppSelector((state) =>
    state.application.applications.find((a) => a.id === id),
  );
  const savedStartApp = useAppSelector((s) => s.onboarding.startApplication);
  const savedRplExp = useAppSelector((s) => s.onboarding.rplExperienceTrade);

  const rawTrade =
    (apiApp as any)?.trade?.name ||
    (typeof (apiApp as any)?.trade === "string" ? (apiApp as any).trade : "") ||
    reduxApp?.title ||
    savedStartApp?.tradeName ||
    savedRplExp?.qualificationTitle;

  const resolvedTrade =
    rawTrade && !isRawId(rawTrade)
      ? rawTrade
      : savedStartApp?.tradeName ||
        savedRplExp?.qualificationTitle ||
        "RPL";

  const rawSector =
    (apiApp as any)?.sector?.name ||
    (typeof (apiApp as any)?.sector === "string" ? (apiApp as any).sector : "") ||
    reduxApp?.subtitle ||
    savedStartApp?.sectorName;

  const resolvedSector =
    rawSector && !isRawId(rawSector) ? rawSector : savedStartApp?.sectorName || "";

  const application = apiApp
    ? {
        id: apiApp.id,
        title: `${resolvedTrade} (${apiApp.type ?? "RPL"})`,
        subtitle: resolvedSector
          ? `${resolvedSector} • Status: ${apiApp.currentStageKey || apiApp.status}`
          : `Status: ${apiApp.currentStageKey || apiApp.status}`,
        status:
          apiApp.status === "draft" &&
          ((apiApp as any)?.submittedAt || reduxApp?.status === "submitted")
            ? "submitted"
            : (apiApp.status as string),
        createdAt: apiApp.createdAt,
        updatedAt: apiApp.updatedAt ?? apiApp.createdAt,
        selfAssessmentCompleted: reduxApp?.selfAssessmentCompleted ?? false,
        paymentCompleted: reduxApp?.paymentCompleted ?? false,
        evidenceUploaded: reduxApp?.evidenceUploaded ?? false,
      }
    : reduxApp
      ? {
          id: reduxApp.id,
          title: reduxApp.title && !isRawId(reduxApp.title) ? reduxApp.title : resolvedTrade,
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

  const isDraft =
    application?.status === "draft" &&
    reduxApp?.status !== "submitted" &&
    !(apiApp as any)?.submittedAt &&
    !(application as any)?.submittedAt;

  const handleEditApplication = () => {
    if (!application) return;
    dispatch(setCurrentApplication(application.id));

    const detailApp = apiApp as unknown as ApplicationDetail | undefined;
    if (detailApp) {
      if (detailApp.personalInformation?.personalDetails) {
        dispatch(
          setPersonalInfo({
            firstName:
              detailApp.personalInformation.personalDetails.firstName || "",
            lastName:
              detailApp.personalInformation.personalDetails.lastName || "",
            middleName:
              detailApp.personalInformation.personalDetails.middleName || "",
            dob: detailApp.personalInformation.personalDetails.dob || "",
            gender:
              detailApp.personalInformation.personalDetails.gender || "",
            nationality:
              detailApp.personalInformation.personalDetails.nationality || "",
            email:
              detailApp.personalInformation.contactInformation?.emailAddress ||
              "",
            phoneNumber:
              detailApp.personalInformation.contactInformation?.phoneNumber
                ?.number || "",
            country:
              detailApp.personalInformation.residentialAddress?.country || "",
            state:
              detailApp.personalInformation.residentialAddress?.state || "",
            lga: detailApp.personalInformation.residentialAddress?.lga || "",
            streetAddress:
              detailApp.personalInformation.residentialAddress?.address || "",
            impairment: "",
            passportFileName: "",
            passportAssetId: "",
            passportUrl: "",
          }),
        );
      }
      if (detailApp.currentOccupation) {
        dispatch(
          setRPLExperienceTrade({
            occupation: detailApp.currentOccupation.occupation || "",
            yearsOfExperience: String(
              detailApp.currentOccupation.yearsOfExperience || 1,
            ),
            employments: (
              detailApp.currentOccupation.employmentHistory || []
            ).map((emp, i) => ({
              id: `emp-${i + 1}`,
              companyName: emp.company || "",
              jobTitle: emp.jobTitle || "",
              employmentType: emp.employmentType || "Full-time",
              startDate: emp.startDate || "",
              endDate: emp.endDate || "",
              responsibilities: emp.keyResponsibilities || "",
            })),
            qualificationTitle: (detailApp as any).trade?.name || "",
            qualificationCode: "",
            completedBefore: "no",
            previousAssessmentDetails: "",
            assessmentType: "rpl",
            individualUnit: (detailApp as any).unitIds || [],
            reasonRPL: (detailApp as any).reasonForSeekingRPL || "",
            selectedEvidence: [],
            otherEvidenceText: "",
          }),
        );
      }
    }
    router.push("/rpl/personal-info");
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
        onOpenFormModal: () => {
          if (isDraft) {
            handleEditApplication();
          } else {
            router.push(
              `/dashboard/applications/${application.id}/application-form`,
            );
          }
        },
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
        isDraft,
        tradeName: resolvedTrade,
        paymentCompleted: application.paymentCompleted,
        evidenceUploaded: application.evidenceUploaded || application.selfAssessmentCompleted,
        internalVerifierCompleted: (reduxApp as any)?.internalVerifierCompleted ?? false,
        externalVerifierCompleted: (reduxApp as any)?.externalVerifierCompleted ?? false,
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
      className="w-full flex flex-col min-h-screen"
    >
      <HeaderBanner
        backHref="/dashboard/applications"
        backTitle={application.title}
        breadcrumbs={[
          { label: "My Applications", href: "/dashboard/applications" },
          { label: application.title },
        ]}
        showCreateButton={!isDraft}
        rightAction={
          isDraft ? (
            <button
              type="button"
              onClick={handleEditApplication}
              className="bg-[#fbab2a] hover:bg-[#e89b1f] active:scale-95 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0 select-none"
            >
              <FiEdit2 className="w-4 h-4" />
              <span>Edit Application</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-white text-xs font-semibold select-none">
              <FiLock className="w-3.5 h-3.5" />
              <span>Submitted & Locked</span>
            </div>
          )
        }
      />

      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4 bg-white rounded-2xl p-4 shadow-2xs">
            {/* Draft Status / Locked Status Banner */}
            {isDraft ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <FiFileText className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-amber-900">
                      Draft Application
                    </span>
                    <span className="text-xs text-amber-700 font-normal">
                      This application is saved as a draft. You can continue editing your personal details and experience before submitting.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleEditApplication}
                  className="px-4 py-2 bg-secondary text-white font-bold text-xs rounded-lg hover:bg-secondary/90 transition-all cursor-pointer whitespace-nowrap"
                >
                  Edit Application
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 shrink-0">
                  <FiLock className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-green-900">
                    Application Submitted
                  </span>
                  <span className="text-xs text-green-700 font-normal">
                    This application has been submitted for review and is locked from further editing.
                  </span>
                </div>
              </div>
            )}

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

