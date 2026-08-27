"use client";

import React from "react";
import Image from "next/image";
import { FiDownload } from "react-icons/fi";
import { ASSETS_URL } from "@/src/assets";
import { useToast } from "@/src/components/ui/toast";

interface ResourcesSectionProps {
  onViewSelfAssessment?: () => void;
  onDownloadThirdPartyReport?: () => void;
}

export const ResourcesSection: React.FC<ResourcesSectionProps> = ({
  onViewSelfAssessment,
  onDownloadThirdPartyReport,
}) => {
  const { toast } = useToast();

  const handleDownload = () => {
    if (onDownloadThirdPartyReport) {
      onDownloadThirdPartyReport();
    } else {
      toast({
        type: "info",
        title: "Download Started",
        description: "Downloading Third Party Reports template...",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="text-lg font-bold text-neutral-primary">
        Resources
      </h3>

      {/* Resource Card 1: Self-Assessment Form */}
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
            <h4 className="text-base sm:text-lg font-bold text-neutral-primary truncate">
              Self-Assessment Form
            </h4>
            <span className="text-xs text-neutral-secondary font-normal">
              5 mb
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewSelfAssessment}
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
            <h4 className="text-base sm:text-lg font-bold text-neutral-primary truncate">
              Third Party Reports
            </h4>
            <span className="text-xs text-neutral-secondary font-normal">
              5 mb
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="bg-[#F8F9FA] border border-gray-200 hover:bg-gray-100 text-neutral-primary font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs shrink-0"
        >
          <span>Download</span>
          <FiDownload className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};
