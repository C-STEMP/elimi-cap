"use client";

import React from "react";
import {
  FiFolder,
  FiEye,
  FiTrash2,
  FiFileText,
  FiImage,
  FiVideo,
} from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import {
  EvidenceRecord,
  EVIDENCE_TYPE_LABELS,
} from "../utils/evidenceConstants";
import Image from "next/image";
import { ASSETS_URL } from "@/assets";

interface EvidenceSectionProps {
  evidences: EvidenceRecord[];
  onPreview: (item: EvidenceRecord) => void;
  onDelete: (item: EvidenceRecord) => void;
  onOpenUploadModal: () => void;
}

function getFileTypeIcon(mimeType?: string, name?: string) {
  const mime = mimeType?.toLowerCase() || "";
  const ext = (name?.split(".").pop() || "").toLowerCase();

  if (mime === "application/pdf" || ext === "pdf") {
    return <Image src={ASSETS_URL.pdfImg} width={20} height={20} alt="PDF" />;
  }
  if (
    mime.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)
  ) {
    return <FiImage className="w-5 h-5 text-primary" />;
  }
  if (
    mime.startsWith("video/") ||
    ["mp4", "mov", "avi", "mkv", "webm"].includes(ext)
  ) {
    return <FiVideo className="w-5 h-5 text-primary" />;
  }
  return <FiFileText className="w-5 h-5 text-primary" />;
}

function getEvidenceTypeLabel(evidenceType?: string): string {
  if (!evidenceType) return "";
  const code = evidenceType.trim().toUpperCase();
  return EVIDENCE_TYPE_LABELS[code] || evidenceType;
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({
  evidences,
  onPreview,
  onDelete,
  onOpenUploadModal,
}) => {
  return (
    <div className="border border-[#F7F4EF] p-4 sm:p-6 rounded-2xl bg-white flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
          Evidence Items ({evidences.length})
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Upload all relevant documents, certificates, and work samples.
        </p>
      </div>

      {evidences.length > 0 ? (
        <div className="flex flex-col gap-4">
          {evidences.map((item) => {
            const s = (item.status || "").toLowerCase().replace(/_/g, " ");
            const isApproved =
              s.includes("approv") ||
              s.includes("accept") ||
              s.includes("complet") ||
              s.includes("verifi");
            const isSubmitted = s.includes("submi");
            const isAttention =
              s.includes("reject") ||
              s.includes("attenti") ||
              s.includes("fail") ||
              s.includes("declin") ||
              (item.issues && item.issues.length > 0 && !isApproved);
            const isInProgress = s.includes("review") || s.includes("progress");

            const badgeBg =
              isApproved || isSubmitted
                ? "bg-[#1E7F4C]/10"
                : isAttention
                  ? "bg-[#FEE2E2]"
                  : isInProgress
                    ? "bg-[#EFF6FF]"
                    : "bg-[#F9A825]/10";
            const badgeText =
              isApproved || isSubmitted
                ? "text-[#1E7F4C]"
                : isAttention
                  ? "text-[#B91C1C]"
                  : isInProgress
                    ? "text-[#1D4ED8]"
                    : "text-[#F9A825]";

            const evidenceTypeLabel = getEvidenceTypeLabel(item.evidenceType);

            return (
              <div
                key={item.id}
                className="bg-input-bg rounded-[20px] p-4 sm:p-5 border border-gray-100/70 flex flex-col gap-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      {getFileTypeIcon(item.mimeType, item.name)}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="text-[#191918] font-medium text-sm sm:text-base leading-snug">
                          {item.name}
                        </h4>
                        <div
                          className={`${badgeBg} ${badgeText} text-xs font-semibold px-3 py-0.5 rounded-full capitalize`}
                        >
                          {item.status || "Pending"}
                        </div>
                      </div>

                      {evidenceTypeLabel && (
                        <span className="text-[#191918]/50 text-xs mt-1">
                          {evidenceTypeLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onPreview(item)}
                      className="w-8 h-8 rounded bg-[#1E7F4C1A] hover:bg-black/20 flex items-center justify-center text-black transition-colors cursor-pointer shrink-0"
                      aria-label={`View ${item.name}`}
                    >
                      <FiEye className="w-4 sm:w-5 h-4 sm:h-5 stroke-2" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className="w-8 h-8 rounded bg-[#B3261E1A] hover:bg-[#fce3e7] flex items-center justify-center text-border-secondary transition-colors cursor-pointer shrink-0"
                      aria-label={`Delete ${item.name}`}
                    >
                      <FiTrash2 className="w-4 sm:w-5 h-4 sm:h-5 stroke-2" />
                    </button>
                  </div>
                </div>

                {item.issues && item.issues.length > 0 && (
                  <div className="mt-1 bg-[#FCE8EB] border border-[#F87171]/30 rounded-xl p-3 sm:p-4 flex flex-col gap-1 text-xs sm:text-sm text-[#A31D38]">
                    <ul className="flex flex-col gap-1 list-disc pl-5">
                      {item.issues.map((issue: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-input-bg rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center border border-dashed border-gray-200">
          <div className="w-16 h-16 rounded-full bg-[#fdf2f4] text-[#a31d38] flex items-center justify-center mb-4">
            <FiFolder className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-black mb-1">
            No Evidence Uploaded Yet
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm max-w-sm mb-6">
            Click &quot;Upload Evidence&quot; in the top header to upload all
            your evidence.
          </p>
          <Button
            type="button"
            variant="amber"
            size="md"
            onClick={onOpenUploadModal}
            className="bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold px-6 py-3 rounded-xl shadow-xs"
          >
            Upload Evidence
          </Button>
        </div>
      )}
    </div>
  );
};
