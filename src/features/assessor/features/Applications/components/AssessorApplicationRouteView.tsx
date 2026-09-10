"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGetApplicationById } from "@/src/features/shared/applications/hooks";
import { Loader } from "@/src/components/ui/loader";
import { AssessorHeaderBanner } from "@/src/features/assessor/features/Dashboard/components/AssessorHeaderBanner";
import {
  AssessorApplicationDetailView,
  type AssessorDetailSubView,
} from "./AssessorApplicationDetailView";
import { NsqAssessorApplicationDetailView } from "./nsq/NsqAssessorApplicationDetailView";
import { IqamToolsDashboard } from "@/src/features/assessor/features/iqam/IqamToolsDashboard";
import type { AssessorApplicationRecord } from "./AssessorApplicationsView";
import { useAppSelector } from "@/src/store/hooks";

export const AssessorApplicationRouteView: React.FC<{ id: string }> = ({
  id,
}) => {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { data: application, isLoading } = useGetApplicationById(id);

  const [applicationSubView, setApplicationSubView] =
    useState<AssessorDetailSubView>("stages");
  const [canMarkAsComplete, setCanMarkAsComplete] = useState(false);
  const [triggerMarkComplete, setTriggerMarkComplete] = useState(false);
  const [nsqNavState, setNsqNavState] = useState<any>("overview");
  const [nsqSubViewTitle, setNsqSubViewTitle] = useState<string | null>(null);
  const [iqamHeaderConfig, setIqamHeaderConfig] = useState<any>(null);
  const moveToIqamRef = useRef<(() => void) | null>(null);

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <Loader tip="Loading application details..." />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-6">
        <h3 className="text-lg font-bold text-gray-800">
          Application Not Found
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          The application you are trying to view does not exist or has been
          removed.
        </p>
        <button
          type="button"
          onClick={() => router.push("/assessor/dashboard/applications")}
          className="px-4 py-2 bg-[#8A1538] text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  const candidateName =
    application.candidate?.name ||
    (application.candidate?.firstName
      ? `${application.candidate.firstName} ${
          application.candidate.lastName || ""
        }`.trim()
      : application.candidateId || "Candidate");

  const assessorRecord: AssessorApplicationRecord = {
    id: application.id,
    candidateName,
    trade:
      application.trade?.name ||
      application.tradeId ||
      (application.type === "NSQ" ? "Standard Assessment" : "RPL"),
    assessmentType: application.type,
    status:
      application.status === "certified"
        ? "Completed"
        : application.status === "in_progress"
        ? "Ongoing"
        : "Pending",
    submittedAt: application.createdAt,
    candidatePhotoUrl:
      application.candidate?.photo?.url ||
      (application.candidate as any)?.photoAssetId ||
      (application.candidate as any)?.avatar ||
      null,
    role: (application as any).role || "Assessor",
  };

  const handleBack = () => {
    if (applicationSubView !== "stages") {
      setApplicationSubView("stages");
    } else {
      router.push("/assessor/dashboard/applications");
    }
  };

  const userName =
    user?.fullName || user?.email?.split("@")[0] || "Assessor";

  return (
    <div className="min-h-screen w-full bg-[#f8f9fb] flex flex-col select-text">
      <AssessorHeaderBanner
        userName={userName}
        activeTab="Applications"
        onSelectTab={(tab) => {
          const tabSlugMap: Record<string, string> = {
            Overview: "overview",
            Centres: "centres",
            Applications: "applications",
            "IQAM Tools": "iqam-tools",
            "Job Board": "job-board",
            Payments: "payments",
            Settings: "settings",
          };
          router.push(`/assessor/dashboard/${tabSlugMap[tab] || "overview"}`);
        }}
        selectedApplicationName={candidateName}
        isNsqApplication={application.type === "NSQ"}
        nsqSubViewTitle={nsqSubViewTitle}
        onMoveToIqam={() => moveToIqamRef.current?.()}
        applicationSubView={applicationSubView}
        canMarkAsComplete={canMarkAsComplete}
        onMarkAsComplete={() => setTriggerMarkComplete(true)}
        onBackFromApplication={handleBack}
        isIvApplication={assessorRecord.role === "Internal Verifier"}
        activeIqamToolTitle={iqamHeaderConfig?.title}
        activeIqamBreadcrumb={iqamHeaderConfig?.breadcrumb}
        onBackFromIqamTool={() => setIqamHeaderConfig(null)}
      />

      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">
        {assessorRecord.role === "Internal Verifier" ? (
          <IqamToolsDashboard
            initialToolId="CON/04/IQAM"
            initialCandidateName={assessorRecord.candidateName}
            onBack={handleBack}
            onUpdateHeader={setIqamHeaderConfig}
          />
        ) : application.type === "NSQ" ? (
          <NsqAssessorApplicationDetailView
            application={assessorRecord}
            onBack={handleBack}
            onSubViewChange={setNsqSubViewTitle}
            subViewNavState={nsqNavState}
            onSubViewNavStateChange={setNsqNavState}
            onRegisterMoveToIqam={(fn) => {
              moveToIqamRef.current = fn;
            }}
          />
        ) : (
          <AssessorApplicationDetailView
            application={assessorRecord}
            subView={applicationSubView}
            onSubViewChange={setApplicationSubView}
            onAllApprovedChange={setCanMarkAsComplete}
            onMarkAsComplete={() => {
              setApplicationSubView("stages");
            }}
            triggerMarkComplete={triggerMarkComplete}
            onResetTriggerMarkComplete={() => setTriggerMarkComplete(false)}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
};
