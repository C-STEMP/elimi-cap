"use client";

import React, { useState, useRef, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useGetApplicationById,
  APPLICATION_DETAIL_REFRESH_INTERVAL_MS,
} from "@/src/features/shared/applications/hooks";
import { useGetMeProfile } from "@/src/features/shared/account/hooks";
import { useGetAssessorProfile } from "@/src/features/assessor/hooks";
import { getAssessorRoleContext } from "@/src/features/shared/applications/utils/assessorRole";
import { AssessorHeaderBanner } from "@/src/features/assessor/features/Dashboard/components/AssessorHeaderBanner";
import {
  AssessorApplicationDetailView,
  type AssessorDetailSubView,
} from "./AssessorApplicationDetailView";
import { NsqAssessorApplicationDetailView } from "./nsq/NsqAssessorApplicationDetailView";
import { closeUrlSubView } from "@/src/lib/navigation/url-sub-view";
import { IqamToolsDashboard } from "@/src/features/assessor/features/iqam/IqamToolsDashboard";
import type { AssessorApplicationRecord } from "./AssessorApplicationsView";
import { useAppSelector } from "@/src/store/hooks";

export const AssessorApplicationRouteView: React.FC<{ id: string }> = ({
  id,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAppSelector((state) => state.auth.user);
  const { data: meProfile } = useGetMeProfile();
  const { data: assessorProfile } = useGetAssessorProfile();
  const { data: application, isLoading } = useGetApplicationById(id, {
    refetchInterval: APPLICATION_DETAIL_REFRESH_INTERVAL_MS,
  });

  const roleCtx = useMemo(() => {
    return getAssessorRoleContext({
      application,
      user,
      meProfile,
      assessorProfile,
    });
  }, [application, user, meProfile, assessorProfile]);

  const [applicationSubView, setApplicationSubView] =
    useState<AssessorDetailSubView>("stages");
  const [canMarkAsComplete, setCanMarkAsComplete] = useState(false);
  const [triggerMarkComplete, setTriggerMarkComplete] = useState(false);
  const [nsqNavState, setNsqNavState] = useState<any>("overview");
  const [nsqSubViewTitle, setNsqSubViewTitle] = useState<string | null>(null);
  const [iqamHeaderConfig, setIqamHeaderConfig] = useState<any>(null);
  const [hasMovedToIqam, setHasMovedToIqam] = useState(false);
  const [canMoveToIqam, setCanMoveToIqam] = useState(false);
  const moveToIqamRef = useRef<(() => void) | null>(null);

  const candidateName = application
    ? application.candidate?.name ||
      (application.candidate?.firstName
        ? `${application.candidate.firstName} ${
            application.candidate.lastName || ""
          }`.trim()
        : application.candidateId || "Candidate")
    : undefined;

  const assessorRecord: AssessorApplicationRecord | null = application
    ? {
        id: application.id,
        candidateName: candidateName as string,
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
        role: (application as any).role || roleCtx.roleLabel || "Assessor",
      }
    : null;

  const handleBack = () => {
    // NSQ sub-views (a unit, observation/IQAM forms) go back to the
    // application overview, not all the way out to the applications list.
    if (application?.type === "NSQ" && nsqNavState !== "overview") {
      setNsqNavState("overview");
      setNsqSubViewTitle(null);
      if (searchParams.get("unit")) closeUrlSubView(router, pathname, searchParams);
      return;
    }
    setCanMoveToIqam(false);
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
        isNsqApplication={application?.type === "NSQ"}
        nsqSubViewTitle={nsqSubViewTitle}
        onMoveToIqam={() => moveToIqamRef.current?.()}
        hasMovedToIqam={hasMovedToIqam}
        canMoveToIqam={canMoveToIqam}
        applicationSubView={applicationSubView}
        canMarkAsComplete={canMarkAsComplete}
        onMarkAsComplete={() => setTriggerMarkComplete(true)}
        onBackFromApplication={handleBack}
        isIvApplication={
          Boolean(
            nsqNavState?.toString().startsWith("iqam") ||
              (roleCtx.isCurrentIqa && !roleCtx.isCurrentQaa) ||
              assessorRecord?.role === "Internal Verifier",
          )
        }
        activeIqamToolTitle={iqamHeaderConfig?.title}
        activeIqamBreadcrumb={iqamHeaderConfig?.breadcrumb}
        onBackFromIqamTool={() => setIqamHeaderConfig(null)}
      />

      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">
        {isLoading ? (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-pulse">
            <div className="lg:col-span-8 flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-5 bg-gray-200 rounded-full w-20" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-48" />
                </div>
              ))}
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 h-40 flex flex-col gap-3">
                  <div className="h-4 bg-gray-200 rounded w-28" />
                  <div className="h-3 bg-gray-100 rounded w-36" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
              ))}
            </div>
          </div>
        ) : !application || !assessorRecord ? (
          <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-6">
            <h3 className="text-lg font-bold text-gray-800">
              Application Not Found
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
              The application you are trying to view does not exist or has
              been removed.
            </p>
            <button
              type="button"
              onClick={() => router.push("/assessor/dashboard/applications")}
              className="px-4 py-2 bg-[#8A1538] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Back to Applications
            </button>
          </div>
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
            onMoveToIqamStatusChange={setHasMovedToIqam}
            onCanMoveToIqamChange={setCanMoveToIqam}
            onUpdateHeader={setIqamHeaderConfig}
          />
        ) : assessorRecord.role === "Internal Verifier" ? (
          <IqamToolsDashboard
            initialToolId="CON/04/IQAM"
            initialApplicationId={application.id}
            initialCentreId={application.centreId}
            initialCandidateName={assessorRecord.candidateName}
            onBack={handleBack}
            onUpdateHeader={setIqamHeaderConfig}
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
