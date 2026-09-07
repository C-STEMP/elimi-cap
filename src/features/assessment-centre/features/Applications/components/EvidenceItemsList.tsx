"use client";

import React from "react";
import { FiDownload, FiFileText } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { Loader } from "@/src/components/ui/loader";
import type { EvidenceRecord } from "@/src/features/shared/evidence-vault/utils/evidenceConstants";

interface Props {
  selfAssessment: any;
  onOpenSelfAssessmentForm: () => void;
  isLoadingEvidence: boolean;
  evidenceItems: any[];
  onSelectPreview: (item: EvidenceRecord) => void;
}

export const EvidenceItemsList: React.FC<Props> = ({
  selfAssessment,
  onOpenSelfAssessmentForm,
  isLoadingEvidence,
  evidenceItems,
  onSelectPreview,
}) => {
  const { toast } = useToast();

  return (
    <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
      {/* Section 1: Resources */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-extrabold text-black tracking-tight">Resources</h2>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <FiFileText className="w-6 h-6 text-[#a31d38]" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-black tracking-tight truncate">
                Self-Assessment Form
              </h3>
              <span className="text-xs text-gray-400 font-normal">
                {selfAssessment?.submittedAt
                  ? `Submitted on ${new Date(selfAssessment.submittedAt).toLocaleDateString("en-GB")}`
                  : "Candidate Competency Self-Assessment"}
              </span>
            </div>
          </div>
          <Button
            type="button"
            onClick={onOpenSelfAssessmentForm}
            variant="outline"
            size="sm"
            className="bg-white! text-[#fbab2a]! border border-gray-200! hover:bg-gray-50! font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-none! shrink-0"
          >
            View
          </Button>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <FiFileText className="w-6 h-6 text-[#a31d38]" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-black tracking-tight truncate">
                Third Party Reports
              </h3>
              <span className="text-xs text-gray-400 font-normal">Employer &amp; Supervisor References</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              toast({
                type: "info",
                title: "Third Party Reports",
                description: "No third party report document attached.",
              })
            }
            className="bg-[#F8F9FA] border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <span>Download</span>
            <FiDownload className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Section 2: Evidence Items */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-extrabold text-black tracking-tight">
          Evidence Items ({evidenceItems.length})
        </h2>

        {isLoadingEvidence ? (
          <div className="p-8 flex justify-center">
            <Loader tip="Loading evidence items..." />
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

            return (
              <div key={item.id || idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex flex-col gap-3 transition-all">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <FiFileText className="w-6 h-6 text-[#a31d38]" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-black tracking-tight truncate">{title}</h3>
                        <span className={`text-xs font-semibold px-3 py-0.5 rounded-full capitalize ${badgeBg} ${badgeText}`}>
                          {displayStatus}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-normal">{displaySize}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
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
                    }}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-[#fbab2a] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl cursor-pointer shrink-0 transition-colors shadow-none"
                  >
                    View
                  </button>
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
