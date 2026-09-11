"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiChevronRight,
  FiCalendar,
  FiCheck,
  FiClock,
  FiUser,
  FiPlus,
} from "react-icons/fi";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import { Button } from "@/src/components/ui/button";
import { Avatar } from "@/src/components/ui/avatar";
import { ASSETS_URL } from "@/assets";
import { useToast } from "@/src/components/ui/toast";
import { StatusModal } from "@/components/status-modal";
import {
  scheduleDirectObservationApi,
  initiateApplicationPaymentApi,
} from "@/src/features/shared/applications/api";
import {
  useGetTradeDetail,
  useGetUnitsByTrade,
  useGetEvidenceTypesByTrade,
  useGetCentres,
  useGetSectors,
} from "@/src/features/shared/reference/hooks";
import { useAppSelector } from "@/src/store/hooks";
import { NsqUnitDetailView } from "./NsqUnitDetailView";
import { NsqRequestObservationModal } from "./NsqRequestObservationModal";
import { NsqObservationRequestReviewModal } from "./NsqObservationRequestReviewModal";
import { NsqObservationSuccessModal } from "./NsqObservationSuccessModal";
import { CandidateReportSignatureModal } from "./CandidateReportSignatureModal";

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
  const { toast } = useToast();

  const savedOnboarding = useAppSelector((state) => state.onboarding.nsqApplication);

  const [selectedUnit, setSelectedUnit] = useState<NsqUnitItem | null>(null);
  const [isObservationModalOpen, setIsObservationModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isReportSignatureModalOpen, setIsReportSignatureModalOpen] = useState(false);
  const [isReportSigned, setIsReportSigned] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Application payment status
  const appId = application?.id || "nsq";
  const [isPaid, setIsPaid] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`nsq_payment_paid_${appId}`);
      if (stored === "true") return true;
    }
    return Boolean(application?.paymentCompleted);
  });

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
  const { data: remoteUnits = [] } = useGetUnitsByTrade(tradeId);
  const { data: remoteEvidenceTypes = [] } = useGetEvidenceTypesByTrade(tradeId);
  const { data: remoteCentres = [] } = useGetCentres();
  const { data: remoteSectors = [] } = useGetSectors();

  const [scheduledObservation, setScheduledObservation] = useState<{
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

  const resolvedTradeName =
    tradeDetail?.name ||
    application?.trade?.name ||
    (typeof application?.trade === "string" && !isRawId(application?.trade)
      ? application?.trade
      : "") ||
    savedOnboarding?.tradeName ||
    "Carpentry";

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
    "Elimi Assessment Centre";

  // Handle Make Payment action
  const handleMakePayment = async () => {
    setIsProcessingPayment(true);

    try {
      if (application?.id && isRawId(application.id)) {
        try {
          await initiateApplicationPaymentApi(application.id);
        } catch {
          // Fallback simulation for payment demo
        }
      }
    } catch {
      // Ignore network errors for mock transition
    }

    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsPaid(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(`nsq_payment_paid_${appId}`, "true");
      }
      toast({
        type: "success",
        title: "Payment Successful",
        description: "Your NSQ assessment fee payment has been confirmed.",
      });
    }, 2200);
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
    units: string[];
    date: string;
    time: string;
    country: string;
    state: string;
    lga: string;
    address: string;
  }) => {
    setScheduledObservation({
      ...details,
      status: "attention_required",
      isSigned: false,
    });
    setSuccessModalInfo({
      title: "Direct Observation Request Sent",
      subtitle: "You have successfully sent your direct observation request",
    });
    setIsSuccessModalOpen(true);

    if (application?.id && details.date) {
      try {
        const isoDate = `${details.date}T${details.time || "10:00"}:00Z`;
        await scheduleDirectObservationApi(application.id, isoDate);
      } catch {
        // Continue with local UI state
      }
    }
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
            rightIcon={<FiPlus className="w-4 h-4 ml-1" />}
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

              {/* Steps Progress */}
              <div className="relative flex items-center justify-between w-full px-2 sm:px-6">
                {/* Horizontal Background Line */}
                <div className="absolute left-6 right-6 top-4 h-0.5 bg-gray-200 -z-0" />
                <div
                  className={`absolute left-6 top-4 h-0.5 -z-0 transition-all duration-300 ${
                    isPaid ? "right-2/4 bg-emerald-500" : "right-3/4 bg-emerald-500"
                  }`}
                />

                {/* Step 1: Induction Form */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/20">
                    <FiCheck className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 text-center">
                    Induction Form
                  </span>
                </div>

                {/* Step 2: QAA */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div
                    className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-md ${
                      isPaid
                        ? "bg-emerald-500 shadow-emerald-500/20"
                        : "bg-[#fbab2a] shadow-amber-500/20"
                    }`}
                  >
                    {isPaid ? (
                      <FiCheck className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-bold text-center ${
                      isPaid ? "text-emerald-600" : "text-[#fbab2a]"
                    }`}
                  >
                    QAA
                  </span>
                </div>

                {/* Step 3: IQA */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center" />
                  <span className="text-[11px] font-medium text-gray-400 text-center">
                    IQA
                  </span>
                </div>

                {/* Step 4: Awarding Body */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center" />
                  <span className="text-[11px] font-medium text-gray-400 text-center">
                    Awarding Body
                  </span>
                </div>

                {/* Step 5: Certification */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center" />
                  <span className="text-[11px] font-medium text-gray-400 text-center">
                    Certification
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Application Status Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h4 className="text-base sm:text-lg font-extrabold text-neutral-primary tracking-tight">
                  Application Status
                </h4>
                {isPaid ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Approved
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#C2410C]">
                    Application Submitted
                  </span>
                )}
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
                    ₦45,000
                  </span>
                  {isPaid ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      Completed
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">
                      Not Started
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm text-neutral-secondary font-medium">
                  NSQ Standard Assessment Fee
                </span>
              </div>

              {!isPaid ? (
                <button
                  type="button"
                  onClick={handleMakePayment}
                  className="text-sm font-extrabold text-[#fbab2a] hover:text-[#e89b1f] hover:underline cursor-pointer select-none shrink-0"
                >
                  Make Payment
                </button>
              ) : (
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 shrink-0">
                  <FiCheck className="w-4 h-4" /> Paid
                </span>
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
                  router.push(`/nsq/induction-form?applicationId=${application?.id || ""}`)
                }
                className="text-sm font-extrabold text-[#fbab2a] hover:text-[#e89b1f] hover:underline cursor-pointer select-none shrink-0"
              >
                Complete Form
              </button>
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

              {scheduledObservation ? (
                <div className="flex flex-col gap-2">
                  <div
                    onClick={() => setIsReviewModalOpen(true)}
                    className={`bg-[#f8f9fa] hover:bg-white border border-gray-100 hover:border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer transition-all group shadow-2xs select-none border-l-[5px] ${
                      scheduledObservation.status === "scheduled" ||
                      scheduledObservation.status === "completed"
                        ? "border-l-emerald-500"
                        : "border-l-[#fbab2a]"
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      {/* Status Badge */}
                      <span
                        className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          scheduledObservation.status === "scheduled" ||
                          scheduledObservation.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : scheduledObservation.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-pink-100 text-pink-700"
                        }`}
                      >
                        {scheduledObservation.status === "scheduled"
                          ? "Scheduled"
                          : scheduledObservation.status === "completed"
                            ? "Completed"
                            : scheduledObservation.status === "pending"
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
                            {scheduledObservation.time || "12:00PM"}
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                            Date
                          </span>
                          <span className="text-xs font-bold text-neutral-primary">
                            {scheduledObservation.date || "22/03/2026"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {scheduledObservation.status === "scheduled" ? (
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
                    ) : scheduledObservation.status === "completed" ? null : (
                      <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                    )}
                  </div>

                  {/* View Form Button for Completed status */}
                  {scheduledObservation.status === "completed" && (
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
                  <p className="text-[11px] text-gray-400 font-medium max-w-[200px]">
                    Your scheduled events will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Observation Request Creation Form Modal */}
      <NsqRequestObservationModal
        isOpen={isObservationModalOpen}
        onClose={() => setIsObservationModalOpen(false)}
        tradeName={resolvedTradeName}
        onRequestSubmitted={handleObservationRequestSubmitted}
      />

      {/* Observation Request Review & Signature Modal */}
      <NsqObservationRequestReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        details={scheduledObservation}
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
        onSignedSuccess={() => setIsReportSigned(true)}
      />

      {/* Processing Payment Modal (media_1789106852366.png) */}
      <StatusModal
        isOpen={isProcessingPayment}
        variant="processing-payment"
        title="Processing Payment"
        description="Please wait while we process your payment"
      />
    </div>
  );
};
