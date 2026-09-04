"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FiMoreVertical, FiFileText, FiImage, FiVideo, FiEye, FiCheck } from "react-icons/fi";
import { ASSETS_URL } from "@/src/assets";

export interface EvidenceItem {
  id: string;
  name: string;
  size: string;
  status: string;
  feedback?: string[];
  fileUrl?: string;
  mimeType?: string;
  evidenceType?: string;
  assetId?: string;
  url?: string;
  dataUrl?: string;
}

function getFileTypeIcon(mimeType?: string, name?: string) {
  const mime = mimeType?.toLowerCase() || "";
  const ext = (name?.split(".").pop() || "").toLowerCase();

  if (mime === "application/pdf" || ext === "pdf") {
    return (
      <Image
        src={ASSETS_URL.pdfImg}
        alt="PDF"
        width={24}
        height={24}
        className="w-6 h-6 object-contain"
      />
    );
  }
  if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) {
    return <FiImage className="w-6 h-6 text-[#a31d38]" />;
  }
  if (mime.startsWith("video/") || ["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) {
    return <FiVideo className="w-6 h-6 text-[#a31d38]" />;
  }
  return <FiFileText className="w-6 h-6 text-[#a31d38]" />;
}

function getStatusBadge(status: string) {
  const s = (status || "").toLowerCase().replace(/_/g, " ");
  if (s.includes("approv") || s.includes("accept") || s.includes("complet") || s.includes("verifi")) {
    return {
      bg: "bg-[#1E7F4C]/10",
      text: "text-[#1E7F4C]",
      label: status || "Approved",
    };
  }
  if (s.includes("submi")) {
    return {
      bg: "bg-[#1E7F4C]/10",
      text: "text-[#1E7F4C]",
      label: status || "Submitted",
    };
  }
  if (s.includes("reject") || s.includes("attenti") || s.includes("fail") || s.includes("declin")) {
    return {
      bg: "bg-[#FCE8EB]",
      text: "text-[#A31D38]",
      label: status || "Attention Required",
    };
  }
  if (s.includes("review") || s.includes("progress")) {
    return {
      bg: "bg-[#EFF6FF]",
      text: "text-[#1D4ED8]",
      label: status || "In Progress",
    };
  }
  return {
    bg: "bg-[#F9A825]/10",
    text: "text-[#F9A825]",
    label: status || "Pending",
  };
}

interface EvidenceItemCardProps {
  item: EvidenceItem;
  onView: (item: EvidenceItem) => void;
  onSendFeedback: (item: EvidenceItem) => void;
  onApprove: (item: EvidenceItem) => void;
}

export const EvidenceItemCard: React.FC<EvidenceItemCardProps> = ({
  item,
  onView,
  onSendFeedback,
  onApprove,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const badge = getStatusBadge(item.status);
  const isApproved = item.status?.toLowerCase().includes("approv");

  return (
    <div
      onClick={() => onView(item)}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md hover:border-gray-200 flex flex-col gap-3 transition-all relative cursor-pointer group"
    >
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-xl bg-[#FFF5F6] border border-rose-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            {getFileTypeIcon(item.mimeType, item.name)}
          </div>

          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4
                onClick={(e) => {
                  e.stopPropagation();
                  onView(item);
                }}
                className="text-base sm:text-lg font-bold text-neutral-primary hover:text-primary transition-colors truncate cursor-pointer"
              >
                {item.name}
              </h4>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badge.bg} ${badge.text}`}
              >
                {badge.label}
              </span>
            </div>
            <span className="text-xs text-neutral-secondary font-normal">
              {item.size} {item.evidenceType ? `• ${item.evidenceType}` : ""}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onView(item);
            }}
            className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
            title="View Document"
            aria-label="View Document"
          >
            <FiEye className="w-4 h-4" />
          </button>

          {!isApproved && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onApprove(item);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#12B76A]/10 hover:bg-[#12B76A]/20 text-[#12B76A] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Approve Evidence"
            >
              <FiCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Approve</span>
            </button>
          )}

          {/* Action Menu (Three dots) */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
              aria-label="Actions"
            >
              <FiMoreVertical className="w-5 h-5" />
            </button>

            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20 flex flex-col text-left animate-in fade-in zoom-in-95 duration-150"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onView(item);
                  }}
                  className="px-4 py-2 text-xs sm:text-sm text-neutral-primary hover:bg-gray-50 text-left transition-colors cursor-pointer font-medium flex items-center gap-2"
                >
                  <FiEye className="w-3.5 h-3.5" />
                  <span>View Evidence</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onSendFeedback(item);
                  }}
                  className="px-4 py-2 text-xs sm:text-sm text-neutral-primary hover:bg-gray-50 text-left transition-colors cursor-pointer font-medium"
                >
                  Send Feedback
                </button>
                {!isApproved && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onApprove(item);
                    }}
                    className="px-4 py-2 text-xs sm:text-sm text-[#12B76A] hover:bg-emerald-50 text-left transition-colors cursor-pointer font-medium"
                  >
                    Approve
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Red Warning Alert Box if Feedback Exists */}
      {item.feedback && item.feedback.length > 0 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-[#FCE8EB] border border-[#F87171]/25 rounded-2xl p-4 flex flex-col gap-1 text-xs text-[#A31D38] font-medium leading-relaxed mt-1"
        >
          {item.feedback.map((fb, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-sm leading-none mt-0.5">•</span>
              <span>{fb}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

