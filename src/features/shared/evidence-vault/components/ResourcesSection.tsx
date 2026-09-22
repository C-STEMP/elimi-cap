"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/src/components/ui/toast";
import { Button } from "@/src/components/ui/button";
import Image from "next/image";
import { FiLoader, FiUploadCloud } from "react-icons/fi";
import { ASSETS_URL } from "@/assets";
import { useThirdPartyReportDownload } from "../hooks/useThirdPartyReportDownload";
import { useUploadThirdPartyReport } from "@/src/features/shared/applications/hooks";
import { useUploadFile } from "@/src/features/shared/storage/hooks";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingReport, setIsUploadingReport] = useState(false);

  const {
    handleDownload: handleDownloadThirdParty,
    isDownloading,
    hasUploadedReport,
  } = useThirdPartyReportDownload(applicationId);

  const uploadFileMutation = useUploadFile();
  const uploadThirdPartyReportMutation = useUploadThirdPartyReport(
    applicationId || "",
  );

  const handleOpenSelfAssessment = () => {
    if (applicationId) {
      router.push(`/dashboard/applications/${applicationId}/self-assessment`);
    } else {
      router.push(`/dashboard/applications`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !applicationId) return;

    try {
      setIsUploadingReport(true);
      const asset = await uploadFileMutation.mutateAsync({
        file,
        purpose: "evidence",
      });

      const assetId = asset?.assetId || (asset as any)?.id;
      if (!assetId) {
        throw new Error("Failed to upload file to storage.");
      }

      await uploadThirdPartyReportMutation.mutateAsync(assetId);
    } catch (err: any) {
      console.error("Upload third party report error:", err);
      toast({
        type: "error",
        title: "Upload Failed",
        description:
          err?.message || "Failed to upload third party report. Please try again.",
      });
    } finally {
      setIsUploadingReport(false);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div className="border border-[#F7F4EF] p-4 sm:p-5 rounded-2xl bg-white shadow-2xs">
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-primary tracking-tight mb-4">
        Resources
      </h2>
      <div className="flex flex-col gap-3.5">
        {/* Self-Assessment Form */}
        <div className="bg-input-bg rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3.5 min-w-0 flex-1 w-full">
            <div className="w-11 sm:w-12 h-11 sm:h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
              <Image
                src={ASSETS_URL.pdfImg}
                width={24}
                height={24}
                alt="pdf_img"
                className="w-5 sm:w-6 h-5 sm:h-6 object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-[#191918] font-bold text-sm sm:text-base md:text-lg leading-snug">
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

          <div className="flex items-center justify-end sm:justify-start w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/50 sm:border-transparent shrink-0">
            <Button
              type="button"
              variant="secondary"
              onClick={handleOpenSelfAssessment}
              className="w-full sm:w-auto text-center"
            >
              {isSelfAssessmentCompleted ? "View Form" : "Fill Form"}
            </Button>
          </div>
        </div>

        {/* Third Party Reports */}
        <div className="bg-input-bg rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3.5 min-w-0 flex-1 w-full">
            <div className="w-11 sm:w-12 h-11 sm:h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
              <Image
                src={ASSETS_URL.pdfImg}
                width={24}
                height={24}
                alt="pdf_img"
                className="w-5 sm:w-6 h-5 sm:h-6 object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-[#191918] font-bold text-sm sm:text-base md:text-lg leading-snug">
                  Third Party Reports
                </h4>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    hasUploadedReport
                      ? "bg-[#E8F5E9] text-[#2E7D32]"
                      : "bg-black/10 text-black"
                  }`}
                >
                  {hasUploadedReport ? "Submitted" : "Not Started"}
                </span>
              </div>
              <span className="text-gray-400 text-xs mt-0.5">5 mb</span>
            </div>
          </div>

          <div className="flex items-center justify-end sm:justify-start gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/50 sm:border-transparent shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              type="button"
              onClick={handleDownloadThirdParty}
              disabled={isDownloading}
              className="flex-1 sm:flex-initial justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Download Third Party Reports"
            >
              <span>{isDownloading ? "Downloading..." : "Download"}</span>
              {isDownloading ? (
                <FiLoader className="w-4 h-4 text-gray-500 animate-spin" />
              ) : (
                <Image
                  src={ASSETS_URL.downloadIcon}
                  width={16}
                  height={16}
                  alt="download_icon"
                  className="opacity-70"
                />
              )}
            </button>

            {applicationId && (
              <Button
                type="button"
                variant="secondary"
                disabled={isUploadingReport}
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-initial justify-center flex items-center gap-1.5"
              >
                {isUploadingReport ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FiUploadCloud className="w-4 h-4" />
                    <span>
                      {hasUploadedReport ? "Re-upload Form" : "Upload Form"}
                    </span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
