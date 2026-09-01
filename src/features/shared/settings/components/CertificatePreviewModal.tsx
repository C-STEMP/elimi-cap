"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiFileText,
  FiCheckCircle,
  FiDownload,
  FiExternalLink,
  FiMaximize2,
} from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { resolveAssetsApi } from "@/src/features/shared/storage/api/storage.api";
import { Loader } from "@/src/components/ui/loader";

export interface CertificatePreviewData {
  title: string;
  subtitle?: string;
  url?: string;
  assetId?: string;
}

interface CertificatePreviewModalProps {
  isOpen: boolean;
  data: CertificatePreviewData | null;
  onClose: () => void;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  isOpen,
  data,
  onClose,
}) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!isOpen || !data) {
      setResolvedUrl(null);
      setIsLoadingUrl(false);
      setImageError(false);
      return;
    }

    if (data.url && !data.url.includes("authenticated")) {
      setResolvedUrl(data.url);
      setIsLoadingUrl(false);
      return;
    }

    if (data.assetId) {
      setIsLoadingUrl(true);
      resolveAssetsApi([data.assetId])
        .then((res) => {
          if (res && res[0]?.url) {
            setResolvedUrl(res[0].url);
          } else if (data.url) {
            setResolvedUrl(data.url);
          }
        })
        .catch((err) => {
          console.warn("Failed to resolve certificate asset URL:", err);
          if (data.url) {
            setResolvedUrl(data.url);
          }
        })
        .finally(() => {
          setIsLoadingUrl(false);
        });
    } else if (data.url) {
      setResolvedUrl(data.url);
    }
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  const previewSource = resolvedUrl || data.url;
  const isPdf =
    previewSource?.toLowerCase().endsWith(".pdf") ||
    previewSource?.includes(".pdf?") ||
    previewSource?.startsWith("data:application/pdf");
  const isImage =
    !isPdf &&
    (previewSource?.match(/\.(jpeg|jpg|png|webp|svg)/i) ||
      previewSource?.startsWith("data:image/") ||
      previewSource?.startsWith("blob:") ||
      previewSource?.includes("image"));

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 transition-opacity duration-300 select-none overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative flex flex-col overflow-hidden my-auto max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between gap-4 bg-[#FDF8F9]">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                <FiFileText className="w-6 h-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-extrabold text-neutral-primary tracking-tight truncate">
                    {data.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <FiCheckCircle className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                </div>
                {data.subtitle && (
                  <p className="text-xs text-gray-500 font-normal mt-0.5 truncate">
                    {data.subtitle}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-gray-200"
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content / Viewport */}
          <div className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center min-h-75 max-h-[62vh] overflow-y-auto bg-gray-50/50">
            {isLoadingUrl ? (
              <div className="py-16 flex flex-col items-center justify-center">
                <Loader
                  fullscreen={false}
                  size="small"
                  tip="Loading certificate preview..."
                />
              </div>
            ) : previewSource && !imageError ? (
              isPdf ? (
                <iframe
                  src={`${previewSource}#toolbar=1`}
                  title={data.title}
                  className="w-full h-[55vh] rounded-2xl border border-gray-200 bg-white shadow-xs"
                />
              ) : isImage ? (
                <div className="relative w-full flex items-center justify-center rounded-2xl overflow-hidden bg-white p-2 border border-gray-200 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewSource}
                    alt={data.title}
                    onError={() => setImageError(true)}
                    className="max-h-[52vh] max-w-full object-contain rounded-xl"
                  />
                </div>
              ) : (
                <iframe
                  src={previewSource}
                  title={data.title}
                  className="w-full h-[55vh] rounded-2xl border border-gray-200 bg-white shadow-xs"
                />
              )
            ) : (
              <div className="w-full bg-white rounded-2xl p-8 border border-gray-200/80 shadow-xs flex flex-col items-center justify-center text-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#fbab2a] flex items-center justify-center">
                  <FiFileText className="w-8 h-8" />
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                  <h4 className="text-base font-extrabold text-neutral-primary">
                    {data.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-secondary font-normal">
                    This certificate is securely recorded on your profile and verified by ELIMI.
                  </p>
                </div>
                {previewSource && (
                  <a
                    href={previewSource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#fbab2a] font-bold text-xs transition-colors"
                  >
                    <span>Download File</span>
                    <FiDownload className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-gray-100 flex items-center justify-between gap-3 bg-white">
            <span className="text-xs text-gray-400 font-medium">
              ELIMI Unified TVET Architecture
            </span>

            <div className="flex items-center gap-2.5">
              {previewSource && (
                <a
                  href={previewSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F8F9FA] hover:bg-gray-100 text-neutral-primary font-semibold text-xs border border-gray-200 transition-colors"
                >
                  <FiExternalLink className="w-3.5 h-3.5" />
                  <span>Open Fullscreen</span>
                </a>
              )}
              <Button
                type="button"
                onClick={onClose}
                variant="amber"
                size="sm"
                className="px-5 h-9 font-bold text-xs text-white bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
