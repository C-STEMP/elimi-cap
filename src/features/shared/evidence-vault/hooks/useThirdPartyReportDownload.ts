"use client";

import { useState, useEffect } from "react";
import { useGetThirdPartyReport } from "@/src/features/shared/applications/hooks";
import { useGetThirdPartyReportTemplate } from "@/src/features/shared/reference/hooks";
import { getThirdPartyReportApi } from "@/src/features/shared/applications/api/evidence.api";
import { getThirdPartyReportTemplateApi } from "@/src/features/shared/reference/api/reference.api";
import { resolveAssetsApi } from "@/src/features/shared/storage/api/storage.api";
import { useToast } from "@/src/components/ui/toast";

export function useThirdPartyReportDownload(applicationId?: string) {
  const { toast } = useToast();
  const { data: templateData, isLoading: isLoadingTemplate } =
    useGetThirdPartyReportTemplate();
  const { data: reportData, isLoading: isLoadingReport } =
    useGetThirdPartyReport(applicationId || "");

  const [resolvedReportUrl, setResolvedReportUrl] = useState<string | null>(
    null,
  );
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function resolveUrl() {
      const directUrl =
        (reportData as any)?.url || (reportData as any)?.asset?.url;
      if (directUrl) {
        if (isMounted) setResolvedReportUrl(directUrl);
        return;
      }

      if (reportData?.assetId) {
        setIsResolving(true);
        try {
          const res: any = await resolveAssetsApi([reportData.assetId]);
          if (!isMounted) return;
          const assets = Array.isArray(res)
            ? res
            : Array.isArray(res?.assets)
              ? res.assets
              : [];
          const match =
            assets.find((a: any) => a.assetId === reportData.assetId) ||
            assets[0];
          if (match?.url && isMounted) {
            setResolvedReportUrl(match.url);
          }
        } catch (err) {
          console.warn("Failed to resolve third party report asset URL:", err);
        } finally {
          if (isMounted) setIsResolving(false);
        }
      } else {
        if (isMounted) setResolvedReportUrl(null);
      }
    }

    resolveUrl();

    return () => {
      isMounted = false;
    };
  }, [reportData]);

  const downloadUrl = resolvedReportUrl || templateData?.url || null;
  const isTemplate = !resolvedReportUrl && Boolean(templateData?.url);

  const handleDownload = async () => {
    if (isDownloading) return;

    try {
      let targetUrl = downloadUrl;
      let isTpl = isTemplate;

      // Only set loading if we actually need to fetch the URL asynchronously
      if (!targetUrl) {
        setIsDownloading(true);

        if (applicationId) {
          try {
            const report = await getThirdPartyReportApi(applicationId);
            const directUrl =
              (report as any)?.url || (report as any)?.asset?.url;
            if (directUrl) {
              targetUrl = directUrl;
              isTpl = false;
            } else if (report?.assetId) {
              const res: any = await resolveAssetsApi([report.assetId]);
              const assets = Array.isArray(res)
                ? res
                : Array.isArray(res?.assets)
                  ? res.assets
                  : [];
              const match =
                assets.find((a: any) => a.assetId === report.assetId) ||
                assets[0];
              if (match?.url) {
                targetUrl = match.url;
                isTpl = false;
              }
            }
          } catch (e) {
            console.warn("Could not fetch application third party report:", e);
          }
        }

        // Fall back to template if no uploaded report was found
        if (!targetUrl) {
          try {
            const template = await getThirdPartyReportTemplateApi();
            if (template?.url) {
              targetUrl = template.url;
              isTpl = true;
            }
          } catch (e) {
            console.warn("Could not fetch third party report template:", e);
          }
        }
      }

      if (targetUrl) {
        const link = document.createElement("a");
        link.href = targetUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = isTpl
          ? "Third-Party-Report-Template.pdf"
          : "Third-Party-Report.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          type: "success",
          title: "Download Complete",
          description: isTpl
            ? "Third Party Reports template downloaded successfully."
            : "Third Party Report downloaded successfully.",
        });
      } else {
        toast({
          type: "error",
          title: "Download Unavailable",
          description:
            "Third party report download link is currently unavailable. Please try again later.",
        });
      }
    } catch (err) {
      console.error("Error during download:", err);
      toast({
        type: "error",
        title: "Download Failed",
        description: "An error occurred while preparing your download.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadUrl,
    resolvedReportUrl,
    hasUploadedReport: Boolean(resolvedReportUrl || reportData?.assetId),
    reportData,
    isResolving: isResolving || isLoadingTemplate || isLoadingReport,
    isDownloading,
    isTemplate,
    handleDownload,
  };
}
