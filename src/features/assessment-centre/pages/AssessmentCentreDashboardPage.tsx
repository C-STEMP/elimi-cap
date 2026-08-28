"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// Dashboard feature
import { AssessmentCentreHeader } from "../features/Dashboard/components/AssessmentCentreHeader";
import { AssessmentCentreEmptyView } from "../features/Dashboard/components/AssessmentCentreEmptyView";
import { RevenueChart } from "../features/Dashboard/components/RevenueChart";
import { TradeChart } from "../features/Dashboard/components/TradeChart";
import { GenderChart } from "../features/Dashboard/components/GenderChart";
import { StaffActivityLogCard } from "../features/Dashboard/components/StaffActivityLogCard";
import { MessagesView } from "../features/Dashboard/components/MessagesView";
import { NotificationDrawer } from "../features/Dashboard/components/NotificationDrawer";
import { BroadcastModal } from "../features/Dashboard/components/BroadcastModal";
import { MessagesHeader } from "../features/Dashboard/components/MessagesHeader";
// Applications feature
import { AssessmentStageCard } from "../features/Applications/components/AssessmentStageCard";
import { PendingApplicationsTable } from "../features/Applications/components/PendingApplicationsTable";
import { AssessmentCentreApplicationsView } from "../features/Applications/components/AssessmentCentreApplicationsView";
import { AssessmentCentreApplicationDetailView } from "../features/Applications/components/AssessmentCentreApplicationDetailView";
import { AssessmentCentreCandidateFormView } from "../features/Applications/components/AssessmentCentreCandidateFormView";
import { AssessmentCentreEvidenceVaultView } from "../features/Applications/components/AssessmentCentreEvidenceVaultView";
import { AssessmentCentreSelfAssessmentFormView } from "../features/Applications/components/AssessmentCentreSelfAssessmentFormView";
import { ApplicationsHeader } from "../features/Applications/components/ApplicationsHeader";
// Staff feature
import { StaffListView } from "../features/Staff/components/StaffListView";
import { StaffDetailView } from "../features/Staff/components/StaffDetailView";
import { AddStaffModal } from "../features/Staff/components/AddStaffModal";
import { StaffStatusModal, StaffStatusModalMode } from "../features/Staff/components/StaffStatusModal";
import { StaffHeader } from "../features/Staff/components/StaffHeader";
// JobListing feature
import { JobListingsView } from "../features/JobListing/components/JobListingsView";
import { JobListingDetailView } from "../features/JobListing/components/JobListingDetailView";
import { PostJobModal } from "../features/JobListing/components/PostJobModal";
import { JobListingHeader } from "../features/JobListing/components/JobListingHeader";
// Assessor feature
import { AssessorsListView } from "../features/Assessor/components/AssessorsListView";
import { AssessorProfileDetailView } from "../features/Assessor/components/AssessorProfileDetailView";
import { AssessorApplicantProfileView } from "../features/Assessor/components/AssessorApplicantProfileView";
import { AssessorsHeader } from "../features/Assessor/components/AssessorsHeader";
// AssessorRequest feature
import { AssessorRequestListView } from "../features/AssessorRequest/components/AssessorRequestListView";
import { AssessorRequestHeader } from "../features/AssessorRequest/components/AssessorRequestHeader";
// Payment feature
import { PaymentsView } from "../features/Payment/components/PaymentsView";
import { WithdrawModal } from "../features/Payment/components/WithdrawModal";
import { TransactionReceiptModal } from "../features/Payment/components/TransactionReceiptModal";
import { PaymentsHeader } from "../features/Payment/components/PaymentsHeader";
// Settings feature
import { SettingsView } from "../features/Settings/components/SettingsView";
import { SettingsHeader } from "../features/Settings/components/SettingsHeader";

import { FiAward } from "react-icons/fi";
import { AssessmentCentreTab, PaymentTransaction } from "../types";
import { useAppSelector } from "@/src/store/hooks";
import {
  useGetCentreDashboard,
  useGetCentreStaff,
  useGetRetainedRequests,
  useGetCentreProfile,
} from "@/src/features/shared/centre/hooks";
import {
  useGetApplications,
  useReviewApplication,
} from "@/src/features/shared/applications/hooks";
import { useGetMe } from "@/src/features/shared/account/hooks";
import {
  saveCentreId,
  saveCentreRole,
  getCentreRole,
} from "@/src/lib/auth-storage";
import {
  getPermittedTabs,
  normalizeRole,
  canViewPayments,
  canAddStaff,
  RoleType,
} from "../utils/rbac";

export const AssessmentCentreDashboardPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const { data: meData } = useGetMe();
  const activeCentre = meData?.centres?.[0];

  React.useEffect(() => {
    if (activeCentre?.centreId) {
      saveCentreId(activeCentre.centreId);
    }
    if (activeCentre?.role) {
      saveCentreRole(activeCentre.role);
    }
  }, [activeCentre]);

  const activeRole: RoleType = normalizeRole(
    activeCentre?.role ||
      user?.centreRole ||
      (typeof window !== "undefined" ? getCentreRole() : null) ||
      user?.role,
  );

  const [activeTab, setActiveTab] = useState<AssessmentCentreTab>("overview");

  const { data: dashboardData } = useGetCentreDashboard();
  const { data: applications = [] } = useGetApplications();
  const { data: staff = [] } = useGetCentreStaff();
  const { data: assessors = [] } = useGetRetainedRequests();

  const { data: centreProfile } = useGetCentreProfile();

  const hasActivity =
    (dashboardData?.kpis?.applications ?? 0) > 0 ||
    (dashboardData?.kpis?.staff ?? 0) > 0 ||
    (dashboardData?.kpis?.assessors ?? 0) > 0 ||
    applications.length > 0 ||
    staff.length > 0;

  // Auto-switch to overview if the user's role is restricted on the current tab
  React.useEffect(() => {
    const permitted = getPermittedTabs(activeRole);
    if (!permitted.includes(activeTab)) {
      setActiveTab("overview");
    }
  }, [activeRole, activeTab]);
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

  const reviewMutation = useReviewApplication();

  const renderHeaderContent = () => {
    if (activeTab === "overview") return null;

    if (activeTab === "staff") {
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
    }

    if (activeTab === "applications") {
      return (
        <ApplicationsHeader
          selectedCandidateName={selectedCandidateName}
          showSelfAssessmentForm={showSelfAssessmentForm}
          showEvidenceVault={showEvidenceVault}
          showCandidateForm={showCandidateForm}
          onBackToList={() => {
            setSelectedCandidateName(null);
            setSelectedApplicationId(null);
          }}
          onBackFromSelfAssessment={() => setShowSelfAssessmentForm(false)}
          onBackFromEvidenceVault={() => setShowEvidenceVault(false)}
          onBackFromCandidateForm={() => setShowCandidateForm(false)}
          onAcceptApplication={() => {
            if (selectedApplicationId) {
              reviewMutation.mutate({
                id: selectedApplicationId,
                payload: {
                  decision: "approve",
                  feedback: "Application accepted by Assessment Centre",
                },
              });
            }
          }}
        />
      );
    }

    if (activeTab === "job-listing") {
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
    }

    if (activeTab === "assessor-request") {
      return (
        <AssessorRequestHeader
          selectedAssessorRequestId={selectedAssessorRequestId}
          onBackToList={() => setSelectedAssessorRequestId(null)}
        />
      );
    }

    if (activeTab === "assessors") {
      return (
        <AssessorsHeader
          selectedAssessorId={selectedAssessorId}
          onBackToList={() => setSelectedAssessorId(null)}
          userRole={activeRole}
          onDeactivate={(mode) => {
            setAssessorDeactivateModalMode(mode);
            setIsAssessorDeactivateModalOpen(true);
          }}
        />
      );
    }

    if (activeTab === "payments") {
      return (
        <PaymentsHeader onWithdrawFunds={() => setIsWithdrawModalOpen(true)} />
      );
    }

    if (activeTab === "settings") {
      return <SettingsHeader />;
    }

    if (activeTab === "messages") {
      return (
        <MessagesHeader
          userRole={activeRole}
          onSendBroadcast={() => setIsBroadcastModalOpen(true)}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col font-sans select-text">
      <AssessmentCentreHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        showStats={activeTab === "overview"}
        userRole={activeRole}
      >
        {renderHeaderContent()}
      </AssessmentCentreHeader>

      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6 sm:gap-8">
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            {/* Centre Accreditation & Approval Status Banner */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#fbab2a] flex items-center justify-center shrink-0 border border-amber-100">
                  <FiAward className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-base sm:text-lg font-extrabold text-black tracking-tight truncate">
                      {centreProfile?.name || "Assessment Centre"}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold ${
                        centreProfile?.status === "approved" || !centreProfile?.status
                          ? "bg-[#E6F4EA] text-[#1E7F4C] border border-[#1E7F4C]/20"
                          : centreProfile?.status === "pending"
                            ? "bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/20"
                            : "bg-[#FCE8EB] text-[#A31D38] border border-red-200"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {centreProfile?.status === "approved" || !centreProfile?.status
                        ? "Accredited & Approved Centre"
                        : centreProfile?.status === "pending"
                          ? "Accreditation Pending Review"
                          : "Accreditation Suspended"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-normal">
                    Centre ID: <span className="font-semibold text-gray-800">{centreProfile?.registrationNo || "AC-NBTE-0042"}</span> • Recognized by NBTE &amp; Sector Skills Council
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                <span className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl">
                  Accreditation: <span className="text-[#1E7F4C] font-bold capitalize">{centreProfile?.status || "Approved"}</span>
                </span>
              </div>
            </div>

            {hasActivity ? (
              <>
                <div
                  className={`grid grid-cols-1 ${
                    canViewPayments(activeRole)
                      ? "md:grid-cols-2 lg:grid-cols-3"
                      : "md:grid-cols-2"
                  } gap-6 items-stretch`}
                >
                  {canViewPayments(activeRole) && <RevenueChart />}
                  <TradeChart />
                  <GenderChart />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <AssessmentStageCard />
                  <StaffActivityLogCard />
                </div>

                <PendingApplicationsTable
                  onViewAll={() => setActiveTab("applications")}
                  onViewApplication={(appId) => {
                    setActiveTab("applications");
                    setSelectedApplicationId(appId);
                    setSelectedCandidateName("Candidate");
                  }}
                />
              </>
            ) : (
              <AssessmentCentreEmptyView />
            )}
          </motion.div>
        )}

        {activeTab === "messages" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <MessagesView />
          </motion.div>
        )}

        {activeTab === "staff" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {selectedStaffId ? (
              <StaffDetailView
                staffId={selectedStaffId}
                onBack={() => setSelectedStaffId(null)}
              />
            ) : (
              <StaffListView
                userRole={activeRole}
                onSelectStaff={(id) => setSelectedStaffId(id)}
                onAddStaff={() => setIsAddStaffModalOpen(true)}
              />
            )}
          </motion.div>
        )}

        {activeTab === "applications" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {selectedCandidateName && showSelfAssessmentForm ? (
              <AssessmentCentreSelfAssessmentFormView
                id={selectedApplicationId || undefined}
                candidateName={selectedCandidateName}
                onBack={() => setShowSelfAssessmentForm(false)}
              />
            ) : selectedCandidateName && showEvidenceVault ? (
              <AssessmentCentreEvidenceVaultView
                id={selectedApplicationId || undefined}
                candidateName={selectedCandidateName}
                onBack={() => setShowEvidenceVault(false)}
                onOpenSelfAssessmentForm={() => setShowSelfAssessmentForm(true)}
              />
            ) : selectedCandidateName && showCandidateForm ? (
              <AssessmentCentreCandidateFormView
                id={selectedApplicationId || undefined}
                candidateName={selectedCandidateName}
                onBack={() => setShowCandidateForm(false)}
              />
            ) : selectedCandidateName ? (
              <AssessmentCentreApplicationDetailView
                id={selectedApplicationId || undefined}
                candidateName={selectedCandidateName}
                onBack={() => {
                  setSelectedCandidateName(null);
                  setSelectedApplicationId(null);
                }}
                onOpenCandidateForm={() => setShowCandidateForm(true)}
                onOpenEvidenceVault={() => setShowEvidenceVault(true)}
              />
            ) : (
              <AssessmentCentreApplicationsView
                onSelectCandidate={(name, id) => {
                  setSelectedCandidateName(name);
                  setSelectedApplicationId(id || null);
                }}
              />
            )}
          </motion.div>
        )}

        {activeTab === "job-listing" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {selectedApplicantId ? (
              <AssessorApplicantProfileView
                applicantId={selectedApplicantId}
                onBack={() => setSelectedApplicantId(null)}
                isAssessorRequest={false}
              />
            ) : selectedJobId ? (
              <JobListingDetailView
                jobId={selectedJobId}
                onBack={() => setSelectedJobId(null)}
                onSelectApplicant={(id) => setSelectedApplicantId(id)}
              />
            ) : (
              <JobListingsView
                onSelectJob={(id) => setSelectedJobId(id)}
                onPostRequest={() => setIsPostJobModalOpen(true)}
              />
            )}
          </motion.div>
        )}

        {activeTab === "assessor-request" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {selectedAssessorRequestId ? (
              <AssessorApplicantProfileView
                applicantId={selectedAssessorRequestId}
                onBack={() => setSelectedAssessorRequestId(null)}
              />
            ) : (
              <AssessorRequestListView
                onSelectAssessorRequest={(id) =>
                  setSelectedAssessorRequestId(id)
                }
              />
            )}
          </motion.div>
        )}

        {activeTab === "assessors" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {selectedAssessorId ? (
              <AssessorProfileDetailView
                assessorId={selectedAssessorId}
                onBack={() => setSelectedAssessorId(null)}
                onViewCandidate={(candidateId) => {
                  setActiveTab("applications");
                  setSelectedCandidateName(candidateId);
                }}
              />
            ) : (
              <AssessorsListView
                userRole={activeRole}
                onSelectAssessor={(id) => setSelectedAssessorId(id)}
              />
            )}
          </motion.div>
        )}

        {activeTab === "payments" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <PaymentsView
              onWithdrawFunds={() => setIsWithdrawModalOpen(true)}
              onSelectReceipt={(tx) => setSelectedReceiptTx(tx)}
            />
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <SettingsView />
          </motion.div>
        )}
      </div>

      <AddStaffModal
        isOpen={isAddStaffModalOpen}
        onClose={() => setIsAddStaffModalOpen(false)}
      />

      <PostJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />

      <TransactionReceiptModal
        isOpen={!!selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
        transaction={selectedReceiptTx}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />

      <StaffStatusModal
        isOpen={isStaffDeactivateModalOpen}
        mode={staffDeactivateModalMode}
        staffName={
          selectedStaffId
            ? staff.find((s) => s.id === selectedStaffId)?.name ||
              staff.find((s) => s.id === selectedStaffId)?.email ||
              undefined
            : undefined
        }
        onClose={() => setIsStaffDeactivateModalOpen(false)}
        onConfirmDeactivate={() => {
          setStaffDeactivateModalMode("deactivated-success");
        }}
        onConfirmActivate={() => {
          setStaffDeactivateModalMode("activated-success");
        }}
      />

      <StaffStatusModal
        isOpen={isAssessorDeactivateModalOpen}
        mode={assessorDeactivateModalMode}
        staffName={
          selectedAssessorId
            ? assessors.find((a) => a.id === selectedAssessorId)?.assessor
                ?.name ||
              (assessors.find((a) => a.id === selectedAssessorId)?.assessorId
                ? `Assessor (${assessors
                    .find((a) => a.id === selectedAssessorId)
                    ?.assessorId?.slice(0, 8)})`
                : undefined)
            : undefined
        }
        onClose={() => setIsAssessorDeactivateModalOpen(false)}
        onConfirmDeactivate={() => {
          setAssessorDeactivateModalMode("deactivated-success");
        }}
        onConfirmActivate={() => {
          setAssessorDeactivateModalMode("activated-success");
        }}
      />
    </div>
  );
};
