"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiUser,
  FiCheck,
  FiSlash,
  FiClipboard,
  FiDollarSign,
  FiFlag,
} from "react-icons/fi";
import { Button } from "@/src/components/ui/button";

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
// Applications feature
import { AssessmentStageCard } from "../features/Applications/components/AssessmentStageCard";
import { PendingApplicationsTable } from "../features/Applications/components/PendingApplicationsTable";
import { AssessmentCentreApplicationsView } from "../features/Applications/components/AssessmentCentreApplicationsView";
import { AssessmentCentreApplicationDetailView } from "../features/Applications/components/AssessmentCentreApplicationDetailView";
import { AssessmentCentreCandidateFormView } from "../features/Applications/components/AssessmentCentreCandidateFormView";
import { AssessmentCentreEvidenceVaultView } from "../features/Applications/components/AssessmentCentreEvidenceVaultView";
import { AssessmentCentreSelfAssessmentFormView } from "../features/Applications/components/AssessmentCentreSelfAssessmentFormView";
// Staff feature
import { StaffListView } from "../features/Staff/components/StaffListView";
import { StaffDetailView } from "../features/Staff/components/StaffDetailView";
import { AddStaffModal } from "../features/Staff/components/AddStaffModal";
import { StaffStatusModal, StaffStatusModalMode } from "../features/Staff/components/StaffStatusModal";
// JobListing feature
import { JobListingsView } from "../features/JobListing/components/JobListingsView";
import { JobListingDetailView } from "../features/JobListing/components/JobListingDetailView";
import { PostJobModal } from "../features/JobListing/components/PostJobModal";
// Assessor feature
import { AssessorsListView } from "../features/Assessor/components/AssessorsListView";
import { AssessorProfileDetailView } from "../features/Assessor/components/AssessorProfileDetailView";
import { AssessorApplicantProfileView } from "../features/Assessor/components/AssessorApplicantProfileView";
// AssessorRequest feature
import { AssessorRequestListView } from "../features/AssessorRequest/components/AssessorRequestListView";
// Payment feature
import { PaymentsView } from "../features/Payment/components/PaymentsView";
import { WithdrawModal } from "../features/Payment/components/WithdrawModal";
import { TransactionReceiptModal } from "../features/Payment/components/TransactionReceiptModal";
// Settings feature
import { SettingsView } from "../features/Settings/components/SettingsView";
import { AssessmentCentreTab, PaymentTransaction } from "../types";
import { MOCK_ASSESSOR_APPLICANTS, MOCK_ASSESSORS, MOCK_JOB_LISTINGS, MOCK_STAFF_MEMBERS } from "@/features/assessment-centre/utils/constants";

export const AssessmentCentreDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AssessmentCentreTab>("overview");
  const [hasActivity, setHasActivity] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
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
                <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
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

              {staff.status === "Inactive" ? (
                <Button
                  type="button"
                  onClick={() => {
                    setStaffDeactivateModalMode("confirm-activate");
                    setIsStaffDeactivateModalOpen(true);
                  }}
                  variant="amber"
                  size="md"
                  className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
                >
                  Activate
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    setStaffDeactivateModalMode("confirm-deactivate");
                    setIsStaffDeactivateModalOpen(true);
                  }}
                  variant="amber"
                  size="md"
                  rightIcon={<FiSlash className="w-4 h-4" />}
                  className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
                >
                  Deactivate
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                    Reviewed Applications
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                      {staff.reviewedApplicationsCount || 220}
                    </span>
                    <span className="text-xs font-normal text-white/70">
                      applications
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <FiClipboard className="w-5 h-5 text-white/90" />
                </div>
              </div>

              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                    Pending Applications
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                      {staff.pendingApplicationsCount || 20}
                    </span>
                    <span className="text-xs font-normal text-white/70">
                      applications
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <FiClipboard className="w-5 h-5 text-white/90" />
                </div>
              </div>

              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                    Requires Attention
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                      {staff.requiresAttentionCount || 10}
                    </span>
                    <span className="text-xs font-normal text-white/70">
                      applications
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
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
            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                  Total Staffs
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    15
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    staffs
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiUser className="w-5 h-5 text-white/90" />
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                  Active Staff
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    10
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    staffs
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiUser className="w-5 h-5 text-white/90" />
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                  Pending Staff
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    3
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    staffs
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiUser className="w-5 h-5 text-white/90" />
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                  Inactive
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    2
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    staffs
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
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
            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 flex flex-col gap-1 border border-white/15 transition-all shadow-xs">
              <span className="text-xs font-semibold text-white/90">
                Total Applications
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  21,220
                </span>
                <span className="text-xs text-white/80 font-normal">
                  applications
                </span>
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 flex flex-col gap-1 border border-white/15 transition-all shadow-xs">
              <span className="text-xs font-semibold text-white/90">
                Pending
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  2,000
                </span>
                <span className="text-xs text-white/80 font-normal">
                  applications
                </span>
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 flex flex-col gap-1 border border-white/15 transition-all shadow-xs">
              <span className="text-xs font-semibold text-white/90">
                Ongoing
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  1,220
                </span>
                <span className="text-xs text-white/80 font-normal">
                  applications
                </span>
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 flex flex-col gap-1 border border-white/15 transition-all shadow-xs">
              <span className="text-xs font-semibold text-white/90">
                Completed
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  17,500
                </span>
                <span className="text-xs text-white/80 font-normal">
                  applications
                </span>
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 flex flex-col gap-1 border border-white/15 transition-all shadow-xs">
              <span className="text-xs font-semibold text-white/90">
                Archived
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
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

    if (activeTab === "job-listing") {
      if (selectedApplicantId) {
        const applicant =
          MOCK_ASSESSOR_APPLICANTS.find((a) => a.id === selectedApplicantId) ||
          MOCK_ASSESSOR_APPLICANTS[0];
        return (
          <div className="flex flex-col gap-1 pt-2">
            <button
              type="button"
              onClick={() => setSelectedApplicantId(null)}
              className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
            >
              <span className="text-xl font-bold">&lt;</span>
              <span>{applicant.name}</span>
            </button>
            <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
              <span
                onClick={() => {
                  setSelectedApplicantId(null);
                  setSelectedJobId(null);
                }}
                className="hover:underline cursor-pointer"
              >
                Requests
              </span>
              <span>&gt;</span>
              <span
                onClick={() => setSelectedApplicantId(null)}
                className="hover:underline cursor-pointer"
              >
                Assessor
              </span>
              <span>&gt;</span>
              <span className="font-semibold text-white">{applicant.name}</span>
            </div>
          </div>
        );
      }

      if (selectedJobId) {
        const job =
          MOCK_JOB_LISTINGS.find((j) => j.id === selectedJobId) ||
          MOCK_JOB_LISTINGS[0];
        return (
          <div className="flex flex-col gap-6 pt-2">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedJobId(null)}
                  className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
                >
                  <span className="text-xl font-bold">&lt;</span>
                  <span>Assessor Request</span>
                </button>
                <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
                  <span
                    onClick={() => setSelectedJobId(null)}
                    className="hover:underline cursor-pointer"
                  >
                    Requests
                  </span>
                  <span>&gt;</span>
                  <span className="font-semibold text-white">Assessor</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setSelectedJobId(null)}
                variant="amber"
                size="md"
                rightIcon={<FiCheck className="w-4.5 h-4.5" />}
                className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
              >
                Mark As Filled
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                    Available Slots
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                      {job.slotsTotal - job.slotsFilled}/{job.slotsTotal}
                    </span>
                    <span className="text-xs font-normal text-white/70">
                      available
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <FiClipboard className="w-5 h-5 text-white/90" />
                </div>
              </div>

              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                    Total Applicants
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                      {job.applicantsCount}
                    </span>
                    <span className="text-xs font-normal text-white/70">
                      applicants
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <FiClipboard className="w-5 h-5 text-white/90" />
                </div>
              </div>

              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                    Shortlisted Applicants
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                      1
                    </span>
                    <span className="text-xs font-normal text-white/70">
                      applicants
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
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
              Job Listing
            </h1>
            <Button
              type="button"
              onClick={() => setIsPostJobModalOpen(true)}
              variant="amber"
              size="md"
              rightIcon={<FiPlus className="w-4.5 h-4.5" />}
              className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
            >
              Post A Request
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                  Total Job Listing
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    12
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    listings
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiClipboard className="w-5 h-5 text-white/90" />
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                  Open Listing
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    8
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    listings
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiClipboard className="w-5 h-5 text-white/90" />
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                  Filled Listing
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    4
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    listings
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiClipboard className="w-5 h-5 text-white/90" />
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                  Total Applicants
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    95
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    applicants
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiUser className="w-5 h-5 text-white/90" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "assessor-request") {
      if (selectedAssessorRequestId) {
        const applicant =
          MOCK_ASSESSOR_APPLICANTS.find(
            (a) => a.id === selectedAssessorRequestId,
          ) || MOCK_ASSESSOR_APPLICANTS[0];
        return (
          <div className="flex flex-col gap-1 pt-2">
            <button
              type="button"
              onClick={() => setSelectedAssessorRequestId(null)}
              className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
            >
              <span className="text-xl font-bold">&lt;</span>
              <span>{applicant.name}</span>
            </button>
            <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
              <span
                onClick={() => setSelectedAssessorRequestId(null)}
                className="hover:underline cursor-pointer"
              >
                Requests
              </span>
              <span>&gt;</span>
              <span>Assessor</span>
              <span>&gt;</span>
              <span className="font-semibold text-white">{applicant.name}</span>
            </div>
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-6 pt-2">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Assessor Request
            </h1>
          </div>
        </div>
      );
    }

    if (activeTab === "assessors") {
      if (selectedAssessorId) {
        const assessor =
          MOCK_ASSESSORS.find((a) => a.id === selectedAssessorId) ||
          MOCK_ASSESSORS[0];
        return (
          <div className="flex flex-col gap-6 pt-2">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedAssessorId(null)}
                  className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
                >
                  <span className="text-xl font-bold">&lt;</span>
                  <span>{assessor.name}</span>
                </button>
                <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
                  <span
                    onClick={() => setSelectedAssessorId(null)}
                    className="hover:underline cursor-pointer"
                  >
                    Assessor
                  </span>
                  <span>&gt;</span>
                  <span className="font-semibold text-white">
                    {assessor.name}
                  </span>
                </div>
              </div>

              {assessor.status === "Inactive" ? (
                <Button
                  type="button"
                  onClick={() => {
                    setAssessorDeactivateModalMode("confirm-activate");
                    setIsAssessorDeactivateModalOpen(true);
                  }}
                  variant="amber"
                  size="md"
                  className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
                >
                  Activate
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    setAssessorDeactivateModalMode("confirm-deactivate");
                    setIsAssessorDeactivateModalOpen(true);
                  }}
                  variant="amber"
                  size="md"
                  rightIcon={<FiSlash className="w-4 h-4" />}
                  className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
                >
                  Deactivate
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                    Assigned Candidates
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                      {assessor.assignedCandidatesCount || 10}
                    </span>
                    <span className="text-xs font-normal text-white/70">
                      applications
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <FiClipboard className="w-5 h-5 text-white/90" />
                </div>
              </div>

              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                    Ongoing
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                      {assessor.ongoingCount || 6}
                    </span>
                    <span className="text-xs font-normal text-white/70">
                      applications
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <FiClipboard className="w-5 h-5 text-white/90" />
                </div>
              </div>

              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                    Completed
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                      {assessor.completedCount || 4}
                    </span>
                    <span className="text-xs font-normal text-white/70">
                      applications
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <FiClipboard className="w-5 h-5 text-white/90" />
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-6 pt-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Assessors
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                  Total Assessors
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    43
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    assessors
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiFlag className="w-5 h-5 text-white/90" />
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                  Active Assessors
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    30
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    assessors
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiFlag className="w-5 h-5 text-white/90" />
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                  Pending Assessors
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    3
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    assessors
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiFlag className="w-5 h-5 text-white/90" />
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                  Inactive Assessors
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    10
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    assessors
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiFlag className="w-5 h-5 text-white/90" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "payments") {
      return (
        <div className="flex flex-col gap-6 pt-2">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Payments
            </h1>

            <Button
              type="button"
              onClick={() => setIsWithdrawModalOpen(true)}
              variant="amber"
              size="md"
              rightIcon={<FiDollarSign className="w-4.5 h-4.5" />}
              className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
            >
              Withdraw Funds
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                  Total Revenue
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    ₦3,125,000
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiDollarSign className="w-5 h-5 text-white/90" />
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                  Completed Transactions
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    50
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    transactions
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiDollarSign className="w-5 h-5 text-white/90" />
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white/80">
                  Pending Transactions
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    6
                  </span>
                  <span className="text-xs font-normal text-white/70">
                    transactions
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiDollarSign className="w-5 h-5 text-white/90" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "settings") {
      return (
        <div className="flex flex-col gap-1 pt-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Settings
          </h1>
        </div>
      );
    }

    if (activeTab === "messages") {
      return (
        <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Messages
          </h1>

          <Button
            type="button"
            onClick={() => setIsBroadcastModalOpen(true)}
            variant="amber"
            size="md"
            rightIcon={<FiPlus className="w-4.5 h-4.5" />}
            className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
          >
            Send Broadcast Message
          </Button>
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
                  onViewApplication={() => {
                    setActiveTab("applications");
                    setSelectedCandidateName("Oguntade James");
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

      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />

      <StaffStatusModal
        isOpen={isStaffDeactivateModalOpen}
        mode={staffDeactivateModalMode}
        staffName={
          selectedStaffId
            ? MOCK_STAFF_MEMBERS.find((s) => s.id === selectedStaffId)?.name
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
            ? MOCK_ASSESSORS.find((a) => a.id === selectedAssessorId)?.name
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
