"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useAppSelector } from "@/src/store/hooks";
import { useGetAssessorCentres } from "../../Centres/hooks";
import { useGetAssessorApplications } from "../../Applications/hooks";
import { useGetAssessorSummary } from "@/src/features/shared/assessor/hooks";
import type { Application } from "../../Applications/hooks";

import {
  AssessorHeaderBanner,
  type AssessorNavTab,
} from "../components/AssessorHeaderBanner";
import type { IqamToolId } from "../../iqam/types/iqam.types";
import { AssessorOverviewView } from "../components/AssessorOverviewView";

import dynamic from "next/dynamic";
import { Loader } from "@/src/components/ui/loader";

const AssessorTabLoadingFallback = () => (
  <div className="w-full min-h-75 flex items-center justify-center">
    <Loader tip="Loading section..." />
  </div>
);

import type { AssessorCentreItem } from "../../Centres/components/AssessorCentresView";
const AssessorCentresView = dynamic(
  () =>
    import("../../Centres/components/AssessorCentresView").then(
      (m) => m.AssessorCentresView,
    ),
  { loading: () => <AssessorTabLoadingFallback /> },
);
const AssessorCentreDetailView = dynamic(
  () =>
    import("../../Centres/components/AssessorCentreDetailView").then(
      (m) => m.AssessorCentreDetailView,
    ),
  { loading: () => <AssessorTabLoadingFallback /> },
);
const ApplyToCentreModal = dynamic(() =>
  import("../../Centres/components/ApplyToCentreModal").then(
    (m) => m.ApplyToCentreModal,
  ),
);

import type { AssessorApplicationRecord } from "../../Applications/components/AssessorApplicationsView";
import type { AssessorDetailSubView } from "../../Applications/components/AssessorApplicationDetailView";
const AssessorApplicationsView = dynamic(
  () =>
    import("../../Applications/components/AssessorApplicationsView").then(
      (m) => m.AssessorApplicationsView,
    ),
  { loading: () => <AssessorTabLoadingFallback /> },
);
const AssessorApplicationDetailView = dynamic(
  () =>
    import("../../Applications/components/AssessorApplicationDetailView").then(
      (m) => m.AssessorApplicationDetailView,
    ),
  { loading: () => <AssessorTabLoadingFallback /> },
);
const NsqAssessorApplicationDetailView = dynamic(
  () =>
    import("../../Applications/components/nsq/NsqAssessorApplicationDetailView").then(
      (m) => m.NsqAssessorApplicationDetailView,
    ),
  { loading: () => <AssessorTabLoadingFallback /> },
);

import type { AssessorJobRecord } from "../../JobBoard/components/AssessorJobBoardView";
const AssessorJobBoardView = dynamic(
  () =>
    import("../../JobBoard/components/AssessorJobBoardView").then(
      (m) => m.AssessorJobBoardView,
    ),
  { loading: () => <AssessorTabLoadingFallback /> },
);
const AssessorJobDetailView = dynamic(
  () =>
    import("../../JobBoard/components/AssessorJobDetailView").then(
      (m) => m.AssessorJobDetailView,
    ),
  { loading: () => <AssessorTabLoadingFallback /> },
);

const AssessorSettingsView = dynamic(
  () =>
    import("../../Settings/components/AssessorSettingsView").then(
      (m) => m.AssessorSettingsView,
    ),
  { loading: () => <AssessorTabLoadingFallback /> },
);

const IqamToolsDashboard = dynamic(
  () =>
    import("../../iqam/IqamToolsDashboard").then(
      (m) => m.IqamToolsDashboard,
    ),
  { loading: () => <AssessorTabLoadingFallback /> },
);

import { useGetCentres } from "@/src/features/shared/reference/hooks";
import { useToast } from "@/src/components/ui/toast";

export const AssessorDashboard: React.FC = () => {
  const { toast } = useToast();
  const user = useAppSelector((state) => state.auth.user);
  const userName = user?.fullName || user?.email?.split("@")[0] || "Assessor";

  const router = useRouter();
  const params = useParams();

  const TAB_TO_SLUG: Record<AssessorNavTab, string> = {
    Overview: "overview",
    Centres: "centres",
    Applications: "applications",
    "IQAM Tools": "iqam-tools",
    "Job Board": "job-board",
    Payments: "payments",
    Settings: "settings",
  };

  const SLUG_TO_TAB: Record<string, AssessorNavTab> = {
    overview: "Overview",
    centres: "Centres",
    applications: "Applications",
    "iqam-tools": "IQAM Tools",
    "job-board": "Job Board",
    payments: "Payments",
    settings: "Settings",
  };

  const routeTabSlug = params?.tab as string | undefined;
  const initialTab =
    routeTabSlug && SLUG_TO_TAB[routeTabSlug]
      ? SLUG_TO_TAB[routeTabSlug]
      : "Overview";

  const [activeTab, setActiveTab] = useState<AssessorNavTab>(initialTab);

  useEffect(() => {
    if (routeTabSlug && SLUG_TO_TAB[routeTabSlug]) {
      setActiveTab(SLUG_TO_TAB[routeTabSlug]);
    }
  }, [routeTabSlug]);

  const isCentresActive = activeTab === "Centres";
  const isAppsActive = activeTab === "Applications";
  const isOverviewActive = activeTab === "Overview";

  const { data: summaryData } = useGetAssessorSummary();
  const { data: centresData } = useGetAssessorCentres(undefined, {
    enabled: isCentresActive || isOverviewActive,
  });
  const { data: applicationsData = [] } = useGetAssessorApplications(
    undefined,
    {
      enabled: isAppsActive || isOverviewActive,
    },
  );
  const { data: remoteCentres = [] } = useGetCentres(undefined, {
    enabled: isCentresActive,
  });

  const centresMap = React.useMemo(() => {
    const map = new Map<string, string>();
    const list = Array.isArray(remoteCentres)
      ? remoteCentres
      : (remoteCentres as any)?.data || [];
    list.forEach((c: any) => {
      if (c && c.id && c.name) {
        map.set(c.id, c.name);
        map.set(c.id.trim(), c.name);
        map.set(c.id.trim().toLowerCase(), c.name);
      }
    });
    return map;
  }, [remoteCentres]);

  const centres: AssessorCentreItem[] = (
    Array.isArray(centresData) ? centresData : (centresData as any)?.data || []
  ).map((r: any) => {
    const rawCentreId = r.centreId || r.id;
    const directName = r.centreName || r.centre?.name;
    const resolvedName =
      directName ||
      centresMap.get(rawCentreId) ||
      centresMap.get(rawCentreId?.trim()) ||
      centresMap.get(rawCentreId?.trim()?.toLowerCase()) ||
      rawCentreId;

    const assignedCount =
      r.assignedCount !== undefined
        ? r.assignedCount
        : applicationsData.filter(
            (a) => a.centreId === rawCentreId || a.centreId === r.id,
          ).length;

    const roleTitle =
      Array.isArray(r.roles) && r.roles.length > 0
        ? r.roles.map((rl: string) => rl.replace(/_/g, " ")).join(", ")
        : r.preferredRole
          ? r.preferredRole.replace(/_/g, " ")
          : "Assessor";

    return {
      id: r.retainedRequestId || r.id,
      centreId: rawCentreId,
      name: resolvedName,
      role: roleTitle.charAt(0).toUpperCase() + roleTitle.slice(1),
      candidateAssigned: assignedCount,
      status:
        r.status === "approved"
          ? "Active"
          : r.status === "pending"
            ? "Pending"
            : "Inactive",
      joinedAt: r.joinedAt
        ? new Date(r.joinedAt).toLocaleDateString("en-GB")
        : r.respondedAt
          ? new Date(r.respondedAt).toLocaleDateString("en-GB")
          : r.requestedAt
            ? new Date(r.requestedAt).toLocaleDateString("en-GB")
            : "-",
    };
  });

  const totalCentres = summaryData?.totalCentres ?? centres.length;
  const totalApplications =
    summaryData?.totalApplications ?? applicationsData.length;
  const pendingApplications =
    summaryData?.pendingApplications ??
    applicationsData.filter(
      (a) => a.status === "in_progress" || a.status === "draft",
    ).length;
  const completedApplications =
    summaryData?.completedApplications ??
    applicationsData.filter((a) => a.status === "certified").length;
  const archivedApplications =
    summaryData?.archivedApplications ??
    applicationsData.filter(
      (a) => a.status === "rejected" || a.status === "withdrawn",
    ).length;

  const [selectedCentre, setSelectedCentre] =
    useState<AssessorCentreItem | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<AssessorApplicationRecord | null>(null);
  const [applicationSubView, setApplicationSubView] =
    useState<AssessorDetailSubView>("stages");
  const [canMarkAsComplete, setCanMarkAsComplete] = useState(false);
  const [triggerMarkComplete, setTriggerMarkComplete] = useState(false);
  const [selectedJob, setSelectedJob] = useState<AssessorJobRecord | null>(
    null,
  );
  const [selectedIqamTool, setSelectedIqamTool] = useState<IqamToolId | null>(null);
  const [iqamHeaderConfig, setIqamHeaderConfig] = useState<{
    title: string;
    breadcrumb: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);
  const [nsqSubViewTitle, setNsqSubViewTitle] = useState<string | null>(null);
  const [nsqNavState, setNsqNavState] = useState<any>("overview");
  const moveToIqamRef = React.useRef<(() => void) | null>(null);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const handleTabChange = (tab: AssessorNavTab) => {
    setActiveTab(tab);
    setSelectedCentre(null);
    setSelectedApplication(null);
    setNsqSubViewTitle(null);
    setNsqNavState("overview");
    setApplicationSubView("stages");
    setCanMarkAsComplete(false);
    setTriggerMarkComplete(false);
    setSelectedJob(null);
    setSelectedIqamTool(null);
    setIqamHeaderConfig(null);
    const slug = TAB_TO_SLUG[tab] || "overview";
    router.push(`/assessor/dashboard/${slug}`);
  };

  const handleBackFromApplication = () => {
    if (selectedApplication?.role === "Internal Verifier") {
      setSelectedApplication(null);
      setIqamHeaderConfig(null);
      return;
    }

    if (selectedApplication?.assessmentType === "NSQ") {
      if (nsqNavState !== "overview") {
        setNsqNavState("overview");
        setNsqSubViewTitle(null);
      } else {
        setSelectedApplication(null);
        setNsqSubViewTitle(null);
        setNsqNavState("overview");
      }
      return;
    }

    if (applicationSubView !== "stages") {
      setApplicationSubView("stages");
    } else {
      setSelectedApplication(null);
      setCanMarkAsComplete(false);
      setTriggerMarkComplete(false);
    }
  };

  const handleTriggerMarkComplete = () => {
    setTriggerMarkComplete(true);
  };

  const handleMarkAsCompleteFinished = () => {
    toast({
      type: "success",
      title: "Folder Marked As Complete",
      description: "You have successfully marked this folder as complete.",
    });
    setApplicationSubView("stages");
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fb] flex flex-col select-text">
      {/* Header Banner */}
      <AssessorHeaderBanner
        userName={userName}
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        selectedCentreName={selectedCentre?.name}
        onBackFromCentre={() => setSelectedCentre(null)}
        selectedApplicationName={selectedApplication?.candidateName}
        isNsqApplication={selectedApplication?.assessmentType === "NSQ"}
        nsqSubViewTitle={nsqSubViewTitle}
        onMoveToIqam={() => moveToIqamRef.current?.()}
        applicationSubView={applicationSubView}
        canMarkAsComplete={canMarkAsComplete}
        onMarkAsComplete={handleTriggerMarkComplete}
        onBackFromApplication={handleBackFromApplication}
        isIvApplication={selectedApplication?.role === "Internal Verifier"}
        activeIqamToolTitle={iqamHeaderConfig?.title || (selectedIqamTool ? "IQAM Tool" : null)}
        activeIqamBreadcrumb={iqamHeaderConfig?.breadcrumb}
        onBackFromIqamTool={() => {
          setSelectedIqamTool(null);
          setIqamHeaderConfig(null);
        }}
        iqamActionLabel={iqamHeaderConfig?.actionLabel}
        onIqamAction={iqamHeaderConfig?.onAction}
        selectedJobTitle={selectedJob?.title}
        onBackFromJob={() => setSelectedJob(null)}
        totalCentresCount={totalCentres}
        totalApplicationsCount={totalApplications}
        pendingApplicationsCount={pendingApplications}
        completedApplicationsCount={completedApplications}
        archivedApplicationsCount={archivedApplications}
        onApplyToCentre={() => setIsApplyModalOpen(true)}
      />

      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">
        {/* Tab Main Content */}
        {activeTab === "Overview" ? (
          <AssessorOverviewView
            onViewAllApplications={() => handleTabChange("Applications")}
            onSelectApplication={(app: Application) => {
              router.push(`/applications/${app.id}?from=assessor`);
            }}
            onApplyToCentre={() => setIsApplyModalOpen(true)}
          />
        ) : activeTab === "Centres" ? (
          selectedCentre ? (
            <AssessorCentreDetailView
              centre={selectedCentre}
              onBack={() => setSelectedCentre(null)}
              onSelectApplication={(appRecord) => {
                router.push(`/applications/${appRecord.id}?from=assessor`);
              }}
            />
          ) : (
            <AssessorCentresView
              centres={centres}
              onSelectCentre={(c) => setSelectedCentre(c)}
              onApplyToCentre={() => setIsApplyModalOpen(true)}
            />
          )
        ) : activeTab === "Applications" ? (
          selectedApplication ? (
            selectedApplication.role === "Internal Verifier" ? (
              <IqamToolsDashboard
                initialToolId="CON/04/IQAM"
                initialCandidateName={selectedApplication.candidateName}
                onBack={handleBackFromApplication}
                onUpdateHeader={setIqamHeaderConfig}
              />
            ) : selectedApplication.assessmentType === "NSQ" ? (
              <NsqAssessorApplicationDetailView
                application={selectedApplication}
                onBack={handleBackFromApplication}
                onSubViewChange={setNsqSubViewTitle}
                subViewNavState={nsqNavState}
                onSubViewNavStateChange={setNsqNavState}
                onRegisterMoveToIqam={(fn) => {
                  moveToIqamRef.current = fn;
                }}
              />
            ) : (
              <AssessorApplicationDetailView
                application={selectedApplication}
                subView={applicationSubView}
                onSubViewChange={setApplicationSubView}
                onAllApprovedChange={setCanMarkAsComplete}
                onMarkAsComplete={handleMarkAsCompleteFinished}
                triggerMarkComplete={triggerMarkComplete}
                onResetTriggerMarkComplete={() => setTriggerMarkComplete(false)}
                onBack={handleBackFromApplication}
              />
            )
          ) : (
            <AssessorApplicationsView
              onSelectApplication={(app) => {
                router.push(`/applications/${app.id}?from=assessor`);
              }}
            />
          )
        ) : activeTab === "Job Board" ? (
          selectedJob ? (
            <AssessorJobDetailView
              job={selectedJob}
              onBack={() => setSelectedJob(null)}
            />
          ) : (
            <AssessorJobBoardView onSelectJob={(job) => setSelectedJob(job)} />
          )
        ) : activeTab === "IQAM Tools" ? (
          <IqamToolsDashboard
            activeTool={selectedIqamTool}
            onToolSelect={(toolId) => {
              setSelectedIqamTool(toolId);
              if (!toolId) setIqamHeaderConfig(null);
            }}
            onBack={() => {
              setSelectedIqamTool(null);
              setIqamHeaderConfig(null);
            }}
            onUpdateHeader={setIqamHeaderConfig}
          />
        ) : activeTab === "Settings" ? (
          <AssessorSettingsView />
        ) : (
          <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-87.5 text-center">
            <h3 className="text-lg font-bold text-neutral-primary">
              {activeTab} Section
            </h3>
            <p className="text-xs sm:text-sm text-neutral-secondary mt-1">
              This feature is ready for full workflow integration.
            </p>
          </div>
        )}
      </div>

      {isApplyModalOpen && (
        <ApplyToCentreModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onSuccess={() => setIsApplyModalOpen(false)}
        />
      )}
    </div>
  );
};
