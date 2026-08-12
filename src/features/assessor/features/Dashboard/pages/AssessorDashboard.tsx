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


export const AssessorDashboard: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const userName = user?.fullName || user?.email?.split("@")[0] || "Assessor";

  const { data: centresData } = useGetAssessorCentres();
  const { data: applicationsData = [] } = useGetAssessorApplications();

  const centres: AssessorCentreItem[] = (centresData ?? []).map((r) => ({
    id: r.id,
    name: r.centreId,
    role: "Assessor",
    candidateAssigned: "-",
    status:
      r.status === "approved"
        ? "Active"
        : r.status === "pending"
        ? "Pending"
        : "Inactive",
    joinedAt: r.respondedAt
      ? new Date(r.respondedAt).toLocaleDateString("en-GB")
      : "-",
  }));

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
                candidateName: app.candidateId,
                trade: app.type,
                assessmentType: app.type,
                status: app.status === "certified" ? "Completed" : "Pending",
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
