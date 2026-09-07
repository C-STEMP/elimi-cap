"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AssessmentCentreHeader } from "../features/Dashboard/components/AssessmentCentreHeader";
import { NotificationDrawer } from "../features/Dashboard/components/NotificationDrawer";
import dynamic from "next/dynamic";
import { Loader } from "@/src/components/ui/loader";
import type { StaffStatusModalMode } from "../features/Staff/components/StaffStatusModal";

const TabLoadingFallback = () => (
  <div className="w-full min-h-75 flex items-center justify-center">
    <Loader tip="Loading section..." />
  </div>
);

const BroadcastModal = dynamic(() =>
  import("../features/Dashboard/components/BroadcastModal").then(
    (m) => m.BroadcastModal,
  ),
);
const AddStaffModal = dynamic(() =>
  import("../features/Staff/components/AddStaffModal").then(
    (m) => m.AddStaffModal,
  ),
);
const StaffStatusModal = dynamic(() =>
  import("../features/Staff/components/StaffStatusModal").then(
    (m) => m.StaffStatusModal,
  ),
);
const PostJobModal = dynamic(() =>
  import("../features/JobListing/components/PostJobModal").then(
    (m) => m.PostJobModal,
  ),
);
const CreatePanelModal = dynamic(() =>
  import("../features/Applications/components/CreatePanelModal").then(
    (m) => m.CreatePanelModal,
  ),
);
const CreateInterviewModal = dynamic(() =>
  import("../features/Applications/components/CreateInterviewModal").then(
    (m) => m.CreateInterviewModal,
  ),
);
const ScheduleInterviewModal = dynamic(() =>
  import("../features/Applications/components/ScheduleInterviewModal").then(
    (m) => m.ScheduleInterviewModal,
  ),
);
const PromptCreatePanelModal = dynamic(() =>
  import("../features/Applications/components/PromptCreatePanelModal").then(
    (m) => m.PromptCreatePanelModal,
  ),
);
const WithdrawModal = dynamic(() =>
  import("../features/Payment/components/WithdrawModal").then(
    (m) => m.WithdrawModal,
  ),
);
const TransactionReceiptModal = dynamic(() =>
  import("../features/Payment/components/TransactionReceiptModal").then(
    (m) => m.TransactionReceiptModal,
  ),
);

import { OverviewTab } from "../features/Dashboard/components/OverviewTab";

const StaffTab = dynamic(
  () => import("../features/Staff/components/StaffTab").then((m) => m.StaffTab),
  { loading: () => <TabLoadingFallback /> },
);
const ApplicationsTab = dynamic(
  () =>
    import("../features/Applications/components/ApplicationsTab").then(
      (m) => m.ApplicationsTab,
    ),
  { loading: () => <TabLoadingFallback /> },
);
const JobListingTab = dynamic(
  () =>
    import("../features/JobListing/components/JobListingTab").then(
      (m) => m.JobListingTab,
    ),
  { loading: () => <TabLoadingFallback /> },
);
const AssessorRequestTab = dynamic(
  () =>
    import("../features/AssessorRequest/components/AssessorRequestTab").then(
      (m) => m.AssessorRequestTab,
    ),
  { loading: () => <TabLoadingFallback /> },
);
const AssessorsTab = dynamic(
  () =>
    import("../features/Assessor/components/AssessorsTab").then(
      (m) => m.AssessorsTab,
    ),
  { loading: () => <TabLoadingFallback /> },
);
const PaymentsTab = dynamic(
  () =>
    import("../features/Payment/components/PaymentsTab").then(
      (m) => m.PaymentsTab,
    ),
  { loading: () => <TabLoadingFallback /> },
);
const MessagesTab = dynamic(
  () =>
    import("../features/Dashboard/components/MessagesTab").then(
      (m) => m.MessagesTab,
    ),
  { loading: () => <TabLoadingFallback /> },
);
const SettingsTab = dynamic(
  () =>
    import("../features/Settings/components/SettingsTab").then(
      (m) => m.SettingsTab,
    ),
  { loading: () => <TabLoadingFallback /> },
);

import { StaffHeader } from "../features/Staff/components/StaffHeader";
import { ApplicationsHeader } from "../features/Applications/components/ApplicationsHeader";
import { JobListingHeader } from "../features/JobListing/components/JobListingHeader";
import { AssessorRequestHeader } from "../features/AssessorRequest/components/AssessorRequestHeader";
import { AssessorsHeader } from "../features/Assessor/components/AssessorsHeader";
import { PaymentsHeader } from "../features/Payment/components/PaymentsHeader";
import { SettingsHeader } from "../features/Settings/components/SettingsHeader";
import { MessagesHeader } from "../features/Dashboard/components/MessagesHeader";

import { AssessmentCentreTab, PaymentTransaction } from "../types";
import { type InterviewRowData } from "../features/Applications/components/ViewInterviewDetailModal";
import { useAppSelector } from "@/src/store/hooks";
import {
  useGetCentreDashboard,
  useGetCentreProfile,
  useGetCentrePanels,
  useGetCentreInterviews,
} from "@/src/features/shared/centre/hooks";
import { useReviewApplication } from "@/src/features/shared/applications/hooks";
import { useGetMe } from "@/src/features/shared/account/hooks";
import {
  saveCentreId,
  saveCentreRole,
  getCentreRole,
} from "@/src/lib/auth-storage";
import { getPermittedTabs, normalizeRole, RoleType } from "../utils/rbac";

export const AssessmentCentreDashboardPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const user = useAppSelector((state) => state.auth.user);
  const { data: meData } = useGetMe();
  const activeCentre = meData?.centres?.[0];

  useEffect(() => {
    if (activeCentre?.centreId) saveCentreId(activeCentre.centreId);
    if (activeCentre?.role) saveCentreRole(activeCentre.role);
  }, [activeCentre]);

  const activeRole: RoleType = normalizeRole(
    activeCentre?.role ||
      user?.centreRole ||
      (typeof window !== "undefined" ? getCentreRole() : null) ||
      user?.role,
  );

  const routeTab =
    (params?.tab as AssessmentCentreTab) ||
    (searchParams.get("tab") as AssessmentCentreTab) ||
    "overview";
  const [activeTab, setActiveTabState] =
    useState<AssessmentCentreTab>(routeTab);

  useEffect(() => {
    if (routeTab && routeTab !== activeTab) {
      setActiveTabState(routeTab);
    }
  }, [routeTab]);

  const handleSelectTab = (tab: AssessmentCentreTab) => {
    setActiveTabState(tab);
    router.push(`/assessment-centre/dashboard/${tab}`);
  };

  const { data: dashboardData } = useGetCentreDashboard();
  const isApplicationsTab = activeTab === "applications";
  const { data: centreProfile } = useGetCentreProfile({
    enabled: activeTab === "overview",
  });
  const { data: centrePanels = [] } = useGetCentrePanels(undefined, {
    enabled: isApplicationsTab,
  });
  const { data: centreInterviews = [] } = useGetCentreInterviews(undefined, {
    enabled: isApplicationsTab,
  });
  const reviewMutation = useReviewApplication();

  const hasActivity =
    (dashboardData?.kpis?.applications ?? 0) > 0 ||
    (dashboardData?.kpis?.staff ?? 0) > 0 ||
    (dashboardData?.kpis?.assessors ?? 0) > 0;

  useEffect(() => {
    const permitted = getPermittedTabs(activeRole);
    if (!permitted.includes(activeTab)) {
      handleSelectTab("overview");
    }
  }, [activeRole, activeTab]);

  // Modal and Selection State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [selectedCandidateName, setSelectedCandidateName] = useState<
    string | null
  >(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [showEvidenceVault, setShowEvidenceVault] = useState(false);
  const [showSelfAssessmentForm, setShowSelfAssessmentForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    null,
  );
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isCreatePanelModalOpen, setIsCreatePanelModalOpen] = useState(false);
  const [isCreateInterviewModalOpen, setIsCreateInterviewModalOpen] =
    useState(false);
  const [isPromptCreatePanelModalOpen, setIsPromptCreatePanelModalOpen] =
    useState(false);
  const [isScheduleInterviewModalOpen, setIsScheduleInterviewModalOpen] =
    useState(false);
  const [selectedInterview, setSelectedInterview] =
    useState<InterviewRowData | null>(null);
  const [selectedAssessorId, setSelectedAssessorId] = useState<string | null>(
    null,
  );
  const [selectedAssessorRequestId, setSelectedAssessorRequestId] = useState<
    string | null
  >(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] =
    useState<PaymentTransaction | null>(null);
  const [isStaffDeactivateModalOpen, setIsStaffDeactivateModalOpen] =
    useState(false);
  const [staffDeactivateModalMode, setStaffDeactivateModalMode] =
    useState<StaffStatusModalMode>("confirm-deactivate");
  const [isAssessorDeactivateModalOpen, setIsAssessorDeactivateModalOpen] =
    useState(false);
  const [assessorDeactivateModalMode, setAssessorDeactivateModalMode] =
    useState<StaffStatusModalMode>("confirm-deactivate");

  const handleOpenScheduleInterview = () => {
    const hasPanels =
      (centrePanels && centrePanels.length > 0) ||
      (centreInterviews && centreInterviews.length > 0);
    if (!hasPanels) setIsPromptCreatePanelModalOpen(true);
    else setIsScheduleInterviewModalOpen(true);
  };

  const renderHeaderContent = () => {
    switch (activeTab) {
      case "staff":
        return (
          <StaffHeader
            selectedStaffId={selectedStaffId}
            onBack={() => setSelectedStaffId(null)}
            onAddStaff={() => setIsAddStaffModalOpen(true)}
            onDeactivate={(mode) => {
              setStaffDeactivateModalMode(mode);
              setIsStaffDeactivateModalOpen(true);
            }}
          />
        );
      case "applications":
        return (
          <ApplicationsHeader
            selectedCandidateName={selectedCandidateName}
            selectedInterviewTitle={selectedInterview?.title || null}
            showSelfAssessmentForm={showSelfAssessmentForm}
            showEvidenceVault={showEvidenceVault}
            showCandidateForm={showCandidateForm}
            onBackToList={() => {
              setSelectedCandidateName(null);
              setSelectedApplicationId(null);
              setSelectedInterview(null);
            }}
            onBackFromInterview={() => setSelectedInterview(null)}
            onBackFromSelfAssessment={() => setShowSelfAssessmentForm(false)}
            onBackFromEvidenceVault={() => setShowEvidenceVault(false)}
            onBackFromCandidateForm={() => setShowCandidateForm(false)}
            onAcceptApplication={() => {
              if (selectedApplicationId) {
                reviewMutation.mutate({
                  id: selectedApplicationId,
                  payload: {
                    decision: "approve",
                    stageKey: "application_form",
                    feedback: "Accepted by Assessment Centre",
                  },
                });
              }
            }}
            onCreatePanel={() => setIsCreatePanelModalOpen(true)}
            onCreateInterview={() => setIsCreateInterviewModalOpen(true)}
            onScheduleInterview={handleOpenScheduleInterview}
          />
        );
      case "job-listing":
        return (
          <JobListingHeader
            selectedJobId={selectedJobId}
            selectedApplicantId={selectedApplicantId}
            onBackToList={() => {
              setSelectedJobId(null);
              setSelectedApplicantId(null);
            }}
            onBackFromJob={() => setSelectedJobId(null)}
            onBackFromApplicant={() => {
              setSelectedApplicantId(null);
              setSelectedJobId(null);
            }}
            onPostRequest={() => setIsPostJobModalOpen(true)}
            onMarkAsFilled={() => setSelectedJobId(null)}
          />
        );
      case "assessor-request":
        return (
          <AssessorRequestHeader
            selectedAssessorRequestId={selectedAssessorRequestId}
            onBackToList={() => setSelectedAssessorRequestId(null)}
          />
        );
      case "assessors":
        return (
          <AssessorsHeader
            selectedAssessorId={selectedAssessorId}
            onBackToList={() => setSelectedAssessorId(null)}
            onDeactivate={(mode) => {
              setAssessorDeactivateModalMode(mode);
              setIsAssessorDeactivateModalOpen(true);
            }}
            userRole={activeRole}
          />
        );
      case "payments":
        return (
          <PaymentsHeader
            onWithdrawFunds={() => setIsWithdrawModalOpen(true)}
          />
        );
      case "settings":
        return <SettingsHeader />;
      case "messages":
        return (
          <MessagesHeader
            userRole={activeRole}
            onSendBroadcast={() => setIsBroadcastModalOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col font-sans select-text">
      <AssessmentCentreHeader
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        showStats={activeTab === "overview"}
        userRole={activeRole}
      >
        {renderHeaderContent()}
      </AssessmentCentreHeader>

      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6 sm:gap-8">
        {activeTab === "overview" && (
          <OverviewTab
            activeRole={activeRole}
            centreProfile={centreProfile}
            hasActivity={hasActivity}
            onNavigateToApplications={(appId) => {
              handleSelectTab("applications");
              if (appId) {
                setSelectedApplicationId(appId);
                setSelectedCandidateName("Candidate");
              }
            }}
          />
        )}
        {activeTab === "messages" && <MessagesTab />}
        {activeTab === "staff" && (
          <StaffTab
            activeRole={activeRole}
            selectedStaffId={selectedStaffId}
            onSelectStaff={setSelectedStaffId}
            onOpenAddStaffModal={() => setIsAddStaffModalOpen(true)}
          />
        )}
        {activeTab === "applications" && (
          <ApplicationsTab
            selectedInterview={selectedInterview}
            selectedCandidateName={selectedCandidateName}
            selectedApplicationId={selectedApplicationId}
            showCandidateForm={showCandidateForm}
            showEvidenceVault={showEvidenceVault}
            showSelfAssessmentForm={showSelfAssessmentForm}
            onSelectInterview={setSelectedInterview}
            onSelectCandidate={(name, id) => {
              setSelectedCandidateName(name);
              setSelectedApplicationId(id || null);
            }}
            onCloseCandidateForm={() => setShowCandidateForm(false)}
            onOpenCandidateForm={() => setShowCandidateForm(true)}
            onCloseEvidenceVault={() => setShowEvidenceVault(false)}
            onOpenEvidenceVault={() => setShowEvidenceVault(true)}
            onCloseSelfAssessmentForm={() => setShowSelfAssessmentForm(false)}
            onOpenSelfAssessmentForm={() => setShowSelfAssessmentForm(true)}
            onOpenCreatePanel={() => setIsCreatePanelModalOpen(true)}
            onOpenCreateInterview={() => setIsCreateInterviewModalOpen(true)}
            onOpenScheduleInterview={handleOpenScheduleInterview}
          />
        )}
        {activeTab === "job-listing" && (
          <JobListingTab
            selectedJobId={selectedJobId}
            selectedApplicantId={selectedApplicantId}
            onSelectJob={setSelectedJobId}
            onSelectApplicant={setSelectedApplicantId}
            onOpenPostJobModal={() => setIsPostJobModalOpen(true)}
          />
        )}
        {activeTab === "assessor-request" && (
          <AssessorRequestTab
            selectedAssessorRequestId={selectedAssessorRequestId}
            onSelectAssessorRequest={setSelectedAssessorRequestId}
          />
        )}
        {activeTab === "assessors" && (
          <AssessorsTab
            activeRole={activeRole}
            selectedAssessorId={selectedAssessorId}
            onSelectAssessor={setSelectedAssessorId}
            onViewCandidate={(candidateId) => {
              handleSelectTab("applications");
              setSelectedCandidateName(candidateId);
            }}
          />
        )}
        {activeTab === "payments" && (
          <PaymentsTab
            onWithdrawFunds={() => setIsWithdrawModalOpen(true)}
            onSelectReceipt={setSelectedReceiptTx}
          />
        )}
        {activeTab === "settings" && <SettingsTab />}
      </div>

      {isAddStaffModalOpen && (
        <AddStaffModal
          isOpen={isAddStaffModalOpen}
          onClose={() => setIsAddStaffModalOpen(false)}
        />
      )}
      {isPostJobModalOpen && (
        <PostJobModal
          isOpen={isPostJobModalOpen}
          onClose={() => setIsPostJobModalOpen(false)}
        />
      )}
      {isCreatePanelModalOpen && (
        <CreatePanelModal
          isOpen={isCreatePanelModalOpen}
          onClose={() => setIsCreatePanelModalOpen(false)}
        />
      )}
      {isCreateInterviewModalOpen && (
        <CreateInterviewModal
          isOpen={isCreateInterviewModalOpen}
          onClose={() => setIsCreateInterviewModalOpen(false)}
          onOpenCreatePanel={() => setIsCreatePanelModalOpen(true)}
        />
      )}
      {isPromptCreatePanelModalOpen && (
        <PromptCreatePanelModal
          isOpen={isPromptCreatePanelModalOpen}
          onClose={() => setIsPromptCreatePanelModalOpen(false)}
          onCreatePanel={() => {
            setIsPromptCreatePanelModalOpen(false);
            setIsCreatePanelModalOpen(true);
          }}
        />
      )}
      {isScheduleInterviewModalOpen && (
        <ScheduleInterviewModal
          isOpen={isScheduleInterviewModalOpen}
          onClose={() => setIsScheduleInterviewModalOpen(false)}
        />
      )}
      {isWithdrawModalOpen && (
        <WithdrawModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
        />
      )}
      {Boolean(selectedReceiptTx) && (
        <TransactionReceiptModal
          isOpen={Boolean(selectedReceiptTx)}
          transaction={selectedReceiptTx}
          onClose={() => setSelectedReceiptTx(null)}
        />
      )}
      {isStaffDeactivateModalOpen && (
        <StaffStatusModal
          isOpen={isStaffDeactivateModalOpen}
          mode={staffDeactivateModalMode}
          onClose={() => setIsStaffDeactivateModalOpen(false)}
        />
      )}
      {isAssessorDeactivateModalOpen && (
        <StaffStatusModal
          isOpen={isAssessorDeactivateModalOpen}
          mode={assessorDeactivateModalMode}
          onClose={() => setIsAssessorDeactivateModalOpen(false)}
        />
      )}
      {isNotificationsOpen && (
        <NotificationDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
      )}
      {isBroadcastModalOpen && (
        <BroadcastModal
          isOpen={isBroadcastModalOpen}
          onClose={() => setIsBroadcastModalOpen(false)}
        />
      )}
    </div>
  );
};
