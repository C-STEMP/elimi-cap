"use client";

import React from "react";
import { FiDownload, FiLoader } from "react-icons/fi";
import { useThirdPartyReportDownload } from "@/src/features/shared/evidence-vault/hooks/useThirdPartyReportDownload";
import {
  PortfolioActionButton,
  PortfolioDocCard,
} from "@/src/features/shared/evidence-vault/components/portfolio";

interface AssessorThirdPartyReportCardProps {
  applicationId?: string;
  onView?: () => void;
}

export const AssessorThirdPartyReportCard: React.FC<AssessorThirdPartyReportCardProps> = ({
  applicationId,
  onView,
}) => {
  const { handleDownload, isDownloading, hasUploadedReport, downloadUrl } =
    useThirdPartyReportDownload(applicationId);

  const handleView = () => {
    if (onView) {
      onView();
    } else if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    } else {
      handleDownload();
    }
  };

  return (
    <PortfolioDocCard
      title="Third Party Report Form"
      subtitle="Filled by the candidate"
      badge={
        hasUploadedReport
          ? { label: "Submitted", tone: "success" }
          : { label: "Not Uploaded", tone: "neutral" }
      }
      actions={
        <>
          {hasUploadedReport && (
            <PortfolioActionButton onClick={handleView}>View</PortfolioActionButton>
          )}
          <PortfolioActionButton variant="secondary" onClick={handleDownload} disabled={isDownloading}>
            <span>{isDownloading ? "Downloading..." : "Download"}</span>
            {isDownloading ? (
              <FiLoader className="w-4 h-4 text-gray-500 animate-spin" />
            ) : (
              <FiDownload className="w-4 h-4 text-gray-500" />
            )}
          </PortfolioActionButton>
        </>
      }
    />
  );
};
