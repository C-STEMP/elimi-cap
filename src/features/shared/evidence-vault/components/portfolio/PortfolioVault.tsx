"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetApplicationReceipt,
  useGetInterviewForms,
} from "@/src/features/shared/applications/hooks";
import type {
  ApplicationDetail,
  InterviewForm,
} from "@/src/features/shared/applications/api/types";
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
  onPreview: (item: EvidenceRecord) => void;
  onViewApplicationForm?: () => void;
  /** Role-specific cards — each view keeps its own fill/upload behaviour. */
  selfAssessmentCard: React.ReactNode;
  thirdPartyReportCard: React.ReactNode;
  evidenceList: React.ReactNode;
  /** Extra section 4 cards only some viewers can load (e.g. IQAM CON/05). */
  extraReportCards?: React.ReactNode;
  /** Section 5 is rendered only when this is provided. */
  verificationReportCard?: React.ReactNode;
}

function formBadge(record?: InterviewForm): { label: string; tone: PortfolioBadgeTone } {
  if (!record) return { label: "Not Started", tone: "neutral" };
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
  onPreview,
  onViewApplicationForm,
  selfAssessmentCard,
  thirdPartyReportCard,
  evidenceList,
  extraReportCards,
  verificationReportCard,
}) => {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Assessors don't see the payment receipt.
  const showReceipt = viewer !== "assessor";
  const { data: receipt } = useGetApplicationReceipt(applicationId, { enabled: showReceipt });
  const { data: interviewForms = [] } = useGetInterviewForms(applicationId);

  const formCard = (formType: InterviewFormType, title: string, subtitle: string) => {
    const record = interviewForms.find((f) => f.formType === formType);
    return (
      <PortfolioDocCard
        key={formType}
        title={title}
        subtitle={subtitle}
        badge={formBadge(record)}
        actions={
          <PortfolioActionButton
            disabled={!record}
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
  };

  const isReceiptPaid = receipt?.status === "completed";
  const canViewReceipt = Boolean(receipt?.assetId || receipt?.url);

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* 1. Induction Documents */}
      <PortfolioSection number={1} title="Induction Documents">
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
              receipt?.paidAt
                ? `Paid on ${new Date(receipt.paidAt).toLocaleDateString("en-GB")}`
                : "Assessment fee receipt"
            }
            badge={
              isReceiptPaid
                ? { label: "Paid", tone: "success" }
                : receipt?.status === "pending"
                  ? { label: "Pending", tone: "warning" }
                  : { label: "Not Paid", tone: "neutral" }
            }
            actions={
              <PortfolioActionButton
                disabled={!canViewReceipt}
                onClick={() =>
                  receipt &&
                  onPreview({
                    id: receipt.paymentId || "payment-receipt",
                    name: "Payment Receipt",
                    size: "PDF",
                    status: isReceiptPaid ? "Paid" : "Pending",
                    statusBg: isReceiptPaid ? "bg-[#D1FAE5]" : "bg-[#FEF3C7]",
                    statusText: isReceiptPaid ? "text-[#047857]" : "text-[#D97706]",
                    assetId: receipt.assetId || undefined,
                    url: receipt.url || undefined,
                    evidenceType: "Payment Receipt",
                  })
                }
              >
                View
              </PortfolioActionButton>
            }
          />
        )}
      </PortfolioSection>

      {/* 2. Candidate Profile */}
      <PortfolioSection number={2} title="Candidate Profile">
        <PortfolioDocCard
          title="CV / Resume"
          subtitle={
            cvEvidence
              ? cvEvidence.name
              : viewer === "candidate"
                ? "Upload your CV as evidence with the type or name “CV”"
                : "The candidate has not uploaded a CV yet"
          }
          badge={
            cvEvidence
              ? { label: cvEvidence.status || "Uploaded", tone: "success" }
              : { label: "Not Uploaded", tone: "neutral" }
          }
          actions={
            <PortfolioActionButton
              disabled={!cvEvidence}
              onClick={() => cvEvidence && onPreview(cvEvidence)}
            >
              View
            </PortfolioActionButton>
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
      <PortfolioSection number={3} title="Standards for Assessment">
        <NosStandardCard application={application} />
        {formCard(
          "assessment_grid",
          "Assessment Mapping Form",
          "Competency criteria mapped against the standard",
        )}
      </PortfolioSection>

      {/* 4. Assessment Reports / Evidences */}
      <PortfolioSection number={4} title="Assessment Reports/Evidences">
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
      {verificationReportCard && (
        <PortfolioSection number={5} title="Verification Report">
          {verificationReportCard}
        </PortfolioSection>
      )}

      <ProfileInformationModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        application={application}
      />
    </div>
  );
};
