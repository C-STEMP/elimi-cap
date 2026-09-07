"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiAward, FiX } from "react-icons/fi";
import { RevenueChart } from "./RevenueChart";
import { TradeChart } from "./TradeChart";
import { GenderChart } from "./GenderChart";
import { StaffActivityLogCard } from "./StaffActivityLogCard";
import { AssessmentCentreEmptyView } from "./AssessmentCentreEmptyView";
import { AssessmentStageCard } from "../../Applications/components/AssessmentStageCard";
import { PendingApplicationsTable } from "../../Applications/components/PendingApplicationsTable";
import { RoleType, canViewPayments } from "../../../utils/rbac";

interface OverviewTabProps {
  activeRole: RoleType;
  centreProfile?: any;
  hasActivity: boolean;
  onNavigateToApplications: (appId?: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  activeRole,
  centreProfile,
  hasActivity,
  onNavigateToApplications,
}) => {
  const [isApprovalDismissed, setIsApprovalDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("elimi_centre_approval_dismissed") === "true";
    } catch {
      return false;
    }
  });

  const handleDismissApproval = () => {
    setIsApprovalDismissed(true);
    try {
      localStorage.setItem("elimi_centre_approval_dismissed", "true");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col gap-6"
    >
      {/* Centre Accreditation & Approval Status Banner */}
      {centreProfile?.status === "pending" ? (
        <div className="bg-[#FEF3C7] rounded-3xl p-5 sm:p-6 border border-[#F59E0B]/30 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#FDE68A] text-[#92400E] flex items-center justify-center shrink-0 border border-amber-300">
              <FiAward className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-[#92400E] tracking-tight truncate">
                  {centreProfile?.name || "Assessment Centre"}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-white text-[#92400E] border border-[#F59E0B]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
                  Accreditation Pending Review
                </span>
              </div>
              <p className="text-xs text-[#B45309] font-normal">
                Centre ID: <span className="font-semibold">{centreProfile?.registrationNo || "AC-NBTE-0042"}</span> • Your centre credentials are under review by NBTE &amp; Sector Skills Council.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <span className="text-xs font-semibold text-[#92400E] bg-white/80 border border-[#F59E0B]/30 px-3.5 py-1.5 rounded-xl">
              Status: <span className="font-bold capitalize">Pending Approval</span>
            </span>
          </div>
        </div>
      ) : !isApprovalDismissed ? (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#1E7F4C]/20 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] text-[#1E7F4C] flex items-center justify-center shrink-0 border border-[#1E7F4C]/20">
              <FiAward className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-black tracking-tight truncate">
                  {centreProfile?.name || "Assessment Centre"}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#E6F4EA] text-[#1E7F4C] border border-[#1E7F4C]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E7F4C]" />
                  Accredited &amp; Approved Centre
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal">
                Centre ID: <span className="font-semibold text-gray-800">{centreProfile?.registrationNo || "AC-NBTE-0042"}</span> • Recognized by NBTE &amp; Sector Skills Council
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <span className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl">
              Accreditation: <span className="text-[#1E7F4C] font-bold capitalize">{centreProfile?.status || "Approved"}</span>
            </span>
            <button
              type="button"
              onClick={handleDismissApproval}
              aria-label="Dismiss approval banner"
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}

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
            onViewAll={() => onNavigateToApplications()}
            onViewApplication={(appId) => onNavigateToApplications(appId)}
          />
        </>
      ) : (
        <AssessmentCentreEmptyView />
      )}
    </motion.div>
  );
};
