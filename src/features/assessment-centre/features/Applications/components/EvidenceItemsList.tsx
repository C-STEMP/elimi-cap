"use client";

import React, { useState } from "react";
import { FiDownload, FiFileText, FiLoader, FiX } from "react-icons/fi";
import { useThirdPartyReportDownload } from "@/src/features/shared/evidence-vault/hooks/useThirdPartyReportDownload";
import {
  getEvidenceTypeName,
  isCvEvidence,
  type EvidenceRecord,
} from "@/src/features/shared/evidence-vault/utils/evidenceConstants";
import {
  EvidenceTypeFilter,
  useEvidenceTypeFilter,
} from "@/src/features/shared/evidence-vault/components/EvidenceTypeFilter";
import {
  PortfolioActionButton,
  PortfolioDocCard,
  PortfolioVault,
  type PortfolioBadgeTone,
} from "@/src/features/shared/evidence-vault/components/portfolio";
import type {
  ApplicationDetail,
  IqamFormSummaryItem,
} from "@/src/features/shared/applications/api/types";
import type { IqamToolId } from "@/src/features/assessor/features/iqam/types/iqam.types";
import { CentreIqamFormViewer } from "./nsq/CentreIqamFormViewer";

interface Props {
  applicationId?: string;
  appDetail?: ApplicationDetail | null;
  selfAssessment: any;
  onOpenSelfAssessmentForm: () => void;
  onOpenCandidateForm?: () => void;
  isLoadingEvidence: boolean;
  evidenceItems: any[];
  onSelectPreview: (item: EvidenceRecord) => void;
}

const IQAM_TOOL_TITLES: Partial<Record<IqamToolId, string>> = {
  "CON/05/IQAM": "IV Observation & Questioning Checklist",
  "CON/06/IQAM": "Final Portfolio / Award Report Form",
};

function iqamBadge(
  forms: IqamFormSummaryItem[] | null | undefined,
  key: IqamFormSummaryItem["key"],
): { label: string; tone: PortfolioBadgeTone } {
  const status = forms?.find((f) => f.key === key)?.status?.toLowerCase() || "";
  if (status.includes("submit") || status.includes("complet")) {
    return { label: "Submitted", tone: "success" };
  }
  if (status) return { label: "In Progress", tone: "warning" };
  return { label: "Not Started", tone: "neutral" };
}

export const EvidenceItemsList: React.FC<Props> = ({
  applicationId,
  appDetail,
  selfAssessment,
  onOpenSelfAssessmentForm,
  onOpenCandidateForm,
  isLoadingEvidence,
  evidenceItems,
  onSelectPreview,
}) => {
  const {
    handleDownload: handleDownloadThirdParty,
    isDownloading,
    hasUploadedReport,
    downloadUrl,
    reportData,
  } = useThirdPartyReportDownload(applicationId);
  const [openIqamTool, setOpenIqamTool] = useState<IqamToolId | null>(null);

  // The CV is shown under "Candidate Profile", not in the evidences list.
  const cvItem = evidenceItems.find((item) => isCvEvidence(item));
  const otherItems = cvItem
    ? evidenceItems.filter((item) => item !== cvItem)
    : evidenceItems;
  const cvEvidence: EvidenceRecord | null = cvItem
    ? {
        id: cvItem.id || cvItem.assetId || "cv",
        name: cvItem.documentName,
        size: cvItem.size || cvItem.fileSize || "Uploaded document",
        status: cvItem.status ? String(cvItem.status).replace(/_/g, " ") : "Uploaded",
        statusBg: "bg-[#1E7F4C]/10",
        statusText: "text-[#1E7F4C]",
        assetId: cvItem.assetId,
        url: cvItem.url,
        dataUrl: cvItem.dataUrl,
        mimeType: cvItem.mimeType,
        evidenceType: cvItem.evidenceType,
      }
    : null;

  const iqamCard = (toolId: IqamToolId, key: IqamFormSummaryItem["key"]) => (
    <PortfolioDocCard
      title={IQAM_TOOL_TITLES[toolId] || toolId}
      subtitle={`Ref: ${toolId} · Filled by the quality assurer`}
      badge={iqamBadge(appDetail?.iqamForms, key)}
      actions={
        <PortfolioActionButton onClick={() => setOpenIqamTool(toolId)}>View</PortfolioActionButton>
      }
    />
  );

  return (
    <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
      <PortfolioVault
        viewer="centre"
        applicationId={applicationId || ""}
        application={appDetail}
        cvEvidence={cvEvidence}
        onPreview={onSelectPreview}
        onViewApplicationForm={onOpenCandidateForm}
        selfAssessmentCard={
          <PortfolioDocCard
            title="Self-Assessment of Competency Form"
            subtitle={
              selfAssessment?.submittedAt
                ? `Submitted on ${new Date(selfAssessment.submittedAt).toLocaleDateString("en-GB")}`
                : "Filled by the candidate"
            }
            badge={
              selfAssessment?.submittedAt
                ? { label: "Submitted", tone: "success" }
                : { label: "Not Submitted", tone: "neutral" }
            }
            actions={
              <PortfolioActionButton onClick={onOpenSelfAssessmentForm}>View</PortfolioActionButton>
            }
          />
        }
        thirdPartyReportCard={
          <PortfolioDocCard
            title="Third Party Report Form"
            subtitle="Employer & Supervisor References"
            badge={
              hasUploadedReport
                ? { label: "Submitted", tone: "success" }
                : { label: "Not Uploaded", tone: "neutral" }
            }
            actions={
              <>
                {hasUploadedReport && (
                  <PortfolioActionButton
                    onClick={() =>
                      onSelectPreview({
                        id: reportData?.assetId || "third-party-report",
                        name: "Third Party Report",
                        size: "PDF",
                        status: "Submitted",
                        statusBg: "bg-[#D1FAE5]",
                        statusText: "text-[#047857]",
                        url: downloadUrl || undefined,
                        assetId: reportData?.assetId || undefined,
                        evidenceType: "TPR",
                      })
                    }
                  >
                    View
                  </PortfolioActionButton>
                )}
                <PortfolioActionButton
                  variant="secondary"
                  onClick={handleDownloadThirdParty}
                  disabled={isDownloading}
                >
                  <span>{isDownloading ? "Downloading..." : "Download"}</span>
                  {isDownloading ? (
                    <FiLoader className="w-4 h-4 text-gray-500 animate-spin" />
                  ) : (
                    <FiDownload className="w-4 h-4 text-gray-500" />
                  )}
                </PortfolioActionButton>
              </>
            }
          />
        }
        evidenceList={
          <CentreEvidenceList
            items={otherItems}
            isLoadingEvidence={isLoadingEvidence}
            onSelectPreview={onSelectPreview}
          />
        }
        extraReportCards={iqamCard("CON/05/IQAM", "assessor_outcomes")}
        verificationReportCard={iqamCard("CON/06/IQAM", "final_portfolio")}
      />

      {openIqamTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs select-text">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Internal Quality Assurance
                </span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  {IQAM_TOOL_TITLES[openIqamTool] || openIqamTool}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenIqamTool(null)}
                aria-label="Close"
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <CentreIqamFormViewer toolId={openIqamTool} applicationId={applicationId || ""} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CentreEvidenceListProps {
  items: any[];
  isLoadingEvidence: boolean;
  onSelectPreview: (item: EvidenceRecord) => void;
}

const CentreEvidenceList: React.FC<CentreEvidenceListProps> = ({
  items,
  isLoadingEvidence,
  onSelectPreview,
}) => {
  const typeFilter = useEvidenceTypeFilter(items);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base sm:text-lg font-bold text-black tracking-tight">
        Evidences ({items.length})
      </h3>

      {isLoadingEvidence ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between gap-4 animate-pulse"
            >
              <div className="flex items-center gap-4 min-w-0 w-full">
                <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0" />
                <div className="flex flex-col gap-2 min-w-0 w-full">
                  <div className="h-4 bg-gray-200 rounded w-48" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
              </div>
              <div className="h-8 bg-gray-100 rounded-xl w-16 shrink-0" />
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
        <EvidenceTypeFilter
          types={typeFilter.types}
          activeType={typeFilter.activeType}
          onChange={typeFilter.setActiveType}
          totalCount={typeFilter.totalCount}
        />
        {typeFilter.filteredItems.map((item) => {
          const idx = items.indexOf(item);
          const statusStr = (item.status as string)?.toLowerCase() || "";
          const isApproved =
            statusStr === "approved" ||
            statusStr === "accepted" ||
            statusStr === "successful";
          const isAttention =
            statusStr === "rejected" ||
            statusStr === "needs_attention" ||
            statusStr === "attention_required";
          const isSubmitted = statusStr === "submitted";

          const title =
            item.documentName ||
            item.name ||
            item.title ||
            item.filename ||
            item.originalName ||
            `Evidence Document #${idx + 1}`;
          const fileFeedback = item.feedback || item.reviewComment;
          const displaySize =
            item.size || item.fileSize || "Uploaded document";
          const displayStatus = isApproved
            ? "Approved"
            : isAttention
              ? "Attention Required"
              : isSubmitted
                ? "Submitted"
                : item.status
                  ? item.status.replace(/_/g, " ")
                  : "Pending";
          const badgeBg =
            isApproved || isSubmitted
              ? "bg-[#1E7F4C]/10"
              : isAttention
                ? "bg-[#FCE8EB]"
                : "bg-[#F9A825]/10";
          const badgeText =
            isApproved || isSubmitted
              ? "text-[#1E7F4C]"
              : isAttention
                ? "text-[#A31D38]"
                : "text-[#F9A825]";

          const handlePreview = () => {
            onSelectPreview({
              id: item.id || `ev-${idx}`,
              name: title,
              size: displaySize,
              status: isApproved
                ? "Approved"
                : isSubmitted
                  ? "Submitted"
                  : displayStatus,
              statusBg: badgeBg,
              statusText: badgeText,
              assetId: item.assetId,
              url: item.url,
              dataUrl: item.dataUrl,
              mimeType: item.mimeType,
              evidenceType: item.evidenceType || "General Evidence",
            });
          };

          return (
            <div
              key={item.id || idx}
              onClick={handlePreview}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs flex flex-col gap-3 transition-all cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1 w-full">
                  <div className="w-11 sm:w-12 h-11 sm:h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <FiFileText className="w-5 sm:w-6 h-5 sm:h-6 text-[#a31d38]" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-black tracking-tight group-hover:text-primary transition-colors wrap-break-word">
                        {title}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2.5 sm:px-3 py-0.5 rounded-full capitalize ${badgeBg} ${badgeText}`}
                      >
                        {displayStatus}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-normal">
                      {displaySize}
                      {item.evidenceType
                        ? ` · ${getEvidenceTypeName(item.evidenceType)}`
                        : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end sm:justify-start w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100/70 sm:border-transparent shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview();
                    }}
                    className="w-full sm:w-auto text-center bg-white border border-gray-200 hover:bg-gray-50 text-[#fbab2a] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl cursor-pointer shrink-0 transition-colors shadow-none"
                  >
                    View
                  </button>
                </div>
              </div>

              {fileFeedback && (
                <div className="bg-[#FCE8EB] border border-[#F87171]/30 rounded-2xl p-4 flex flex-col gap-1 text-xs text-[#A31D38] font-medium leading-relaxed mt-1">
                  <div className="flex items-start gap-2">
                    <span className="text-sm">•</span>
                    <span>{fileFeedback}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </>
      ) : (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-400 font-normal">
          No uploaded evidence files found for this candidate.
        </div>
      )}
    </div>
  );
};
