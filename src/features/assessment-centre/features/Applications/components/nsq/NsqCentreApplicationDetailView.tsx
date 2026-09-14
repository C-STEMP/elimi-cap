"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { Avatar } from "@/src/components/ui/avatar";
import { ConfirmNsqDecisionModal } from "./ConfirmNsqDecisionModal";
import { AssignNsqAssessorModal, type NsqRoleType } from "./AssignNsqAssessorModal";
import {
  useGetTradeDetail,
  useGetUnitsByTrade,
  useGetEvidenceTypesByTrade,
  useGetCentres,
  useGetSectors,
} from "@/src/features/shared/reference/hooks";
import {
  useGetInductionForm,
  useGetDirectObservations,
  useGetApplicationStages,
  useGetPaymentQuote,
  useGetApplicationReceipt,
} from "@/src/features/shared/applications/hooks";
import { formatCurrency } from "@/src/utils/currency";
import { IqamToolsDashboard } from "@/src/features/assessor/features/iqam/IqamToolsDashboard";
import type { IqamToolId } from "@/src/features/assessor/features/iqam/types/iqam.types";
import type { ApplicationDetail } from "@/src/features/shared/applications/api/types";

const NSQ_PROGRESS_STEPS = [
  { key: "induction", label: "Induction Form" },
  { key: "regular_assessment", label: "QAA" },
  { key: "internal_verification", label: "IQA" },
  { key: "external_verification", label: "Awarding Body" },
  { key: "certification", label: "Certification" },
] as const;

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
  criteriaApproved?: number;
  criteriaTotal?: number;
}

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

  // NSQ Backend Queries
  const { data: inductionForm } = useGetInductionForm(application?.id);
  const { data: directObservationsData } = useGetDirectObservations(
    application?.id,
  );
  const liveObservation = directObservationsData?.items?.[0];

  // Unit navigation state (internal + controlled via props)
  const [internalUnitNumber, setInternalUnitNumber] = useState<string | null>(
    null,
  );
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

  // Assigned Staff State — no assessor until either assigned this session or
  // hydrated from real backend data below.
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

  // Hydrate the assigned Internal Verifier from the real ApplicationDetail
  // field (there is no equivalent read for the QAA/unit assessor yet, so
  // that side stays session-local until it's assigned from this view).
  useEffect(() => {
    if (application?.internalVerifier) {
      setAssignedIqa({
        id: application.internalVerifier.assessorId,
        name: application.internalVerifier.name,
        qualification: "IQAM Verifier",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application?.internalVerifier?.assessorId]);

  // Modals for induction, receipt & IQAM form viewer
  const [isInductionModalOpen, setIsInductionModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedIqamTool, setSelectedIqamTool] = useState<IqamToolId | null>(null);
  const [isObservationDetailOpen, setIsObservationDetailOpen] = useState<boolean>(false);

  // Real workflow stages — GET /applications/{id}/stages.
  const { data: stagesData } = useGetApplicationStages(application?.id || "");
  const applicationFormStage = stagesData?.find((s) => s.stageKey === "application_form");
  const paymentStage = stagesData?.find((s) => s.stageKey === "payment");

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
  const { data: remoteUnits = [], isLoading: isLoadingUnits } = useGetUnitsByTrade(tradeId);
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
    "—";

  const candidateName =
    application?.candidate?.name ||
    (application?.candidate?.firstName
      ? `${application.candidate.firstName} ${
          application.candidate.lastName || ""
        }`.trim()
      : application?.user?.name || application?.candidateName || "Candidate");

  const candidateEmail =
    (application as any)?.personalInformation?.contactInformation?.emailAddress ||
    application?.candidate?.email ||
    application?.user?.email ||
    "—";
  const candidatePhoneNumber = (application as any)?.personalInformation?.contactInformation
    ?.phoneNumber;
  const candidatePhone = candidatePhoneNumber?.number
    ? `${candidatePhoneNumber.countryCode || ""} ${candidatePhoneNumber.number}`.trim()
    : application?.candidate?.phone || application?.user?.phone || "—";
  const candidatePhoto =
    application?.candidate?.photo?.url || application?.candidate?.photoUrl || null;

  const levelName =
    (tradeDetail as any)?.level ||
    (typeof application?.trade === "object" && (application.trade as any)?.level) ||
    "Level 1";

  const qualificationCode =
    (tradeDetail as any)?.code ||
    (typeof application?.trade === "object" && (application.trade as any)?.code) ||
    "—";

  const evidenceTypesText =
    remoteEvidenceTypes.length > 0
      ? (remoteEvidenceTypes as any[])
          .map((e: any) =>
            typeof e === "string" ? e : e?.code || e?.name || "",
          )
          .filter(Boolean)
          .slice(0, 5)
          .join("/")
      : "—";

  // Units list — prefer the application-specific units (real per-unit
  // evidence progress from GET /applications/{id} `nsq.units`) over the
  // generic trade catalogue, which has no progress data.
  const unitsList: QualificationUnitItem[] = application?.nsq?.units?.length
    ? application.nsq.units.map((u: any) => ({
        id: u.id,
        unitNo: u.referenceNumber,
        title: u.title,
        status:
          u.status === "approved"
            ? "Approved"
            : u.status === "in_progress"
              ? "In Progress"
              : "Not Started",
        criteriaApproved: u.criteriaApproved,
        criteriaTotal: u.criteriaTotal,
      }))
    : remoteUnits.length > 0
      ? (remoteUnits as any[]).map((u: any, i: number) => ({
          id: u.id,
          unitNo: u.referenceNumber || u.code || `UNIT ${i + 1}`,
          title: u.title || u.name || `Unit ${i + 1}`,
          status: "Not Started" as const,
        }))
      : [];

  // Compute status — application_form stage is the source of truth;
  // localStatus is only an instant-UI override until the stages query refetches.
  // Note: application.status === "in_progress" just means "submitted, somewhere
  // in the pipeline" — it stays in_progress through payment/induction/assessment
  // long after application_form review, so it must NOT be treated as "approved".
  const currentStatus = localStatus || application?.status || "draft";
  const isDraft = currentStatus === "draft";
  const isApproved =
    applicationFormStage?.status === "successful" ||
    currentStatus === "certified" ||
    currentStatus === "approved";
  const isRejected = applicationFormStage?.status === "rejected" || currentStatus === "rejected";
  // A draft has never been submitted, so it has no backend workflow state yet
  // — POST /applications/{id}/review would fail with "no workflow state".
  // Only a submitted (non-draft) application can be pending centre review.
  const isPending = !isApproved && !isRejected && !isDraft;

  // Payment — GET /applications/{id}/stages (payment row), readable by centre
  // staff the same as the receipt/payment-quote endpoints.
  const isPaymentPaid = paymentStage?.status === "successful";
  const { data: paymentQuote } = useGetPaymentQuote(application?.id || "", {
    enabled: Boolean(application?.id && !isPaymentPaid),
  });
  const { data: receiptData } = useGetApplicationReceipt(application?.id || "", {
    enabled: Boolean(application?.id && isPaymentPaid),
  });

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

  // Receipt transaction object — GET /applications/{id}/receipt.
  const receiptTransaction: PaymentTransaction = {
    id: receiptData?.paymentId || application?.id || "tx-nsq-001",
    candidateName,
    assessmentType: `NSQ ${resolvedTradeName} (${levelName})`,
    amountPaid: paymentAmountText,
    status: isPaymentPaid ? "Paid" : "Pending",
    date: receiptData?.paidAt
      ? new Date(receiptData.paidAt).toLocaleDateString("en-GB")
      : application?.submittedAt
        ? new Date(application.submittedAt).toLocaleDateString("en-GB")
        : "—",
    transactionId:
      receiptData?.paymentId ||
      `TX-NSQ-${(application?.id || "001").replace(/-/g, "").slice(0, 8).toUpperCase()}`,
    paymentMethod: receiptData?.provider || "Paystack",
    description: "NSQ Standard Assessment Fee Payment",
  };

  const handleDecisionSuccess = (decision: "approve" | "reject") => {
    setLocalStatus(decision === "approve" ? "approved" : "rejected");
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

            {/* Steps Progress — driven by GET /applications/{id}/stages.
                Application Form and Payment have their own cards below, so
                the timeline covers the remaining five workflow stages. */}
            <div className="relative flex items-center justify-between w-full px-4 sm:px-10">
              {/* Connector line background */}
              <div className="absolute left-8 right-8 top-3.5 h-[1.5px] bg-gray-200 z-0" />
              <div
                className="absolute left-8 top-3.5 h-[1.5px] z-0 bg-[#10b981] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />

              {progressSteps.map((step) => {
                const isComplete = step.status === "successful";
                const isRejectedStep = step.status === "rejected";
                const isActive =
                  !isComplete && !isRejectedStep && step.status !== "not_started";

                return (
                  <div key={step.key} className="flex flex-col items-center gap-2.5 z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isComplete
                          ? "bg-[#10b981] shadow-xs"
                          : isRejectedStep
                            ? "bg-red-500 shadow-xs"
                            : isActive
                              ? "bg-[#fbab2a] shadow-xs"
                              : "border border-gray-400 bg-white"
                      }`}
                    >
                      {(isComplete || isRejectedStep || isActive) && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span
                      className={`text-xs text-center font-medium ${
                        isComplete
                          ? "text-[#10b981] font-semibold"
                          : isRejectedStep
                            ? "text-red-500 font-semibold"
                            : isActive
                              ? "text-[#fbab2a] font-semibold"
                              : "text-gray-400"
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
                ) : isDraft ? (
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                    Draft — Not Submitted
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
                  {paymentAmountText}
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

            {isPaymentPaid && (
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(true)}
                className="text-sm font-semibold text-[#fbab2a] hover:text-[#e89b1f] hover:underline cursor-pointer select-none shrink-0"
              >
                Receipt
              </button>
            )}
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
                      <Avatar
                        src={assignedAssessor.photoUrl}
                        name={assignedAssessor.name}
                        className="w-12 h-12 shrink-0 border border-gray-200"
                        alt={assignedAssessor.name}
                      />
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
                      <Avatar
                        src={assignedIqa.photoUrl}
                        name={assignedIqa.name}
                        className="w-12 h-12 shrink-0 border border-gray-200"
                        alt={assignedIqa.name}
                      />
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
                  {isLoadingUnits && !application?.nsq?.units?.length ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-[#F8F9FA] flex items-center justify-between gap-4 animate-pulse"
                      >
                        <div className="h-3.5 bg-gray-200 rounded w-2/3" />
                        <div className="h-5 bg-gray-200 rounded-full w-20 shrink-0" />
                      </div>
                    ))
                  ) : (
                    <>
                      {unitsList.length === 0 && (
                        <p className="text-xs text-gray-400 font-medium py-2">
                          Units will appear here once the candidate&apos;s qualification standard is loaded.
                        </p>
                      )}
                      {unitsList.map((unit, index) => {
                    const hasCounts =
                      typeof unit.criteriaApproved === "number" &&
                      typeof unit.criteriaTotal === "number";
                    const badgeText = hasCounts
                      ? `${unit.criteriaApproved}/${unit.criteriaTotal} Approved`
                      : unit.status === "Approved"
                        ? "Approved"
                        : unit.status === "In Progress"
                          ? "In Progress"
                          : "Not Started";
                    const badgeClass =
                      unit.status === "Approved"
                        ? "bg-[#10753A] text-white"
                        : unit.status === "In Progress"
                          ? "bg-[#FEF3C7] text-[#D97706]"
                          : "bg-gray-200/80 text-gray-600";
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
                    </>
                  )}
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

          {/* Observation Request Card — GET /applications/{id}/direct-observation */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-gray-900">
              Observation Request
            </h4>

            {liveObservation ? (
              <>
                <div className="relative bg-[#F8F9FA] rounded-xl p-4 border border-gray-100 flex items-center justify-between gap-3 overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      liveObservation.status === "accepted" ||
                      liveObservation.status === "completed"
                        ? "bg-[#10b981]"
                        : liveObservation.status === "rejected" ||
                            liveObservation.status === "cancelled"
                          ? "bg-red-500"
                          : "bg-[#fbab2a]"
                    }`}
                  />

                  <div className="flex flex-col gap-1.5 pl-1.5 min-w-0">
                    <span
                      className={`self-start px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        liveObservation.status === "accepted" ||
                        liveObservation.status === "completed"
                          ? "bg-[#D1FAE5] text-[#059669]"
                          : liveObservation.status === "rejected" ||
                              liveObservation.status === "cancelled"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {liveObservation.status === "accepted"
                        ? "Confirmed"
                        : liveObservation.status === "completed"
                          ? "Completed"
                          : liveObservation.status === "rejected"
                            ? "Rejected"
                            : liveObservation.status === "cancelled"
                              ? "Cancelled"
                              : "Pending Review"}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      Physically Observation
                    </span>
                    <div className="flex items-center gap-4 text-[11px] text-gray-500 pt-0.5">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          TIME
                        </span>
                        <span className="font-semibold text-gray-700">
                          {liveObservation.scheduledAt
                            ?.split("T")[1]
                            ?.slice(0, 5) || "—"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          DATE
                        </span>
                        <span className="font-semibold text-gray-700">
                          {liveObservation.scheduledAt?.split("T")[0] || "—"}
                        </span>
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
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                <span className="text-xs font-bold text-gray-800">No request</span>
                <p className="text-[11px] text-gray-400 font-medium max-w-[200px]">
                  The candidate&apos;s scheduled observation will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Candidate Information Card */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-gray-900">
              Candidate Information
            </h4>

            <div className="flex items-center gap-3.5 pt-1">
              <Avatar
                src={candidatePhoto}
                name={candidateName}
                className="w-12 h-12 shrink-0 border border-gray-100"
                alt={candidateName}
              />

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
                    {inductionForm?.data?.firstName
                      ? `${inductionForm.data.firstName} ${inductionForm.data.lastName || ""}`.trim()
                      : candidateName}
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
              <span
                className={`self-start px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  liveObservation?.status === "accepted" || liveObservation?.status === "completed"
                    ? "bg-[#D1FAE5] text-[#059669]"
                    : liveObservation?.status === "rejected" ||
                        liveObservation?.status === "cancelled"
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-700"
                }`}
              >
                {liveObservation?.status === "accepted"
                  ? "Confirmed"
                  : liveObservation?.status === "completed"
                    ? "Completed"
                    : liveObservation?.status === "rejected"
                      ? "Rejected"
                      : liveObservation?.status === "cancelled"
                        ? "Cancelled"
                        : "Pending Review"}
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
                  {assignedAssessor?.name || "Not yet assigned"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-400 font-medium">Date</span>
                <span className="font-bold text-gray-900">
                  {liveObservation?.scheduledAt?.split("T")[0] || "—"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-400 font-medium">Time</span>
                <span className="font-bold text-gray-900">
                  {liveObservation?.scheduledAt?.split("T")[1]?.slice(0, 5) || "—"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400 font-medium">Venue</span>
                <span className="font-bold text-gray-900">
                  {liveObservation?.address || "—"}
                </span>
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
