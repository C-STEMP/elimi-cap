"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import { UpcomingCard } from "@/features/candidate/features/Dashboard/components/UpcomingCard";

import { useQueryClient } from "@tanstack/react-query";
import { StatusModal } from "@/components/status-modal";
import { Button } from "@/src/components/ui/button";
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
import { NsqApplicationDetailView } from "../components/nsq/NsqApplicationDetailView";
import { TransactionReceiptModal } from "@/features/assessment-centre/features/Payment/components/TransactionReceiptModal";
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
import {
  useApplication,
  useGetApplicationById,
  useGetApplicationStages,
  useGetPaymentQuote,
  useGetApplicationReceipt,
} from "@/src/features/candidate/features/Application/hooks";
import { APPLICATION_QUERY_KEYS } from "@/src/features/shared/applications/hooks/useApplication";
import type { ApplicationDetail } from "@/src/features/shared/applications/api";
import { Loader } from "@/src/components/ui/loader";

const statusToFormState = (
  status: string,
  selfAssessmentCompleted: boolean,
  paymentCompleted: boolean,
): ApplicationFormState => {
  if (status === "draft") return "pending";
  if (status === "submitted") return "pending";
  if (status === "in_progress") {
    if (!paymentCompleted) return "pending";
    if (!selfAssessmentCompleted) return "figma_screen_1";
    return "figma_screen_5";
  }
  if (status === "application_form") return "pending";
  if (status === "payment") return "pending";
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
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { initiatePayment } = useApplication();
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

  const isRawId = (str?: string) => {
    if (!str) return false;
    if (/^[0-9A-Z]{20,}$/.test(str) || /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(str))
      return true;
    return false;
  };

  // Real API data
  const { data: apiApp, isLoading } = useGetApplicationById(id || "");
  const { data: stagesData } = useGetApplicationStages(id || "");
  const { data: paymentQuote } = useGetPaymentQuote(id || "");
  const { data: receiptData } = useGetApplicationReceipt(id || "");

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

  const paymentStageFromApi = stagesData?.find((s) => s.stageKey === "payment");
  const isPaymentPaid =
    isPaymentConfirmed ||
    paymentStageFromApi?.status === "successful" ||
    (reduxApp?.paymentCompleted ?? false);

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
        paymentCompleted: isPaymentPaid,
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
          paymentCompleted: isPaymentPaid,
          evidenceUploaded: reduxApp.evidenceUploaded,
        }
      : null;

  const [activePaymentModal, setActivePaymentModal] =
    useState<PaymentModalType>(null);
  const [paymentErrorInfo, setPaymentErrorInfo] = useState<{
    title?: string;
    description?: string;
  }>({});
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isInterviewCollapsed, setIsInterviewCollapsed] = useState(false);

  const authUser = useAppSelector((state) => state.auth.user);

  // Check for redirect callback from Paystack
  useEffect(() => {
    const paymentParam = searchParams.get("payment");
    const referenceParam =
      searchParams.get("reference") || searchParams.get("trxref");

    if (paymentParam === "success" || referenceParam) {
      setIsPaymentConfirmed(true);
      if (id) {
        dispatch(markPaymentComplete(id));
        try {
          sessionStorage.removeItem("pending_payment_application_id");
          localStorage.removeItem("pending_payment_application_id");
        } catch {}

        queryClient.invalidateQueries({
          queryKey: APPLICATION_QUERY_KEYS.stages(id),
        });
        queryClient.invalidateQueries({
          queryKey: APPLICATION_QUERY_KEYS.detail(id),
        });
        queryClient.invalidateQueries({
          queryKey: APPLICATION_QUERY_KEYS.receipt(id),
        });
        queryClient.invalidateQueries({
          queryKey: APPLICATION_QUERY_KEYS.all,
        });
      }
      setActivePaymentModal("success");
      toast({
        type: "success",
        title: "Payment Confirmed",
        description: "Your payment was processed successfully via Paystack.",
      });

      // Clean URL params cleanly
      if (typeof window !== "undefined" && window.history?.replaceState) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    } else if (paymentParam === "cancelled" || paymentParam === "failed") {
      setActivePaymentModal("unsuccessful");
      if (typeof window !== "undefined" && window.history?.replaceState) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [searchParams, id, dispatch, toast, queryClient]);

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
    setPaymentErrorInfo({});
    try {
      if (application.id && typeof window !== "undefined") {
        sessionStorage.setItem("pending_payment_application_id", application.id);
        localStorage.setItem("pending_payment_application_id", application.id);
      }
    } catch {}

    initiatePayment.mutate(application.id, {
      onSuccess: (data: any) => {
        const checkoutUrl = data?.checkoutUrl || data?.data?.checkoutUrl;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          setTimeout(() => {
            setIsPaymentConfirmed(true);
            setActivePaymentModal("success");
            dispatch(markPaymentComplete(application.id));
            queryClient.invalidateQueries({
              queryKey: APPLICATION_QUERY_KEYS.stages(application.id),
            });
            queryClient.invalidateQueries({
              queryKey: APPLICATION_QUERY_KEYS.detail(application.id),
            });
            queryClient.invalidateQueries({
              queryKey: APPLICATION_QUERY_KEYS.all,
            });
          }, 800);
        }
      },
      onError: (err: any) => {
        if (
          err?.statusCode === 409 ||
          err?.message?.toLowerCase()?.includes("already exists") ||
          err?.message?.toLowerCase()?.includes("pending or successful payment")
        ) {
          toast({
            type: "info",
            title: "Payment Already Recorded",
            description:
              "A payment session for this application is already active or completed.",
          });
          setIsPaymentConfirmed(true);
          setActivePaymentModal(null);
          dispatch(markPaymentComplete(application.id));
          queryClient.invalidateQueries({
            queryKey: APPLICATION_QUERY_KEYS.stages(application.id),
          });
        } else {
          const isDeactivated =
            err?.message?.toLowerCase()?.includes("integration has been deactivated") ||
            err?.message?.toLowerCase()?.includes("deactivated") ||
            err?.code === "orchestrator.invalid_argument";

          if (isDeactivated) {
            setPaymentErrorInfo({
              title: "Payment Gateway Deactivated",
              description:
                "The payment provider (Paystack) integration on the Orchestrator service is currently deactivated or being configured. Please contact the platform administrator to reactivate payment processing.",
            });
          } else {
            setPaymentErrorInfo({
              title: "Payment Unsuccessful",
              description:
                err?.message || "Your payment was not successful. Please try again.",
            });
          }

          setActivePaymentModal("unsuccessful");
        }
      },
    });
  };

  const handleStartFolderArrangement = () => {
    if (!application) return;
    setActivePaymentModal(null);
    dispatch(markPaymentComplete(application.id));
    router.push(`/dashboard/applications/${application.id}/evidence-vault`);
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
        onDownloadReceipt: () => {
          setIsReceiptModalOpen(true);
        },
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
        paymentAmountText: paymentQuote?.amountMinorUnits
          ? `₦${(Number(paymentQuote.amountMinorUnits) / 100).toLocaleString()}`
          : paymentStageFromApi?.amountMinorUnits
            ? `₦${(Number(paymentStageFromApi.amountMinorUnits) / 100).toLocaleString()}`
            : "₦45,000",
        paymentCompleted: application.paymentCompleted,
        evidenceUploaded: application.evidenceUploaded || application.selfAssessmentCompleted,
        internalVerifierCompleted: (reduxApp as any)?.internalVerifierCompleted ?? false,
        externalVerifierCompleted: (reduxApp as any)?.externalVerifierCompleted ?? false,
      })
    : [];

  if (isLoading) {
    return <Loader fullscreen={false} tip="Loading application details..." className="min-h-[60vh]" />;
  }

  if (
    apiApp?.type === "NSQ" ||
    (reduxApp as any)?.type === "NSQ" ||
    (application as any)?.type === "NSQ" ||
    id === "nsq"
  ) {
    return (
      <NsqApplicationDetailView
        application={apiApp || reduxApp || application || { type: "NSQ" }}
      />
    );
  }

  if (!application) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4 p-6">
        <p className="text-gray-700 text-lg font-bold">Application Not Found</p>
        <p className="text-gray-400 text-sm max-w-md">
          This application could not be found or you do not have permission to view it.
        </p>
        <Button
          onClick={() => router.push("/dashboard/applications")}
          className="mt-2"
        >
          Back to My Applications
        </Button>
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
        title={paymentErrorInfo.title}
        description={paymentErrorInfo.description}
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

      <TransactionReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        transaction={{
          id:
            receiptData?.paymentId ||
            (application?.id ? "TXN_" + application.id.slice(0, 8) : "TXN_12345_ABCDE"),
          candidateName:
            receiptData?.candidateName ||
            authUser?.fullName ||
            (apiApp as any)?.candidate?.name ||
            "Tunde Bakare",
          assessmentType: apiApp?.type || "RPL",
          description: "Recognition of prior learning",
          amountPaid: receiptData?.amount?.amountMinorUnits
            ? `₦${(Number(receiptData.amount.amountMinorUnits) / 100).toLocaleString()}`
            : paymentQuote?.amountMinorUnits
              ? `₦${(Number(paymentQuote.amountMinorUnits) / 100).toLocaleString()}`
              : "₦45,000",
          date: receiptData?.paidAt
            ? new Date(receiptData.paidAt).toISOString().split("T")[0]
            : (application as any)?.submittedAt
              ? new Date((application as any).submittedAt).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
          paymentMethod: receiptData?.provider || "Paystack",
          status: "Paid" as const,
          transactionId:
            receiptData?.paymentId ||
            (application?.id
              ? "TXN_" + application.id.replace(/-/g, "").slice(0, 10).toUpperCase()
              : "TXN_12345_ABCDE"),
        }}
      />
    </motion.div>
  );
};

