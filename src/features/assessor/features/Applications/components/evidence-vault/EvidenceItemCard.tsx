"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FiMoreVertical } from "react-icons/fi";
import { ASSETS_URL } from "@/src/assets";

export interface EvidenceItem {
  id: string;
  name: string;
  size: string;
  status: "Pending" | "Approved" | "Attention Required";
  feedback?: string[];
  fileUrl?: string;
}

interface EvidenceItemCardProps {
  item: EvidenceItem;
  onSendFeedback: (item: EvidenceItem) => void;
  onApprove: (item: EvidenceItem) => void;
}

export const EvidenceItemCard: React.FC<EvidenceItemCardProps> = ({
  item,
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

  const isApproved = item.status === "Approved";
  const isPending = item.status === "Pending";

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col gap-3 transition-all relative">
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-[#FFF5F6] border border-rose-100 flex items-center justify-center shrink-0">
            <Image
              src={ASSETS_URL.pdfImg}
              alt="PDF"
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
            />
          </div>

          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="text-base sm:text-lg font-bold text-neutral-primary truncate">
                {item.name}
              </h4>
              {isApproved ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8F8F0] text-[#12B76A]">
                  Approved
                </span>
              ) : isPending ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF4E5] text-[#FF9800]">
                  Pending
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600">
                  {item.status}
                </span>
              )}
            </div>
            <span className="text-xs text-neutral-secondary font-normal">
              {item.size}
            </span>
          </div>
        </div>

        {/* Action Menu (Three dots) */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
            aria-label="Actions"
          >
            <FiMoreVertical className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-10 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20 flex flex-col text-left animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onSendFeedback(item);
                }}
                className="px-4 py-2 text-xs sm:text-sm text-neutral-primary hover:bg-gray-50 text-left transition-colors cursor-pointer font-medium"
              >
                Send Feedback
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onApprove(item);
                }}
                className="px-4 py-2 text-xs sm:text-sm text-neutral-primary hover:bg-gray-50 text-left transition-colors cursor-pointer font-medium"
              >
                Approve
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Red Warning Alert Box if Feedback Exists */}
      {item.feedback && item.feedback.length > 0 && (
        <div className="bg-[#FCE8EB] border border-[#F87171]/25 rounded-2xl p-4 flex flex-col gap-1 text-xs text-[#A31D38] font-medium leading-relaxed mt-1">
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
