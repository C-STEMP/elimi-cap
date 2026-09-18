"use client";

import React from "react";
import Image from "next/image";
import { FiDownload, FiLoader } from "react-icons/fi";
import { ASSETS_URL } from "@/src/assets";
import { useToast } from "@/src/components/ui/toast";
import { useThirdPartyReportDownload } from "@/src/features/shared/evidence-vault/hooks/useThirdPartyReportDownload";

interface ResourcesSectionProps {
  applicationId?: string;
  onViewSelfAssessment?: () => void;
  onViewThirdPartyReport?: () => void;
  onDownloadThirdPartyReport?: () => void;
}

export const ResourcesSection: React.FC<ResourcesSectionProps> = ({
  applicationId,
  onViewSelfAssessment,
  onViewThirdPartyReport,
  onDownloadThirdPartyReport,
}) => {
  const { toast } = useToast();
  const {
    handleDownload: triggerDownload,
    isDownloading,
    hasUploadedReport,
    downloadUrl,
  } = useThirdPartyReportDownload(applicationId);

  const handleDownload = () => {
    if (onDownloadThirdPartyReport) {
      onDownloadThirdPartyReport();
    } else {
      triggerDownload();
    }
  };

  const handleViewReport = () => {
    if (onViewThirdPartyReport) {
      onViewThirdPartyReport();
    } else if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    } else {
      triggerDownload();
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="text-lg font-bold text-neutral-primary">
        Resources
      </h3>

      {/* Resource Card 1: Self-Assessment Form */}
      <div
        onClick={onViewSelfAssessment}
        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between gap-4 transition-all cursor-pointer group"
      >
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
            <h4 className="text-base sm:text-lg font-bold text-neutral-primary truncate group-hover:text-primary transition-colors">
              Self-Assessment Form
            </h4>
            <span className="text-xs text-neutral-secondary font-normal">
              5 mb
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewSelfAssessment?.();
          }}
          className="bg-white text-[#FBAB2A] border border-gray-200 hover:bg-orange-50/50 font-bold text-xs sm:text-sm px-6 py-2 rounded-xl transition-all cursor-pointer shadow-2xs shrink-0"
        >
          View
        </button>
      </div>

      {/* Resource Card 2: Third Party Reports */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between gap-4 transition-all">
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
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base sm:text-lg font-bold text-neutral-primary truncate">
                Third Party Reports
              </h4>
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
            <span className="text-xs text-neutral-secondary font-normal">
              5 mb
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasUploadedReport && (
            <button
              type="button"
              onClick={handleViewReport}
              className="bg-white text-[#FBAB2A] border border-gray-200 hover:bg-orange-50/50 font-bold text-xs sm:text-sm px-6 py-2 rounded-xl transition-all cursor-pointer shadow-2xs shrink-0"
            >
              View
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-[#F8F9FA] border border-gray-200 hover:bg-gray-100 text-neutral-primary font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
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
  );
};
