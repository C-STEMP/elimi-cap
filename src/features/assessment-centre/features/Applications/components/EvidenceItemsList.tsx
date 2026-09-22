"use client";

import React from "react";
import { FiDownload, FiFileText, FiLoader } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import type { EvidenceRecord } from "@/src/features/shared/evidence-vault/utils/evidenceConstants";
import { useThirdPartyReportDownload } from "@/src/features/shared/evidence-vault/hooks/useThirdPartyReportDownload";

interface Props {
  applicationId?: string;
  selfAssessment: any;
  onOpenSelfAssessmentForm: () => void;
  isLoadingEvidence: boolean;
  evidenceItems: any[];
  onSelectPreview: (item: EvidenceRecord) => void;
}

export const EvidenceItemsList: React.FC<Props> = ({
  applicationId,
  selfAssessment,
  onOpenSelfAssessmentForm,
  isLoadingEvidence,
  evidenceItems,
  onSelectPreview,
}) => {
  const { toast } = useToast();
  const {
    handleDownload: handleDownloadThirdParty,
    isDownloading,
    hasUploadedReport,
    downloadUrl,
    reportData,
  } = useThirdPartyReportDownload(applicationId);

  return (
    <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
      {/* Section 1: Resources */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-extrabold text-black tracking-tight">Resources</h2>

        <div
          onClick={onOpenSelfAssessmentForm}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1 w-full">
            <div className="w-11 sm:w-12 h-11 sm:h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <FiFileText className="w-5 sm:w-6 h-5 sm:h-6 text-[#a31d38]" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-black tracking-tight group-hover:text-primary transition-colors">
                Self-Assessment Form
              </h3>
              <span className="text-xs text-gray-400 font-normal">
                {selfAssessment?.submittedAt
                  ? `Submitted on ${new Date(selfAssessment.submittedAt).toLocaleDateString("en-GB")}`
                  : "Candidate Competency Self-Assessment"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end sm:justify-start w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100/70 sm:border-transparent shrink-0">
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSelfAssessmentForm();
              }}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto bg-white! text-[#fbab2a]! border border-gray-200! hover:bg-gray-50! font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-none! shrink-0 text-center"
            >
              View
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all">
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1 w-full">
            <div className="w-11 sm:w-12 h-11 sm:h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <FiFileText className="w-5 sm:w-6 h-5 sm:h-6 text-[#a31d38]" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-black tracking-tight">
                  Third Party Reports
                </h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    hasUploadedReport
                      ? "bg-[#E8F5E9] text-[#2E7D32]"
                      : "bg-black/10 text-black"
                  }`}
                >
                  {hasUploadedReport ? "Submitted" : "Not Uploaded"}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-normal">Employer &amp; Supervisor References</span>
            </div>
          </div>
          <div className="flex items-center justify-end sm:justify-start gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100/70 sm:border-transparent shrink-0">
            {hasUploadedReport && (
              <Button
                type="button"
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
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-initial text-center bg-white! text-[#fbab2a]! border border-gray-200! hover:bg-gray-50! font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-none! shrink-0"
              >
                View
              </Button>
            )}

            <button
              type="button"
              onClick={handleDownloadThirdParty}
              disabled={isDownloading}
              className="flex-1 sm:flex-initial justify-center bg-[#F8F9FA] border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{isDownloading ? "Downloading..." : "Download"}</span>
              {isDownloading ? (
                <FiLoader className="w-4 h-4 text-gray-500 animate-spin" />
              ) : (
                <FiDownload className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Evidence Items */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-extrabold text-black tracking-tight">
          Evidence Items ({evidenceItems.length})
        </h2>

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
        ) : evidenceItems.length > 0 ? (
          evidenceItems.map((item, idx) => {
            const statusStr = (item.status as string)?.toLowerCase() || "";
            const isApproved =
              statusStr === "approved" || statusStr === "accepted" || statusStr === "successful";
            const isAttention =
              statusStr === "rejected" || statusStr === "needs_attention" || statusStr === "attention_required";
            const isSubmitted = statusStr === "submitted";

            const title =
              item.documentName || item.name || item.title || item.filename || item.originalName || `Evidence Document #${idx + 1}`;
            const fileFeedback = item.feedback || item.reviewComment;
            const displaySize = item.size || item.fileSize || "Uploaded document";
            const displayStatus = isApproved ? "Approved" : isAttention ? "Attention Required" : isSubmitted ? "Submitted" : item.status ? item.status.replace(/_/g, " ") : "Pending";
            const badgeBg = isApproved || isSubmitted ? "bg-[#1E7F4C]/10" : isAttention ? "bg-[#FCE8EB]" : "bg-[#F9A825]/10";
            const badgeText = isApproved || isSubmitted ? "text-[#1E7F4C]" : isAttention ? "text-[#A31D38]" : "text-[#F9A825]";

            const handlePreview = () => {
              onSelectPreview({
                id: item.id || `ev-${idx}`,
                name: title,
                size: displaySize,
                status: isApproved ? "Approved" : isSubmitted ? "Submitted" : displayStatus,
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
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-black tracking-tight group-hover:text-primary transition-colors break-words">{title}</h3>
                        <span className={`text-xs font-semibold px-2.5 sm:px-3 py-0.5 rounded-full capitalize ${badgeBg} ${badgeText}`}>
                          {displayStatus}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-normal">{displaySize}</span>
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
          })
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-400 font-normal">
            No uploaded evidence files found for this candidate.
          </div>
        )}
      </div>
    </div>
  );
};
