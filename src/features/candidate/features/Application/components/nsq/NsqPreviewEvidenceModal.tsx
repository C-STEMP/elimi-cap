"use client";

import React from "react";
import { Modal } from "antd";
import {
  FiX,
  FiFileText,
  FiDownload,
  FiCheck,
  FiAlertCircle,
  FiExternalLink,
} from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import type { EvidenceItem, PerformanceCriteria } from "./NsqUnitDetailView";

interface NsqPreviewEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceItem | null;
  performanceCriteria?: PerformanceCriteria | null;
}

export const NsqPreviewEvidenceModal: React.FC<NsqPreviewEvidenceModalProps> = ({
  isOpen,
  onClose,
  evidence,
  performanceCriteria,
}) => {
  if (!evidence) return null;

  const fileName = evidence.fileName || evidence.title || "document";

  const isImageUrl = (url?: string, name?: string) => {
    const target = `${url || ""} ${name || ""}`.toLowerCase();
    return (
      target.startsWith("data:image/") ||
      /\.(jpeg|jpg|png|webp|svg|gif)/i.test(target) ||
      target.includes("image/upload") ||
      target.includes("res.cloudinary.com")
    );
  };

  const isPdfUrl = (url?: string, name?: string) => {
    const target = `${url || ""} ${name || ""}`.toLowerCase();
    return target.endsWith(".pdf") || target.includes(".pdf") || target.includes("/pdf");
  };

  const isVideoUrl = (url?: string, name?: string) => {
    const target = `${url || ""} ${name || ""}`.toLowerCase();
    return (
      /\.(mp4|webm|mov|m4v)/i.test(target) ||
      target.includes("video/upload")
    );
  };

  const hasImage = isImageUrl(evidence.url, fileName);
  const hasPdf = isPdfUrl(evidence.url, fileName);
  const hasVideo = isVideoUrl(evidence.url, fileName);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      closable={false}
      width={760}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <div className="flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#fdf2f5] text-[#a31d38] flex items-center justify-center shrink-0 shadow-inner">
              <FiFileText className="w-5 h-5" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-base sm:text-lg text-neutral-primary truncate max-w-[340px] sm:max-w-md">
                  {fileName}
                </h4>

                {/* Status Badge */}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                    evidence.status === "approved"
                      ? "bg-emerald-100 text-emerald-800"
                      : evidence.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {evidence.status === "approved"
                    ? "Approved"
                    : evidence.status === "rejected"
                      ? "Rejected"
                      : "In Review"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mt-0.5">
                <span>{evidence.evidenceType} Evidence</span>
                {evidence.fileSize && (
                  <>
                    <span>•</span>
                    <span>{evidence.fileSize}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <FiX className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {/* Performance Criteria Context Card */}
          {performanceCriteria && (
            <div className="bg-[#fcf8f9] border border-[#a31d38]/15 rounded-2xl p-4 flex items-start gap-3">
              <span className="px-2.5 py-0.5 rounded-md bg-[#a31d38] text-white font-bold text-[11px] uppercase shrink-0 mt-0.5">
                {performanceCriteria.code}
              </span>
              <p className="text-xs sm:text-sm font-semibold text-neutral-primary leading-relaxed">
                {performanceCriteria.description}
              </p>
            </div>
          )}

          {/* Document Preview Viewport */}
          <div className="w-full bg-[#f8f9fa] border border-gray-200/80 rounded-2xl overflow-hidden min-h-[300px] flex items-center justify-center p-3 sm:p-4">
            {hasPdf && evidence.url ? (
              <div className="w-full h-[460px] rounded-xl overflow-hidden bg-white border border-gray-200 shadow-inner flex flex-col">
                <iframe
                  src={`${evidence.url}#toolbar=1`}
                  title={fileName}
                  className="w-full h-full rounded-xl"
                />
              </div>
            ) : hasImage && evidence.url ? (
              <div className="relative w-full max-h-[460px] flex items-center justify-center rounded-xl overflow-hidden bg-white p-2 border border-gray-100 shadow-inner">
                <img
                  src={evidence.url}
                  alt={fileName}
                  className="max-h-[430px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                />
              </div>
            ) : hasVideo && evidence.url ? (
              <div className="w-full max-h-[440px] rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <video
                  src={evidence.url}
                  controls
                  className="max-h-[420px] w-full object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 gap-3 max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[#a31d38]">
                  <FiFileText className="w-8 h-8" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-extrabold text-sm text-neutral-primary">
                    {fileName}
                  </span>
                  <p className="text-xs text-gray-500 font-medium">
                    Uploaded evidence document recorded for criteria verification.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Assessor Feedback Display (If Available) */}
          {evidence.feedback && (
            <div
              className={`rounded-2xl p-4 border flex flex-col gap-1.5 ${
                evidence.status === "approved"
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                  : evidence.status === "rejected"
                    ? "bg-red-50/70 border-red-200 text-red-900"
                    : "bg-amber-50/70 border-amber-200 text-amber-900"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                {evidence.status === "approved" ? (
                  <FiCheck className="w-3.5 h-3.5 stroke-[3] text-emerald-700" />
                ) : (
                  <FiAlertCircle className="w-3.5 h-3.5 text-red-600" />
                )}
                <span>Assessor Feedback</span>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                {evidence.feedback}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
          {evidence.url ? (
            <a
              href={evidence.url}
              target="_blank"
              rel="noopener noreferrer"
              download={fileName}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#a31d38] hover:text-[#8a1538] hover:underline"
            >
              <FiExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab</span>
            </a>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="px-5 h-9 rounded-xl border-gray-200 text-xs font-bold"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
