"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  useApplication, useGetApplicationById, useGetApplicationStages,
  useGetPaymentQuote, useGetApplicationReceipt,
} from "./useApplication";
import { useGetInterviewSchedule, useGetInterviewPanel } from "@/src/features/shared/applications/hooks";
import { APPLICATION_QUERY_KEYS } from "@/src/features/shared/applications/hooks/useApplication";
import { getFolderArrangementStatus, getFormStatus, getStagesConfig } from "../utils/constants";
import {
  statusToFormState, resolveTradeName, buildFacilitatorData,
  buildInterviewAssessors, buildTransactionReceipt, populateOnboardingFromAppDetail,
} from "../utils/applicationDetailsHelpers";
import type { PaymentModalType } from "../components/PaymentModals";
import { formatCurrency } from "@/src/utils/currency";

export function useApplicationDetailsState(id?: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { initiatePayment } = useApplication();

  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [activePaymentModal, setActivePaymentModal] = useState<PaymentModalType>(null);
  const [paymentErrorInfo, setPaymentErrorInfo] = useState<{ title?: string; description?: string }>({});
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isInterviewCollapsed, setIsInterviewCollapsed] = useState(false);

  const authUser = useAppSelector((state) => state.auth.user);
  const { data: apiApp, isLoading } = useGetApplicationById(id || "");
  const { data: stagesData } = useGetApplicationStages(id || "");

  const paymentStage = stagesData?.find((s) => s.stageKey === "payment" || s.stageKey === "payment_quote");
  const isPaymentPaid = isPaymentConfirmed || paymentStage?.status === "successful" || Boolean((apiApp as any)?.paymentCompleted);
  const isDraft = apiApp?.status === "draft" && !(apiApp as any)?.submittedAt;
  const isInterviewStageActive = Boolean(
    apiApp?.currentStageKey === "interview" || (apiApp as any)?.interviewScheduled ||
    stagesData?.some((s) => (s.stageKey === "interview" || s.stageKey === "observation" || s.stageKey === "direct_observation") && s.status !== "not_started") ||
    (apiApp?.status && ["interview_scheduled", "interview_completed", "certification"].includes(apiApp.status)),
  );

  const { data: paymentQuote } = useGetPaymentQuote(id || "", { enabled: Boolean(id && !isDraft && !isPaymentPaid) });
  const { data: receiptData } = useGetApplicationReceipt(id || "", { enabled: Boolean(id && isPaymentPaid) });
  const { data: interviewSchedule } = useGetInterviewSchedule(id || "", { enabled: Boolean(id && !isDraft && isInterviewStageActive) });
  const { data: interviewPanel } = useGetInterviewPanel(id || "", { enabled: Boolean(id && !isDraft && isInterviewStageActive) });

  const isInterviewScheduled = Boolean(interviewSchedule?.scheduledAt);
  const formattedInterviewDate = interviewSchedule?.scheduledAt
    ? new Date(interviewSchedule.scheduledAt).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
    : undefined;

  const resolvedTrade = resolveTradeName((apiApp as any)?.trade, apiApp?.type ?? "RPL");
  const appFormStage = stagesData?.find((s) => s.stageKey === "application_form" || s.stageKey === "application_review" || s.stageKey === "application");
  const isAppFormApproved = Boolean(
    appFormStage?.status === "successful" || (appFormStage?.status as string) === "approved" ||
    (apiApp?.currentStageKey && !["application_form", "application_review", "draft"].includes(apiApp.currentStageKey)),
  );
  const isAppFormUnderReview = Boolean(
    !isDraft && !isAppFormApproved &&
    (appFormStage?.status === "under_review" || appFormStage?.status === "in_progress" ||
      apiApp?.currentStageKey === "application_form" || apiApp?.currentStageKey === "application_review" || (apiApp as any)?.submittedAt),
  );
  const isPaymentUnlocked = Boolean(!isDraft && (isPaymentPaid || isAppFormApproved));

  const application = apiApp ? {
    id: apiApp.id, title: `${resolvedTrade} (${apiApp.type ?? "RPL"})`,
    status: apiApp.status === "draft" && (apiApp as any)?.submittedAt ? "submitted" : (apiApp.status as string),
    createdAt: apiApp.createdAt, submittedAt: (apiApp as any)?.submittedAt,
    selfAssessmentCompleted: Boolean((apiApp as any)?.selfAssessmentCompleted),
    paymentCompleted: isPaymentPaid, evidenceUploaded: Boolean((apiApp as any)?.evidenceUploaded),
  } : null;

  const facilitatorData = useMemo(() => buildFacilitatorData((apiApp as any)?.assignedFacilitator || (apiApp as any)?.facilitator, resolvedTrade), [apiApp, resolvedTrade]);
  const interviewAssessors = useMemo(() => (isInterviewStageActive || isInterviewScheduled ? buildInterviewAssessors(interviewPanel, resolvedTrade) : undefined), [isInterviewStageActive, isInterviewScheduled, interviewPanel, resolvedTrade]);

  useEffect(() => {
    const paymentParam = searchParams.get("payment");
    const refParam = searchParams.get("reference") || searchParams.get("trxref");
    if (paymentParam === "success" || refParam) {
      setIsPaymentConfirmed(true);
      if (id) ["stages", "detail", "receipt", "all"].forEach((k) => queryClient.invalidateQueries({ queryKey: [k, id] }));
      setActivePaymentModal("success");
      toast({ type: "success", title: "Payment Confirmed", description: "Your payment was processed successfully via Paystack." });
      if (typeof window !== "undefined" && window.history?.replaceState) window.history.replaceState({}, "", window.location.pathname);
    } else if (paymentParam === "cancelled" || paymentParam === "failed") {
      setActivePaymentModal("unsuccessful");
      if (typeof window !== "undefined" && window.history?.replaceState) window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, id, toast, queryClient]);

  const formState = application ? statusToFormState(application.status, application.selfAssessmentCompleted, application.paymentCompleted) : "pending";
  const isVaultActive = formState.startsWith("vault_") || formState.startsWith("figma_") || (application?.paymentCompleted ?? false);
  const folderStatus = getFolderArrangementStatus(isVaultActive, formState);
  const formStatus = getFormStatus(formState);
  const isAtInterviewStage = Boolean(isInterviewScheduled || isInterviewStageActive);

  const handleMakePayment = () => {
    if (!application) return;
    if (!isPaymentUnlocked && !isPaymentPaid) {
      toast({ type: "error", title: "Centre Approval Required", description: "Your centre must approve your application before payment." });
      return;
    }
    setActivePaymentModal("processing");
    setPaymentErrorInfo({});
    initiatePayment.mutate(application.id, {
      onSuccess: (data: any) => {
        const checkoutUrl = data?.checkoutUrl || data?.data?.checkoutUrl;
        if (checkoutUrl) window.location.href = checkoutUrl;
        else { setIsPaymentConfirmed(true); setActivePaymentModal("success"); queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all }); }
      },
      onError: (err: any) => {
        setPaymentErrorInfo({ title: "Payment Unsuccessful", description: err?.message || "Payment was not successful. Please try again." });
        setActivePaymentModal("unsuccessful");
      },
    });
  };

  const paymentAmountText = paymentQuote?.amountMinorUnits
    ? formatCurrency(paymentQuote.amountMinorUnits, paymentQuote.currency || "NGN")
    : paymentStage?.amountMinorUnits
      ? formatCurrency(paymentStage.amountMinorUnits, paymentStage.currency || "NGN")
      : "—";

  const stages = application ? getStagesConfig({
    formState, isVaultActive, folderStatus, formStatus, isInterviewCollapsed,
    onToggleInterviewCollapse: () => setIsInterviewCollapsed(!isInterviewCollapsed),
    onOpenFormModal: () => isDraft ? (populateOnboardingFromAppDetail(dispatch, application.id, apiApp), router.push("/rpl/personal-info")) : router.push(`/dashboard/applications/${application.id}/application-form`),
    onMakePayment: handleMakePayment,
    onDownloadReceipt: () => setIsReceiptModalOpen(true),
    onNavigateToVault: () => router.push(`/dashboard/applications/${application.id}/evidence-vault`),
    onAppeal: () => toast({ type: "info", title: "Appeal Submitted", description: "Your appeal request has been recorded." }),
    onTakeCourse: () => toast({ type: "info", title: "Navigating to Course", description: "Redirecting to course..." }),
    onOpenSignatureModal: () => setIsSignatureModalOpen(true),
    onProceedToExternalVerifier: () => { queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.stages(application.id) }); },
    onProceedToCertification: () => { queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.stages(application.id) }); },
    submittedDate: (application as any).submittedAt || application.createdAt,
    isDraft, isPaymentUnlocked, isAppFormApproved, isAppFormUnderReview,
    tradeName: resolvedTrade, paymentAmountText, paymentCompleted: application.paymentCompleted,
    evidenceUploaded: application.evidenceUploaded || application.selfAssessmentCompleted,
    stagesData, currentStageKey: apiApp?.currentStageKey,
    assessors: interviewAssessors, interviewDateText: formattedInterviewDate,
  }) : [];

  const transactionReceipt = useMemo(
    () => buildTransactionReceipt(receiptData, application, apiApp, authUser, paymentQuote, paymentStage),
    [receiptData, application, apiApp, authUser, paymentQuote, paymentStage],
  );

  return {
    apiApp, application, isLoading, isDraft, isPaymentPaid, stages, activeInterviewSchedule: interviewSchedule,
    isInterviewScheduled, isAtInterviewStage, facilitatorData, activePaymentModal, paymentErrorInfo,
    isCallRequestModalOpen, isFormModalOpen, isSignatureModalOpen, isReceiptModalOpen, transactionReceipt,
    handleMakePayment,
    handleEditApplication: () => { if (application) { populateOnboardingFromAppDetail(dispatch, application.id, apiApp); router.push("/rpl/personal-info"); } },
    handleStartFolderArrangement: () => { setActivePaymentModal(null); router.push(`/dashboard/applications/${application?.id}/evidence-vault`); },
    handleConfirmCallModal: () => { setIsCallRequestModalOpen(false); toast({ type: "success", title: "Call Requested", description: "Facilitator will contact you soon." }); },
    setActivePaymentModal, setIsCallRequestModalOpen, setIsFormModalOpen, setIsSignatureModalOpen, setIsReceiptModalOpen,
  };
}
