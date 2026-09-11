"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FiCheck,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiX,
  FiUserPlus,
} from "react-icons/fi";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import { TransactionReceiptModal } from "@/features/assessment-centre/features/Payment/components/TransactionReceiptModal";
import type { PaymentTransaction } from "@/features/assessment-centre/types";
import { ConfirmNsqDecisionModal } from "./ConfirmNsqDecisionModal";
import { AssignNsqAssessorModal, type NsqRoleType } from "./AssignNsqAssessorModal";
import {
  useGetTradeDetail,
  useGetUnitsByTrade,
  useGetEvidenceTypesByTrade,
  useGetCentres,
  useGetSectors,
} from "@/src/features/shared/reference/hooks";
import { IqamToolsDashboard } from "@/src/features/assessor/features/iqam/IqamToolsDashboard";
import type { IqamToolId } from "@/src/features/assessor/features/iqam/types/iqam.types";
import type { ApplicationDetail } from "@/src/features/shared/applications/api/types";

interface NsqCentreApplicationDetailViewProps {
  application: ApplicationDetail | any;
  onBack: () => void;
  selectedUnitNumber?: string | null;
  onSelectUnit?: (unitNo: string | null) => void;
}

interface QualificationUnitItem {
  id: string;
  unitNo: string;
  title: string;
  status: "Not Started" | "In Progress" | "Completed" | "Approved";
}

const DEFAULT_UNITS: QualificationUnitItem[] = [
  { id: "unit-1", unitNo: "UNIT 1", title: "Lorem ipsum dolor dolor satui", status: "Not Started" },
  { id: "unit-2", unitNo: "UNIT 2", title: "Lorem ipsum dolor dolor satui", status: "Not Started" },
  { id: "unit-3", unitNo: "UNIT 3", title: "Lorem ipsum dolor dolor satui", status: "Not Started" },
  { id: "unit-4", unitNo: "UNIT 4", title: "Lorem ipsum dolor dolor satui", status: "Not Started" },
];

const IQAM_FORMS_LIST: { id: IqamToolId; title: string }[] = [
  { id: "CON/02/IQAM", title: "Internal Verification Sampling Plan" },
  { id: "CON/03/IQAM", title: "Internal Verification Sampling Record" },
  { id: "CON/04/IQAM", title: "Comprehensive Internal Verifier Report Form" },
  { id: "CON/05/IQAM", title: "IV Observation & Questioning Checklist" },
  { id: "CON/06/IQAM", title: "Final Portfolio / Award Report Form" },
];

export const NsqCentreApplicationDetailView: React.FC<
  NsqCentreApplicationDetailViewProps
> = ({ application, onBack, selectedUnitNumber, onSelectUnit }) => {
  const router = useRouter();

  // Unit navigation state (internal + controlled via props)
  const [internalUnitNumber, setInternalUnitNumber] = useState<string | null>(null);
  const activeUnitNumber =
    selectedUnitNumber !== undefined ? selectedUnitNumber : internalUnitNumber;

  const handleSelectUnit = (unitNo: string | null) => {
    setInternalUnitNumber(unitNo);
    onSelectUnit?.(unitNo);
  };

  // Accordion state for Unit Detail View
  const [expandedLos, setExpandedLos] = useState<Record<string, boolean>>({
    "lo-1": true,
  });
  const [expandedPcs, setExpandedPcs] = useState<Record<string, boolean>>({
    "pc-1-1": true,
  });

  const toggleLo = (id: string) => {
    setExpandedLos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePc = (id: string) => {
    setExpandedPcs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Local approval state for instant UI update
  const [localStatus, setLocalStatus] = useState<string | null>(null);

  // Decision Modal State
  const [decisionModal, setDecisionModal] = useState<{
    isOpen: boolean;
    decision: "approve" | "reject";
  }>({
    isOpen: false,
    decision: "approve",
  });

  // Assessor/Verifier Assignment Modal State
  const [assignModal, setAssignModal] = useState<{
    isOpen: boolean;
    roleType: NsqRoleType;
  }>({
    isOpen: false,
    roleType: "QAA",
  });

  // Assigned Staff State (default null matching mockup "No assessor assigned")
  const [assignedAssessor, setAssignedAssessor] = useState<{
    id: string;
    name: string;
    email?: string;
    qualification?: string;
    photoUrl?: string;
  } | null>(null);

  const [assignedIqa, setAssignedIqa] = useState<{
    id: string;
    name: string;
    email?: string;
    qualification?: string;
    photoUrl?: string;
  } | null>(null);

  // Modals for induction, receipt & IQAM form viewer
  const [isInductionModalOpen, setIsInductionModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedIqamTool, setSelectedIqamTool] = useState<IqamToolId | null>(null);
  const [paymentSuccessful, setPaymentSuccessful] = useState<boolean>(false);
  const [isIqaApproved, setIsIqaApproved] = useState<boolean>(false);
  const [isObservationDetailOpen, setIsObservationDetailOpen] = useState<boolean>(false);

  // Resolve ID helper
  const isRawId = (str?: string) => {
    if (!str) return false;
    return /^[0-9A-Z]{20,}$/.test(str) || /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(str);
  };

  const tradeId =
    application?.tradeId ||
    (typeof application?.trade === "object" ? application?.trade?.id : null) ||
    (typeof application?.trade === "string" && isRawId(application?.trade)
      ? application?.trade
      : "") ||
    "";

  const sectorId =
    application?.sectorId ||
    (typeof application?.sector === "object" ? application?.sector?.id : null) ||
    (typeof application?.sector === "string" && isRawId(application?.sector)
      ? application?.sector
      : "") ||
    "";

  // Dynamic reference data
  const { data: tradeDetail } = useGetTradeDetail(tradeId);
  const { data: remoteUnits = [] } = useGetUnitsByTrade(tradeId);
  const { data: remoteEvidenceTypes = [] } = useGetEvidenceTypesByTrade(tradeId);
  const { data: remoteCentres = [] } = useGetCentres();
  const { data: remoteSectors = [] } = useGetSectors();

  // Resolved Names
  const resolvedTradeName =
    tradeDetail?.name ||
    application?.trade?.name ||
    (typeof application?.trade === "string" && !isRawId(application?.trade)
      ? application?.trade
      : "") ||
    "Masonry";

  const resolvedSectorName =
    remoteSectors.find((s) => s.id === sectorId)?.name ||
    application?.sector?.name ||
    (typeof application?.sector === "string" && !isRawId(application?.sector)
      ? application?.sector
      : "") ||
    "Construction & Building";

  const resolvedCentreName =
    remoteCentres.find((c) => c.id === application?.centreId)?.name ||
    application?.centre?.name ||
    "Elimi Training & Assessment Centre";

  const candidateName =
    application?.candidate?.name ||
    (application?.candidate?.firstName
      ? `${application.candidate.firstName} ${
          application.candidate.lastName || ""
        }`.trim()
      : application?.user?.name || application?.candidateName || "Samson David");

  const candidateEmail =
    application?.candidate?.email || application?.user?.email || "samsondav@gmail.com";
  const candidatePhone =
    application?.candidate?.phone || application?.user?.phone || "+234 812 345 6789";
  const candidatePhoto =
    application?.candidate?.photo?.url ||
    application?.candidate?.photoUrl ||
    "/hero-img-1.jpg";

  const levelName =
    (tradeDetail as any)?.level ||
    (typeof application?.trade === "object" && (application.trade as any)?.level) ||
    "Level 1";

  const qualificationCode =
    (tradeDetail as any)?.code ||
    (typeof application?.trade === "object" && (application.trade as any)?.code) ||
    "CON/MS001/L1";

  const evidenceTypesText =
    remoteEvidenceTypes.length > 0
      ? (remoteEvidenceTypes as any[])
          .map((e: any) =>
            typeof e === "string" ? e : e?.code || e?.name || "",
          )
          .filter(Boolean)
          .slice(0, 5)
          .join("/")
      : "DO/QA/WT/WP/ASS";

  // Units list
  const unitsList: QualificationUnitItem[] =
    remoteUnits.length > 0
      ? (remoteUnits as any[]).map((u: any, i: number) => ({
          id: u.id,
          unitNo: u.referenceNumber || u.code || `UNIT ${i + 1}`,
          title: u.title || u.name || "Lorem ipsum dolor dolor satui",
          status: "Not Started",
        }))
      : DEFAULT_UNITS;

  // Compute status
  const currentStatus = localStatus || application?.status || "draft";
  const isApproved =
    currentStatus === "in_progress" ||
    currentStatus === "certified" ||
    currentStatus === "approved";
  const isRejected = currentStatus === "rejected";
  const isPending = !isApproved && !isRejected;

  const isPaymentPaid =
    paymentSuccessful ||
    application?.paymentStatus === "successful" ||
    application?.status === "in_progress" ||
    application?.status === "certified";

  // Receipt transaction object
  const receiptTransaction: PaymentTransaction = {
    id: application?.id || "tx-nsq-001",
    candidateName,
    assessmentType: `NSQ ${resolvedTradeName} (${levelName})`,
    amountPaid: "45,000",
    status: isPaymentPaid ? "Paid" : "Pending",
    date: application?.submittedAt
      ? new Date(application.submittedAt).toLocaleDateString("en-GB")
      : "07/22/2026",
    transactionId: `TX-NSQ-${(application?.id || "001").slice(0, 8).toUpperCase()}`,
    paymentMethod: "Bank Card (Online)",
    description: "NSQ Standard Assessment Fee Payment",
  };

  const handleDecisionSuccess = (decision: "approve" | "reject") => {
    setLocalStatus(decision === "approve" ? "approved" : "rejected");
    if (decision === "approve") {
      setPaymentSuccessful(true);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Column */}
        {activeUnitNumber ? (
          /* Unit Detail View (matching media_1789153528869.png) */
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* LO 1 Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
              <div
                onClick={() => toggleLo("lo-1")}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <h3 className="text-base font-bold text-gray-900">
                  LO 1: Maintain personal health and hygiene
                </h3>
                {expandedLos["lo-1"] ? (
                  <FiChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>

              {expandedLos["lo-1"] && (
                <div className="flex flex-col gap-3 pt-1">
                  {/* PC 1.1 Accordion */}
                  <div className="border border-gray-100 bg-[#F8F9FA] rounded-xl p-4 flex flex-col gap-3">
                    <div
                      onClick={() => togglePc("pc-1-1")}
                      className="flex items-center justify-between cursor-pointer select-none gap-2"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="px-2 py-0.5 bg-[#FDF2F4] text-[#E11D48] font-bold text-xs rounded-md shrink-0">
                          PC 1.1
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                          Wear Clean, Smart And Appropriate Personal Protective Equipment.
                        </span>
                      </div>
                      {expandedPcs["pc-1-1"] ? (
                        <FiChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                      ) : (
                        <FiChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                    </div>

                    {expandedPcs["pc-1-1"] && (
                      <div className="flex flex-col gap-3 pt-1">
                        {/* Evidence 1: Approved */}
                        <div className="rounded-xl p-3.5 flex items-center justify-between border border-[#A7F3D0] bg-[#ECFDF5] gap-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#065F46] min-w-0">
                            <FiFileText className="w-4 h-4 text-[#059669] shrink-0" />
                            <span className="truncate">Work Product(WP)</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#10753A] text-white flex items-center gap-1.5 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>Approved</span>
                          </span>
                        </div>

                        {/* Evidence 2: Rejected */}
                        <div className="rounded-xl p-3.5 flex flex-col gap-2.5 border border-[#FECDD3] bg-[#FFF1F2]">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#9F1239] min-w-0">
                              <FiFileText className="w-4 h-4 text-[#E11D48] shrink-0" />
                              <span className="truncate">Work Product(WP)</span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DC2626] text-white flex items-center gap-1.5 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              <span>Rejected</span>
                            </span>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-xs text-[#E11D48] font-normal leading-relaxed">
                            The uploaded photograph does not show compulsory eye shield/goggles while operating
                          </div>
                        </div>

                        {/* Evidence 3: In Review */}
                        <div className="rounded-xl p-3.5 flex items-center justify-between border border-[#FDE68A] bg-[#FFFBEB] gap-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#92400E] min-w-0">
                            <FiFileText className="w-4 h-4 text-[#D97706] shrink-0" />
                            <span className="truncate">Work Product(WP)</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D97706] text-white flex items-center gap-1.5 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>In Review</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PCs 1.2 to 1.9 (collapsed accordions) */}
                  {[
                    "PC 1.2",
                    "PC 1.3",
                    "PC 1.4",
                    "PC 1.5",
                    "PC 1.6",
                    "PC 1.7",
                    "PC 1.8",
                    "PC 1.9",
                  ].map((pcCode) => {
                    const pcKey = pcCode.toLowerCase().replace(" ", "-");
                    const isExpanded = Boolean(expandedPcs[pcKey]);
                    return (
                      <div
                        key={pcCode}
                        className="bg-[#F8F9FA] rounded-xl p-4 flex flex-col gap-2 transition-all border border-transparent hover:border-gray-200"
                      >
                        <div
                          onClick={() => togglePc(pcKey)}
                          className="flex items-center justify-between cursor-pointer select-none gap-2"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <span className="px-2 py-0.5 bg-[#FDF2F4] text-[#E11D48] font-bold text-xs rounded-md shrink-0">
                              {pcCode}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-700 font-normal truncate">
                              Wear Clean, Smart And Appropriate Personal Protective Equipment.
                            </span>
                          </div>
                          {isExpanded ? (
                            <FiChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                          ) : (
                            <FiChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                          )}
                        </div>
                        {isExpanded && (
                          <div className="pt-2 text-xs text-gray-400 italic">
                            No evidence submitted for this criterion yet.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* LO 2 Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
              <div
                onClick={() => toggleLo("lo-2")}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <h3 className="text-base font-bold text-gray-900">
                  LO 2: Maintain a hygienic, safe and hazard free workplace.
                </h3>
                {expandedLos["lo-2"] ? (
                  <FiChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
              {expandedLos["lo-2"] && (
                <div className="pt-2 text-xs text-gray-400 italic">
                  Criteria list will appear here.
                </div>
              )}
            </div>

            {/* LO 3 Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
              <div
                onClick={() => toggleLo("lo-3")}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <h3 className="text-base font-bold text-gray-900">
                  LO 3: Maintain a hygienic, safe and secure workplace
                </h3>
                {expandedLos["lo-3"] ? (
                  <FiChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
              {expandedLos["lo-3"] && (
                <div className="pt-2 text-xs text-gray-400 italic">
                  Criteria list will appear here.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 flex flex-col gap-5">
          {/* 1. Assessment Progress Stepper Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-gray-100 flex flex-col gap-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Assessment Progress
            </h3>

            <div className="relative flex items-center justify-between w-full px-4 sm:px-10">
              {/* Connector line background */}
              <div className="absolute left-8 right-8 top-3.5 h-[1.5px] bg-gray-200 -z-0" />

              {/* Progress active connector line: Induction -> QAA */}
              {isPaymentPaid && (
                <div className="absolute left-8 w-[23%] top-3.5 h-[1.5px] -z-0 bg-[#10b981]" />
              )}

              {/* Progress active connector line: QAA -> IQA */}
              {assignedIqa && (
                <div
                  className={`absolute left-[29%] w-[22%] top-3.5 h-[1.5px] -z-0 ${
                    isIqaApproved ? "bg-[#10b981]" : "bg-[#fbab2a]"
                  }`}
                />
              )}

              {/* Step 1: Induction Form */}
              <div className="flex flex-col items-center gap-2.5 z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isPaymentPaid
                      ? "bg-[#10b981] shadow-xs"
                      : "border border-gray-400 bg-white"
                  }`}
                >
                  {isPaymentPaid && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  )}
                </div>
                <span
                  className={`text-xs text-center font-medium ${
                    isPaymentPaid
                      ? "text-[#10b981] font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  Induction Form
                </span>
              </div>

              {/* Step 2: QAA */}
              <div className="flex flex-col items-center gap-2.5 z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isPaymentPaid
                      ? "bg-[#10b981] shadow-xs"
                      : "border border-gray-400 bg-white"
                  }`}
                >
                  {isPaymentPaid && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  )}
                </div>
                <span
                  className={`text-xs text-center font-medium ${
                    isPaymentPaid
                      ? "text-[#10b981] font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  QAA
                </span>
              </div>

              {/* Step 3: IQA */}
              <div
                onClick={() => {
                  if (assignedIqa) setIsIqaApproved((prev) => !prev);
                }}
                className={`flex flex-col items-center gap-2.5 z-10 ${
                  assignedIqa ? "cursor-pointer" : ""
                }`}
                title={assignedIqa ? "Click to toggle IQA approval status" : undefined}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    assignedIqa
                      ? isIqaApproved
                        ? "bg-[#10b981] shadow-xs"
                        : "bg-[#fbab2a] shadow-xs"
                      : "border border-gray-400 bg-white"
                  }`}
                >
                  {assignedIqa && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  )}
                </div>
                <span
                  className={`text-xs text-center font-medium ${
                    assignedIqa
                      ? isIqaApproved
                        ? "text-[#10b981] font-semibold"
                        : "text-[#fbab2a] font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  IQA
                </span>
              </div>

              {/* Step 4: Awarding Body */}
              <div className="flex flex-col items-center gap-2.5 z-10">
                <div className="w-7 h-7 rounded-full border border-gray-400 bg-white flex items-center justify-center" />
                <span className="text-xs font-medium text-gray-400 text-center">
                  Awarding Body
                </span>
              </div>

              {/* Step 5: Certification */}
              <div className="flex flex-col items-center gap-2.5 z-10">
                <div className="w-7 h-7 rounded-full border border-gray-400 bg-white flex items-center justify-center" />
                <span className="text-xs font-medium text-gray-400 text-center">
                  Certification
                </span>
              </div>
            </div>
          </div>

          {/* 2. Application Status Card */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <h4 className="text-base font-bold text-gray-900">
                  Application Status
                </h4>
                {isApproved ? (
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#059669]">
                    Approved
                  </span>
                ) : isRejected ? (
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                    Rejected
                  </span>
                ) : (
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706]">
                    Pending
                  </span>
                )}
              </div>

              {/* Reject / Approve actions in Pending state */}
              {isPending && (
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() =>
                      setDecisionModal({ isOpen: true, decision: "reject" })
                    }
                    className="text-[#DC2626] font-semibold text-sm hover:underline cursor-pointer transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDecisionModal({ isOpen: true, decision: "approve" })
                    }
                    className="text-[#16A34A] font-semibold text-sm hover:underline cursor-pointer transition-colors"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-gray-500 font-normal">
              {resolvedCentreName} | {resolvedSectorName} | {resolvedTradeName}
            </p>
          </div>

          {/* 3. Payment Card */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <span className="text-base sm:text-lg font-bold text-gray-900">
                  ₦45,000
                </span>
                {isPaymentPaid ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#059669]">
                    Successful
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                    Not Started
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-normal">
                NSQ Standard Assessment Fee
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsReceiptModalOpen(true)}
              className="text-sm font-semibold text-[#fbab2a] hover:text-[#e89b1f] hover:underline cursor-pointer select-none shrink-0"
            >
              Receipt
            </button>
          </div>

          {/* 4. Candidate Induction Form Card */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex items-center justify-between gap-4">
            <span className="text-sm sm:text-base font-bold text-gray-900">
              Candidate Induction Form
            </span>

            <button
              type="button"
              onClick={() => setIsInductionModalOpen(true)}
              className="text-sm font-semibold text-[#fbab2a] hover:text-[#e89b1f] hover:underline cursor-pointer select-none shrink-0"
            >
              View
            </button>
          </div>

          {/* Progressed Content: NOS Cards, Assessors, Units, IQAM Forms (Shown when payment is successful) */}
          {isPaymentPaid && (
            <>
              {/* 5. NOS Qualification & Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: NOS Qualification Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between gap-5">
                  <div className="flex flex-col gap-2">
                    <span className="self-start px-2.5 py-0.5 rounded-md bg-[#FCE7F3] text-[#BE185D] font-bold text-[10px] tracking-wide">
                      Mandatory
                    </span>
                    <h4 className="text-base font-bold text-gray-900">
                      {resolvedTradeName} National Occupational Standard
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                        QUALIFICATION CODE
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 truncate mt-0.5">
                        {qualificationCode}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                        EVIDENCE TYPE
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 truncate mt-0.5">
                        {evidenceTypesText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Sector, Score & Level Metrics */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs grid grid-cols-2 gap-4 items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      SECTOR
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900 truncate mt-0.5">
                      {resolvedSectorName}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      MANDATORY UNIT SCORE
                    </span>
                    <span className="text-base sm:text-lg font-bold text-gray-900 mt-0.5">
                      0
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      LEVEL
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5">
                      {levelName}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      OPTIONAL UNIT SCORE
                    </span>
                    <span className="text-base sm:text-lg font-bold text-gray-900 mt-0.5">
                      0
                    </span>
                  </div>
                </div>
              </div>

              {/* 6. Assessors Section */}
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">
                    Assessors
                  </h3>
                  {(assignedAssessor || assignedIqa) && (
                    <button
                      type="button"
                      onClick={() =>
                        setAssignModal({
                          isOpen: true,
                          roleType: assignedIqa ? "QAA" : "IQA",
                        })
                      }
                      className="text-xs font-semibold text-[#fbab2a] hover:text-[#e89b1f] hover:underline cursor-pointer"
                    >
                      Reassign Assessors
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left: QAA Assessor Subcard */}
                  {assignedAssessor ? (
                    <div className="bg-[#F8F9FA] rounded-xl p-5 border border-gray-100 flex items-center gap-3.5 min-h-[100px]">
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 relative bg-white border border-gray-200">
                        <Image
                          src={assignedAssessor.photoUrl || "/hero-img-2.jpg"}
                          alt={assignedAssessor.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-gray-900 truncate">
                          {assignedAssessor.name}
                        </span>
                        <span className="text-xs text-gray-500 truncate mt-0.5">
                          QAA Assessor
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#F8F9FA] rounded-xl p-5 border border-gray-100 flex flex-col items-center text-center justify-center gap-1.5 min-h-[100px]">
                      <span className="font-bold text-sm text-gray-800">
                        No assessor assigned
                      </span>
                      <span className="text-xs text-gray-400">
                        Assign an assessor to begin the verification process.
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setAssignModal({ isOpen: true, roleType: "QAA" })
                        }
                        className="text-[#fbab2a] hover:text-[#e89b1f] text-xs font-bold flex items-center gap-1.5 mt-2 cursor-pointer"
                      >
                        <FiUserPlus className="w-3.5 h-3.5" />
                        <span>Assign QAA assessor</span>
                      </button>
                    </div>
                  )}

                  {/* Right: IQA Verifier Subcard */}
                  {assignedIqa ? (
                    <div className="bg-[#F8F9FA] rounded-xl p-5 border border-gray-100 flex items-center gap-3.5 min-h-[100px]">
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 relative bg-white border border-gray-200">
                        <Image
                          src={assignedIqa.photoUrl || "/hero-img-1.jpg"}
                          alt={assignedIqa.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-gray-900 truncate">
                          {assignedIqa.name}
                        </span>
                        <span className="text-xs text-gray-500 truncate mt-0.5">
                          IQAM Verifier
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#F8F9FA] rounded-xl p-5 border border-gray-100 flex flex-col items-center text-center justify-center gap-1.5 min-h-[100px]">
                      <span className="font-bold text-sm text-gray-800">
                        No assessor assigned
                      </span>
                      <span className="text-xs text-gray-400">
                        Assign an assessor to begin the verification process.
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setAssignModal({ isOpen: true, roleType: "IQA" })
                        }
                        className="text-[#fbab2a] hover:text-[#e89b1f] text-xs font-bold flex items-center gap-1.5 mt-2 cursor-pointer"
                      >
                        <FiUserPlus className="w-3.5 h-3.5" />
                        <span>Assign IQA assessor</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 7. Candidate Induction Form Action Card */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-100 flex items-center justify-between gap-4">
                <span className="text-sm sm:text-base font-bold text-gray-900">
                  Candidate Induction Form
                </span>

                <button
                  type="button"
                  onClick={() => setIsInductionModalOpen(true)}
                  className="px-6 py-2 border border-gray-200 rounded-xl text-xs font-bold text-[#fbab2a] hover:bg-amber-50/60 cursor-pointer transition-all"
                >
                  View
                </button>
              </div>

              {/* 8. Qualification Units Card */}
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
                <h3 className="text-base font-bold text-gray-900">
                  {resolvedTradeName} {levelName}
                </h3>

                <div className="flex flex-col gap-2.5">
                  {unitsList.map((unit, index) => {
                    const badgeText = isIqaApproved
                      ? "10/10 Approved"
                      : "10/10 Pending";
                    const badgeClass = isIqaApproved
                      ? "bg-[#10753A] text-white"
                      : "bg-[#FEF3C7] text-[#D97706]";
                    return (
                      <div
                        key={unit.id}
                        onClick={() => handleSelectUnit(unit.unitNo)}
                        className="p-4 rounded-xl bg-[#F8F9FA] hover:bg-gray-100/80 flex items-center justify-between gap-4 transition-all cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-xs sm:text-sm text-gray-900 uppercase shrink-0">
                            {unit.unitNo}:
                          </span>
                          <span className="text-xs sm:text-sm text-gray-600 font-normal truncate">
                            {unit.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badgeClass}`}
                          >
                            {badgeText}
                          </span>
                          <FiChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 9. IQAM Forms Card */}
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
                <h3 className="text-base font-bold text-gray-900">
                  IQAM Forms
                </h3>

                <div className="flex flex-col gap-2.5">
                  {IQAM_FORMS_LIST.map((form) => (
                    <div
                      key={form.id}
                      className="p-4 rounded-xl bg-[#F8F9FA] flex items-center justify-between gap-4 transition-all"
                    >
                      <span className="text-xs sm:text-sm font-semibold text-gray-800">
                        {form.title}
                      </span>

                      <button
                        type="button"
                        onClick={() => setSelectedIqamTool(form.id)}
                        className="text-xs sm:text-sm font-bold text-[#fbab2a] hover:text-[#e89b1f] hover:underline cursor-pointer shrink-0"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

        {/* Right Sidebar Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Calendar Widget (Dark Theme matching mockup) */}
          <CalendarWidget />

          {/* Observation Request Card */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-gray-900">
              Observation Request
            </h4>

            <div className="relative bg-[#F8F9FA] rounded-xl p-4 border border-gray-100 flex items-center justify-between gap-3 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#10b981]" />

              <div className="flex flex-col gap-1.5 pl-1.5 min-w-0">
                <span className="self-start px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#059669]">
                  Confirmed
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                  Physically Observation
                </span>
                <div className="flex items-center gap-4 text-[11px] text-gray-500 pt-0.5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">
                      TIME
                    </span>
                    <span className="font-semibold text-gray-700">12:00PM</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">
                      DATE
                    </span>
                    <span className="font-semibold text-gray-700">22/03/2026</span>
                  </div>
                </div>
              </div>

              <FiChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            </div>

            <button
              type="button"
              onClick={() => setIsObservationDetailOpen(true)}
              className="w-full py-2.5 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-all shadow-xs"
            >
              View
            </button>
          </div>

          {/* Candidate Information Card */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-gray-900">
              Candidate Information
            </h4>

            <div className="flex items-center gap-3.5 pt-1">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 relative bg-gray-100 border border-gray-100">
                <Image
                  src={candidatePhoto}
                  alt={candidateName}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-gray-900 truncate">
                  {candidateName}
                </span>
                <span className="text-xs text-gray-400 truncate mt-0.5">
                  {candidateEmail}
                </span>
                <span className="text-xs text-gray-400 truncate mt-0.5">
                  {candidatePhone}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Confirmation Modal (Approve / Reject) */}
      <ConfirmNsqDecisionModal
        isOpen={decisionModal.isOpen}
        onClose={() => setDecisionModal({ ...decisionModal, isOpen: false })}
        applicationId={application?.id || "app-nsq"}
        candidateName={candidateName}
        tradeName={resolvedTradeName}
        decision={decisionModal.decision}
        onSuccess={handleDecisionSuccess}
      />

      {/* Assign Assessor / IQA Modal */}
      <AssignNsqAssessorModal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal({ ...assignModal, isOpen: false })}
        applicationId={application?.id || "app-nsq"}
        roleType={assignModal.roleType}
        tradeName={resolvedTradeName}
        unitIds={unitsList.map((u) => u.id)}
        currentAssignedId={
          assignModal.roleType === "QAA"
            ? assignedAssessor?.id
            : assignedIqa?.id
        }
        onAssigned={(assigned) => {
          if (assignModal.roleType === "QAA") {
            setAssignedAssessor(assigned);
          } else {
            setAssignedIqa(assigned);
          }
        }}
      />

      {/* Induction Form Modal */}
      {isInductionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-text">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative border border-gray-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsInductionModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="flex flex-col">
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
                    {candidateName}
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
                    {application?.submittedAt
                      ? new Date(application.submittedAt).toLocaleDateString("en-GB")
                      : "22/03/2026"}
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

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsInductionModalOpen(false)}
                className="px-5 py-2 bg-[#fbab2a] hover:bg-[#e89b1f] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        isOpen={isReceiptModalOpen}
        transaction={receiptTransaction}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      {/* IQAM Tool Viewer Modal */}
      {selectedIqamTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs select-text">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Internal Quality Assurance
                </span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  {IQAM_FORMS_LIST.find((f) => f.id === selectedIqamTool)?.title || selectedIqamTool}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIqamTool(null)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <IqamToolsDashboard
                initialToolId={selectedIqamTool}
                initialCandidateName={candidateName}
                onBack={() => setSelectedIqamTool(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Observation Request Detail Modal */}
      {isObservationDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-text">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-gray-100 flex flex-col gap-5">
            <button
              type="button"
              onClick={() => setIsObservationDetailOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-[#FDF2F4] text-[#E11D48] hover:bg-rose-100 transition-all cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>

            <div className="flex flex-col gap-1">
              <span className="self-start px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#059669]">
                Confirmed
              </span>
              <h3 className="text-lg font-bold text-gray-900 mt-1">
                Physically Observation
              </h3>
              <p className="text-xs text-gray-500">
                Scheduled observation session details
              </p>
            </div>

            <div className="bg-[#F8F9FA] rounded-2xl p-4 flex flex-col gap-3 text-xs border border-gray-100">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-400 font-medium">Candidate</span>
                <span className="font-bold text-gray-900">{candidateName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-400 font-medium">Assessor</span>
                <span className="font-bold text-gray-900">
                  {assignedAssessor?.name || "Ngozi Eze"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-400 font-medium">Date</span>
                <span className="font-bold text-gray-900">22/03/2026</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-400 font-medium">Time</span>
                <span className="font-bold text-gray-900">12:00 PM</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400 font-medium">Venue</span>
                <span className="font-bold text-gray-900">{resolvedCentreName}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsObservationDetailOpen(false)}
              className="w-full py-3 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
