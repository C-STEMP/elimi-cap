"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AssessmentCentreHeader } from "../features/Dashboard/components/AssessmentCentreHeader";
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
const ScheduleInductionModal = dynamic(() =>
  import("../features/Applications/components/ScheduleInductionModal").then(
    (m) => m.ScheduleInductionModal,
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
import { type InductionRowData } from "../features/Applications/components/ViewInductionDetailModal";
import { useAppSelector } from "@/src/store/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import {
  useGetApplicationById,
  useGetApplicationStages,
  useGetApplications,
  APPLICATION_QUERY_KEYS,
} from "@/src/features/shared/applications/hooks";
import { reviewApplicationApi } from "@/src/features/shared/applications/api";
import { ConfirmApprovePendingModal } from "../features/Applications/components/ConfirmApprovePendingModal";
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
import { useUrlModal } from "@/src/lib/hooks/usePersistentModal";
import {
  DASHBOARD_CREATE_PANEL_MODAL,
  CREATE_INTERVIEW_MODAL,
  DASHBOARD_SCHEDULE_INTERVIEW_MODAL,
  DASHBOARD_SCHEDULE_INDUCTION_MODAL,
  BROADCAST_MODAL,
  ADD_STAFF_MODAL,
  POST_JOB_MODAL,
  WITHDRAW_MODAL,
} from "@/src/lib/modal-keys";

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

  const { data: dashboardData, isLoading: isDashboardLoading } = useGetCentreDashboard();
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
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useUrlModal(BROADCAST_MODAL);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useUrlModal(ADD_STAFF_MODAL);
  const [selectedCandidateName, setSelectedCandidateName] = useState<
    string | null
  >(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const queryClient = useQueryClient();
  const { data: selectedAppDetail } = useGetApplicationById(
    selectedApplicationId || "",
  );
  const { data: selectedAppStages = [] } = useGetApplicationStages(
    selectedApplicationId || "",
  );

  const isSelectedAppApproved = Boolean(
    (selectedAppDetail?.status as string) === "approved" ||
      selectedAppDetail?.status === "in_progress" ||
      selectedAppDetail?.status === "certified" ||
      selectedAppStages.some(
        (s) =>
          (s.stageKey === "application_form" ||
            s.stageKey === "application_review" ||
            s.stageKey === "application") &&
          ((s.status as string) === "successful" ||
            (s.status as string) === "approved"),
      ) ||
      (selectedAppDetail?.currentStageKey &&
        selectedAppDetail.currentStageKey !== "application_form" &&
        selectedAppDetail.currentStageKey !== "application_review" &&
        selectedAppDetail.currentStageKey !== "draft" &&
        selectedAppDetail.currentStageKey !== "submitted"),
  );
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [showEvidenceVault, setShowEvidenceVault] = useState(false);
  const [showSelfAssessmentForm, setShowSelfAssessmentForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    null,
  );
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useUrlModal(POST_JOB_MODAL);
  const [isCreatePanelModalOpen, setIsCreatePanelModalOpen] = useUrlModal(DASHBOARD_CREATE_PANEL_MODAL);
  const [isCreateInterviewModalOpen, setIsCreateInterviewModalOpen] =
    useUrlModal(CREATE_INTERVIEW_MODAL);
  const [isPromptCreatePanelModalOpen, setIsPromptCreatePanelModalOpen] =
    useState(false);
  const [isScheduleInterviewModalOpen, setIsScheduleInterviewModalOpen] =
    useUrlModal(DASHBOARD_SCHEDULE_INTERVIEW_MODAL);
  const [isScheduleInductionModalOpen, setIsScheduleInductionModalOpen] =
    useUrlModal(DASHBOARD_SCHEDULE_INDUCTION_MODAL);
  const [selectedInterview, setSelectedInterview] =
    useState<InterviewRowData | null>(null);
  const [selectedInduction, setSelectedInduction] =
    useState<InductionRowData | null>(null);
  const [selectedAssessorId, setSelectedAssessorId] = useState<string | null>(
    null,
  );
  const [selectedAssessorRequestId, setSelectedAssessorRequestId] = useState<
    string | null
  >(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useUrlModal(WITHDRAW_MODAL);
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

  // Stat card filter state — lifted here so header clicks wire to tab list views
  const [applicationsFilterTab, setApplicationsFilterTab] = useState<string>("All");
  const [staffStatusFilter, setStaffStatusFilter] = useState<string>("All");
  const [assessorsStatusFilter, setAssessorsStatusFilter] = useState<string>("All");
  const [jobStatusFilter, setJobStatusFilter] = useState<string>("all");
  const [paymentsStatusFilter, setPaymentsStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const { data: allApplications = [] } = useGetApplications();
  const [isApproveAllPendingModalOpen, setIsApproveAllPendingModalOpen] = useState(false);
  const [isApprovingAllPending, setIsApprovingAllPending] = useState(false);

  const pendingApps = useMemo(() => {
    return allApplications.filter(
      (a) =>
        a.status === "draft" ||
        (a as { currentStageKey?: string }).currentStageKey === "application_form" ||
        (a as { currentStageKey?: string }).currentStageKey === "application_review" ||
        (a as { stage?: string }).stage === "application_form",
    );
  }, [allApplications]);

  const handleTriggerApproveAllPending = () => {
    setApplicationsFilterTab("Pending");
    setIsApproveAllPendingModalOpen(true);
  };

  const handleConfirmApproveAllPending = async () => {
    if (pendingApps.length === 0) {
      setIsApproveAllPendingModalOpen(false);
      return;
    }
    setIsApprovingAllPending(true);
    try {
      const results = await Promise.allSettled(
        pendingApps.map((a) =>
          reviewApplicationApi(a.id, {
            decision: "approve",
            stageKey: "application_form",
            feedback: "Application accepted by Assessment Centre",
          }),
        ),
      );
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (successful > 0) {
        queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: ["centre", "applications"] });
        queryClient.invalidateQueries({ queryKey: ["applications"] });
        queryClient.invalidateQueries({ queryKey: ["centre"] });
        queryClient.invalidateQueries({ queryKey: ["centre-applications"] });
      }

      setIsApproveAllPendingModalOpen(false);

      if (failed === 0) {
        toast({
          type: "success",
          title: "Applications Approved",
          description: `Successfully approved ${successful} pending application${
            successful > 1 ? "s" : ""
          }.`,
        });
      } else if (successful > 0) {
        toast({
          type: "warning",
          title: "Partially Approved",
          description: `Approved ${successful} application${
            successful > 1 ? "s" : ""
          }, but ${failed} could not be approved.`,
        });
      } else {
        toast({
          type: "error",
          title: "Approval Failed",
          description: "Failed to approve pending applications.",
        });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to approve pending applications.";
      toast({
        type: "error",
        title: "Approval Failed",
        description: msg,
      });
    } finally {
      setIsApprovingAllPending(false);
    }
  };

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
            activeStatusFilter={staffStatusFilter}
            onSelectStatusFilter={setStaffStatusFilter}
          />
        );
      case "applications":
        return (
          <ApplicationsHeader
            selectedCandidateName={selectedCandidateName}
            selectedInterviewTitle={selectedInterview?.title || null}
            selectedInductionTitle={selectedInduction?.title || null}
            showSelfAssessmentForm={showSelfAssessmentForm}
            showEvidenceVault={showEvidenceVault}
            showCandidateForm={showCandidateForm}
            isApplicationApproved={isSelectedAppApproved}
            onBackToList={() => {
              setSelectedCandidateName(null);
              setSelectedApplicationId(null);
              setSelectedInterview(null);
              setSelectedInduction(null);
            }}
            onBackFromInterview={() => setSelectedInterview(null)}
            onBackFromInduction={() => setSelectedInduction(null)}
            onBackFromSelfAssessment={() => setShowSelfAssessmentForm(false)}
            onBackFromEvidenceVault={() => setShowEvidenceVault(false)}
            onBackFromCandidateForm={() => setShowCandidateForm(false)}
            onAcceptApplication={() => {
              if (selectedApplicationId) {
                reviewMutation.mutate(
                  {
                    id: selectedApplicationId,
                    payload: {
                      decision: "approve",
                      stageKey: "application_form",
                      feedback: "Accepted by Assessment Centre",
                    },
                  },
                  {
                    onSuccess: () => {
                      queryClient.invalidateQueries({
                        queryKey: APPLICATION_QUERY_KEYS.all,
                      });
                      queryClient.invalidateQueries({
                        queryKey: APPLICATION_QUERY_KEYS.detail(
                          selectedApplicationId,
                        ),
                      });
                      queryClient.invalidateQueries({
                        queryKey: APPLICATION_QUERY_KEYS.stages(
                          selectedApplicationId,
                        ),
                      });
                      queryClient.invalidateQueries({
                        queryKey: ["applications"],
                      });
                      queryClient.invalidateQueries({ queryKey: ["centre"] });
                    },
                  },
                );
              }
            }}
            onCreatePanel={() => setIsCreatePanelModalOpen(true)}
            onCreateInterview={() => setIsCreateInterviewModalOpen(true)}
            onScheduleInterview={handleOpenScheduleInterview}
            onScheduleInduction={() => setIsScheduleInductionModalOpen(true)}
            activeFilterTab={applicationsFilterTab}
            onSelectFilterTab={setApplicationsFilterTab}
            onApproveAllPending={handleTriggerApproveAllPending}
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
            activeStatusFilter={jobStatusFilter}
            onSelectStatusFilter={setJobStatusFilter}
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
            activeStatusFilter={assessorsStatusFilter}
            onSelectStatusFilter={setAssessorsStatusFilter}
          />
        );
      case "payments":
        return (
          <PaymentsHeader
            onWithdrawFunds={() => setIsWithdrawModalOpen(true)}
            activeStatusFilter={paymentsStatusFilter}
            onSelectStatusFilter={setPaymentsStatusFilter}
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
            isLoading={isDashboardLoading}
            onNavigateToApplications={(appId) => {
              if (appId) {
                router.push(`/applications/${appId}?from=centre`);
              } else {
                handleSelectTab("applications");
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
            activeStatusFilter={staffStatusFilter}
            onSelectStatusFilter={setStaffStatusFilter}
          />
        )}
        {activeTab === "applications" && (
          <ApplicationsTab
            selectedInterview={selectedInterview}
            selectedInduction={selectedInduction}
            selectedCandidateName={selectedCandidateName}
            selectedApplicationId={selectedApplicationId}
            showCandidateForm={showCandidateForm}
            showEvidenceVault={showEvidenceVault}
            showSelfAssessmentForm={showSelfAssessmentForm}
            onSelectInterview={setSelectedInterview}
            onSelectInduction={setSelectedInduction}
            onSelectCandidate={(name, id) => {
              if (id) {
                router.push(`/applications/${id}?from=centre`);
              } else {
                setSelectedCandidateName(name);
                setSelectedApplicationId(null);
              }
            }}
            onCloseCandidateForm={() => setShowCandidateForm(false)}
            onOpenCandidateForm={() => setShowCandidateForm(true)}
            onCloseEvidenceVault={() => setShowEvidenceVault(false)}
            onOpenEvidenceVault={() => {
              if (selectedApplicationId) {
                router.push(
                  `/applications/${selectedApplicationId}/evidence-vault?from=centre`,
                );
              } else {
                setShowEvidenceVault(true);
              }
            }}
            onCloseSelfAssessmentForm={() => setShowSelfAssessmentForm(false)}
            onOpenSelfAssessmentForm={() => setShowSelfAssessmentForm(true)}
            onOpenCreatePanel={() => setIsCreatePanelModalOpen(true)}
            onOpenCreateInterview={() => setIsCreateInterviewModalOpen(true)}
            onOpenScheduleInterview={handleOpenScheduleInterview}
            onOpenScheduleInduction={() => setIsScheduleInductionModalOpen(true)}
            activeFilterTab={applicationsFilterTab}
            onTabChange={setApplicationsFilterTab}
          />
        )}
        {activeTab === "job-listing" && (
          <JobListingTab
            selectedJobId={selectedJobId}
            selectedApplicantId={selectedApplicantId}
            onSelectJob={setSelectedJobId}
            onSelectApplicant={setSelectedApplicantId}
            onOpenPostJobModal={() => setIsPostJobModalOpen(true)}
            activeStatusFilter={jobStatusFilter}
            onSelectStatusFilter={setJobStatusFilter}
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
              router.push(`/applications/${candidateId}?from=centre`);
            }}
            activeStatusFilter={assessorsStatusFilter}
            onSelectStatusFilter={setAssessorsStatusFilter}
          />
        )}
        {activeTab === "payments" && (
          <PaymentsTab
            onWithdrawFunds={() => setIsWithdrawModalOpen(true)}
            onSelectReceipt={setSelectedReceiptTx}
            cardFilter={paymentsStatusFilter}
            onCardFilterChange={setPaymentsStatusFilter}
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
          modalKey={DASHBOARD_CREATE_PANEL_MODAL}
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
          modalKey={DASHBOARD_SCHEDULE_INTERVIEW_MODAL}
          onClose={() => setIsScheduleInterviewModalOpen(false)}
        />
      )}
      {isScheduleInductionModalOpen && (
        <ScheduleInductionModal
          isOpen={isScheduleInductionModalOpen}
          modalKey={DASHBOARD_SCHEDULE_INDUCTION_MODAL}
          onClose={() => setIsScheduleInductionModalOpen(false)}
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
      {isBroadcastModalOpen && (
        <BroadcastModal
          isOpen={isBroadcastModalOpen}
          onClose={() => setIsBroadcastModalOpen(false)}
        />
      )}
      <ConfirmApprovePendingModal
        isOpen={isApproveAllPendingModalOpen}
        isSubmitting={isApprovingAllPending}
        count={pendingApps.length}
        onConfirm={handleConfirmApproveAllPending}
        onCancel={() => {
          if (!isApprovingAllPending) setIsApproveAllPendingModalOpen(false);
        }}
      />
    </div>
  );
};
