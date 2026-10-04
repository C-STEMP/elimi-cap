"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/src/components/ui/toast";
import { FiDownload, FiLoader, FiUploadCloud } from "react-icons/fi";
import { useThirdPartyReportDownload } from "../hooks/useThirdPartyReportDownload";
import { useUploadThirdPartyReport } from "@/src/features/shared/applications/hooks";
import { useUploadFile } from "@/src/features/shared/storage/hooks";
import { PortfolioActionButton, PortfolioDocCard } from "./portfolio";

interface CandidateSelfAssessmentCardProps {
  applicationId?: string;
  isCompleted?: boolean;
}

export const CandidateSelfAssessmentCard: React.FC<CandidateSelfAssessmentCardProps> = ({
  applicationId,
  isCompleted = false,
}) => {
  const router = useRouter();

  return (
    <PortfolioDocCard
      title="Self-Assessment of Competency Form"
      subtitle="Filled by you"
      badge={
        isCompleted
          ? { label: "Completed", tone: "success" }
          : { label: "Not Started", tone: "neutral" }
      }
      actions={
        <PortfolioActionButton
          onClick={() =>
            router.push(
              applicationId
                ? `/dashboard/applications/${applicationId}/self-assessment`
                : "/dashboard/applications",
            )
          }
        >
          {isCompleted ? "View Form" : "Fill Form"}
        </PortfolioActionButton>
      }
    />
  );
};

interface CandidateThirdPartyReportCardProps {
  applicationId?: string;
}

export const CandidateThirdPartyReportCard: React.FC<CandidateThirdPartyReportCardProps> = ({
  applicationId,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingReport, setIsUploadingReport] = useState(false);

  const {
    handleDownload: handleDownloadThirdParty,
    isDownloading,
    hasUploadedReport,
  } = useThirdPartyReportDownload(applicationId);

  const uploadFileMutation = useUploadFile();
  const uploadThirdPartyReportMutation = useUploadThirdPartyReport(applicationId || "");

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
    <PortfolioDocCard
      title="Third Party Report Form"
      subtitle="Download the template, fill it and upload it back"
      badge={
        hasUploadedReport
          ? { label: "Submitted", tone: "success" }
          : { label: "Not Started", tone: "neutral" }
      }
      actions={
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleFileUpload}
          />
          <PortfolioActionButton
            variant="secondary"
            onClick={handleDownloadThirdParty}
            disabled={isDownloading}
            aria-label="Download Third Party Reports"
          >
            <span>{isDownloading ? "Downloading..." : "Download"}</span>
            {isDownloading ? (
              <FiLoader className="w-4 h-4 text-gray-500 animate-spin" />
            ) : (
              <FiDownload className="w-4 h-4 text-gray-500" />
            )}
          </PortfolioActionButton>
          {applicationId && (
            <PortfolioActionButton
              disabled={isUploadingReport}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploadingReport ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FiUploadCloud className="w-4 h-4" />
                  <span>{hasUploadedReport ? "Re-upload Form" : "Upload Form"}</span>
                </>
              )}
            </PortfolioActionButton>
          )}
        </>
      }
    />
  );
};
