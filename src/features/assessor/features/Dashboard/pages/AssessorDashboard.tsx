"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/src/store/hooks";
import { useGetAssessorCentres } from "../../Centres/hooks";
import { useGetAssessorApplications } from "../../Applications/hooks";
import type { Application } from "../../Applications/hooks";

// Header & Overview components
import {
  AssessorHeaderBanner,
  type AssessorNavTab,
} from "../components/AssessorHeaderBanner";
import { AssessorOverviewView } from "../components/AssessorOverviewView";

// Centres feature components
import {
  AssessorCentresView,
  type AssessorCentreItem,
} from "../../Centres/components/AssessorCentresView";
import { AssessorCentreDetailView } from "../../Centres/components/AssessorCentreDetailView";
import { ApplyToCentreModal } from "../../Centres/components/ApplyToCentreModal";

// Applications feature components
import {
  AssessorApplicationsView,
  type AssessorApplicationRecord,
} from "../../Applications/components/AssessorApplicationsView";
import { AssessorApplicationDetailView } from "../../Applications/components/AssessorApplicationDetailView";

// JobBoard feature components
import {
  AssessorJobBoardView,
  type AssessorJobRecord,
} from "../../JobBoard/components/AssessorJobBoardView";
import { AssessorJobDetailView } from "../../JobBoard/components/AssessorJobDetailView";

// Settings feature components
import { AssessorSettingsView } from "../../Settings/components/AssessorSettingsView";


import { useGetCentres } from "@/src/features/shared/reference/hooks";

export const AssessorDashboard: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const userName = user?.fullName || user?.email?.split("@")[0] || "Assessor";

  const { data: centresData } = useGetAssessorCentres();
  const { data: applicationsData = [] } = useGetAssessorApplications();
  const { data: remoteCentres = [] } = useGetCentres();

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
    const directName = r.centre?.name || r.centreName;
    const resolvedName =
      directName ||
      centresMap.get(rawCentreId) ||
      centresMap.get(rawCentreId?.trim()) ||
      centresMap.get(rawCentreId?.trim()?.toLowerCase()) ||
      rawCentreId;

    const assignedCount = applicationsData.filter(
      (a) => a.centreId === rawCentreId || a.centreId === r.id,
    ).length;

    return {
      id: r.id,
      centreId: rawCentreId,
      name: resolvedName,
      role: "Assessor",
      candidateAssigned: assignedCount,
      status:
        r.status === "approved"
          ? "Active"
          : r.status === "pending"
          ? "Pending"
          : "Inactive",
      joinedAt: r.respondedAt
        ? new Date(r.respondedAt).toLocaleDateString("en-GB")
        : r.requestedAt
        ? new Date(r.requestedAt).toLocaleDateString("en-GB")
        : "-",
    };
  });

  // Derive real stat counts from API data
  const totalApplications = applicationsData.length;
  const pendingApplications = applicationsData.filter(
    (a) => a.status === "in_progress" || a.status === "draft",
  ).length;
  const completedApplications = applicationsData.filter(
    (a) => a.status === "certified",
  ).length;

  const [activeTab, setActiveTab] = useState<AssessorNavTab>("Overview");

  const [selectedCentre, setSelectedCentre] = useState<AssessorCentreItem | null>(
    null,
  );
  const [selectedApplication, setSelectedApplication] =
    useState<AssessorApplicationRecord | null>(null);
  const [selectedJob, setSelectedJob] = useState<AssessorJobRecord | null>(null);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const handleTabChange = (tab: AssessorNavTab) => {
    setActiveTab(tab);
    setSelectedCentre(null);
    setSelectedApplication(null);
    setSelectedJob(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fb] p-4 sm:p-6 select-text">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header Banner */}
        <AssessorHeaderBanner
          userName={userName}
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          selectedCentreName={selectedCentre?.name}
          onBackFromCentre={() => setSelectedCentre(null)}
          selectedApplicationName={selectedApplication?.candidateName}
          onBackFromApplication={() => setSelectedApplication(null)}
          onApplyToCentre={() => setIsApplyModalOpen(true)}
          totalCentresCount={centres.length}
          totalApplicationsCount={totalApplications}
          pendingApplicationsCount={pendingApplications}
          completedApplicationsCount={completedApplications}
        />

        {/* Tab Main Content */}
        {activeTab === "Overview" ? (
          <AssessorOverviewView
            onViewAllApplications={() => handleTabChange("Applications")}
            onSelectApplication={(app: Application) => {
              setActiveTab("Applications");
              setSelectedApplication({
                id: app.id,
                candidateName:
                  app.candidate?.name ||
                  (app.candidate?.firstName
                    ? `${app.candidate.firstName} ${app.candidate.lastName || ""}`.trim()
                    : app.candidateId),
                trade: app.trade?.name || app.tradeId || (app.type === "NSQ" ? "Standard Assessment" : "RPL"),
                assessmentType: app.type,
                status: app.status === "certified" ? "Completed" : app.status === "in_progress" ? "Ongoing" : "Pending",
                submittedAt: app.createdAt,
              });
            }}
            onApplyToCentre={() => setIsApplyModalOpen(true)}
          />
        ) : activeTab === "Centres" ? (
          selectedCentre ? (
            <AssessorCentreDetailView
              centre={selectedCentre}
              onBack={() => setSelectedCentre(null)}
              onSelectApplication={(appRecord) => {
                setActiveTab("Applications");
                setSelectedApplication(appRecord);
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
            <AssessorApplicationDetailView
              application={selectedApplication}
              onBack={() => setSelectedApplication(null)}
            />
          ) : (
            <AssessorApplicationsView
              onSelectApplication={(app) => setSelectedApplication(app)}
            />
          )
        ) : activeTab === "Job Board" ? (
          selectedJob ? (
            <AssessorJobDetailView
              job={selectedJob}
              onBack={() => setSelectedJob(null)}
            />
          ) : (
            <AssessorJobBoardView
              onSelectJob={(job) => setSelectedJob(job)}
            />
          )
        ) : activeTab === "Settings" ? (
          <AssessorSettingsView />
        ) : (
          <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[350px] text-center">
            <h3 className="text-lg font-bold text-neutral-primary">
              {activeTab} Section
            </h3>
            <p className="text-xs sm:text-sm text-neutral-secondary mt-1">
              This feature is ready for full workflow integration.
            </p>
          </div>
        )}
      </div>

      <ApplyToCentreModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
};
