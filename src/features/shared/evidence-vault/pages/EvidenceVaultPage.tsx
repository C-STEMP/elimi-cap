"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import { UpcomingCard } from "@/features/candidate/features/Dashboard/components/UpcomingCard";
import { FacilitatorCard } from "@/features/candidate/features/Dashboard/components/FacilitatorCard";
import { buildFacilitatorData } from "@/features/candidate/features/Application/utils/applicationDetailsHelpers";
import { StatusModal } from "@/components/status-modal";
import { useToast } from "@/src/components/ui/toast";
import {
  useGetApplicationById,
  useGetInterviewSchedule,
} from "@/src/features/shared/applications/hooks";
import { CandidateEvidenceVaultSection } from "../components/CandidateEvidenceVaultSection";

interface EvidenceVaultPageProps {
  applicationId?: string;
}

export const EvidenceVaultPage: React.FC<EvidenceVaultPageProps> = ({
  applicationId = "",
}) => {
  const { toast } = useToast();
  const pathname = usePathname();

  const { data: apiApp, isLoading: isApplicationLoading } =
    useGetApplicationById(applicationId);
  const isInterviewStage = Boolean(
    apiApp?.currentStageKey === "interview" ||
      (apiApp as any)?.stages?.some(
        (s: any) => s.key === "interview" && s.status !== "not_started",
      ),
  );
  const { data: interviewSchedule } = useGetInterviewSchedule(applicationId, {
    enabled: Boolean(applicationId && isInterviewStage),
  });

  const rawTrade =
    (apiApp as any)?.trade?.name ||
    (typeof (apiApp as any)?.trade === "string" ? (apiApp as any)?.trade : "");
  const typeLabel =
    apiApp?.type === "NSQ" ? "Standard Assessment" : apiApp?.type || "RPL";
  const dynamicTitle = rawTrade
    ? `${rawTrade} (${typeLabel})`
    : `${typeLabel} Application`;

  const facilitatorData = React.useMemo(
    () =>
      buildFacilitatorData(
        (apiApp as any)?.assignedFacilitator ||
          (apiApp as any)?.facilitator ||
          (apiApp as any)?.unitAssessor ||
          (apiApp as any)?.assessor,
        rawTrade,
      ),
    [apiApp, rawTrade],
  );

  const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);

  const application = apiApp
    ? {
        id: apiApp.id,
        title: dynamicTitle,
        subtitle: `Status: ${apiApp.status}`,
        status: "evidence_upload" as const,
        createdAt: apiApp.createdAt,
        updatedAt: apiApp.updatedAt ?? apiApp.createdAt,
      }
    : {
        id: applicationId || "",
        title: "Application Evidence Vault",
        subtitle: "Evidence Vault",
        status: "evidence_upload" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col min-h-screen"
    >
      <HeaderBanner
        backHref={
          pathname?.startsWith("/applications")
            ? `/applications/${application.id}`
            : `/dashboard/applications/${application.id}`
        }
        backTitle="Evidence Vault"
        breadcrumbs={[
          {
            label: "My Applications",
            href: "/dashboard/applications",
          },
          {
            label: application.title,
            href: pathname?.startsWith("/applications")
              ? `/applications/${application.id}`
              : `/dashboard/applications/${application.id}`,
          },
          { label: "Evidence Vault" },
        ]}
        showCreateButton={false}
      />

      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
            <CandidateEvidenceVaultSection
              applicationId={application.id}
              application={apiApp}
              isApplicationLoading={isApplicationLoading}
              accordion
              defaultOpenSection={4}
            />
          </div>

          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
            <CalendarWidget
              panelInterviewDate={interviewSchedule?.scheduledAt || undefined}
            />
            <UpcomingCard
              interview={
                interviewSchedule?.scheduledAt
                  ? {
                      title: "Panel Interview",
                      date: new Date(
                        interviewSchedule.scheduledAt,
                      ).toLocaleDateString("en-GB"),
                      time: new Date(
                        interviewSchedule.scheduledAt,
                      ).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }),
                      mode: interviewSchedule.mode,
                      liveUrl:
                        interviewSchedule.mode === "online"
                          ? interviewSchedule.link
                          : undefined,
                      location: interviewSchedule.location || "",
                    }
                  : null
              }
            />
            <FacilitatorCard
              facilitator={facilitatorData}
              onRequestCall={() => setIsCallRequestModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <StatusModal
        isOpen={isCallRequestModalOpen}
        onClose={() => setIsCallRequestModalOpen(false)}
        type="success"
        title="Call Request Sent Successfully"
        description="Your call request has been sent successfully. Your facilitator will get back to you soon."
        actionLabel="Close"
        onAction={() => {
          setIsCallRequestModalOpen(false);
          toast({
            type: "success",
            title: "Call Requested",
            description: "Facilitator will contact you soon.",
          });
        }}
      />
    </motion.div>
  );
};
