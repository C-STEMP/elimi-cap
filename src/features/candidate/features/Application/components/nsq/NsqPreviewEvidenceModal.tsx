"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "antd";
import {
  FiX,
  FiFileText,
  FiDownload,
  FiCheck,
  FiAlertCircle,
  FiExternalLink,
  FiLoader,
} from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { resolveAssetsApi } from "@/src/features/shared/storage/api/storage.api";
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
  const [resolvedUrl, setResolvedUrl] = useState<string>("");
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);

    if (evidence?.url) {
      setResolvedUrl(evidence.url);
      setIsResolving(false);
      return;
    }

    if (evidence?.assetId) {
      let isMounted = true;
      setIsResolving(true);
      resolveAssetsApi([evidence.assetId])
        .then((res: any) => {
          if (!isMounted) return;
          const assets: { assetId: string; url: string }[] = Array.isArray(res)
            ? res
            : Array.isArray(res?.assets)
              ? res.assets
              : [];
          const match =
            assets.find((a) => a.assetId === evidence.assetId) || assets[0];
          if (match?.url) {
            setResolvedUrl(match.url);
          }
        })
        .catch((err) => {
          console.warn("Could not resolve asset url in preview modal:", err);
        })
        .finally(() => {
          if (isMounted) setIsResolving(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setResolvedUrl("");
      setIsResolving(false);
    }
  }, [evidence?.url, evidence?.assetId]);

  if (!evidence) return null;

  const effectiveUrl = resolvedUrl || evidence.url || "";

  const displayFileName = (() => {
    if (evidence.fileName && /\.[a-z0-9]{2,5}$/i.test(evidence.fileName)) {
      return evidence.fileName;
    }
    if (effectiveUrl) {
      try {
        const cleanPath = effectiveUrl.split("?")[0];
        const lastSegment = cleanPath.split("/").pop();
        if (lastSegment && /\.[a-z0-9]{2,5}$/i.test(lastSegment)) {
          return decodeURIComponent(lastSegment);
        }
      } catch {
        // Fall back
      }
    }
    return evidence.fileName || evidence.title || "document";
  })();

  const isPdfUrl = (url?: string, name?: string) => {
    const target = `${url || ""} ${name || ""}`.toLowerCase();
    const cleanUrl = (url || "").split("?")[0].toLowerCase();
    return (
      cleanUrl.endsWith(".pdf") ||
      target.includes(".pdf") ||
      target.includes("/pdf") ||
      target.startsWith("data:application/pdf")
    );
  };

  const isImageUrl = (url?: string, name?: string) => {
    const target = `${url || ""} ${name || ""}`.toLowerCase();
    const cleanUrl = (url || "").split("?")[0].toLowerCase();
    return (
      target.startsWith("data:image/") ||
      /\.(jpeg|jpg|png|webp|svg|gif|avif)(\?|$)/i.test(target) ||
      cleanUrl.endsWith(".jpg") ||
      cleanUrl.endsWith(".jpeg") ||
      cleanUrl.endsWith(".png") ||
      cleanUrl.endsWith(".webp") ||
      cleanUrl.endsWith(".svg") ||
      cleanUrl.endsWith(".gif") ||
      target.includes("image/upload") ||
      (target.includes("res.cloudinary.com") && !target.includes(".pdf"))
    );
  };

  const isVideoUrl = (url?: string, name?: string) => {
    const target = `${url || ""} ${name || ""}`.toLowerCase();
    const cleanUrl = (url || "").split("?")[0].toLowerCase();
    return (
      /\.(mp4|webm|mov|m4v)(\?|$)/i.test(target) ||
      cleanUrl.endsWith(".mp4") ||
      cleanUrl.endsWith(".webm") ||
      cleanUrl.endsWith(".mov") ||
      target.includes("video/upload")
    );
  };

  const hasPdf = isPdfUrl(effectiveUrl, displayFileName);
  const hasImage = isImageUrl(effectiveUrl, displayFileName);
  const hasVideo = isVideoUrl(effectiveUrl, displayFileName);

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
                  {displayFileName}
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
            {isResolving ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <FiLoader className="w-8 h-8 text-[#a31d38] animate-spin" />
                <span className="text-xs text-gray-500 font-medium">
                  Loading evidence preview...
                </span>
              </div>
            ) : hasPdf && effectiveUrl ? (
              <div className="w-full h-[460px] rounded-xl overflow-hidden bg-white border border-gray-200 shadow-inner flex flex-col">
                <iframe
                  src={`${effectiveUrl}#toolbar=1`}
                  title={displayFileName}
                  className="w-full h-full rounded-xl"
                />
              </div>
            ) : hasImage && effectiveUrl && !hasImageError ? (
              <div className="relative w-full max-h-[460px] flex items-center justify-center rounded-xl overflow-hidden bg-white p-2 border border-gray-100 shadow-inner">
                <img
                  src={effectiveUrl}
                  alt={displayFileName}
                  onError={() => setHasImageError(true)}
                  className="max-h-[430px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                />
              </div>
            ) : hasVideo && effectiveUrl ? (
              <div className="w-full max-h-[440px] rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <video
                  src={effectiveUrl}
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
                    {displayFileName}
                  </span>
                  <p className="text-xs text-gray-500 font-medium">
                    {effectiveUrl
                      ? "Uploaded evidence document recorded for criteria verification."
                      : "Evidence recorded. File preview is currently unavailable."}
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
          {effectiveUrl ? (
            <a
              href={effectiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={displayFileName}
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
