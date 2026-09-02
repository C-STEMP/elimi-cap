"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/src/components/ui/toast";
import { Button } from "@/src/components/ui/button";
import Image from "next/image";
import { ASSETS_URL } from "@/assets";

import { useGetThirdPartyReportTemplate } from "@/src/features/shared/reference/hooks";

interface ResourcesSectionProps {
  applicationId?: string;
  isSelfAssessmentCompleted?: boolean;
}

export const ResourcesSection: React.FC<ResourcesSectionProps> = ({
  applicationId,
  isSelfAssessmentCompleted = false,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { data: templateData } = useGetThirdPartyReportTemplate();

  const handleOpenSelfAssessment = () => {
    if (applicationId) {
      router.push(`/dashboard/applications/${applicationId}/self-assessment`);
    } else {
      router.push(`/dashboard/applications`);
    }
  };

  const handleDownloadThirdParty = () => {
    if (templateData?.url) {
      window.open(templateData.url, "_blank");
      toast({
        type: "success",
        title: "Download Started",
        description: "Downloading Third Party Reports template...",
      });
    } else {
      toast({
        type: "info",
        title: "Download Started",
        description: "Downloading Third Party Reports template...",
      });
    }
  };

  return (
    <div className="border border-[#F7F4EF] p-4 sm:p-5 rounded-2xl bg-white shadow-2xs">
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-primary tracking-tight mb-4">
        Resources
      </h2>
      <div className="flex flex-col gap-3.5">
        {/* Self-Assessment Form */}
        <div className="bg-input-bg rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
              <Image
                src={ASSETS_URL.pdfImg}
                width={24}
                height={24}
                alt="pdf_img"
                className="object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-[#191918] font-bold text-base sm:text-lg leading-snug">
                  Self-Assessment Form
                </h4>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isSelfAssessmentCompleted
                      ? "bg-[#E8F5E9] text-[#2E7D32]"
                      : "bg-black/10 text-black"
                  }`}
                >
                  {isSelfAssessmentCompleted ? "Completed" : "Not Started"}
                </span>
              </div>
              <span className="text-gray-400 text-xs mt-0.5">5 mb</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleOpenSelfAssessment}
            // className="bg-secondary hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 rounded-xl shadow-none cursor-pointer shrink-0"
          >
            {isSelfAssessmentCompleted ? "View Form" : "Fill Form"}
          </Button>
        </div>

        {/* Third Party Reports */}
        <div className="bg-input-bg rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
              <Image
                src={ASSETS_URL.pdfImg}
                width={24}
                height={24}
                alt="pdf_img"
                className="object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="text-[#191918] font-bold text-base sm:text-lg leading-snug">
                Third Party Reports
              </h4>
              <span className="text-gray-400 text-xs mt-0.5">5 mb</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadThirdParty}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            aria-label="Download Third Party Reports"
          >
            <span>Download</span>
            <Image
              src={ASSETS_URL.downloadIcon}
              width={16}
              height={16}
              alt="download_icon"
              className="opacity-70"
            />
          </button>
        </div>
      </div>
    </div>
  );
};
