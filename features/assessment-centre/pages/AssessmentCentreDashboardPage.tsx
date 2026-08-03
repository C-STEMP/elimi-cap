"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AssessmentCentreHeader } from "../components/AssessmentCentreHeader";
import { RevenueChart } from "../components/RevenueChart";
import { TradeChart } from "../components/TradeChart";
import { GenderChart } from "../components/GenderChart";
import { AssessmentStageCard } from "../components/AssessmentStageCard";
import { StaffActivityLogCard } from "../components/StaffActivityLogCard";
import { PendingApplicationsTable } from "../components/PendingApplicationsTable";
import { AssessmentCentreEmptyView } from "../components/AssessmentCentreEmptyView";
import { MessagesView } from "../components/MessagesView";
import { StaffListView } from "../components/StaffListView";
import { StaffDetailView } from "../components/StaffDetailView";
import { AddStaffModal } from "../components/AddStaffModal";
import { JobListingsView } from "../components/JobListingsView";
import { JobListingDetailView } from "../components/JobListingDetailView";
import { AssessorApplicantProfileView } from "../components/AssessorApplicantProfileView";
import { PostJobModal } from "../components/PostJobModal";
import { AssessorsListView } from "../components/AssessorsListView";
import { AssessorProfileDetailView } from "../components/AssessorProfileDetailView";
import { PaymentsView } from "../components/PaymentsView";
import { WithdrawModal } from "../components/WithdrawModal";
import { TransactionReceiptModal } from "../components/TransactionReceiptModal";
import { SettingsView } from "../components/SettingsView";
import { GenericTabPlaceholder } from "../components/GenericTabPlaceholder";
import { NotificationDrawer } from "../components/NotificationDrawer";
import { AssessmentCentreTab, PaymentTransaction } from "../types";

export const AssessmentCentreDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AssessmentCentreTab>("overview");
  const [hasActivity, setHasActivity] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);

  const [selectedAssessorId, setSelectedAssessorId] = useState<string | null>(null);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] =
    useState<PaymentTransaction | null>(null);

  return (
    <div className="min-h-screen bg-[#F4F5F7] p-4 sm:p-6 lg:p-8 xl:p-10 font-sans select-text">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-6 sm:gap-8">
        {/* Header Banner Navigation */}
        <AssessmentCentreHeader
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          showStats={activeTab === "overview"}
        />

        {/* Overview Tab Content */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            {/* View Mode Toggle Switch (Active vs Empty State) */}
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
                {/* Row 1: 3 Graphs & Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  <RevenueChart />
                  <TradeChart />
                  <GenderChart />
                </div>

                {/* Row 2: Assessment Stage & Staff Log */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  <AssessmentStageCard />
                  <StaffActivityLogCard />
                </div>

                {/* Row 3: Pending Applications Table */}
                <PendingApplicationsTable
                  onViewAll={() => setActiveTab("applications")}
                />
              </>
            ) : (
              /* Image 2 Empty State View */
              <AssessmentCentreEmptyView />
            )}
          </motion.div>
        )}

        {/* Messages Tab Content */}
        {activeTab === "messages" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <MessagesView />
          </motion.div>
        )}

        {/* Staff Tab */}
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

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <GenericTabPlaceholder
            title="Candidate Applications"
            description="Review all candidate applications submitted to your Assessment Centre, manage review stages, and issue certificates."
          />
        )}

        {/* Job Listing Tab */}
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

        {/* Assessor Request Tab */}
        {activeTab === "assessor-request" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {selectedApplicantId ? (
              <AssessorApplicantProfileView
                applicantId={selectedApplicantId}
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

        {/* Assessors Tab */}
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

        {/* Payments Tab */}
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

        {/* Settings Tab */}
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

      {/* Notification Slide-Over Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isAddStaffModalOpen}
        onClose={() => setIsAddStaffModalOpen(false)}
      />

      {/* Post Job Modal */}
      <PostJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
      />

      {/* Withdraw Funds Modal */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        isOpen={!!selectedReceiptTx}
        transaction={selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
      />
    </div>
  );
};
