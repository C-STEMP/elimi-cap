"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiFileText,
  FiDownload,
  FiExternalLink,
  FiLoader,
  FiCheckCircle,
} from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { EvidenceRecord } from "../utils/evidenceConstants";
import { getGeneralEvidenceByIdApi } from "@/src/features/shared/applications/api";
import { resolveAssetsApi } from "@/src/features/shared/storage/api/storage.api";
import { getAccessToken } from "@/src/lib/auth-storage";

interface PreviewEvidenceModalProps {
  item: EvidenceRecord | null;
  applicationId?: string;
  onClose: () => void;
  onApprove?: (item: EvidenceRecord) => void;
  isApproving?: boolean;
}

export const PreviewEvidenceModal: React.FC<PreviewEvidenceModalProps> = ({
  item,
  applicationId = "",
  onClose,
  onApprove,
  isApproving = false,
}) => {
  const [resolvedUrl, setResolvedUrl] = useState<string>("");
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [blobUrl, setBlobUrl] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    let currentCreatedBlob = "";

    async function loadDocument() {
      if (!item) return;

      setIsResolving(true);

      const initialUrl = item.url || item.dataUrl;
      let targetUrl = initialUrl || "";
      let targetAssetId = item.assetId || "";

      // 1. If we don't have url or assetId on list item, fetch individual evidence item detail from CAP backend
      if (
        !targetUrl &&
        !targetAssetId &&
        applicationId &&
        item.id &&
        !item.id.startsWith("ev-local-")
      ) {
        try {
          const detail = await getGeneralEvidenceByIdApi(
            applicationId,
            item.id,
          );
          if (!isMounted) return;
          if (detail?.assetId) {
            targetAssetId = detail.assetId;
          }
          if ((detail as any)?.url) {
            targetUrl = (detail as any).url;
          }
        } catch (detailErr) {
          console.warn("Could not fetch evidence item detail:", detailErr);
        }
      }

      // 2. Resolve assetId using Orchestrator Storage service
      if (!targetUrl && targetAssetId) {
        try {
          const res: any = await resolveAssetsApi([targetAssetId]);
          if (!isMounted) return;
          const assets: { assetId: string; url: string }[] =
            Array.isArray(res)
              ? res
              : Array.isArray(res?.assets)
                ? res.assets
                : [];
          const match =
            assets.find((a) => a.assetId === targetAssetId) || assets[0];
          if (match?.url) {
            targetUrl = match.url;
          }
        } catch (err) {
          console.warn("Could not resolve asset url:", err);
        }
      }

      if (!targetUrl) {
        if (isMounted) {
          setResolvedUrl("");
          setIsResolving(false);
        }
        return;
      }

      // If it's already a blob or data url, use it directly
      if (targetUrl.startsWith("blob:") || targetUrl.startsWith("data:")) {
        if (isMounted) {
          setResolvedUrl(targetUrl);
          setIsResolving(false);
        }
        return;
      }

      // Set targetUrl directly (presigned or resolved URL)
      if (isMounted) {
        setResolvedUrl(targetUrl);
        setIsResolving(false);
      }
    }

    loadDocument();

    return () => {
      isMounted = false;
      if (currentCreatedBlob) {
        URL.revokeObjectURL(currentCreatedBlob);
      }
    };
  }, [item, applicationId]);

  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [item?.id, item?.url, resolvedUrl]);

  if (!item) return null;

  const fileUrl = resolvedUrl || item.url || item.dataUrl;

  const isPdf =
    fileUrl?.toLowerCase().endsWith(".pdf") ||
    fileUrl?.includes(".pdf?") ||
    fileUrl?.startsWith("data:application/pdf") ||
    item.name?.toLowerCase().endsWith(".pdf") ||
    item.mimeType === "application/pdf";

  const isApproved =
    item.status === "Approved" ||
    (item.status as string)?.toLowerCase() === "approved" ||
    (item.status as string)?.toLowerCase() === "accepted" ||
    (item.status as string)?.toLowerCase() === "successful";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 p-1 cursor-pointer transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-5 pr-8">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[#fdf2f4] text-[#a31d38] flex items-center justify-center shrink-0 border border-[#fce3e7]">
                <FiFileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-black text-base sm:text-lg truncate">
                    {item.name}
                  </h4>
                  <span
                    className={`${
                      isApproved
                        ? "bg-[#E6F4EA] text-[#1E7F4C]"
                        : item.statusBg || "bg-[#FEF3C7]"
                    } ${
                      isApproved
                        ? "text-[#1E7F4C]"
                        : item.statusText || "text-[#D97706]"
                    } text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize`}
                  >
                    {isApproved ? "Approved" : item.status || "Pending"}
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {item.size} • {item.evidenceType || "General Evidence"}
                </span>
              </div>
            </div>
          </div>

          {/* Document Preview Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50 rounded-2xl border border-gray-100 p-4 flex flex-col items-center justify-center min-h-[350px]">
            {isResolving ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10">
                <FiLoader className="w-8 h-8 text-[#a31d38] animate-spin" />
                <span className="text-xs text-gray-500 font-medium">
                  Loading document preview...
                </span>
              </div>
            ) : fileUrl && !hasImageError && !isPdf ? (
              <div className="relative w-full flex items-center justify-center rounded-2xl overflow-hidden bg-white p-2 border border-gray-200 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fileUrl}
                  alt={item.name}
                  onError={() => setHasImageError(true)}
                  className="max-h-[52vh] max-w-full object-contain rounded-xl"
                />
              </div>
            ) : fileUrl && isPdf ? (
              <iframe
                src={`${fileUrl}#toolbar=1`}
                className="w-full h-[55vh] rounded-2xl border border-gray-200 bg-white shadow-xs"
                title={item.name}
              />
            ) : fileUrl ? (
              <div className="w-full bg-white rounded-2xl p-8 border border-gray-200 shadow-xs flex flex-col items-center justify-center text-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#a31d38] flex items-center justify-center shadow-2xs">
                  <FiFileText className="w-8 h-8" />
                </div>
                <h5 className="font-bold text-sm text-gray-800">{item.name}</h5>
                <p className="text-xs text-gray-500 max-w-xs text-center">
                  This document can be opened directly or downloaded to your device.
                </p>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#a31d38] hover:bg-[#8d1830] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <FiExternalLink className="w-4 h-4" />
                  <span>Open Full Document</span>
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <div className="w-16 h-16 rounded-3xl bg-red-50 text-[#a31d38] flex items-center justify-center shadow-2xs">
                  <FiFileText className="w-8 h-8" />
                </div>
                <h5 className="font-bold text-sm text-gray-800">{item.name}</h5>
                <p className="text-xs text-gray-500 max-w-xs text-center">
                  Document has been registered and is awaiting reviewer inspection.
                </p>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between gap-3 mt-5 pt-3 border-t border-gray-100 flex-wrap">
            {fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                download={item.name}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a31d38] hover:underline cursor-pointer"
              >
                <FiDownload className="w-4 h-4" />
                <span>Download File</span>
              </a>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5 ml-auto">
              {onApprove && !isApproved && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => onApprove(item)}
                  disabled={isApproving}
                  className="bg-[#1E7F4C] hover:bg-[#166534] text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isApproving ? (
                    <FiLoader className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiCheckCircle className="w-4 h-4" />
                  )}
                  <span>{isApproving ? "Approving..." : "Approve"}</span>
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-xl"
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
