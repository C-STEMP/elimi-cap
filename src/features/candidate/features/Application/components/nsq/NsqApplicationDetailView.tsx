"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FiChevronRight,
  FiCalendar,
  FiCheck,
  FiClock,
  FiUser,
  FiX,
} from "react-icons/fi";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import { Button } from "@/src/components/ui/button";
import { Avatar } from "@/src/components/ui/avatar";
import { ASSETS_URL } from "@/assets";
import { useToast } from "@/src/components/ui/toast";
import { TransactionReceiptModal } from "@/features/assessment-centre/features/Payment/components/TransactionReceiptModal";
import { PaymentModal, type PaymentModalType } from "../PaymentModals";
import { scheduleDirectObservationApi } from "@/src/features/shared/applications/api";
import {
  useGetInductionForm,
  useGetDirectObservations,
  useScheduleDirectObservation,
  useGetApplicationStages,
  useInitiateApplicationPayment,
  useGetPaymentQuote,
  useGetApplicationReceipt,
} from "@/src/features/shared/applications/hooks";
import { APPLICATION_QUERY_KEYS } from "@/src/features/shared/applications/hooks/queryKeys";
import {
  useGetTradeDetail,
  useGetUnitsByTrade,
  useGetEvidenceTypesByTrade,
  useGetCentres,
  useGetSectors,
} from "@/src/features/shared/reference/hooks";
import { useAppSelector } from "@/src/store/hooks";
import { formatCurrency } from "@/src/utils/currency";
import { NsqUnitDetailView } from "./NsqUnitDetailView";
import { NsqRequestObservationModal } from "./NsqRequestObservationModal";
import { NsqObservationRequestReviewModal } from "./NsqObservationRequestReviewModal";
import { NsqObservationSuccessModal } from "./NsqObservationSuccessModal";
import { CandidateReportSignatureModal } from "./CandidateReportSignatureModal";
import { NsqCompleteInductionFormModal } from "./NsqCompleteInductionFormModal";

const NSQ_PROGRESS_STEPS = [
  { key: "induction", label: "Induction Form" },
  { key: "regular_assessment", label: "QAA" },
  { key: "internal_verification", label: "IQA" },
  { key: "external_verification", label: "Awarding Body" },
  { key: "certification", label: "Certification" },
] as const;

interface NsqUnitItem {
  id: string;
  unitNo: string;
  title: string;
  status: "Not Started" | "In Progress" | "Completed" | "Approved";
  structure?: Record<string, unknown>;
}

interface NsqApplicationDetailViewProps {
  application: any;
}

export const NsqApplicationDetailView: React.FC<NsqApplicationDetailViewProps> = ({
  application,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const savedOnboarding = useAppSelector((state) => state.onboarding.nsqApplication);

  const [selectedUnit, setSelectedUnit] = useState<NsqUnitItem | null>(null);
  const [isObservationModalOpen, setIsObservationModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isReportSignatureModalOpen, setIsReportSignatureModalOpen] = useState(false);
  const [isReportSigned, setIsReportSigned] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isInductionViewModalOpen, setIsInductionViewModalOpen] = useState(false);
  const [isInductionFillModalOpen, setIsInductionFillModalOpen] = useState(false);

  const appId = application?.id || "nsq";

  // Real workflow stages from the backend (GET /applications/{id}/stages).
  const { data: stagesData } = useGetApplicationStages(application?.id || "");

  const applicationFormStage = stagesData?.find((s) => s.stageKey === "application_form");
  const paymentStage = stagesData?.find((s) => s.stageKey === "payment");

  // Payment status/flow — mirrors the RPL application detail payment integration
  // (POST /applications/{id}/pay -> Paystack checkoutUrl redirect, confirmed on
  // return via the `payment`/`reference` query params).
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [activePaymentModal, setActivePaymentModal] = useState<PaymentModalType>(null);
  const [paymentErrorInfo, setPaymentErrorInfo] = useState<{
    title?: string;
    description?: string;
  }>({});

  const isPaid = isPaymentConfirmed || paymentStage?.status === "successful";
  const isAppFormApproved = Boolean(
    applicationFormStage?.status === "successful" ||
      (application?.currentStageKey &&
        !["application_form", "draft"].includes(application.currentStageKey)),
  );
  const isPaymentUnlocked = isAppFormApproved || isPaid;

  const { data: paymentQuote } = useGetPaymentQuote(application?.id || "", {
    enabled: Boolean(application?.id && !isPaid),
  });
  const { data: receiptData } = useGetApplicationReceipt(application?.id || "", {
    enabled: Boolean(application?.id && isPaid),
  });
  const initiatePayment = useInitiateApplicationPayment();

  const paymentAmountText = receiptData?.amount?.amountMinorUnits
    ? formatCurrency(receiptData.amount.amountMinorUnits, receiptData.amount.currency)
    : paymentQuote?.amountMinorUnits
      ? formatCurrency(paymentQuote.amountMinorUnits, paymentQuote.currency)
      : paymentStage?.amountMinorUnits
        ? formatCurrency(paymentStage.amountMinorUnits, paymentStage.currency || "NGN")
        : "—";

  // Assessment Progress timeline nodes, resolved against the real stage rows.
  const progressSteps = useMemo(
    () =>
      NSQ_PROGRESS_STEPS.map((step) => ({
        ...step,
        status: stagesData?.find((s) => s.stageKey === step.key)?.status ?? "not_started",
      })),
    [stagesData],
  );
  const completedStepsCount = progressSteps.filter((s) => s.status === "successful").length;
  const progressPercent =
    progressSteps.length > 1 ? (completedStepsCount / (progressSteps.length - 1)) * 100 : 0;

  const applicationStatusBadge =
    applicationFormStage?.status === "successful" || isAppFormApproved ? (
      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#ecfdf5] text-[#10b981]">
        Approved
      </span>
    ) : applicationFormStage?.status === "rejected" ? (
      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-red-50 text-red-600">
        Rejected
      </span>
    ) : applicationFormStage?.status === "under_review" ||
      applicationFormStage?.status === "in_progress" ? (
      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#FFF7ED] text-[#C2410C]">
        Under Review
      </span>
    ) : (
      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#FFF7ED] text-[#C2410C]">
        Application Submitted
      </span>
    );

  const paymentStatusBadge = isPaid ? (
    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#ecfdf5] text-[#10b981]">
      Successful
    </span>
  ) : paymentStage?.status === "awaiting_payment" || paymentStage?.status === "in_progress" ? (
    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700">
      Pending
    </span>
  ) : (
    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-gray-100 text-gray-600">
      Not Started
    </span>
  );

  // Handle Paystack redirect back to this page.
  useEffect(() => {
    const paymentParam = searchParams.get("payment");
    const refParam = searchParams.get("reference") || searchParams.get("trxref");
    if (!application?.id) return;

    if (paymentParam === "success" || refParam) {
      setIsPaymentConfirmed(true);
      const refreshPaymentData = () => {
        queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.stages(application.id) });
        queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.receipt(application.id) });
        queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.detail(application.id) });
      };
      // Payment completion is processed asynchronously on the backend (a
      // payment.completed webhook), so it may not be reflected the instant
      // Paystack redirects back — refetch now and again shortly after to
      // catch up once the webhook lands.
      refreshPaymentData();
      const retryTimer = setTimeout(refreshPaymentData, 3000);
      setActivePaymentModal("success");
      toast({
        type: "success",
        title: "Payment Confirmed",
        description: "Your NSQ assessment fee payment has been confirmed.",
      });
      if (typeof window !== "undefined" && window.history?.replaceState) {
        window.history.replaceState({}, "", window.location.pathname);
      }
      return () => clearTimeout(retryTimer);
    } else if (paymentParam === "cancelled" || paymentParam === "failed") {
      setActivePaymentModal("unsuccessful");
      if (typeof window !== "undefined" && window.history?.replaceState) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, application?.id]);

  const [successModalInfo, setSuccessModalInfo] = useState({
    title: "Direct Observation Request Sent",
    subtitle: "You have successfully sent your direct observation request",
  });

  const isRawId = (str?: string) => {
    if (!str) return false;
    if (/^[0-9A-Z]{20,}$/.test(str) || /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(str))
      return true;
    return false;
  };

  const tradeId =
    application?.tradeId ||
    (typeof application?.trade === "object" ? application?.trade?.id : null) ||
    (typeof application?.trade === "string" && isRawId(application?.trade)
      ? application?.trade
      : "") ||
    savedOnboarding?.tradeId ||
    "";

  const sectorId =
    application?.sectorId ||
    (typeof application?.sector === "object" ? application?.sector?.id : null) ||
    (typeof application?.sector === "string" && isRawId(application?.sector)
      ? application?.sector
      : "") ||
    savedOnboarding?.sectorId ||
    "";

  const centreId =
    application?.centreId ||
    (typeof application?.centre === "object" ? application?.centre?.id : null) ||
    (typeof application?.centre === "string" && isRawId(application?.centre)
      ? application?.centre
      : "") ||
    savedOnboarding?.centreId ||
    "";

  // Fetch dynamic Trade Detail, Units, Centres, and Sectors
  const { data: tradeDetail } = useGetTradeDetail(tradeId);
  const { data: remoteUnits = [], isLoading: isLoadingUnits } = useGetUnitsByTrade(tradeId);
  const { data: remoteEvidenceTypes = [] } = useGetEvidenceTypesByTrade(tradeId);
  const { data: remoteCentres = [] } = useGetCentres();
  const { data: remoteSectors = [] } = useGetSectors();

  // NSQ Backend Queries & Mutations
  const { data: inductionForm } = useGetInductionForm(application?.id);
  const { data: directObservationsData } = useGetDirectObservations(application?.id);
  const { mutateAsync: scheduleObservationMutation } =
    useScheduleDirectObservation(application?.id);

  const [scheduledObservation, setScheduledObservation] = useState<{
    id?: string;
    units?: string[];
    date: string;
    time: string;
    country?: string;
    state?: string;
    lga?: string;
    address?: string;
    status?: "pending" | "attention_required" | "scheduled" | "completed";
    isSigned?: boolean;
  } | null>(
    application?.directObservation
      ? {
          units: application.directObservation.units || ["UNIT 1"],
          date:
            application.directObservation.scheduledAt?.split("T")[0] ||
            "22/03/2026",
          time:
            application.directObservation.scheduledAt
              ?.split("T")[1]
              ?.slice(0, 5) || "12:00PM",
          status: application.directObservation.status || "pending",
          isSigned: false,
        }
      : null,
  );

  const liveSitting = directObservationsData?.items?.[0];
  const activeObservation = liveSitting
    ? {
        id: liveSitting.id,
        units: liveSitting.unitIds || ["UNIT 1"],
        date: liveSitting.scheduledAt?.split("T")[0] || "22/03/2026",
        time:
          liveSitting.scheduledAt?.split("T")[1]?.slice(0, 5) || "12:00PM",
        address: liveSitting.address,
        status: (liveSitting.status === "requested"
          ? "attention_required"
          : liveSitting.status) as any,
        isSigned: Boolean(liveSitting.learnerSignature),
      }
    : scheduledObservation;

  const resolvedTradeName =
    tradeDetail?.name ||
    application?.trade?.name ||
    (typeof application?.trade === "string" && !isRawId(application?.trade)
      ? application?.trade
      : "") ||
    savedOnboarding?.tradeName ||
    "Masonry";

  const resolvedSectorName =
    (tradeDetail as any)?.sector?.name ||
    application?.sector?.name ||
    (typeof application?.sector === "string" && !isRawId(application?.sector)
      ? application?.sector
      : "") ||
    remoteSectors.find((s) => s.id === sectorId)?.name ||
    savedOnboarding?.sectorName ||
    "Construction";

  const resolvedCentreName =
    (application as any)?.centre?.name ||
    (typeof application?.centre === "string" && !isRawId(application?.centre)
      ? application?.centre
      : "") ||
    remoteCentres.find((c) => c.id === centreId)?.name ||
    savedOnboarding?.centreName ||
    "CStemp Tvet Centre";

  const nsqData = (application as any)?.nsq;
  const wishedQualificationLevel = nsqData?.wishedQualificationLevel;
  const levelName = wishedQualificationLevel
    ? `Level ${wishedQualificationLevel.level}`
    : "";

  const assignedFacilitator = (application as any)?.facilitator || null;

  // Real units for this application — GET /applications/{id} `nsq.units`
  // (same source the assessor/centre views already use) is application-scoped
  // and already carries this application's actual per-unit progress
  // (criteriaApproved/criteriaTotal/criteriaPending). Prefer it over the
  // generic trade catalogue (GET /trades/{id}/units), which is only a
  // fallback for when `nsq` hasn't populated yet. No fake placeholder rows
  // when neither has loaded yet; the empty state is rendered instead.
  //
  // `nsq.units` intentionally spans every active-NOS unit on the trade
  // across all qualification levels (evidence may target any of them) —
  // per the API contract, the UI default is the induction wish-list level,
  // so we filter down to that here instead of listing all three levels'
  // units stacked on top of each other.
  const nsqUnitsAll: any[] = nsqData?.units || [];
  const nsqUnits = wishedQualificationLevel
    ? nsqUnitsAll.filter(
        (u) => u.qualificationLevelId === wishedQualificationLevel.id,
      )
    : nsqUnitsAll;
  const unitsList: NsqUnitItem[] =
    nsqUnits.length > 0
      ? nsqUnits.map((u) => {
          const status: NsqUnitItem["status"] =
            u.status === "approved"
              ? "Approved"
              : u.status === "in_progress" || u.criteriaPending > 0
                ? "In Progress"
                : "Not Started";
          return {
            id: u.id,
            unitNo: u.referenceNumber,
            title: u.title,
            status,
          };
        })
      : remoteUnits && remoteUnits.length > 0
        ? remoteUnits.map((u, idx) => ({
            id: u.id,
            unitNo: u.referenceNumber || `UNIT ${idx + 1}`,
            title: u.title,
            status: "Not Started" as const,
            structure: u.structure,
          }))
        : [];

  const qualificationCode =
    nsqUnits[0]?.referenceNumber ||
    remoteUnits[0]?.referenceNumber ||
    (tradeDetail?.activeNosDocument as any)?.qualificationLevels?.[0]?.slug ||
    (tradeDetail?.activeNosDocument as any)?.title ||
    "—";

  const evidenceTypesText =
    remoteEvidenceTypes && remoteEvidenceTypes.length > 0
      ? remoteEvidenceTypes.join("/")
      : "—";

  // Handle Make Payment action — initiates a real checkout via
  // POST /applications/{id}/pay and redirects to the returned Paystack
  // checkoutUrl (same flow as the RPL application detail page).
  const handleMakePayment = () => {
    if (!application?.id) return;

    if (!isPaymentUnlocked) {
      toast({
        type: "error",
        title: "Centre Approval Required",
        description: "Your centre must approve your application before payment.",
      });
      return;
    }

    setActivePaymentModal("processing");
    setPaymentErrorInfo({});

    initiatePayment.mutate(application.id, {
      onSuccess: (data: any) => {
        const checkoutUrl = data?.checkoutUrl || data?.data?.checkoutUrl;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          setIsPaymentConfirmed(true);
          setActivePaymentModal("success");
          queryClient.invalidateQueries({
            queryKey: APPLICATION_QUERY_KEYS.stages(application.id),
          });
        }
      },
      onError: (err: any) => {
        setPaymentErrorInfo({
          title: "Payment Unsuccessful",
          description: err?.message || "Payment was not successful. Please try again.",
        });
        setActivePaymentModal("unsuccessful");
      },
    });
  };

  // If a unit is selected, show the Unit Detail View
  if (selectedUnit) {
    return (
      <NsqUnitDetailView
        applicationId={application?.id}
        unitId={selectedUnit.id}
        unitNumber={selectedUnit.unitNo}
        unitTitle={selectedUnit.title}
        tradeName={resolvedTradeName}
        currentStageKey={application?.currentStageKey}
        structure={selectedUnit.structure}
        onBack={() => setSelectedUnit(null)}
      />
    );
  }

  const handleObservationRequestSubmitted = async (details: {
    unitIds: string[];
    date: string;
    time: string;
    country: string;
    state: string;
    lga: string;
    address: string;
  }) => {
    if (!application?.id) {
      throw new Error("Application not loaded yet. Please try again.");
    }

    // Attempt the real request first — only show success once the backend
    // actually confirms it, instead of unconditionally announcing "sent".
    const isoDate = `${details.date}T${details.time || "10:00"}:00Z`;
    const fullAddress = [details.address, details.lga, details.state, details.country]
      .filter(Boolean)
      .join(", ");
    await scheduleObservationMutation({
      unitIds: details.unitIds,
      scheduledAt: isoDate,
      address: fullAddress || details.address || "Centre Workshop",
    });

    const unitLabels = details.unitIds.map(
      (id) => unitsList.find((u) => u.id === id)?.unitNo || id,
    );
    setScheduledObservation({
      units: unitLabels,
      date: details.date,
      time: details.time,
      country: details.country,
      state: details.state,
      lga: details.lga,
      address: details.address,
      status: "attention_required",
      isSigned: false,
    });
    setSuccessModalInfo({
      title: "Direct Observation Request Sent",
      subtitle: "You have successfully sent your direct observation request",
    });
    setIsSuccessModalOpen(true);
  };

  const handleConfirmSchedule = (updated: any) => {
    setScheduledObservation(updated);
    setSuccessModalInfo({
      title: "Schedule Confirmed",
      subtitle: "You have successfully confirmed this schedule",
    });
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="w-full flex flex-col items-center bg-[#f8f9fa] min-h-screen pb-12">
      {/* Edge to edge header banner */}
      <HeaderBanner
        title={resolvedTradeName}
        backTitle={resolvedTradeName}
        backHref="/dashboard/applications"
        rightAction={
          <Button
            type="button"
            variant="amber"
            size="md"
            rightIcon={<FiCalendar className="w-4 h-4 ml-1.5" />}
            onClick={() => setIsObservationModalOpen(true)}
            className="px-4 sm:px-5 h-10 text-white font-bold text-xs sm:text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-md cursor-pointer shrink-0 flex items-center gap-1"
          >
            <span>Request Observation</span>
          </Button>
        }
        breadcrumbs={[
          { label: "My Applications", href: "/dashboard/applications" },
          { label: resolvedTradeName },
        ]}
      />

      {/* Main Container */}
      <div className="w-full max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Main Column */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* 1. Assessment Progress Timeline Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
              <h3 className="text-base sm:text-lg font-extrabold text-neutral-primary tracking-tight">
                Assessment Progress
              </h3>

              {/* Steps Progress — driven by GET /applications/{id}/stages.
                  Application Form and Payment have their own cards below,
                  so the timeline covers the remaining five workflow stages. */}
              <div className="relative flex items-center justify-between w-full px-2 sm:px-6">
                {/* Horizontal Background Line */}
                <div className="absolute left-6 right-6 top-3 h-0.5 bg-gray-200 z-0" />
                <div
                  className="absolute left-6 top-3 h-0.5 z-0 bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />

                {progressSteps.map((step) => {
                  const isComplete = step.status === "successful";
                  const isRejected = step.status === "rejected";
                  const isActive =
                    !isComplete && !isRejected && step.status !== "not_started";

                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 z-10">
                      {isComplete || isActive || isRejected ? (
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shadow-xs ${
                            isComplete
                              ? "bg-[#10b981]"
                              : isRejected
                                ? "bg-red-500"
                                : "bg-[#fbab2a]"
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-gray-300 bg-white flex items-center justify-center" />
                      )}
                      <span
                        className={`text-[11px] text-center ${
                          isComplete
                            ? "font-bold text-[#10b981]"
                            : isRejected
                              ? "font-bold text-red-500"
                              : isActive
                                ? "font-bold text-[#fbab2a]"
                                : "font-medium text-gray-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Application Status Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-base sm:text-lg font-extrabold text-neutral-primary tracking-tight">
                    Application Status
                  </h4>
                  {applicationStatusBadge}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-neutral-secondary font-medium">
                {resolvedCentreName} | {resolvedSectorName} | {resolvedTradeName}
              </p>
            </div>

            {/* 3. Payment Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg sm:text-xl font-black text-neutral-primary">
                    {paymentAmountText}
                  </span>
                  {paymentStatusBadge}
                </div>
                <span className="text-xs sm:text-sm text-neutral-secondary font-medium">
                  NSQ Standard Assessment Fee
                </span>
              </div>

              {isPaid ? (
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(true)}
                  className="text-sm font-extrabold text-[#fbab2a] hover:text-[#e89b1f] hover:underline cursor-pointer select-none shrink-0"
                >
                  Receipt
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleMakePayment}
                  disabled={initiatePayment.isPending}
                  className="text-sm font-extrabold text-[#fbab2a] hover:text-[#e89b1f] hover:underline cursor-pointer select-none shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Make Payment
                </button>
              )}
            </div>

            {/* 4. Candidate Induction Form Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
              <span className="text-sm sm:text-base font-extrabold text-neutral-primary tracking-tight">
                Candidate Induction Form
              </span>

              <button
                type="button"
                onClick={() =>
                  inductionForm?.submittedAt
                    ? setIsInductionViewModalOpen(true)
                    : setIsInductionFillModalOpen(true)
                }
                className="text-sm font-extrabold text-[#fbab2a] hover:text-[#e89b1f] hover:underline cursor-pointer select-none shrink-0"
              >
                {inductionForm?.submittedAt ? "View" : "Complete Form"}
              </button>
            </div>

            {/* 5. Middle Cards Grid: NOS Details & Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Card: NOS Details */}
              <div className="bg-[#fcfaf7] rounded-2xl p-5 border border-amber-100/50 shadow-xs flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="self-start px-2.5 py-0.5 rounded-md bg-[#fce7f3] text-[#be185d] font-bold text-[10px] tracking-wide">
                    Mandatory
                  </span>
                  <h4 className="text-base font-extrabold text-neutral-primary tracking-tight">
                    {resolvedTradeName} National Occupational Standard
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200/40">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      Qualification Code
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-neutral-primary truncate mt-0.5">
                      {qualificationCode}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      Evidence Type
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-neutral-primary truncate mt-0.5">
                      {evidenceTypesText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Card: Metrics */}
              <div className="bg-[#fcfaf7] rounded-2xl p-5 border border-amber-100/50 shadow-xs grid grid-cols-2 gap-4 items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    Sector
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-neutral-primary truncate mt-0.5">
                    {resolvedSectorName}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    Mandatory Unit Score
                  </span>
                  <span className="text-base sm:text-lg font-black text-neutral-primary mt-0.5">
                    0
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    Level
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-neutral-primary mt-0.5">
                    {levelName}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    Optional Unit Score
                  </span>
                  <span className="text-base sm:text-lg font-black text-neutral-primary mt-0.5">
                    0
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Units List */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
              <h3 className="text-base sm:text-lg font-extrabold text-neutral-primary tracking-tight">
                {levelName ? `${resolvedTradeName} ${levelName}` : resolvedTradeName}
              </h3>

              <div className="flex flex-col gap-3">
                {isLoadingUnits ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-gray-100/80 bg-[#f8f9fa] flex items-center justify-between gap-4 animate-pulse"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 flex-1">
                        <div className="h-3.5 bg-gray-200 rounded w-16 shrink-0" />
                        <div className="h-3.5 bg-gray-200 rounded w-48" />
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="h-5 bg-gray-200 rounded-full w-20" />
                        <div className="w-4 h-4 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))
                ) : unitsList.length > 0 ? (
                  unitsList.map((unit) => (
                    <div
                      key={unit.id}
                      onClick={() => setSelectedUnit(unit)}
                      className="p-4 rounded-xl border border-gray-100/80 hover:border-gray-200 bg-[#f8f9fa] hover:bg-white flex items-center justify-between gap-4 cursor-pointer transition-all group shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                        <span className="font-extrabold text-xs sm:text-sm text-neutral-primary uppercase shrink-0">
                          {unit.unitNo}:
                        </span>
                        <span className="text-xs sm:text-sm text-gray-700 font-medium truncate">
                          {unit.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                            unit.status === "Approved"
                              ? "bg-[#ecfdf5] text-[#10b981]"
                              : unit.status === "In Progress"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-gray-200/80 text-gray-600"
                          }`}
                        >
                          {unit.status}
                        </span>
                        <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 font-medium py-2">
                    Units will appear here once your qualification standard is loaded.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Calendar */}
            <CalendarWidget />

            {/* Observation Request Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
              <h4 className="text-sm font-extrabold text-neutral-primary tracking-tight">
                Observation Request
              </h4>

              {activeObservation ? (
                <div className="flex flex-col gap-2">
                  <div
                    onClick={() => setIsReviewModalOpen(true)}
                    className={`bg-[#f8f9fa] hover:bg-white border border-gray-100 hover:border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer transition-all group shadow-2xs select-none border-l-[5px] ${
                      activeObservation.status === "scheduled" ||
                      activeObservation.status === "completed"
                        ? "border-l-emerald-500"
                        : "border-l-[#fbab2a]"
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      {/* Status Badge */}
                      <span
                        className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          activeObservation.status === "scheduled" ||
                          activeObservation.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : activeObservation.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-pink-100 text-pink-700"
                        }`}
                      >
                        {activeObservation.status === "scheduled"
                          ? "Scheduled"
                          : activeObservation.status === "completed"
                            ? "Completed"
                            : activeObservation.status === "pending"
                              ? "Pending"
                              : "Attention Required"}
                      </span>

                      <h5 className="font-extrabold text-xs sm:text-sm text-neutral-primary tracking-tight">
                        Physically Observation
                      </h5>

                      {/* Time & Date Grid */}
                      <div className="flex items-center gap-6 text-gray-600">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                            Time
                          </span>
                          <span className="text-xs font-bold text-neutral-primary">
                            {activeObservation.time || "12:00PM"}
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                            Date
                          </span>
                          <span className="text-xs font-bold text-neutral-primary">
                            {activeObservation.date || "22/03/2026"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {activeObservation.status === "scheduled" ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsObservationModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-neutral-900 transition-colors cursor-pointer"
                        title="Reschedule observation"
                      >
                        <FiClock className="w-4 h-4" />
                      </button>
                    ) : activeObservation.status === "completed" ? null : (
                      <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                    )}
                  </div>

                  {/* View Form Button for Completed status */}
                  {activeObservation.status === "completed" && (
                    <Button
                      type="button"
                      variant="amber"
                      size="md"
                      onClick={() => setIsReviewModalOpen(true)}
                      className="w-full h-11 text-white font-bold text-xs sm:text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-md cursor-pointer mt-1 flex items-center justify-center"
                    >
                      View Form
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                    <FiCalendar className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-neutral-primary">
                    No request
                  </span>
                  <p className="text-[11px] text-gray-400 font-medium max-w-50">
                    Your scheduled events will appear here
                  </p>
                </div>
              )}
            </div>

            {/* Assessor / Facilitator Card — real GET /applications/{id}
                `facilitator` field, not a fabricated identity. */}
            {assignedFacilitator ? (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center gap-3.5">
                <Avatar
                  src={assignedFacilitator.photo?.url || null}
                  name={assignedFacilitator.name}
                  className="w-14 h-14 shrink-0 rounded-full border border-gray-100"
                  alt="Assessor"
                />

                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-sm text-neutral-primary truncate">
                    {assignedFacilitator.name}
                  </span>
                  <span className="text-[11px] text-neutral-secondary font-medium truncate mt-0.5">
                    {assignedFacilitator.role || "Assessor"} • {resolvedTradeName}
                    {levelName ? ` (${levelName})` : ""}
                  </span>
                  {assignedFacilitator.tags && assignedFacilitator.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {assignedFacilitator.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center gap-3.5">
                <div className="w-14 h-14 shrink-0 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                  <FiUser className="w-6 h-6" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm text-neutral-primary">
                    No assessor assigned yet
                  </span>
                  <span className="text-[11px] text-neutral-secondary font-medium mt-0.5">
                    You&apos;ll see your assessor&apos;s details here once one is assigned.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Observation Request Creation Form Modal */}
      <NsqRequestObservationModal
        isOpen={isObservationModalOpen}
        onClose={() => setIsObservationModalOpen(false)}
        tradeName={resolvedTradeName}
        availableUnits={unitsList.map((u) => ({ id: u.id, label: u.unitNo }))}
        onRequestSubmitted={handleObservationRequestSubmitted}
      />

      {/* Observation Request Review & Signature Modal */}
      <NsqObservationRequestReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        details={activeObservation}
        applicationId={application?.id}
        onConfirmSchedule={handleConfirmSchedule}
      />

      {/* Observation Success Confirmation Modal */}
      <NsqObservationSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={successModalInfo.title}
        subtitle={successModalInfo.subtitle}
      />

      {/* Internal Verifier Report Signature Modal */}
      <CandidateReportSignatureModal
        isOpen={isReportSignatureModalOpen}
        onClose={() => setIsReportSignatureModalOpen(false)}
        applicationId={application?.id}
        sessionId={activeObservation?.id}
        onSignedSuccess={() => setIsReportSigned(true)}
      />

      {/* Transaction Receipt Modal — backed by GET /applications/{id}/receipt */}
      <TransactionReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        transaction={{
          id: receiptData?.paymentId || appId,
          candidateName:
            receiptData?.candidateName ||
            application?.candidate?.name ||
            application?.user?.name ||
            "Candidate",
          assessmentType: "NSQ Standard",
          description: "NSQ Standard Assessment Fee",
          amountPaid: paymentAmountText,
          date: receiptData?.paidAt
            ? new Date(receiptData.paidAt).toLocaleDateString("en-GB")
            : new Date().toLocaleDateString("en-GB"),
          paymentMethod: receiptData?.provider || "Paystack",
          status: "Paid",
          transactionId:
            receiptData?.paymentId ||
            `TXN-${appId.replace(/-/g, "").slice(0, 10).toUpperCase()}`,
        }}
      />

      {/* Candidate Induction Form — fill/submit (real POST /applications/{id}/induction-form) */}
      <NsqCompleteInductionFormModal
        isOpen={isInductionFillModalOpen}
        onClose={() => setIsInductionFillModalOpen(false)}
        applicationId={appId}
        tradeName={resolvedTradeName}
        levelName={levelName}
        qualificationLevels={inductionForm?.options?.qualificationLevels || []}
        defaultQualificationLevelId={
          (application as any)?.nsq?.wishedQualificationLevel?.id ||
          inductionForm?.qualificationLevel?.id
        }
        candidateName={
          application?.candidate?.name || application?.user?.name || ""
        }
        availableUnits={
          inductionForm?.options?.units && inductionForm.options.units.length > 0
            ? inductionForm.options.units.map((u) => ({
                id: u.id,
                unitNo: u.referenceNumber,
                title: u.title,
                qualificationLevelId: u.qualificationLevelId,
              }))
            : unitsList.map((u) => ({
                id: u.id,
                unitNo: u.unitNo,
                title: u.title,
              }))
        }
        defaultSelectedUnitIds={
          (application as any)?.nsq?.wishedUnitIds ||
          (application as any)?.nsq?.units?.map((u: any) => u.id)
        }
      />

      {/* Candidate Induction View Modal */}
      {isInductionViewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 select-text">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsInductionViewModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>

            <div className="text-left mb-5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                National Skills Qualification (NSQ)
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight mt-0.5">
                Candidate Induction Form
              </h3>
              <p className="text-xs text-neutral-secondary font-normal mt-0.5">
                Verified candidate registration details, selected trade units, and self-declaration
              </p>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    CANDIDATE NAME
                  </span>
                  <span className="font-bold text-neutral-primary text-xs mt-0.5 block">
                    {inductionForm?.data?.firstName
                      ? `${inductionForm.data.firstName} ${inductionForm.data.lastName || ""}`.trim()
                      : application?.candidate?.name ||
                        application?.user?.name ||
                        "Candidate"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    REGISTERED TRADE
                  </span>
                  <span className="font-bold text-neutral-primary text-xs mt-0.5 block">
                    {inductionForm?.trade?.name || resolvedTradeName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    REGISTRATION STATUS
                  </span>
                  <span className="text-emerald-700 font-bold text-xs mt-0.5 inline-flex items-center gap-1">
                    <FiCheck className="w-3.5 h-3.5" />{" "}
                    {inductionForm?.submittedAt
                      ? "Induction Completed"
                      : "Induction Form"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    SUBMISSION DATE
                  </span>
                  <span className="font-medium text-neutral-primary text-xs mt-0.5 block">
                    {inductionForm?.submittedAt
                      ? new Date(inductionForm.submittedAt).toLocaleDateString(
                          "en-GB",
                        )
                      : application?.submittedAt
                        ? new Date(application.submittedAt).toLocaleDateString(
                            "en-GB",
                          )
                        : "22/03/2026"}
                  </span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-2xl p-4 flex flex-col gap-2.5">
                <span className="font-bold text-xs text-neutral-primary">
                  Registered Qualification Units
                </span>
                <div className="flex flex-wrap gap-2">
                  {(inductionForm?.units && inductionForm.units.length > 0
                    ? inductionForm.units.map((u) => ({
                        id: u.id,
                        unitNo: u.referenceNumber,
                        title: u.title,
                      }))
                    : unitsList
                  ).map((u) => (
                    <span
                      key={u.id}
                      className="px-3 py-1.5 bg-rose-50 border border-rose-100 text-[#a31d38] font-bold text-[11px] rounded-xl"
                    >
                      {u.unitNo}: {u.title}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-xs text-emerald-900 block">
                    Candidate Declaration & Verification
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Candidate confirmed agreement to NOS assessment requirements and code of conduct.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-xl shrink-0">
                  Signed
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={() => setIsInductionViewModalOpen(false)}
                variant="amber"
                className="bg-[#fbab2a] text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment status modals (processing / success / cancelled / unsuccessful) —
          same flow as the RPL application detail payment integration. */}
      <PaymentModal
        isOpen={Boolean(activePaymentModal)}
        type={activePaymentModal}
        title={paymentErrorInfo.title}
        description={paymentErrorInfo.description}
        onClose={() => setActivePaymentModal(null)}
        onAction={() => setActivePaymentModal(null)}
      />
    </div>
  );
};
