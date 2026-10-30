"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetApplicationPortfolio,
  useGetApplicationReceipt,
  useGetInterviewForms,
  useGetPaymentQuote,
} from "@/src/features/shared/applications/hooks";
import type {
  ApplicationDetail,
  InterviewForm,
} from "@/src/features/shared/applications/api/types";
import { formatCurrency } from "@/src/utils/currency";
import { TransactionReceiptModal } from "@/features/assessment-centre/features/Payment/components/TransactionReceiptModal";
import type { EvidenceRecord } from "../../utils/evidenceConstants";
import { PortfolioSection } from "./PortfolioSection";
import {
  PortfolioActionButton,
  PortfolioDocCard,
  type PortfolioBadgeTone,
} from "./PortfolioDocCard";
import { NosStandardCard } from "./NosStandardCard";
import { ProfileInformationModal } from "./ProfileInformationModal";

export type PortfolioViewer = "candidate" | "centre" | "assessor";

type InterviewFormType = InterviewForm["formType"];

// Route ids understood by /applications/[id]/assessment-forms/[formType].
const FORM_ROUTE_IDS: Record<InterviewFormType, string> = {
  skill_demonstration: "skills_demo",
  assessment_grid: "assessment_mapping",
  records: "interview_record",
  practical_observation: "observation_checklist",
};

interface PortfolioVaultProps {
  viewer: PortfolioViewer;
  applicationId: string;
  application?: ApplicationDetail | null;
  /** The upload recognised as the candidate's CV (see isCvEvidence). */
  cvEvidence?: EvidenceRecord | null;
  isLeadPanelist?: boolean;
  onPreview: (item: EvidenceRecord) => void;
  onViewApplicationForm?: () => void;
  onUploadCv?: () => void;
  onMakePayment?: () => void;
  onViewReceipt?: () => void;
  isPaymentPaid?: boolean;
  isPaymentUnlocked?: boolean;
  paymentAmountText?: string;
  /** Role-specific cards — each view keeps its own fill/upload behaviour. */
  selfAssessmentCard: React.ReactNode;
  thirdPartyReportCard: React.ReactNode;
  evidenceList: React.ReactNode;
  /** Extra section 4 cards only some viewers can load (e.g. IQAM CON/05). */
  extraReportCards?: React.ReactNode;
  /** Section 5 is rendered only when this is provided. */
  verificationReportCard?: React.ReactNode;
  /**
   * When true, each numbered section is rendered inside a white card with an
   * accordion header where only one section can be open at a time.
   */
  accordion?: boolean;
  /** Section number (1–5) open by default when `accordion` is enabled. */
  defaultOpenSection?: number;
  /** When true, section 5 (Verification Report) is hidden (e.g. candidate detail view with stages below number 4). */
  hideVerificationSection?: boolean;
}

function formBadge(record?: { status?: string }): { label: string; tone: PortfolioBadgeTone } {
  if (!record || record.status === "not_started") {
    return { label: "Not Started", tone: "neutral" };
  }
  if (record.status === "completed") return { label: "Completed", tone: "success" };
  return { label: "In Progress", tone: "warning" };
}

/**
 * The candidate portfolio, arranged into the five numbered sections from the
 * design: Induction, Candidate Profile, Standards, Reports/Evidences and
 * Verification Report.
 */
export const PortfolioVault: React.FC<PortfolioVaultProps> = ({
  viewer,
  applicationId,
  application,
  cvEvidence,
  isLeadPanelist,
  onPreview,
  onViewApplicationForm,
  onUploadCv,
  onMakePayment,
  onViewReceipt,
  isPaymentPaid,
  isPaymentUnlocked,
  paymentAmountText,
  selfAssessmentCard,
  thirdPartyReportCard,
  evidenceList,
  extraReportCards,
  verificationReportCard,
  accordion = false,
  defaultOpenSection = 4,
  hideVerificationSection = false,
}) => {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [openSection, setOpenSection] = useState<number | null>(
    defaultOpenSection,
  );

  const toggleSection = (sectionNumber: number) => {
    setOpenSection((prev) => (prev === sectionNumber ? null : sectionNumber));
  };

  // Assessors don't see the payment receipt.
  const showReceipt = viewer !== "assessor";
  const { data: portfolio } = useGetApplicationPortfolio(applicationId);
  const { data: receipt } = useGetApplicationReceipt(applicationId, { enabled: showReceipt });
  const { data: paymentQuote } = useGetPaymentQuote(applicationId, {
    enabled: Boolean(applicationId && showReceipt),
  });
  const isInterviewStage = Boolean(
    application?.currentStageKey === "interview" ||
      (application as any)?.stages?.some(
        (s: any) => s.key === "interview" && s.status !== "not_started",
      ),
  );
  const { data: interviewForms = [] } = useGetInterviewForms(applicationId, {
    enabled: Boolean(applicationId && isInterviewStage),
  });

  const portfolioCv = portfolio?.candidateProfile?.cv || application?.cv;
  const resolvedCv: EvidenceRecord | null =
    cvEvidence ||
    (portfolioCv?.assetId
      ? {
          id: portfolioCv.assetId,
          name: "Candidate CV / Resume",
          size: "Uploaded document",
          status: "Uploaded",
          statusBg: "bg-[#1E7F4C]/10",
          statusText: "text-[#1E7F4C]",
          assetId: portfolioCv.assetId,
          url: portfolioCv.url || undefined,
          dataUrl: portfolioCv.url || undefined,
          evidenceType: "CV",
        }
      : null);

  const resolvedReceipt = receipt || portfolio?.inductionDocuments?.paymentReceipt || null;

  const formCard = (formType: InterviewFormType, title: string, subtitle: string) => {
    if (formType === "assessment_grid") {
      const isMappingAvailable =
        portfolio?.standards?.assessmentMappingAvailable !== false;
      return (
        <PortfolioDocCard
          key={formType}
          title={title}
          subtitle={subtitle}
          badge={
            isMappingAvailable
              ? { label: "Available", tone: "success" }
              : { label: "Not Started", tone: "neutral" }
          }
          actions={
            <PortfolioActionButton
              disabled={!applicationId}
              onClick={() =>
                router.push(
                  `/applications/${applicationId}/assessment-forms/${FORM_ROUTE_IDS[formType]}?from=${viewer}`,
                )
              }
            >
              View
            </PortfolioActionButton>
          }
        />
      );
    }

    const record =
      interviewForms.find((f) => f.formType === formType) ||
      portfolio?.assessmentReports?.interviewForms?.find(
        (f) => f.formType === formType,
      );
    const hasStarted = Boolean(record && record.status !== "not_started");
    const canEdit = viewer === "assessor" && Boolean(isLeadPanelist);
    const canAccess = hasStarted || viewer === "assessor";
    return (
      <PortfolioDocCard
        key={formType}
        title={title}
        subtitle={subtitle}
        badge={formBadge(record)}
        actions={
          <PortfolioActionButton
            disabled={!canAccess}
            onClick={() =>
              router.push(
                `/applications/${applicationId}/assessment-forms/${FORM_ROUTE_IDS[formType]}?from=${viewer}`,
              )
            }
          >
            {record?.status === "completed"
              ? "View"
              : canEdit
                ? "Fill Form"
                : "View"}
          </PortfolioActionButton>
        }
      />
    );
  };

  const isReceiptPaid =
    isPaymentPaid ??
    (resolvedReceipt?.status === "completed" ||
      Boolean(
        (application as { paymentCompleted?: boolean } | null | undefined)
          ?.paymentCompleted,
      ));

  const receiptTransaction = React.useMemo(() => {
    const amountMinor =
      receipt?.amount?.amountMinorUnits || paymentQuote?.amountMinorUnits;
    const currency =
      receipt?.amount?.currency ||
      receipt?.currency ||
      paymentQuote?.currency ||
      "NGN";
    const amountPaid = amountMinor
      ? formatCurrency(amountMinor, currency)
      : paymentAmountText && paymentAmountText !== "—"
        ? paymentAmountText
        : "—";

    const profileDetails = portfolio?.candidateProfile?.personalDetails;
    const appDetails = application?.personalInformation?.personalDetails;
    const fullName =
      receipt?.candidateName ||
      application?.candidate?.name ||
      [profileDetails?.firstName, profileDetails?.lastName]
        .filter(Boolean)
        .join(" ") ||
      [appDetails?.firstName, appDetails?.lastName].filter(Boolean).join(" ") ||
      "Candidate";

    const assessmentType =
      receipt?.applicationType || application?.type || "RPL";
    const paidAt = resolvedReceipt?.paidAt;

    return {
      id:
        receipt?.paymentId ||
        (applicationId ? "TXN_" + applicationId.slice(0, 8) : "TXN_PAID"),
      candidateName: fullName,
      assessmentType,
      description:
        assessmentType === "NSQ"
          ? "National Skills Qualification"
          : "Recognition of prior learning",
      amountPaid,
      date: paidAt
        ? new Date(paidAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      paymentMethod: receipt?.provider || "Paystack",
      status: "Paid" as const,
      transactionId:
        receipt?.paymentId ||
        (applicationId
          ? "TXN_" + applicationId.replace(/-/g, "").slice(0, 10).toUpperCase()
          : "TXN_PAID"),
    };
  }, [
    receipt,
    paymentQuote,
    paymentAmountText,
    portfolio,
    application,
    resolvedReceipt,
    applicationId,
  ]);

  return (
    <div className={`flex flex-col ${accordion ? "gap-4" : "gap-8"} w-full`}>
      {/* 1. Induction Documents */}
      <PortfolioSection
        number={1}
        title="Induction Documents"
        isOpen={!accordion || openSection === 1}
        onToggle={accordion ? () => toggleSection(1) : undefined}
      >
        <PortfolioDocCard
          title="Candidate Application Form"
          subtitle="NBTE/RPL/01"
          actions={
            onViewApplicationForm && (
              <PortfolioActionButton onClick={onViewApplicationForm}>View</PortfolioActionButton>
            )
          }
        />
        {showReceipt && (
          <PortfolioDocCard
            title="Payment Receipt"
            subtitle={
              isReceiptPaid
                ? resolvedReceipt?.paidAt
                  ? `Paid on ${new Date(resolvedReceipt.paidAt).toLocaleDateString("en-GB")}`
                  : "Assessment fee receipt"
                : paymentAmountText && paymentAmountText !== "—"
                  ? `${paymentAmountText} · Assessment fee`
                  : "Assessment fee receipt"
            }
            badge={
              isReceiptPaid
                ? { label: "Paid", tone: "success" }
                : isPaymentUnlocked
                  ? { label: "Payment Required", tone: "warning" }
                  : resolvedReceipt?.status === "pending"
                    ? { label: "Pending", tone: "warning" }
                    : { label: "Awaiting Approval", tone: "neutral" }
            }
            actions={
              isReceiptPaid ? (
                <PortfolioActionButton
                  onClick={() =>
                    onViewReceipt
                      ? onViewReceipt()
                      : setIsReceiptModalOpen(true)
                  }
                >
                  View
                </PortfolioActionButton>
              ) : viewer === "candidate" && onMakePayment ? (
                <PortfolioActionButton
                  variant="amber"
                  disabled={!isPaymentUnlocked}
                  onClick={onMakePayment}
                >
                  {isPaymentUnlocked ? "Make Payment" : "Awaiting Centre Approval"}
                </PortfolioActionButton>
              ) : (
                <PortfolioActionButton disabled>
                  View
                </PortfolioActionButton>
              )
            }
          />
        )}
      </PortfolioSection>

      {/* 2. Candidate Profile */}
      <PortfolioSection
        number={2}
        title="Candidate Profile"
        isOpen={!accordion || openSection === 2}
        onToggle={accordion ? () => toggleSection(2) : undefined}
      >
        <PortfolioDocCard
          title="CV / Resume"
          subtitle={
            resolvedCv
              ? resolvedCv.name
              : viewer === "candidate"
                ? "Upload your CV / Resume for your candidate profile"
                : "The candidate has not uploaded a CV yet"
          }
          badge={
            resolvedCv
              ? { label: resolvedCv.status || "Uploaded", tone: "success" }
              : { label: "Not Uploaded", tone: "neutral" }
          }
          actions={
            resolvedCv ? (
              <PortfolioActionButton onClick={() => onPreview(resolvedCv)}>
                View
              </PortfolioActionButton>
            ) : viewer === "candidate" && onUploadCv ? (
              <PortfolioActionButton onClick={onUploadCv}>
                Upload CV
              </PortfolioActionButton>
            ) : (
              <PortfolioActionButton disabled>View</PortfolioActionButton>
            )
          }
        />
        <PortfolioDocCard
          title="Profile Information"
          subtitle="Personal details from the onboarding form"
          actions={
            <PortfolioActionButton onClick={() => setIsProfileOpen(true)}>View</PortfolioActionButton>
          }
        />
      </PortfolioSection>

      {/* 3. Standards for Assessment */}
      <PortfolioSection
        number={3}
        title="Standards for Assessment"
        isOpen={!accordion || openSection === 3}
        onToggle={accordion ? () => toggleSection(3) : undefined}
      >
        <NosStandardCard application={application} />
        {formCard(
          "assessment_grid",
          "Assessment Mapping Form",
          "Competency criteria mapped against the standard",
        )}
      </PortfolioSection>

      {/* 4. Assessment Reports / Evidences */}
      <PortfolioSection
        number={4}
        title="Assessment Reports/Evidences"
        isOpen={!accordion || openSection === 4}
        onToggle={accordion ? () => toggleSection(4) : undefined}
      >
        {selfAssessmentCard}
        {formCard(
          "skill_demonstration",
          "Skills Demonstration Form",
          "Practical skills demonstration and safety standards",
        )}
        {thirdPartyReportCard}
        {evidenceList}
        {formCard("records", "Interview Record Form", "Interview questions and responses")}
        {formCard(
          "practical_observation",
          "Practical Observation Checklist Form",
          "Practical observation findings from the interview panel",
        )}
        {extraReportCards}
      </PortfolioSection>

      {/* 5. Verification Report */}
      {!hideVerificationSection &&
        (verificationReportCard ||
          portfolio?.verification?.internalVerifier ||
          portfolio?.verification?.externalVerifier ||
          portfolio?.verification?.ivOutcome ||
          portfolio?.verification?.evOutcome) && (
        <PortfolioSection
          number={5}
          title="Verification Report"
          isOpen={!accordion || openSection === 5}
          onToggle={accordion ? () => toggleSection(5) : undefined}
        >
          {verificationReportCard || (
            <>
              <PortfolioDocCard
                title="Internal Verification (IV)"
                subtitle={
                  portfolio?.verification?.internalVerifier?.assignedAt
                    ? `Assigned on ${new Date(
                        portfolio.verification.internalVerifier.assignedAt,
                      ).toLocaleDateString("en-GB")}`
                    : "Internal Quality Assurance review"
                }
                badge={
                  portfolio?.verification?.ivOutcome?.toLowerCase() === "approved"
                    ? { label: "Approved", tone: "success" }
                    : portfolio?.verification?.ivOutcome?.toLowerCase() === "rejected"
                      ? { label: "Rejected", tone: "warning" }
                      : portfolio?.verification?.internalVerifier
                        ? { label: "In Progress", tone: "warning" }
                        : { label: "Not Started", tone: "neutral" }
                }
              />
              {portfolio?.verification?.externalVerifier ||
              portfolio?.verification?.evOutcome ? (
                <PortfolioDocCard
                  title="External Verification (EV)"
                  subtitle={
                    portfolio?.verification?.externalVerifier?.assignedAt
                      ? `Assigned on ${new Date(
                          portfolio.verification.externalVerifier.assignedAt,
                        ).toLocaleDateString("en-GB")}`
                      : "Awarding Body External Quality Assurance review"
                  }
                  badge={
                    portfolio?.verification?.evOutcome?.toLowerCase() === "approved"
                      ? { label: "Approved", tone: "success" }
                      : portfolio?.verification?.evOutcome?.toLowerCase() === "rejected"
                        ? { label: "Rejected", tone: "warning" }
                        : { label: "In Progress", tone: "warning" }
                  }
                />
              ) : null}
            </>
          )}
        </PortfolioSection>
      )}

      <ProfileInformationModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        application={application}
        personalDetails={portfolio?.candidateProfile?.personalDetails}
      />

      <TransactionReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        transaction={receiptTransaction}
      />
    </div>
  );
};
