"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiUser, FiCheck, FiSlash, FiClipboard } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { MOCK_STAFF_MEMBERS } from "../utils/constants";
import { AssessmentCentreHeader } from "../components/AssessmentCentreHeader";
import { AssessmentCentreEmptyView } from "../components/AssessmentCentreEmptyView";
import { RevenueChart } from "../components/RevenueChart";
import { TradeChart } from "../components/TradeChart";
import { GenderChart } from "../components/GenderChart";
import { AssessmentStageCard } from "../components/AssessmentStageCard";
import { StaffActivityLogCard } from "../components/StaffActivityLogCard";
import { PendingApplicationsTable } from "../components/PendingApplicationsTable";
import { MessagesView } from "../components/MessagesView";
import { StaffListView } from "../components/StaffListView";
import { StaffDetailView } from "../components/StaffDetailView";
import { AddStaffModal } from "../components/AddStaffModal";
import { JobListingsView } from "../components/JobListingsView";
import { JobListingDetailView } from "../components/JobListingDetailView";
import { PostJobModal } from "../components/PostJobModal";
import { AssessorsListView } from "../components/AssessorsListView";
import { AssessorProfileDetailView } from "../components/AssessorProfileDetailView";
import { PaymentsView } from "../components/PaymentsView";
import { WithdrawModal } from "../components/WithdrawModal";
import { TransactionReceiptModal } from "../components/TransactionReceiptModal";
import { SettingsView } from "../components/SettingsView";
import { NotificationDrawer } from "../components/NotificationDrawer";
import { AssessmentCentreApplicationsView } from "../components/AssessmentCentreApplicationsView";
import { AssessmentCentreApplicationDetailView } from "../components/AssessmentCentreApplicationDetailView";
import { AssessmentCentreCandidateFormView } from "../components/AssessmentCentreCandidateFormView";
import { AssessmentCentreEvidenceVaultView } from "../components/AssessmentCentreEvidenceVaultView";
import { AssessmentCentreSelfAssessmentFormView } from "../components/AssessmentCentreSelfAssessmentFormView";
import { AssessmentCentreTab, PaymentTransaction } from "../types";

export const AssessmentCentreDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AssessmentCentreTab>("overview");
  const [hasActivity, setHasActivity] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);

  const [selectedCandidateName, setSelectedCandidateName] = useState<
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

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] =
    useState<PaymentTransaction | null>(null);

  const renderHeaderContent = () => {
    if (activeTab === "overview") return null;

    if (activeTab === "staff") {
      if (selectedStaffId) {
        const staff =
          MOCK_STAFF_MEMBERS.find((s) => s.id === selectedStaffId) ||
          MOCK_STAFF_MEMBERS[1];
        return (
          <div className="flex flex-col gap-6 pt-2">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedStaffId(null)}
                  className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
                >
                  <span className="text-xl font-bold">&lt;</span>
                  <span>{staff.name}</span>
                </button>
                <div className="flex items-center gap-2 text-xs lg:text-base text-white/80 font-normal">
                  <span
                    onClick={() => setSelectedStaffId(null)}
                    className="hover:underline cursor-pointer"
                  >
                    Staff
                  </span>
                  <span>&gt;</span>
                  <span className="font-semibold text-white">{staff.name}</span>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                rightIcon={<FiSlash className="w-4 h-4" />}
              >
                Deactivate
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-medium text-white/80">
                    Reviewed Applications
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold text-white">
                      {staff.reviewedApplicationsCount || 220}
                    </span>
                    <span className="text-xs font-normal text-white/70">
                      applications
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <FiClipboard className="w-5 h-5 text-white/90" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-medium text-white/80">
                    Pending Applications
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold text-white">
                      {staff.pendingApplicationsCount || 20}
                    </span>
                    <span className="text-xs font-normal text-white/70">
                      applications
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <FiClipboard className="w-5 h-5 text-white/90" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-medium text-white/80">
                    Requires Attention
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold text-white">
                      {staff.requiresAttentionCount || 10}
                    </span>
                    <span className="text-xs font-normal text-white/70">
                      applications
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <FiClipboard className="w-5 h-5 text-white/90" />
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-6 pt-2">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Staff
            </h1>
            <Button
              type="button"
              onClick={() => setIsAddStaffModalOpen(true)}
              variant="amber"
              size="md"
              rightIcon={<FiPlus className="w-4.5 h-4.5" />}
              className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
            >
              Add Staff
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-medium text-white/80">
                  Total Staffs
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold text-white">
                    15
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    staffs
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <FiUser className="w-5 h-5 text-white/90" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-medium text-white/80">
                  Active Staff
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold text-white">
                    10
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    staffs
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <FiUser className="w-5 h-5 text-white/90" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-medium text-white/80">
                  Pending Staff
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold text-white">
                    3
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    staffs
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <FiUser className="w-5 h-5 text-white/90" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-medium text-white/80">
                  Inactive
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold text-white">
                    2
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    staffs
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <FiUser className="w-5 h-5 text-white/90" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "applications") {
      if (selectedCandidateName && showSelfAssessmentForm) {
        return (
          <div className="flex flex-col gap-1 pt-2">
            <button
              type="button"
              onClick={() => setShowSelfAssessmentForm(false)}
              className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
            >
              <span className="text-xl font-bold">&lt;</span>
              <span>Self Assessment Form</span>
            </button>
            <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal flex-wrap">
              <span
                onClick={() => setSelectedCandidateName(null)}
                className="hover:underline cursor-pointer"
              >
                Applications
              </span>
              <span>&gt;</span>
              <span
                onClick={() => {
                  setShowSelfAssessmentForm(false);
                  setShowEvidenceVault(false);
                }}
                className="hover:underline cursor-pointer"
              >
                {selectedCandidateName}
              </span>
              <span>&gt;</span>
              <span
                onClick={() => setShowSelfAssessmentForm(false)}
                className="hover:underline cursor-pointer"
              >
                Evidence Vault
              </span>
              <span>&gt;</span>
              <span className="font-semibold text-white">
                Self Assessment Form
              </span>
            </div>
          </div>
        );
      }

      if (selectedCandidateName && showEvidenceVault) {
        return (
          <div className="flex flex-col gap-1 pt-2">
            <button
              type="button"
              onClick={() => setShowEvidenceVault(false)}
              className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
            >
              <span className="text-xl font-bold">&lt;</span>
              <span>Evidence Vault</span>
            </button>
            <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
              <span
                onClick={() => setSelectedCandidateName(null)}
                className="hover:underline cursor-pointer"
              >
                Applications
              </span>
              <span>&gt;</span>
              <span
                onClick={() => setShowEvidenceVault(false)}
                className="hover:underline cursor-pointer"
              >
                {selectedCandidateName}
              </span>
              <span>&gt;</span>
              <span className="font-semibold text-white">Evidence Vault</span>
            </div>
          </div>
        );
      }

      if (selectedCandidateName && showCandidateForm) {
        return (
          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setShowCandidateForm(false)}
                className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
              >
                <span className="text-xl font-bold">&lt;</span>
                <span>Application Form</span>
              </button>
              <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
                <span
                  onClick={() => setSelectedCandidateName(null)}
                  className="hover:underline cursor-pointer"
                >
                  Applications
                </span>
                <span>&gt;</span>
                <span
                  onClick={() => setShowCandidateForm(false)}
                  className="hover:underline cursor-pointer"
                >
                  {selectedCandidateName}
                </span>
                <span>&gt;</span>
                <span className="font-semibold text-white">
                  Application Form
                </span>
              </div>
            </div>
          </div>
        );
      }

      if (selectedCandidateName) {
        return (
          <div className="flex flex-col gap-1 pt-2">
            <button
              type="button"
              onClick={() => setSelectedCandidateName(null)}
              className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
            >
              <span className="text-xl font-bold">&lt;</span>
              <span>{selectedCandidateName}</span>
            </button>
            <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
              <span
                onClick={() => setSelectedCandidateName(null)}
                className="hover:underline cursor-pointer"
              >
                Applications
              </span>
              <span>&gt;</span>
              <span className="font-semibold text-white">
                {selectedCandidateName}
              </span>
            </div>
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-6 pt-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Applications
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 flex flex-col gap-1 border border-white/15">
              <span className="text-xs font-semibold text-white/90">
                Total Applications
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  21,220
                </span>
                <span className="text-xs text-white/80 font-normal">
                  applications
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 flex flex-col gap-1 border border-white/15">
              <span className="text-xs font-semibold text-white/90">
                Pending
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  2,000
                </span>
                <span className="text-xs text-white/80 font-normal">
                  applications
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 flex flex-col gap-1 border border-white/15">
              <span className="text-xs font-semibold text-white/90">
                Ongoing
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  1,220
                </span>
                <span className="text-xs text-white/80 font-normal">
                  applications
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 flex flex-col gap-1 border border-white/15">
              <span className="text-xs font-semibold text-white/90">
                Completed
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  17,500
                </span>
                <span className="text-xs text-white/80 font-normal">
                  applications
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 flex flex-col gap-1 border border-white/15">
              <span className="text-xs font-semibold text-white/90">
                Archived
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  500
                </span>
                <span className="text-xs text-white/80 font-normal">
                  applications
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] p-4 md:p-6 font-sans select-text">
      <div className="max-w-360 mx-auto flex flex-col gap-6 sm:gap-8">
        <AssessmentCentreHeader
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          showStats={activeTab === "overview"}
        >
          {renderHeaderContent()}
        </AssessmentCentreHeader>

        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center justify-end gap-2 text-xs font-semibold text-neutral-secondary">
              <span>View Mode:</span>
              <button
                type="button"
                onClick={() => setHasActivity(true)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  hasActivity
                    ? "bg-[#a31d38] text-white shadow-2xs font-bold"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                With Data
              </button>
              <button
                type="button"
                onClick={() => setHasActivity(false)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  !hasActivity
                    ? "bg-[#a31d38] text-white shadow-2xs font-bold"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                Empty State
              </button>
            </div>

            {hasActivity ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  <RevenueChart />
                  <TradeChart />
                  <GenderChart />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <AssessmentStageCard />
                  <StaffActivityLogCard />
                </div>

                <PendingApplicationsTable
                  onViewAll={() => setActiveTab("applications")}
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
                candidateName={selectedCandidateName}
                onBack={() => setShowSelfAssessmentForm(false)}
              />
            ) : selectedCandidateName && showEvidenceVault ? (
              <AssessmentCentreEvidenceVaultView
                candidateName={selectedCandidateName}
                onBack={() => setShowEvidenceVault(false)}
                onOpenSelfAssessmentForm={() => setShowSelfAssessmentForm(true)}
              />
            ) : selectedCandidateName && showCandidateForm ? (
              <AssessmentCentreCandidateFormView
                candidateName={selectedCandidateName}
                onBack={() => setShowCandidateForm(false)}
              />
            ) : selectedCandidateName ? (
              <AssessmentCentreApplicationDetailView
                candidateName={selectedCandidateName}
                onBack={() => setSelectedCandidateName(null)}
                onOpenCandidateForm={() => setShowCandidateForm(true)}
                onOpenEvidenceVault={() => setShowEvidenceVault(true)}
              />
            ) : (
              <AssessmentCentreApplicationsView
                onSelectCandidate={(name) => setSelectedCandidateName(name)}
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
              <StaffDetailView
                staffId={selectedApplicantId}
                onBack={() => setSelectedApplicantId(null)}
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
              />
            ) : (
              <AssessorsListView
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
    </div>
  );
};
