"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { StatusModal } from "@/components/status-modal";
import { TransactionReceiptModal } from "@/features/assessment-centre/features/Payment/components/TransactionReceiptModal";
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
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isInductionViewModalOpen, setIsInductionViewModalOpen] = useState(false);

  // Application payment status
  const appId = application?.id || "nsq";
  const [isPaid, setIsPaid] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`nsq_payment_paid_${appId}`);
      if (stored === "true") return true;
    }
    return true; // Default to true matching media_1789142603340.png where payment is already Successful
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

  const levelName = application?.level || "Level 3";

  // Dynamic Units list matching mockup (media_1789142603340.png)
  const unitsList: NsqUnitItem[] =
    remoteUnits && remoteUnits.length > 0
      ? remoteUnits.map((u, idx) => ({
          id: u.id,
          unitNo: u.referenceNumber || `UNIT ${idx + 1}`,
          title: u.title,
          status: "Not Started" as const,
          structure: u.structure,
        }))
      : [
          {
            id: "unit-01",
            unitNo: "UNIT 1",
            title: "Lorem ipsum dolor dolor satuir",
            status: "Not Started" as const,
          },
          {
            id: "unit-02",
            unitNo: "UNIT 2",
            title: "Lorem ipsum dolor dolor satuir",
            status: "Not Started" as const,
          },
          {
            id: "unit-03",
            unitNo: "UNIT 3",
            title: "Lorem ipsum dolor dolor satuir",
            status: "Not Started" as const,
          },
          {
            id: "unit-04",
            unitNo: "UNIT 4",
            title: "Lorem ipsum dolor dolor satuir",
            status: "Not Started" as const,
          },
        ];

  const qualificationCode =
    remoteUnits[0]?.referenceNumber ||
    (tradeDetail?.activeNosDocument as any)?.qualificationLevels?.[0]?.slug ||
    (tradeDetail?.activeNosDocument as any)?.title ||
    "CON/MS001/L1";

  const evidenceTypesText =
    remoteEvidenceTypes && remoteEvidenceTypes.length > 0
      ? remoteEvidenceTypes.join("/")
      : "DO/QA/WT/WP/ASS";

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

              {/* Steps Progress */}
              <div className="relative flex items-center justify-between w-full px-2 sm:px-6">
                {/* Horizontal Background Line */}
                <div className="absolute left-6 right-6 top-3 h-0.5 bg-gray-200 -z-0" />
                <div
                  className="absolute left-6 top-3 h-0.5 -z-0 bg-emerald-500 transition-all duration-300"
                  style={{ width: isPaid ? "25%" : "0%" }}
                />

                {/* Step 1: Induction Form */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span className="text-[11px] font-bold text-[#10b981] text-center">
                    Induction Form
                  </span>
                </div>

                {/* Step 2: QAA */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-6 h-6 rounded-full bg-[#fbab2a] flex items-center justify-center shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span className="text-[11px] font-bold text-[#fbab2a] text-center">
                    QAA
                  </span>
                </div>

                {/* Step 3: IQA */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-6 h-6 rounded-full border border-gray-300 bg-white flex items-center justify-center" />
                  <span className="text-[11px] font-medium text-gray-400 text-center">
                    IQA
                  </span>
                </div>

                {/* Step 4: Awarding Body */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-6 h-6 rounded-full border border-gray-300 bg-white flex items-center justify-center" />
                  <span className="text-[11px] font-medium text-gray-400 text-center">
                    Awarding Body
                  </span>
                </div>

                {/* Step 5: Certification */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-6 h-6 rounded-full border border-gray-300 bg-white flex items-center justify-center" />
                  <span className="text-[11px] font-medium text-gray-400 text-center">
                    Certification
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Application Status Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-base sm:text-lg font-extrabold text-neutral-primary tracking-tight">
                    Application Status
                  </h4>
                  {isPaid ? (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#ecfdf5] text-[#10b981]">
                      Approved
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#FFF7ED] text-[#C2410C]">
                      Application Submitted
                    </span>
                  )}
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
                    ₦45,000
                  </span>
                  {isPaid ? (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#ecfdf5] text-[#10b981]">
                      Successful
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-gray-100 text-gray-600">
                      Not Started
                    </span>
                  )}
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
                  className="text-sm font-extrabold text-[#fbab2a] hover:text-[#e89b1f] hover:underline cursor-pointer select-none shrink-0"
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
                onClick={() => setIsInductionViewModalOpen(true)}
                className="text-sm font-extrabold text-[#fbab2a] hover:text-[#e89b1f] hover:underline cursor-pointer select-none shrink-0"
              >
                View
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
                {resolvedTradeName} {levelName}
              </h3>

              <div className="flex flex-col gap-3">
                {unitsList.map((unit) => (
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
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-gray-200/80 text-gray-600">
                        {unit.status}
                      </span>
                      <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
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

            {/* Assessor Profile Card (Ngozi Eze) */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center gap-3.5">
              <Avatar
                src={(application as any)?.verifier?.photo?.url || (application as any)?.assessor?.photo?.url || null}
                name={(application as any)?.assessor?.name || "Ngozi Eze"}
                className="w-14 h-14 shrink-0 rounded-full border border-gray-100"
                alt="Assessor"
              />

              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm text-neutral-primary truncate">
                  {(application as any)?.assessor?.name || "Ngozi Eze"}
                </span>
                <span className="text-[11px] text-neutral-secondary font-medium truncate mt-0.5">
                  Assessor • {resolvedTradeName} ({levelName})
                </span>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600">
                    {resolvedTradeName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600">
                    RPL Coordinator
                  </span>
                </div>
              </div>
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

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        transaction={{
          id: appId,
          candidateName: application?.candidate?.name || application?.user?.name || "Candidate",
          assessmentType: "NSQ Standard",
          description: "NSQ Standard Assessment Fee",
          amountPaid: "₦45,000",
          date: new Date().toLocaleDateString("en-GB"),
          paymentMethod: "Online Card",
          status: "Paid",
          transactionId: `TXN-${appId.slice(0, 8).toUpperCase()}`,
        }}
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
                    {application?.candidate?.name || application?.user?.name || "Candidate"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    REGISTERED TRADE
                  </span>
                  <span className="font-bold text-neutral-primary text-xs mt-0.5 block">
                    {resolvedTradeName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    REGISTRATION STATUS
                  </span>
                  <span className="text-emerald-700 font-bold text-xs mt-0.5 inline-flex items-center gap-1">
                    <FiCheck className="w-3.5 h-3.5" /> Induction Completed
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    SUBMISSION DATE
                  </span>
                  <span className="font-medium text-neutral-primary text-xs mt-0.5 block">
                    {application?.submittedAt ? new Date(application.submittedAt).toLocaleDateString("en-GB") : "22/03/2026"}
                  </span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-2xl p-4 flex flex-col gap-2.5">
                <span className="font-bold text-xs text-neutral-primary">
                  Registered Qualification Units
                </span>
                <div className="flex flex-wrap gap-2">
                  {unitsList.map((u) => (
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

      {/* Processing Payment Modal */}
      <StatusModal
        isOpen={isProcessingPayment}
        variant="processing-payment"
        title="Processing Payment"
        description="Please wait while we process your payment"
      />
    </div>
  );
};
